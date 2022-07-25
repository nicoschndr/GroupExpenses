import { Component, OnInit } from '@angular/core';
import {Expense} from '../models/classes/expense';
import {ActionSheetController, AlertController, ModalController} from '@ionic/angular';
import {ExpensesService} from '../services/expenses.service';
import {AddExpenseComponent} from '../components/add-expense/add-expense.component';
import {IncomingsService} from '../services/incomings.service';
import {User} from '../models/classes/User.model';
import {UserService} from '../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DebtsService} from '../services/debts.service';
import {Group} from '../models/classes/Group.model';
import {DetailsPageComponent} from '../components/details-page/details-page.component';
import {GroupService} from '../services/group.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
})
export class ExpensesPage implements OnInit {
  segment = 'Aufteilung';
  expense: Expense;
  expenses: Expense[] = [];
  income: Expense;
  incoming: Expense[] = [];
  groupId: string;
  users: User[];
  split = [];
  currentUserId: string;
  currentGroup: Group;
  constructor(private actionSheet: ActionSheetController,
              public expensesService: ExpensesService,
              private modalCtrl: ModalController,
              public incomingService: IncomingsService,
              private alertCtrl: AlertController,
              private userService: UserService,
              private router: Router,
              private route: ActivatedRoute,
              public debtsService: DebtsService,
              private groupService: GroupService
              ) {}

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('gId');
    this.getCurrentUserData().catch((err) => console.log('Error: ', err));
    await this.getExpenses(this.groupId);
    await this.getIncoming(this.groupId);
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
   * This function will get all expenses of the current group with the given group id.
   *
   * @example
   * Call it with a group id as a string
   * getExpenses('h8f5h2gg4')
   *
   * @param groupId
   */
  async getExpenses(groupId: string) {
    this.expenses = await this.expensesService.getAllExpenses(groupId);
  }

  /**
   * This function will open and pass group id and type to modal form to create a new expense.
   */
  async openAddExpensesModal(){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        groupId: this.groupId,
        id: '',
        type: 'expense',
      }
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }

  /**
   * This function will open and pass expense id and type to modal form for user to update expense data.
   *
   * @example
   * Call it with an expense id as a string
   * editExpense('z5t84hug')
   *
   * @param expense
   */
  async editExpense(expense: Expense){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        data: expense,
        type: 'expense',
      },
    });
    await modal.present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }

  /**
   * This function will navigate to details page with expense id.
   *
   * @example
   * Call it with an expense id as a string
   * showExpenseDetails('fu98tq3')
   *
   * @param expense
   */
  async showExpenseDetails(expense: Expense){
    const modal = await this.modalCtrl.create({
      component: DetailsPageComponent,
      componentProps: {
        data: expense
      }
    });
    await modal.present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }

  /**
   * This function will delete expense from firestore with given expense object.
   *
   * @example
   * Call it with an object of type Expense
   * deleteExpense(expense: Expense)
   *
   * @param expense
   */
  async deleteExpense(expense: Expense){
    const alertConfirm = await this.alertCtrl.create({
      header: 'Sind Sie sicher?',
      message: 'Soll der Eintrag ' + '"'+ expense.name +'"' + ' wirklich gelöscht werden?',
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
   * This function will get all incoming from current group with given group id
   *
   * @example
   * Call it with a group id as a string
   * getIncoming('fnt4gtr')
   *
   * @param groupId
   */
  async getIncoming(groupId: string){
    this.incoming = await this.incomingService.getAllIncoming(groupId);
  }

  /**
   * This function will open and pass group id and type to modal form to create a new income.
   */
  async openAddIncomeModal(){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        groupId: this.groupId,
        id: '',
        type: 'income',
      }
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }

  /**
   * This function will open and pass expense id and type to modal form for user to update income data.
   *
   * @example
   * Call it with an expense id as a string
   * editExpense('z5t84hug')
   *
   * @param income
   */
  async editIncome(income: Expense){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        data: income,
        type: 'income',
      },
    });
    await modal.present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }

  async showIncomeDetails(income: Expense){
    const modal = await this.modalCtrl.create({
      component: DetailsPageComponent,
      componentProps: {
        data: income
      }
    });
    await modal.present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }

  /**
   * This function will delete expense from firestore with given income object.
   *
   * @example
   * Call it with an object of type Expense
   * deleteExpense(income: Expense)
   *
   * @param income
   */
  async deleteIncome(income: Expense){
    const alertConfirm = await this.alertCtrl.create({
      header: 'Sind Sie sicher?',
      message: 'Soll der Eintrag '+'"'+ income.name + '"'+ ' wirklich gelöscht werden?',
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

  async showDebts() {
    await this.debtsService.calculateDebtsForExpenses(this.groupId, this.expenses);
    await this.debtsService.calculateDebtsForIncomes(this.groupId, this.incoming);
    await this.getExpenses(this.groupId);
    await this.getIncoming(this.groupId);
  }

  async calcShare(){
    this.currentGroup = await this.groupService.getGroupById(this.groupId);
    let userIncoming: Expense[] = [];
    for(const uId of this.currentGroup.groupMembers){
      userIncoming = this.incoming.filter((obj) => obj.userId === uId);
      let userSum = 0;
      let share = 0;
      for(const income of userIncoming){
        userSum += income.amount;
      }
      share = userSum / this.currentGroup.groupMembers.length;
      await this.incomingService.addShare(this.groupId, uId, share);
    }
  }
}
