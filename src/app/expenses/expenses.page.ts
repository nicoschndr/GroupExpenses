import { Component, OnInit } from '@angular/core';
import {Expense} from '../models/classes/expense';
import {ActionSheetController, AlertController, ModalController, ViewWillEnter} from '@ionic/angular';
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
export class ExpensesPage implements ViewWillEnter {
  segment = 'Aufteilung';
  expense: Expense;
  expenses: Expense[] = [];
  expensesInterval: Expense[] = [];
  income: Expense;
  incoming: Expense[] = [];
  groupId: string;
  users: User[];
  split = [];
  currentUserId: string;
  currentGroup: Group;
  debts: Debt[] = [];
  membersNameMap: Map<string, string> = new Map<string, string>();
  membersDebt: Map<string, number> = new Map();
  userDebts: Map<string, number> = new Map();
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

  async ionViewWillEnter() {
    this.segment = 'Aufteilung';
    await this.getUser();
    this.groupId = this.route.snapshot.paramMap.get('gId');
    this.getCurrentUserData().catch((err) => console.log('Error: ', err));
    await this.getExpenses(this.groupId);
    await this.getIncoming(this.groupId);
    await this.getGroup();
    await this.getExpenseInterval(this.groupId);
    await this.getMembers();
    await this.getDebts(this.currentGroup.id);
    await this.addNewIntervalEntry();
  }

  /**
   * This function get the currently logged-in user
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
    await modal.onDidDismiss().then(() => this.segment = 'Ausgaben');
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
    await modal.onDidDismiss().then(() => this.segment = 'Ausgaben');
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

  /**
   * This function will get all expenses that should return every month that was already split.
   */
  async getExpenseInterval(groupId: string){
    this.expensesService.getAllSplitIntervalExpensesFromGroup(groupId).subscribe((res) => {
      this.expensesInterval = res.map((e) => ({
        id: e.payload.doc.id,
        ...e.payload.doc.data() as Expense
      }));
    });
  }

  /**
   * This function will change the date of the expense and set split to false and call a method from expense service
   * to add that is supposed to be called every month.
   */
  async addNewIntervalEntry(){
    for(const expense of this.expensesInterval){
      expense.split = false;
      const date = new Date(expense.date);
      const newMonth = date.getMonth()+1;
      const setNewMonth = date.setMonth(newMonth);
      expense.date = new Date(setNewMonth).getTime();
      await this.expensesService.addExpense(expense);
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
    await modal.onDidDismiss().then(() => this.segment = 'Einnahmen');
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
    await modal.onDidDismiss().then(() => this.segment = 'Einnahmen');
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

  /**
   * This function will navigate back to the group overview with the given group ID.
   *
   * @example
   * Call it with a group ID as a string
   * backToGroupOverview('8tru2se')
   *
   * @param groupId
   */
  backToGroupOverview(groupId: string){
    this.router.navigate(['group-overview/', {gId: groupId}]).catch((err) => console.log('Error: ', err));
  }

  /**
   * This function will call all needed methods to calculate and split the expenses & incoming of the current group.
   */
  async showDebts() {
    //The two methods from debt service to calculate the new expenses & incoming that has not been split yet.
    await this.debtsService.calculateDebtsForExpenses(this.groupId, this.expenses);
    await this.debtsService.calculateDebtsForIncomes(this.groupId, this.incoming);
    //This function will get all debts of current group
    await this.getDebts(this.currentGroup.id);
    //This function will calculate the debts of the other group members
    await this.getDebtsOfMembers();
    //This function will calculate the debts of the current user
    await this.getDebtsOfCurrentUser();
    //This function will calculate the debts between each user
    await this.calcUsersDebt();
    //This function will get the list of all expenses
    await this.getExpenses(this.groupId);
    //This function will get the list of all incoming
    await this.getIncoming(this.groupId);
    //This function will get all debts of current group
    await this.getDebts(this.currentGroup.id);
    //This function will update all expenses with an interval for the coming month
    await this.addNewIntervalEntry();
  }

  /**
   * This function will get all data from current group
   */
  async getGroup(){
    this.currentGroup = await this.groupService.getGroupById(this.groupId);
  }

  /**
   * This function gets all members and their information
   */
  async getMembers(): Promise<void> {
    //get all user-data for every userId in the members array from the group
    for (const userId of this.currentGroup.groupMembers) {
      //get user data from service
      const user: User = await this.userService.getUserWithUid(userId);
      this.membersNameMap.set(userId, user.firstName);
    }
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
      }
    }
  }
}
