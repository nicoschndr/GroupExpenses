import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import {getDocs} from '@angular/fire/firestore';
import {Expense} from '../models/classes/Expense';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class IncomingsService {
  entry: Expense;
  amount = 0;
  date: Date;
  private incomingCollections: AngularFirestoreCollection<Expense>;
  private incoming: Observable<Expense>;
  constructor(private afs: AngularFirestore) {
    this.incomingCollections = this.afs.collection('incoming');
  }

  /**
   * This function will add given data to firebase collection.
   *
   * @example
   * Call it with an income object of type Expense
   * addIncome(income: Expense)
   *
   * @param income
   */
  async addIncome(income: Expense) {
    income.id = this.afs.createId();
    await this.incomingCollections.doc(income.id).set(Object.assign({},income))
      .then(() => console.log('Successfully added new income to firebase'))
      .catch((err) => console.log('Error: ' + err));
  }

  /**
   * This function will return an observable containing all data from the collection with the given group id.
   *
   * @example
   * Call it with a group id as a string
   * getAllIncoming('nf9o45t')
   *
   * @param groupId
   */
  getAllIncoming(groupId: string){
    return this.afs.collection('incoming', ref => ref.where('groupId', '==', groupId)
      .where('date', '<=', new Date().getTime()))
      .snapshotChanges();
  }

  getAllNotSplitIncome(groupId: string){
    return this.afs.collection('expenses', ref => ref.where('groupId', '==', groupId)
      .where('split', '==', false)
      .where('date', '<=', new Date().getTime()))
      .snapshotChanges();
  }
  /**
   * This function will fetch data with given id from firebase collection.
   *
   * @example
   * Call it with an id as a string
   * getEntryById('35rht2g6')
   *
   * @param incomeId
   */
  async getEntryById(incomeId: string) {
    const document = await this.incomingCollections.doc(incomeId).get().toPromise();
    return document.data() as Expense;
  }

  /**
   * This function will update income of object Expense in firebase.
   *
   * @example
   * Call it with an income object of type Expense
   * updateIncome(income: Expense)
   *
   * @param income
   */
  updateIncome(income: Expense){
    const data = JSON.parse(JSON.stringify(income));
    this.incomingCollections.doc(income.id).update(data)
      .then(() => console.log('Successfully updated new income to firebase'))
      .catch((err) => console.log('Error: ', err));
  }

  /**
   * This function will remove income entry with given income id string.
   *
   * @example
   * Call it with an income id as a string
   *
   * @param incomeId
   */
  async removeEntry(incomeId: string){
    await this.incomingCollections.doc(incomeId).delete();
  }

  async getAllIncomingbyMonth(id: string, from: Date, to: Date) {
    const incRef = firebase.firestore().collection('incoming')
    .where('groupId', '==', id)
    .where('date', '>=', from.getTime())
    .where('date', '<=', to.getTime());

    const incDocs = await getDocs(incRef);
    const incoming: Expense[] = [];
    incDocs.forEach(recordDoc => {
      incoming.push(recordDoc.data());
    });
    return incoming;
  }
}
