import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import {Expense} from '../models/classes/expense';
import firebase from 'firebase/compat/app';
import {Income} from '../models/classes/income';

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
  getAllIncoming(id: string){
    return this.afs.collection('incoming', ref => ref.where('groupId', '==', id)).snapshotChanges();
  }
  async getEntryById(id: string) {
    const document = await this.incomingCollections.doc(id).get().toPromise();
    return document.data() as Expense;
  }
  updateIncome(entry: Expense){
    const data = JSON.parse(JSON.stringify(entry));
    this.incomingCollections.doc(entry.id).update(data)
      .catch((err) => console.log('Error: ', err));
  }
  async removeEntry(id: string){
    await this.incomingCollections.doc(id).delete();
  }

  /**
   * This function will decrease the amount by the given data from the creditors field value amount
   * of debitor with the given userId.
   *
   */
  async addShare(gId: string, uId: string, money: number){
    const decrement = firebase.firestore.FieldValue.increment(-money);
    firebase.firestore().collection('group').doc(gId).collection('paymentTest').doc(uId)
      .collection('groupMembers').get().then((snapshot) => {
        for(const user of snapshot.docs) {
          user.ref.update({amount: decrement});
        }
      });
  }
}
