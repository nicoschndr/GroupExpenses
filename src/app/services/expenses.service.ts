import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Expense} from '../models/classes/expense';
import {Observable} from 'rxjs';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import firebase from 'firebase/compat/app';
import {Debt} from '../models/classes/debt';
import {getDocs} from '@angular/fire/firestore';
import {Timestamp} from 'firebase/firestore';

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
    expense.date = new Date(expense.date);
    const data = JSON.parse(JSON.stringify(expense));
    data.timestamp = firebase.firestore.Timestamp.fromDate(new Date(expense.date));
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
   * This function will get all expenses from one group by the given ID where the interval is true.
   *
   * @example
   * Call it with a group ID as a string
   * getAllExpenses('fj94tz3g')
   *
   * @param groupId
   */
  getAllIntervalExpensesFromGroup(groupId: string){
    return this.afs.collection('expenses', ref => ref.where('groupId', '==', groupId)
      .where('interval', '==', true))
      .snapshotChanges();
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
  async updateIntervalExpense(expense: Expense){
    const newDate = expense.date.getMonth()+1;
    console.log('newDate: ', newDate);
    const newDate2 = Timestamp.fromDate(expense.date).toDate().getMonth()+1;
    console.log('newDate2: ', newDate2);
    await this.expensesCollections.doc(expense.id).update({date: new Date(newDate), split: false});
  }

  async getAllExpensesbyMonth(id: string, from: Date, to: Date) {
    const incRef = firebase.firestore().collection('expenses')
    .where('groupId', '==', id)
    .where('timestamp', '>=', from)
    .where('timestamp', '<=', to);

    const incDocs = await getDocs(incRef);
    const expenses: Debt[] = [];
    incDocs.forEach(recordDoc => {
      if (!recordDoc.data().split) {
        expenses.push(recordDoc.data());
      }
    });
    return expenses;
  }

}
