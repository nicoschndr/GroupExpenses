import { Injectable } from '@angular/core';
import {Group} from '../models/classes/Group.model';
import {Expense} from '../models/classes/Expense';
import {Debt} from '../models/classes/Debt';
import {GroupService} from './group.service';
import {ExpensesService} from './expenses.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import firebase from 'firebase/compat/app';
import {getDocs} from '@angular/fire/firestore';
import {IncomingsService} from './incomings.service';

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
    private incomingsService: IncomingsService,
  ) {
    this.groupCollection = this.afs.collection('group');
  }

  async addDebt(gId: string, debt: Debt){
    debt.id = this.afs.createId();
    const data = JSON.parse(JSON.stringify(debt));
    await firebase.firestore().collection('group').doc(gId).collection('debts').doc(debt.id).set(data);
  }

  /**
   * This function divides the expenses of one group and calculates which member owes who what amount
   *
   * @example
   * Call it with an id of a group - type string and an array of expenses
   * calculateDebtsForExpenses('VHrpRwIDhaRAaBfKmPGd', Expense[])
   *
   * @param gId
   * @param expenses
   *
   */
  async calculateDebtsForExpenses(gId: string, expenses: Expense[]) {
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
        creditorMap.set(key, newValue * (-1));
      }
    });

    //sort Maps after value
    const sortedDebtorMap = new Map([...debtorMap.entries()].sort((a, b) => b[1] - a[1]));
    const sortedCreditorMap = new Map([...creditorMap.entries()].sort((a, b) => a[1] - b[1]));

    //check if there is still something to split
    while (sortedDebtorMap.size > 0 && sortedCreditorMap.size > 0) {
      //calculate the difference between the smallest amount a member needs to pay and a member needs to get paid
      //both are the first entries of the Maps
      const debt: number = Math.round(
        ((sortedCreditorMap.values().next().value) - (sortedDebtorMap.values().next().value) + Number.EPSILON) * 100
      ) / 100;
      //if the debt is positive, there is still something left of the amount the first member in the Map needs to pay
      if (debt > 0) {
        //this is the new value the debtor still owes the group, so set the new value into the Map
        sortedDebtorMap.set(sortedDebtorMap.keys().next().value, debt);
        const newDebt: Debt = new Debt(
          '',
          sortedCreditorMap.keys().next().value,
          sortedDebtorMap.keys().next().value,
          sortedDebtorMap.values().next().value, //amount is the value which the creditor
          false
        );
        //add a new debt into the storage
        await this.addDebt(gId, newDebt);
        //the amount of money the person gets is now fully assigned to a debtor, so delete the entry
        sortedCreditorMap.delete(sortedCreditorMap.keys().next().value);
      }
      //if the debt is positive, there is still something left of the amount the first member in the Map needs to be paid
      else if (debt < 0) {
        //this is the new value the group still owes the member, so set the new value into the Map
        sortedCreditorMap.set(sortedCreditorMap.keys().next().value, (debt * (-1)));
        const newDebt: Debt = new Debt(
          '',
          sortedCreditorMap.keys().next().value,
          sortedDebtorMap.keys().next().value,
          sortedCreditorMap.values().next().value,
          false
        );
        //add a new debt into the storage
        await this.addDebt(gId, newDebt);
        //the amount of money the person owes is now fully assigned to a creditor, so delete the entry
        sortedDebtorMap.delete(sortedDebtorMap.keys().next().value);
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
        await this.addDebt(gId, newDebt);
        //the amount of money the person gets is now fully assigned to a debtor, so delete the entry
        sortedCreditorMap.delete(sortedCreditorMap.keys().next().value);
        //the amount of money the person owes is now fully assigned to a creditor, so delete the entry
        sortedDebtorMap.delete(sortedDebtorMap.keys().next().value);
      }
    }
    //mark all given expenses as split
    await this.markExpensesAsSplit(expenses);
  }

  /**
   * This function divides the expenses of one group and calculates which member owes who what amount
   *
   * @example
   * Call it with an id of a group - type string and an incomes array type of Expense
   * calculateDebts('VHrpRwIDhaRAaBfKmPGd', Expense[])
   *
   * @param gId
   * @param incomes
   *
   */
  async calculateDebtsForIncomes(gId: string, incomes: Expense[]) {
    //get group by groupId
    const group: Group = await this.groupService.getGroupById(gId);
    //Map which stores sum of the expenses made by one member
    //key: userId - type string, value: sum of expenses - type number
    const userIncomesSum: Map<string, number> = new Map();
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
      const incomesFromUser: Expense[] = incomes.filter((i) => i.userId === uId);
      //variable storing the amount of expenses made by one member
      let userSum = 0;
      //iterate through all expenses and sum up amounts
      for (const income of incomesFromUser) {
        userSum += income.amount;
      }

      //store amount of expenses made by one user in Map
      userIncomesSum.set(uId, Math.round((userSum + Number.EPSILON) * 100) / 100);
      //get the amount expenses made by all members
      sum += userSum;
    }

    //calculate the share which every member must pay
    const share = Math.round(((sum / group.groupMembers.length) + Number.EPSILON) * 100) / 100;

    //iterate through Map which stores all sums of expenses made by one user
    userIncomesSum.forEach((value: number, key: string) => {
      //calculate if the member must pay an amount or gets an amount of money
      const newValue = Math.round(((share - value) + Number.EPSILON) * 100) / 100;
      //if value is positive, the member gets money
      if (newValue > 0) {
        //then save member as creditor in Map
        creditorMap.set(key, newValue);
      }
      //if value is negative, the member owes money
      else if (newValue < 0) {
        //then save member as debtor in Map
        debtorMap.set(key, newValue * (-1));
      }
    });

    //sort Maps after value
    const sortedDebtorMapI = new Map([...debtorMap.entries()].sort((a, b) => b[1] - a[1]));
    const sortedCreditorMapI = new Map([...creditorMap.entries()].sort((a, b) => a[1] - b[1]));

    //check if there is still something to split
    while (sortedDebtorMapI.size > 0 && sortedCreditorMapI.size > 0) {
      //calculate the difference between the smallest amount a member needs to pay and a member needs to get paid
      //both are the first entries of the Maps
      const debt: number = Math.round(
        ((sortedCreditorMapI.values().next().value) - (sortedDebtorMapI.values().next().value) + Number.EPSILON) * 100
      ) / 100;
      //if the debt is positive, there is still something left of the amount the first member in the Map needs to pay
      if (debt > 0) {
        //this is the new value the debtor still owes the group, so set the new value into the Map
        sortedDebtorMapI.set(sortedDebtorMapI.keys().next().value, debt);
        const newDebt: Debt = new Debt(
          '',
          sortedCreditorMapI.keys().next().value,
          sortedDebtorMapI.keys().next().value,
          sortedDebtorMapI.values().next().value, //amount is the value which the creditor
          false
        );
        //add a new debt into the storage
        await this.addDebt(gId, newDebt);
        //the amount of money the person gets is now fully assigned to a debtor, so delete the entry
        sortedDebtorMapI.delete(sortedDebtorMapI.keys().next().value);
      }
      //if the debt is positive, there is still something left of the amount the first member in the Map needs to be paid
      else if (debt < 0) {
        //this is the new value the group still owes the member, so set the new value into the Map
        sortedDebtorMapI.set(sortedDebtorMapI.keys().next().value, (debt * (-1)));
        const newDebt: Debt = new Debt(
          '',
          sortedCreditorMapI.keys().next().value,
          sortedDebtorMapI.keys().next().value,
          sortedCreditorMapI.values().next().value,
          false
        );
        //add a new debt into the storage
        await this.addDebt(gId, newDebt);
        //the amount of money the person owes is now fully assigned to a creditor, so delete the entry
        sortedCreditorMapI.delete(sortedCreditorMapI.keys().next().value);
      }
      //creditor- and debtor values are the same, so the debtor pays the creditor
      else if (debt === 0) {
        const newDebt: Debt = new Debt(
          '',
          sortedCreditorMapI.keys().next().value,
          sortedDebtorMapI.keys().next().value,
          sortedCreditorMapI.values().next().value,
          false
        );
        //add a new debt into the storage
        await this.addDebt(gId, newDebt);
        //the amount of money the person gets is now fully assigned to a debtor, so delete the entry
        sortedCreditorMapI.delete(sortedCreditorMapI.keys().next().value);
        //the amount of money the person owes is now fully assigned to a creditor, so delete the entry
        sortedDebtorMapI.delete(sortedDebtorMapI.keys().next().value);
      }
    }
    //mark all given expenses as split
    await this.markIncomesAsSplit(incomes);
  }

  /**
   * This function will return all debt entries from one group out of the firestore
   *
   * @example
   * Call it with a groupId type of string
   * getDebts('2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param groupId
   */
  async getDebts(groupId: string): Promise<Debt[]> {
    //access the subcollection 'debts' of the group
    const debtsRef = firebase.firestore().collection('group').doc(groupId).collection('debts');
    //get debts
    const debtDocs = await getDocs(debtsRef);
    const debts: Debt[] = [];
    //then save as debts in array and return them
    debtDocs.forEach(debtDoc => {
      debts.push(debtDoc.data());
    });
    return debts;
  }

  /**
   * This function will delete a debt-document of the subcollection 'debts' of the collection 'group' by a given debtid
   *
   * @example
   * Call it with a groupId and debtId both type of string
   * deletePaidDebtsById('s93ske3l3493492ssdf', '2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param groupId
   * @param debtId
   */
  async deletePaidDebtsById(groupId: string, debtId: string) {
    await firebase.firestore().collection('group').doc(groupId).collection('debts').doc(debtId).delete();
  }

  /**
   * This function will mark all given expenses as splitted
   *
   * @example
   * Call it with an array of Expenses
   * markExpensesAsSplit(Expenses[])
   *
   * @param expenses
   */
  async markExpensesAsSplit(expenses: Expense[]) {
    for (const expense of expenses) {
      expense.split = true;
      await this.expensesService.updateExpense(expense);
    }
  }

  /**
   * This function will mark all given incomes as splitted
   *
   * @example
   * Call it with an array of Expenses
   * markIncomesAsSplit(Expenses[])
   *
   * @param incomes
   */
  async markIncomesAsSplit(incomes: Expense[]) {
    for (const income of incomes) {
      income.split = true;
      await this.incomingsService.updateIncome(income);
    }
  }
}
