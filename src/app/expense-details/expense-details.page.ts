import { Component, OnInit } from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {ExpensesService} from '../services/expenses.service';
import {Expense} from '../models/classes/expense';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-expense-details',
  templateUrl: './expense-details.page.html',
  styleUrls: ['./expense-details.page.scss'],
})
export class ExpenseDetailsPage implements OnInit {
  eId: string;
  expense: Expense;
  interval: string;

  constructor(private modalCtrl: ModalController, private alertCtrl: AlertController,
              private expensesService: ExpensesService, private route: ActivatedRoute,
              private router: Router) {
    this.eId = this.route.snapshot.paramMap.get('eId');
    this.getExpense().catch((err) => console.log('Error: ', err));
  }

  ngOnInit() {
  }
  async getExpense(){
    this.expense = await this.expensesService.getEntryById(this.eId);
    if(this.expense.interval === true){
      this.interval = 'Ja';
    } else {
      this.interval = 'Nein';
    }
  }
  async deleteExpense(){
    const alertConfirm = await this.alertCtrl.create({
      header: 'Sind Sie sicher?',
      message: 'Soll der Eintrag wirklich gelöscht werden?',
      buttons: [
        {
          text: 'Ja',
          handler: () => {
            this.expensesService.removeEntry(this.expense.id);
            this.dismissModal();
            alertSuccess.present();
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        }
      ]
    });
    await alertConfirm.present();
    const alertSuccess = await this.alertCtrl.create({
      header: 'Erfolgreich',
      message: 'Ausgabe wurde gelöscht.',
      buttons: ['OK']
    });
  }
  expenseOverview(){
  }
  dismissModal(){
    this.modalCtrl.dismiss().catch((err) => console.log('Error: ', err));
  }
}
