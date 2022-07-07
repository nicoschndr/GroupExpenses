import { Injectable } from '@angular/core';
import {Group} from '../models/classes/group.model';
import {Expense} from '../models/classes/expense';
import {Debt} from '../models/classes/debt';
import {GroupService} from './group.service';
import {ExpensesService} from './expenses.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import firebase from 'firebase/compat/app';
import {getDocs} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DebtsService {

  private groupCollection: AngularFirestoreCollection<Group>;
  private debts: Observable<Debt[]>;

  constructor(
    private afs: AngularFirestore,
    private groupService: GroupService,
    private expensesService: ExpensesService,
  ) {
    this.groupCollection = this.afs.collection('group');
  }

  /**
   * This function divides the expenses of one group and calculates which member owes who what amount
   *
   * @example
   * Call it with an id of a group - type string
   * calculateDebts('VHrpRwIDhaRAaBfKmPGd')
   *
   * **/
  async calculateDebts(gId: string, expenses: Expense[]) {
    //get group by groupId
    const group: Group = await this.groupService.getGroupById(gId);

    //Map which stores sum of the expenses made by one member
    //key: userId - type string, value: sum of expenses - type number
    const userExpensesSum: Map<string, number> = new Map();
    //Map for members which are owing money
    //key: userId - type string, value: the amount they still need to pay - type number
    const debtorMap: Map<string, number> = new Map();
    //Map for members which are waiting for money
    //key: userId - type string, value: the amount they are waiting for - type number
    const creditorMap: Map<string, number> = new Map();
    //sum of all expenses made by this group
    let sum = 0;

    for (const uId of group.groupMembers) {
      //get all expenses made from one user by his userId
      const expensesFromUser: Expense[] = expenses.filter((e) => e.userId === uId);
      //variable storing the amount of expenses made by one member
      let userSum = 0;
      //iterate through all expenses and sum up amounts
      for (const expense of expensesFromUser) {
        userSum += expense.amount;
      }

      //store amount of expenses made by one user in Map
      userExpensesSum.set(uId, Math.round((userSum + Number.EPSILON) * 100) / 100);
      //get the amount expenses made by all members
      sum += userSum;
    }

    //calculate the share which every member must pay
    const share = Math.round(((sum / group.groupMembers.length) + Number.EPSILON) * 100) / 100;

    //iterate through Map which stores all sums of expenses made by one user
    userExpensesSum.forEach((value: number, key: string) => {
      //calculate if the member must pay an amount or gets an amount of money
      const newValue = Math.round(((share - value) + Number.EPSILON) * 100) / 100;
      //if value is positive, the member owes money
      if (newValue > 0) {
        //then save member as debtor in Map
        debtorMap.set(key, newValue);
      }
      //if value is negative, the member gets money
      else if (newValue < 0) {
        //then save member as creditor in Map
        creditorMap.set(key, newValue);
      }
    });

    //sort Maps after value
    const sortedDebtorMap = new Map([...debtorMap.entries()].sort((a, b) => b[1] - a[1]));
    const sortedCreditorMap = new Map([...creditorMap.entries()].sort((a, b) => a[1] - b[1]));
    console.log(sortedDebtorMap, sortedCreditorMap);

    //check if there is still something to split
    while (sortedDebtorMap.size > 0 && sortedCreditorMap.size > 0) {
      //calculate the difference between the smallest amount a member needs to pay and a member needs to get paid
      //both are the first entries of the Maps
      const debt: number = Math.round(
        ((sortedCreditorMap.values().next().value) + (sortedDebtorMap.values().next().value) + Number.EPSILON) * 100
      ) / 100;
      //if the debt is positive, there is still something left of the amount the first member in the Map needs to pay
      if (debt > 0) {
        //this is the new value the debtor still owes the group, so set the new value into the Map
        sortedDebtorMap.set(sortedDebtorMap.keys().next().value, debt);
        const newDebt: Debt = new Debt(
          '',
          sortedCreditorMap.keys().next().value,
          sortedDebtorMap.keys().next().value,
          sortedCreditorMap.values().next().value, //amount is the value which the creditor
          false
        );
        //add a new debt into the storage
        await this.expensesService.addDebt(gId, newDebt);
        //the amount of money the person gets is now fully assigned to a debtor, so delete the entry
        sortedCreditorMap.delete(sortedCreditorMap.keys().next().value);
        console.log(sortedDebtorMap, sortedCreditorMap);
      }
      //if the debt is positive, there is still something left of the amount the first member in the Map needs to be paid
      else if (debt < 0) {
        //this is the new value the group still owes the member, so set the new value into the Map
        sortedCreditorMap.set(sortedCreditorMap.keys().next().value, debt);
        const newDebt: Debt = new Debt(
          '',
          sortedCreditorMap.keys().next().value,
          sortedDebtorMap.keys().next().value,
          sortedDebtorMap.values().next().value,
          false
        );
        //add a new debt into the storage
        await this.expensesService.addDebt(gId, newDebt);
        //the amount of money the person owes is now fully assigned to a creditor, so delete the entry
        sortedDebtorMap.delete(sortedDebtorMap.keys().next().value);
        console.log(sortedDebtorMap, sortedCreditorMap);
      }
      //creditor- and debtor values are the same, so the debtor pays the creditor
      else if (debt === 0) {
        const newDebt: Debt = new Debt(
          '',
          sortedCreditorMap.keys().next().value,
          sortedDebtorMap.keys().next().value,
          sortedCreditorMap.values().next().value,
          false
        );
        //add a new debt into the storage
        await this.expensesService.addDebt(gId, newDebt);
        //the amount of money the person gets is now fully assigned to a debtor, so delete the entry
        sortedCreditorMap.delete(sortedCreditorMap.keys().next().value);
        //the amount of money the person owes is now fully assigned to a creditor, so delete the entry
        sortedDebtorMap.delete(sortedDebtorMap.keys().next().value);
        console.log(sortedDebtorMap, sortedCreditorMap);
      }
    }
  }

  async getDebts(groupId: string): Promise<Debt[]> {
    const debtsRef = firebase.firestore().collection('group').doc(groupId).collection('debts');
    const debtDocs = await getDocs(debtsRef);
    const debts: Debt[] = [];
    debtDocs.forEach(recordDoc => {
      debts.push(recordDoc.data());
    });
    return debts;
  }

  async markDebtAsPaid(groupId: string, debtId: string) {
    await firebase.firestore().collection('group').doc(groupId).collection('debts').doc(debtId).delete();
  }
}
