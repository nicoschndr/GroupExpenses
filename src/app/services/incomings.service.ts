import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import {Expense} from '../models/classes/expense';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class IncomingsService {
  entry: Expense;
  amount = 0;
  toUserId = '';
  fromUserId = '';
  date: Date;
  private incomingCollections: AngularFirestoreCollection<Expense>;
  private incoming: Observable<Expense>;
  constructor(private afs: AngularFirestore) {
    this.incomingCollections = this.afs.collection('incoming');
  }
  async addIncome(entry: Expense) {
    entry.id = this.afs.createId();
    const data = JSON.parse(JSON.stringify(entry));
    await this.incomingCollections.doc(entry.id).set(data)
      .catch((err) => console.log('Error: ' + err));
  }

  /**
   * This function will fetch all data from the collection with the given group id.
   *
   * @example
   * Call it with a group id as a string
   * getAllIncoming('nf9o45t')
   *
   * @param groupId
   */
  getAllIncoming(groupId: string){
    return this.afs.collection('incoming', ref => ref.where('groupId', '==', groupId)).snapshotChanges();
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

  /**
   * This function will decrease the amount by the given data from the creditors field value amount
   * of debitor with the given userId.
   *
   */
  async addShare(gId: string, uId: string, share: number){
    const decrement = firebase.firestore.FieldValue.increment(-share);
    firebase.firestore().collection('group').doc(gId).collection('paymentTest').doc(uId)
      .collection('groupMembers').get().then((snapshot) => {
        for(const user of snapshot.docs) {
          user.ref.update({amount: decrement});
        }
      });
  }
}
