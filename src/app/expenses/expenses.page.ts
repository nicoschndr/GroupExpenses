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
import {Debt} from '../models/classes/debt';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
})
export class ExpensesPage implements OnInit {
  segment = 'Aufteilung';
  expense: Expense;
  expenses: Expense[] = [];
  expensesInterval: Expense[] = [];
  income: Expense;
  incoming: Expense[] = [];
  groupId: string;
  users: User[];
  split = [];
  splittedExpense: Expense[] = [];
  splittedIncome: Expense[] = [];
  currentUserId: string;
  currentGroup: Group;
  debts: Debt[] = [];
  debtOfUser = 0;
  public membersDebt: Map<string, number> = new Map();
  public userDebts: Map<string, number> = new Map();
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
    await this.getUser();
    this.groupId = this.route.snapshot.paramMap.get('gId');
    this.getCurrentUserData().catch((err) => console.log('Error: ', err));
    await this.getExpenses(this.groupId);
    await this.getIncoming(this.groupId);
    await this.getGroup();
    await this.getExpenseInterval(this.groupId);
  }
  segmentChanged(ev: any){
    console.log('Segment changed to ', ev);
  }

  /**
   * This function get the currently logged in user
   */
  async getUser() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      //check if there is a user logged in
      if (user) {
        //if so, save
        this.currentUserId = await this.userService.getCurrentUserId();
      } else {
        //if not, redirect to grouplis view, where the logout is handled
        await this.router.navigate(['grouplist']);
      }
    });
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
    this.expensesService.getAllExpenses(groupId).subscribe((res) => {
      this.expenses = res.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as Expense
      }));
    });
  }

  async getSplit(groupId: string){
    this.splittedExpense = await this.expensesService.getSplitExpenses(groupId);
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
    await modal.onDidDismiss().then((res) => {
      this.segment = res.data;
    });
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
    await modal.onDidDismiss().then((res) => {
      this.segment = res.data;
    });
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

  async getExpenseInterval(groupId: string){
    this.expensesService.getAllIntervalExpensesFromGroup(groupId).subscribe((res) => {
      this.expensesInterval = res.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as Expense
      }));
    });
  }

  async addNewIntervalEntry(){
    for(const expense of this.expensesInterval){
      if(expense.interval === true && expense.split === true){

      }
    }
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
    this.incomingService.getAllIncoming(groupId).subscribe((res) => {
      this.incoming = res.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as Expense
      }));
    });
  }

  async getSplittedIncome(groupId: string){
    this.splittedIncome = await this.incomingService.getSplitIncoming(groupId);
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
    await modal.onDidDismiss().then((res) => {
      this.segment = res.data;
    });
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
    await modal.onDidDismiss().then((res) => {
      this.segment = res.data;
    });
  }

  /**
   * This function will open a modal to show entry details.
   *
   * @example
   * Call it with an object of type 'Expense'
   * showIncomeDetails(income: Expense)
   *
   * @param income
   */
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

  /**
   * This function will open an alert if entry was successfully deleted.
   */
  async openSuccessAlert(){
    const alertSuccess = await this.alertCtrl.create({
      header: 'Erfolgreich',
      message: 'Eintrag wurde gelöscht.',
      buttons: ['OK']
    });
    await alertSuccess.present();
  }

  async showDebts() {
    await this.debtsService.calculateDebtsForExpenses(this.groupId, this.expenses);
    await this.debtsService.calculateDebtsForIncomes(this.groupId, this.incoming);
    await this.getExpenses(this.groupId);
    await this.getIncoming(this.groupId);
    await this.getDebts(this.currentGroup.id);
    await this.getDebtsOfMembers();
    await this.getDebtsOfCurrentUser();
    await this.calcUsersDebt();
  }

  async getGroup(){
    this.currentGroup = await this.groupService.getGroupById(this.groupId);
  }

  /*********************************************
   * Functions for handling debts and payments *
   *********************************************/

  /**
   * This function will get all debts from the group
   *
   * @example
   * Call it with a groupId type of string
   * getDebts('2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param groupId
   */
  async getDebts(groupId: string) {
    //request all debts from service
    this.debts = await this.debtsService.getDebts(groupId);
  }

  /**
   * This function will calculate the amount of money the current user is owing to his group-members
   * for every member is a total saved in a Map
   */
  getDebtsOfCurrentUser() {
    //calculate the amount the user is owing for every member of the group
    for (const user of this.currentGroup.groupMembers) {
      let sum = 0;
      //check for every debt-entry
      for (const debt of this.debts) {
        //if there is one, in which the current user is owing the currently viewed user money
        if (debt.dId === this.currentUserId && debt.cId === user && debt.paid === false) {
          //if so, then sum it up
          sum += debt.amount;
        }
      }
      //save the calculated amount in the map, which stores all debts the current user has
      this.userDebts.set(user, sum);
    }
  }

  /**
   * This function will calculate the amount of money the groupmembers are owing the current user
   * for every member there is a seperate amount caluclated
   */
  async getDebtsOfMembers() {
    //calculate for every groupmember
    for (const user of this.currentGroup.groupMembers) {
      let sum = 0;
      //check every debt
      for (const debt of this.debts) {
        //if there is a debt entry, in which the current user is still a creditor to the currently viewed user
        if (debt.dId === user && debt.cId === this.currentUserId && debt.paid === false) {
          //if so, sum it up
          sum += debt.amount;
        }
      }
      //save the amount in the Map, in which all groupmembers are stored with the amount of money
      // they are still owing to the curren user
      this.membersDebt.set(user, sum);
    }
  }

  /**
   * This function will sum up for every pair of users what they are owing each other
   *
   * so if user A owes user B for example 10 € and user B owes user A only 5 €, the function will handle
   * the difference and will update the Maps, so that user A only needs to pay 5 € to user B
   */
  async calcUsersDebt() {
    //check for every member the current user is owing money
    for (const [keyU, valueU] of this.userDebts) {
      // `key` is the key of the entry, `value` is the value
      let debt = 0;
      //check if this member is also owing the current user money
      for (const [keyM, valueM] of this.membersDebt) {
        if (keyU === keyM) {
          //if so, calculate the difference
          debt = valueU - valueM;
          if (debt === 0) { //if they are owing the same amount, mark their debts as paid and delete the debts from the maps
            await this.markDebtAsPaid(keyM, this.currentUserId); //delete debt from firebase
            await this.markDebtAsPaid(this.currentUserId, keyM); //delete debt from firebase
            this.userDebts.delete(keyU); //delete entry from user map
            this.membersDebt.delete(keyU); //delete entry from members map
          } else if (debt < 0) { //if the difference is negative, the current user is now a creditor
            this.membersDebt.set(keyU, (debt * (-1))); //update map entry
            await this.markDebtAsPaid(keyU, this.currentUserId); //delete debt from firebase
            const newDebtEntry: Debt = new Debt('', this.currentUserId, keyU, debt * (-1), false); //create new debt entry with new amount
            await this.debtsService.addDebt(this.groupId, newDebtEntry); //add new debt to firebase
            this.userDebts.delete(keyU); //delete the current user as debtor to the member
            await this.markDebtAsPaid(this.currentUserId, keyU); //mark the debts of the current user to the member as paid
            // eslint-disable-next-line max-len
          } else if (debt > 0) { //if the difference is positive the current user is still owing money to the member, but the amount is now smaller
            this.userDebts.set(keyU, debt); //save the new value of money the current user is owing to the member in the map
            await this.markDebtAsPaid(this.currentUserId, keyU); //delete debt from firebase
            const newDebtEntry: Debt = new Debt('', keyU, this.currentUserId, debt, false); //create new debt entry with new amount
            await this.debtsService.addDebt(this.groupId, newDebtEntry); //add new debt to firebase
            this.membersDebt.delete(keyU); //the member is no debtor anymore, so delete the entry
            await this.markDebtAsPaid(keyU, this.currentUserId); //mark debts from the member to the current user as paid
          }
        }
      }
    }
  }

  /**
   * This function will mark all debts from a user for a certain creditor as paid
   * after clicking on the card of a user and selecting 'Zahlung erhalten'
   * or from the app itself, when two users are owing each other the same amount of money
   *
   * @example
   * Call it with two userIds type of string, one user is the debtor and the other one is the creditor
   * markDebtAsPaid('2uGkBIjf5WYoL4UZdObrca9T6mv1', '5si49sjs3kqjb2h2553ddsf')
   *
   * @param dId
   * @param cId
   */
  public async markDebtAsPaid(dId: string, cId?: string) {
    for (const debt of this.debts) {
      if (debt.dId === dId && debt.cId === cId || debt.dId === dId && debt.cId === this.currentUserId) {
        await this.debtsService.deletePaidDebtsById(this.groupId, debt.id);
        await this.userService.unsetReminderCount(dId);
      }
    }
  }
}
