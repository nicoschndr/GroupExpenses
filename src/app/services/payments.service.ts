import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import { Payment } from '../models/classes/payment.model';
@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  private paymentCollection: AngularFirestoreCollection<Payment>;

  constructor(private afs: AngularFirestore) {
    this.paymentCollection = afs.collection<Payment>('payments');
  }

  async getPayment(pId: string) {
    const doc = await this.paymentCollection.doc(pId).get().toPromise();
    return doc.data() as Payment;
  }

  async getOpenPaymentsForUser(uId: string) {
    const doc = await this.paymentCollection.doc(uId);
  }

  async setReminderForPayment(pId: string) {
    const data: Payment = await this.getPayment(pId);
    data.reminder = true;
    await this.paymentCollection.doc(pId).update(data);
  }
}
