import { Component, OnInit } from '@angular/core';
import {Expense} from '../models/classes/expense';
import{Income} from '../models/classes/income';
import {ActionSheetController, AlertController, ModalController} from '@ionic/angular';
import {ExpensesService} from '../services/expenses.service';
import {AddExpenseComponent} from '../components/add-expense/add-expense.component';
import {IncomingsService} from '../services/incomings.service';
import {User} from '../models/classes/User.model';
import {UserService} from '../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupService} from '../group/group.service';
import {ExpenseDetailsPage} from '../expense-details/expense-details.page';
import {Group} from '../models/classes/Group.model';

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
  currentGroup: Group;
  constructor(private actionSheet: ActionSheetController, public expensesService: ExpensesService,
              private modalCtrl: ModalController, public incomingService: IncomingsService,
              private alertCtrl: AlertController, private userService: UserService,
              private router: Router, private route: ActivatedRoute, private groupService: GroupService) {
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

  /**
   * This function will get id of current / logged-in user by calling getCurrentUserId() from userService.
   */
  async getCurrentUserData(){
    this.currentUserId = await this.userService.getCurrentUserId();
  }

  /****************************
   * Functions for expenses   *
   ***************************/

  /**
   *
   * @param id
   */
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
        type: 'expense',
      }
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async editExpense(entryId: string){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        id: entryId,
        type: 'expense',
      },
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

  /**************************
   * Functions for incoming *
   **************************/

  /**
   *
   * @param id
   */
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
      component: AddExpenseComponent,
      componentProps: {
        groupId: this.groupId,
        type: 'income',
      }
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async editIncome(entryId: string){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        id: entryId,
        type: 'income',
      },
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
  async calcShare(){
    console.log('calc share');
    this.currentGroup = await this.groupService.getGroup(this.groupId);
    const group: Group = new Group(
      ['qnJ51aAi7iZevuMRAUhp5FXrLI63', '94u305hugwo', '98h435h02gj94', 'fn82303z543214'],
      'kjhji',
      'kjhji'
    );
    for(const uId of group.groupMembers){
      // Can not fetch data for some reasons, still working on it
      const userIncoming: Income[] = this.incomingService.getIncomingByUserId(this.groupId, uId);
      let userSum = 0;
      let share = 0;
      const incomingTest: Income[] = [
        new Income(
          '8if9z435h23',
          'qnJ51aAi7iZevuMRAUhp5FXrLI63',
          'Benjamin',
          '84h209gh4',
          'Max',
          10,
          new Date(),
          'hf8345iuhwge'),
      ];
      console.log('user Incoming: ', JSON.stringify(userIncoming));
      for(const income of incomingTest){
        userSum += income.amount;
      }
      share = userSum / group.groupMembers.length;
      await this.incomingService.addShare(this.groupId, uId, share);
    }
  }
}
