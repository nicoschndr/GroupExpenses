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
  //groupUser: Group;
  split = [];
  constructor(private actionSheet: ActionSheetController, public expensesService: ExpensesService,
              private modalCtrl: ModalController, public incomingService: IncomingsService,
              private alertCtrl: AlertController) {
    this.expenses.unshift(new Expense('expense1', 'Zahnpasta', '3,45', new Date(), '', false));
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
    console.log('expense: ', JSON.stringify(this.expense));
  }
  getExpenses(){
    this.expensesService.getAllExpenses().subscribe((res) => {
      this.expenses = res.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as Expense
      }));
    });
    console.log('all Expenses: ' + JSON.stringify(this.expense));
  }
  openAddExpensesModal(){
    this.openModalExpense();
  }
  async openModalExpense(){
    console.log('modale expense');
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async editExpense(expense){
    console.log('edit expense');
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: expense,
    });
    await modal.present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  deleteExpense(expense: Expense){
    this.expensesService.removeEntry(expense.id);
  }
  addExpenseStatus(){
    this.expenseStatus = true;
  }
  //methods for incoming
  async getOneIncome(income: Income){
    this.income = await this.incomingService.getEntryById(income.id);
    console.log('income: ', JSON.stringify(this.income));
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
    console.log('modal income');
    const modal = await this.modalCtrl.create({
      component: AddIncomeComponent
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async editIncome(income){
    console.log('edit income');
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
    await this.incomingService.removeEntry(income.id);
    const alert = await this.alertCtrl.create({
      header: 'Erfolgreich',
      message: 'Einnahme wurde gelöscht.',
      buttons: ['OK']
    });
    await alert.present();
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
