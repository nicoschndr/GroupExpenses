import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Expense} from '../models/classes/expense';
import {Observable} from 'rxjs';
import {getDocs} from '@angular/fire/firestore';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  entry: Expense = new Expense();
  addExpenseStatus = false;
  private expensesCollections: AngularFirestoreCollection<Expense>;
  private expenses: Observable<Expense[]>;
  constructor(private afs: AngularFirestore) {
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
    await this.expensesCollections.doc(expense.id).set(Object.assign({}, expense))
      .then(() => console.log('Successfully added new expense to firebase'))
      .catch((err) => console.log('Error: ' + err));
    return this.addExpenseStatus = false;
  }

  /**
   * This function will get all expenses from one group by the given ID where split value is false and only documents
   * until current date.
   *
   * @example
   * Call it with a group ID as a string
   * getAllExpenses('fj94tz3g')
   *
   * @param groupId
   */
  getAllExpenses(groupId: string){
    return this.afs.collection('expenses', ref => ref.where('groupId', '==', groupId)
      .where('split', '==', false)
      .where('date', '<=', new Date().getTime()))
      .snapshotChanges();
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
  getAllSplitIntervalExpensesFromGroup(groupId: string){
    return this.afs.collection('expenses', ref => ref.where('groupId', '==', groupId)
      .where('interval', '==', true)
      .where('split', '==', true))
      .snapshotChanges();
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
      .then(() => console.log('Successfully updated expense in firebase'))
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
    await this.expensesCollections.doc(id).delete()
      .then(() => console.log('Successfully deleted expense'))
      .catch((err) => console.log('Error: ', err));
  }

  async getAllExpensesbyMonth(id: string, from: Date, to: Date) {
    const incRef = firebase.firestore().collection('expenses')
    .where('groupId', '==', id)
    .where('date', '>=', from.getTime())
    .where('date', '<=', to.getTime());

    const incDocs = await getDocs(incRef);
    const expenses: Expense[] = [];
    incDocs.forEach(recordDoc => {
      if (!recordDoc.data().split) {
        expenses.push(recordDoc.data());
      }
    });
    return expenses;
  }
}
