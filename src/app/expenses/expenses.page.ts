import { Component, OnInit } from '@angular/core';
import {Expense} from '../models/classes/expense';
import{Income} from '../models/classes/income';
import {ActionSheetController, AlertController, ModalController} from '@ionic/angular';
import {ExpensesService} from '../services/expenses.service';
import {AddExpenseComponent} from '../components/add-expense/add-expense.component';
import {IncomingsService} from '../services/incomings.service';
import {AddIncomeComponent} from '../components/add-income/add-income.component';
import {User} from '../models/classes/User.model';
import {UserService} from '../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupService} from '../group/group.service';
import {ExpenseDetailsPage} from '../expense-details/expense-details.page';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
})
export class ExpensesPage implements OnInit {
  segment = 'Aufteilung';
  expense: Expense;
  expenses: Expense[] = [];
  income: Income;
  incoming: Income[] = [];
  groupId: string;
  users: User[];
  split = [];
  currentUserId: string;
  constructor(private actionSheet: ActionSheetController, public expensesService: ExpensesService,
              private modalCtrl: ModalController, public incomingService: IncomingsService,
              private alertCtrl: AlertController, private userService: UserService,
              private router: Router, private route: ActivatedRoute) {
    this.groupId = this.route.snapshot.paramMap.get('gId');
    this.getCurrentUserData().catch((err) => console.log('Error: ', err));
    this.getExpenses(this.groupId);
    this.getIncoming(this.groupId);
  }

  ngOnInit() {
  }
  segmentChanged(ev: any){
    console.log('Segment changed to ', ev);
  }
  //methods for expenses
  async getExpenseById(expense: Expense){
    this.expense = await this.expensesService.getEntryById(expense.id);
  }
  async getCurrentUserData(){
    this.currentUserId = await this.userService.getCurrentUserId();
  }
  getExpenses(id: string){
    this.expensesService.getAllExpenses(id).subscribe((res) => {
      this.expenses = res.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as Expense
      }));
    });
    this.expenses.sort();
  }
  async openAddExpensesModal(){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        groupId: this.groupId,
      }
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
  showExpenseDetails(id: string){
    this.router.navigate(['expense-details/', {eId: id}]).catch((err) => console.log('Error: ', err));
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
            this.openSuccessAlert();
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        }
      ]
    });
    await alertConfirm.present();
  }
  //methods for incoming
  async getOneIncome(income: Income){
    this.income = await this.incomingService.getEntryById(income.id);
  }
  getIncoming(id: string){
    this.incomingService.getAllIncoming(id).subscribe((res) => {
      this.incoming = res.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as Income
      }));
    });
  }
  async openAddIncomeModal(){
    const modal = await this.modalCtrl.create({
      component: AddIncomeComponent,
      componentProps: {
        groupId: this.groupId,
      }
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
            this.openSuccessAlert();
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        }
      ]
    });
    await alertConfirm.present();
  }
  async openSuccessAlert(){
    const alertSuccess = await this.alertCtrl.create({
      header: 'Erfolgreich',
      message: 'Ausgabe wurde gelöscht.',
      buttons: ['OK']
    });
    await alertSuccess.present();
  }
}
