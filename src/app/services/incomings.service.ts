import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Income} from '../models/classes/income';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncomingsService {
  entry: Income;
  amount = 0;
  toUserId = '';
  fromUserId = '';
  date: Date;
  private incomingCollections: AngularFirestoreCollection<Income>;
  private incoming: Observable<Income>;
  constructor(private afs: AngularFirestore) {
    this.incomingCollections = this.afs.collection('incoming');
  }
  async addIncome(entry: Income) {
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
    return document.data() as Income;
  }
  updateIncome(income: Income){
    const data = JSON.parse(JSON.stringify(income));
    this.incomingCollections.doc(income.id).update(data)
      .catch((err) => console.log('Error: ', err));
  }
  async removeEntry(id: string){
    await this.incomingCollections.doc(id).delete();
  }
}
