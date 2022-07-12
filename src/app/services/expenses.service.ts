import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Expense} from '../models/classes/expense';
import {Observable} from 'rxjs';
import{AngularFireStorage} from '@angular/fire/compat/storage';
import firebase from 'firebase/compat/app';
import {Debt} from '../models/classes/debt';
import {getDocs} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  entry: Expense = new Expense();
  addExpenseStatus = false;
  private expensesCollections: AngularFirestoreCollection<Expense>;
  private expenses: Observable<Expense[]>;
  constructor(private afs: AngularFirestore, private afsStorage: AngularFireStorage) {
    this.expensesCollections = this.afs.collection('expenses');
  }

  /**
   * This function will add a new expense into the firebase collection 'expenses'.
   *
   * @example
   * Call it with an object of type 'Expense'
   * addExpense(expense: Expense)
   *
   * @param expense
   */
  async addExpense(expense: Expense){
    expense.id = this.afs.createId();
    const data = JSON.parse(JSON.stringify(expense));
    await this.expensesCollections.doc(expense.id).set(data)
      .catch((err) => console.log('Error: ' + err));
    return this.addExpenseStatus = false;
  }

  /**
   * This function will get all expenses from one group by the given ID where split value is false.
   *
   * @example
   * Call it with a group ID as a string
   * getAllExpenses('fj94tz3g')
   *
   * @param groupId
   */
  getAllExpenses(groupId: string){
    return this.afs.collection('expenses', ref => ref.where('groupId', '==', groupId)
      .where('split', '==', false))
      .snapshotChanges();
  }

  async getAllExpensesArray(id: string){
    const expRef = firebase.firestore().collection('expenses').where('groupId', '==', id);
    const expDocs = await getDocs(expRef);
    const expenses: Debt[] = [];
    expDocs.forEach(recordDoc => {
      if (!recordDoc.data().split) {
        expenses.push(recordDoc.data());
      }
    });
    return expenses;
  }

  /**
   * This function will get all expenses from one group that has been calculated / splitted.
   *
   * @example
   * Call it with a group ID as a string
   * getAllSplittedExpenses('gi9w4zt823w')
   *
   * @param groupId
   */
  getAllSplittedExpenses(groupId: string){
    return this.afs.collection('expenses', ref => ref.where('groupId', '==', groupId)
      .where('split', '==', true))
      .snapshotChanges();
  }
  /**
   * This function will get all expenses by one user where the split value is false.
   *
   * @example
   * Call it with a group ID and a user ID - both as strings
   * getAllExpensesFromUser('hf84tz5hqr', 'ef94zho2s')
   *
   * @param groupId
   * @param userId
   */
  getALlExpensesFromUser(groupId: string, userId: string){
    return this.afs.collection('expenses', ref => ref.where('groupId', '==', groupId)
      .where('userId', '==', userId)
      .where('split', '==', false))
      .snapshotChanges();
  }
  async getSplitExpenses(id: string){
    const expRef = firebase.firestore().collection('expenses').where('groupId', '==', id);
    const expDocs = await getDocs(expRef);
    const expenses: Debt[] = [];
    expDocs.forEach(recordDoc => {
      if (!recordDoc.data().split) {
        expenses.push(recordDoc.data());
      }
    });
    return expenses;
  }

  /**
   * This function will get data from one expense by ihe given ID.
   *
   * @example
   * Call it with an expense ID as a string
   * getEntryById('8z5rfh4')
   *
   * @param id
   */
  async getEntryById(id: string) {
    const document = await this.expensesCollections.doc(id).get().toPromise();
    return document.data() as Expense;
  }

  /**
   * This function will update a given expense with the new value.
   *
   * @example
   * Call it with an object of type 'Expense'
   * updateExpense(expense: Expense)
   *
   * @param expense
   */
  updateExpense(expense: Expense){
    const data = JSON.parse(JSON.stringify(expense));
    this.expensesCollections.doc(expense.id).update(data)
      .catch((err) => console.log('Error: ', err));
  }

  /**
   * This function will delete an object from the firebase collection by the given ID.
   *
   * @example
   * Call it with an expense ID as a string
   * removeEntry('fmi4zh58ri')
   *
   * @param id
   */
  async removeEntry(id: string){
    await this.expensesCollections.doc(id).delete();
  }
  async addDebt(gId: string, debt: Debt){
    console.log(gId);
    debt.id = this.afs.createId();
    const data = JSON.parse(JSON.stringify(debt));
    await this.expensesCollections.doc(debt.id).set(data);
    await firebase.firestore().collection('group').doc(gId).collection('debts').doc(debt.id).set(data);
  }
  async getAllIncoming(id: string){
    const incRef = firebase.firestore().collection('incoming').where('groupId', '==', id);
    const incDocs = await getDocs(incRef);
    const incoming: Debt[] = []; // TODO: add class for incoming?
    incDocs.forEach(recordDoc => {
      if (!recordDoc.data().split) {
        incoming.push(recordDoc.data());
      }
    });
    return incoming;
  }
}
