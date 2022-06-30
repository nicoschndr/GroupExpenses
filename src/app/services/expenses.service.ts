import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Expense} from '../models/classes/expense';
import {Observable} from 'rxjs';
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
  async addExpense(entry: Expense){
    entry.id = this.afs.createId();
    const data = JSON.parse(JSON.stringify(entry));
    await this.expensesCollections.doc(entry.id).set(data)
      .catch((err) => console.log('Error: ' + err));
    return this.addExpenseStatus = false;
  }
  getAllExpenses(id: string){
    return this.afs.collection('expenses', ref => ref.where('groupId', '==', id)).snapshotChanges();
  }
  async getEntryById(id: string) {
    const document = await this.expensesCollections.doc(id).get().toPromise();
    return document.data() as Expense;
  }
  updateExpense(expense: Expense){
    const data = JSON.parse(JSON.stringify(expense));
    this.expensesCollections.doc(expense.id).update(data)
      .catch((err) => console.log('Error: ', err));
  }
  async removeEntry(id: string){
    await this.expensesCollections.doc(id).delete();
  }
}
