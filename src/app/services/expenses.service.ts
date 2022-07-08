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
  async addExpense(entry: Expense){
    entry.id = this.afs.createId();
    const data = JSON.parse(JSON.stringify(entry));
    await this.expensesCollections.doc(entry.id).set(data)
      .catch((err) => console.log('Error: ' + err));
    return this.addExpenseStatus = false;
  }
  async getAllExpenses(id: string){
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
  async addDebt(gId: string, debt: Debt){
    console.log(gId);
    debt.id = this.afs.createId();
    const data = JSON.parse(JSON.stringify(debt));
    await this.expensesCollections.doc(debt.id).set(data);
    await firebase.firestore().collection('group').doc(gId).collection('debts').doc(debt.id).set(data);
  }
}
