import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Expense} from '../models/classes/expense';
import {Observable} from 'rxjs';

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
  getAllExpenses(){
    return this.expensesCollections.snapshotChanges();
  }
  openExpenseForm(){
    return this.addExpenseStatus = true;
  }
  async getEntryById(id: string) {
    const document = await this.expensesCollections.doc(id).get().toPromise();
    return document.data() as Expense;
  }
  updateExpense(expense: Expense){
    this.expensesCollections.doc(expense.id).set(expense);
  }
  async removeEntry(id: string){
    await this.expensesCollections.doc(id).delete();
  }
}
