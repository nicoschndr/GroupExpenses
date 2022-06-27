import { Component, OnInit } from '@angular/core';
import {Expense} from '../models/classes/expense';
import{Income} from '../models/classes/income';
import {ActionSheetController, AlertController, ModalController} from '@ionic/angular';
import {ExpensesService} from '../services/expenses.service';
import {AddExpenseComponent} from '../components/add-expense/add-expense.component';
import {IncomingsService} from '../services/incomings.service';
import {AddIncomeComponent} from '../components/add-income/add-income.component';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
})
export class ExpensesPage implements OnInit {
  segment = 'Aufteilung';
  expense: Expense;
  expenses: Expense[] = [];
  expenseStatus = false;
  income: Income;
  incoming: Income[] = [];
  incomeStatus = false;
  // debitor: User;
  // creditor: User;
  // groupUser: Group;
  split = [];
  constructor(private actionSheet: ActionSheetController, public expensesService: ExpensesService,
              private modalCtrl: ModalController, public incomingService: IncomingsService,
              private alertCtrl: AlertController) {
    this.getExpenses();
    this.getIncoming();
  }

  ngOnInit() {
  }
  segmentChanged(ev: any){
    console.log('Segment changed to ', ev);
  }
  //methods for expenses
  async getOneExpense(expense: Expense){
    this.expense = await this.expensesService.getEntryById(expense.id);
  }
  getExpenses(){
    this.expensesService.getAllExpenses().subscribe((res) => {
      this.expenses = res.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as Expense
      }));
    });
  }
  openAddExpensesModal(){
    this.openModalExpense();
  }
  async openModalExpense(){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async editExpense(expense: Expense){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: expense,
    });
    await modal.present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async deleteExpense(expense: Expense){
    const alertConfirm = await this.alertCtrl.create({
      header: 'Sind Sie sicher?',
      message: 'Soll der Eintrag ' + expense.name + ' wirklich gelöscht werden?',
      buttons: [
        {
          text: 'Ja',
          handler: () => {
            this.expensesService.removeEntry(expense.id);
            // alertSuccess.present();
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        }
      ]
    });
    await alertConfirm.present();
    // const alertSuccess = await this.alertCtrl.create({
    //   header: 'Erfolgreich',
    //   message: 'Ausgabe wurde gelöscht.',
    //   buttons: ['OK']
    // });
  }
  addExpenseStatus(){
    this.expenseStatus = true;
  }
  //methods for incoming
  async getOneIncome(income: Income){
    this.income = await this.incomingService.getEntryById(income.id);
  }
  getIncoming(){
    this.incomingService.getAllIncoming().subscribe((res) => {
      this.incoming = res.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as Income
      }));
    });
  }
  openAddIncomeModal(){
    this.openModalIncome();
  }
  async openModalIncome(){
    const modal = await this.modalCtrl.create({
      component: AddIncomeComponent
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async editIncome(income: Income){
    const modal = await this.modalCtrl.create({
      component: AddIncomeComponent,
      componentProps: income,
    });
    await modal.present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async deleteIncome(income: Income){
    const alertConfirm = await this.alertCtrl.create({
      header: 'Sind Sie sicher?',
      message: 'Soll der Eintrag wirklich gelöscht werden?',
      buttons: [
        {
          text: 'Ja',
          handler: () => {
            this.incomingService.removeEntry(income.id);
            // alertSuccess.present();
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        }
      ]
    });
    await alertConfirm.present();
    // const alertSuccess = await this.alertCtrl.create({
    //   header: 'Erfolgreich',
    //   message: 'Ausgabe wurde gelöscht.',
    //   buttons: ['OK']
    // });
  }
  // async openActionSheet(){
  //   console.log('Open Action Sheet');
  //   const actionSheet = await this.actionSheet.create({
  //     header: 'Neuer Eintrag',
  //     buttons: [
  //       {
  //         text: 'Ausgabe hinzufügen',
  //         handler: () => {
  //           console.log('Ausgabe hinzufügen');
  //         }
  //       },
  //       {
  //         text: 'Einnahme hinzufügen',
  //         handler: () => {
  //           console.log('Einnahme hinzufügen');
  //         }
  //       },
  //       {
  //         text: 'Abbrechen',
  //         role: 'cancel',
  //         handler: () => {
  //           console.log('Vorgang abgebrochen');
  //         }
  //       },
  //     ],
  //   });
  //   console.log('Second');
  //   await actionSheet.present();
  //   console.log('Third');
  // }
}
