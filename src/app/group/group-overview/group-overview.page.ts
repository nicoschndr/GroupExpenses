import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  NavController,
  PopoverController,
  ViewDidEnter,
  ViewWillEnter
} from '@ionic/angular';
import {Share} from '@capacitor/share';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {User} from '../../models/classes/User.model';
import {UserService} from '../../services/user.service';
import {AlertsService} from '../../services/alerts.service';
import {Group} from '../../models/classes/group.model';
import {GroupService} from '../../services/group.service';
import {DebtsService} from '../../services/debts.service';
import {Debt} from '../../models/classes/debt';


@Component({
  selector: 'app-group-overview',
  templateUrl: './group-overview.page.html',
  styleUrls: ['./group-overview.page.scss'],
})
export class GroupOverviewPage implements ViewWillEnter {
  public editMode = false;
  public group: Group = new Group();
  public members: User[] = [];
  public membersDebt: Map<string, number> = new Map();
  public userDebts: Map<string, number> = new Map();
  public groupId: string;
  public debtOfUser = 0;
  private currentUserId: string;
  private isInGroup = false;
  private debts: Debt[] = [];

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private debtsService: DebtsService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private actionSheetController: ActionSheetController,
    private alertsService: AlertsService,
    private alertController: AlertController,
  ) {
  }

  async ionViewWillEnter() {
    await this.getUser();
    await this.getGroup();
    await this.getDebts(this.groupId);
    await this.getMembers();
    //check if the current user is a member of the group
    if (!this.isInGroup) {
      //if not, redirect to the grouplist
      this.router.navigate(['grouplist']);
    } else { //if so, trigger functions for showing the group
      await this.getDebtsOfMembers();
      await this.getDebtsOfCurrentUser();
      await this.getBalanceOfUser();
      await this.calcUsersDebt();
    }
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
        console.log(this.currentUserId);
      } else {
        //if not, redirect to grouplis view, where the logout is handled
        await this.router.navigate(['grouplist']);
      }
    });
  }

  /**
   * This function gets the current group
   */
  async getGroup() {
    //get the groupId from the url-parameters
    this.groupId = this.route.snapshot.paramMap.get('gId');
    //get all group-data from service
    this.group = await this.groupService.getGroupById(this.groupId);
  }



  /**************************************
   * Functions for handling the members *
   **************************************

  /**
   * This function gets all members and their information
   */
  async getMembers(): Promise<void> {
    const users: User[] = [new User()];
    //get all user-data for every userId in the members array from the group
    for (const userId of this.group.groupMembers) {
      //get user data from service
      const user: User = await this.userService.getUserWithUid(userId);
      //check if the handled userId is the currently logged in user
      if (user.id === this.currentUserId) {
        //if so, save him as the first user in the list
        this.isInGroup = true;
        users[0].id = user.id;
        users[0].firstName = 'Ich';
        users[0].lastName = user.lastName;
        users[0].email = user.email;
        users[0].password = user.password;
        users[0].gruppen = user.gruppen;
        users[0].reminderCount = user.reminderCount;
      } else {
        //if not, save the user in the list
        users.push(user);
        this.membersDebt.set(user.id, 0);
      }
    }
    //save list of users as members
    this.members = users;
  }

  /**
   * This function checks if the selected member should really be deleted or if the user really wants to leave the group
   * by showing an alert after the click on the 'x' in the memberlist or after clicking 'Gruppe verlasen' on the actionsheet
   *
   * @example
   * Call it with a userId type of string
   * confirmDeleteAction('2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param uId
   */
  async confirmDeleteAction(uId: string) {
    //check if the user which should be removed is the current user, if so the user wants to leave the group by himself
    if (uId === this.currentUserId) {
      //if so, show the appropriate alert
      const alertLeaveGroup = await this.alertController.create({
        cssClass: 'alert',
        header: 'Willst du die Gruppe wirklich verlassen?',
        buttons: [{
          text: 'Ja',
          handler: () => {
            //trigger the function which is removing the user from the group
            this.deleteUserFromGroup(uId);
          }
        }, {
          text: 'Nein',
          role: 'cancel',
        }]
      });
      await alertLeaveGroup.present();
      await alertLeaveGroup.onDidDismiss();
    } else {
      const alertDeleteUser = await this.alertController.create({
        cssClass: 'alert',
        header: 'Willst du das Gruppenmitglied wirklich entfernen?',
        buttons: [{
          text: 'Ja',
          handler: () => {
            //trigger the function which is removing the user from the group
            this.deleteUserFromGroup(uId);
            //reload the page and show the remaining members
            this.router.navigate(['group-overview', {gId: this.groupId}]);
          }
        }, {
          text: 'Nein',
          role: 'cancel',
        }]
      });
      await alertDeleteUser.present();
      await alertDeleteUser.onDidDismiss();
    }
  }

  /**
   * This function will handle the request for removing a user of a group or leaving the group after the demand of the
   * current user himself
   * it sends the request to the service and will handle its response
   *
   * @example
   * Call it with a userId type of string
   * deleteUserFromGroup('2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param uId
   */
  async deleteUserFromGroup(uId: string) {
    //delete user from group by using the service
    const deleteAction: boolean = await this.groupService.deleteUserFromGroup(uId, this.group.id);
    //check if the delete function was successfull
    if (deleteAction) {
      //if so, leave the edit mode, update the members and show the confirmation alert for the user
      this.editMode = false;
      await this.alertsService.showConfirmation();
      await this.getGroup();
      await this.getMembers();
    } else {
      await this.router.navigate(['grouplist']);
    }
  }



  /********************************************
   * Functions for handling group-invitations *
   ********************************************

  /**
   * This function will let the user share the data for joining a group with other apps
   */
  sendInvitation() {
    //define the message, which is showed when sharing the group
    // eslint-disable-next-line max-len
    const msg: string = 'Nehme an meiner Gruppe ' + this.group.name + ' teil, um unsere Ausgaben über die App Billie zu teilen! Lade die Billie-App aus dem App-Store und lege ein Konto an. Gebe anschließend folgende Daten im Bereich -Gruppe erstellen / Mit Gruppen-id teilnehmen- ein. Gruppen-Id: ' + this.group.id + ', Key:' + this.group.key;

    Share.canShare().then(canShare => {
      if (canShare.value) {
        Share.share({
          text: msg,
          dialogTitle: 'Leistungen teilen'
        }).then((v) => console.log('ok: ', v))
          .catch(err => console.log(err));
      } else {
        console.log('Error: Sharing not aviable!');
      }
    });
  }

  /**
   * This function will show the alert in which you can send an invitation
   */
  async sendInvitationAlert() {
    const alert = await this.alertController.create({
      cssClass: 'alertText',
      header: 'Sende eine Gruppeneinladung!',
      message: 'Gruppen-ID: ' + this.group.id + '<br>' +
        'Key: ' + this.group.key,
      buttons: [{
        text: 'teilen',
        handler: () => {
          //Call the function which handles the sharing
          this.sendInvitation();
        }
      }]
    });
    await alert.present();
    await alert.onDidDismiss();
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
    for (const user of this.members) {
      let sum = 0;
      //check for every debt-entry
      for (const debt of this.debts) {
        //if there is one, in which the current user is owing the currently viewed user money
        if (debt.dId === this.currentUserId && debt.cId === user.id && debt.paid === false) {
          //if so, then sum it up
          sum += debt.amount;
        }
      }
      //save the calculated amount in the map, which stores all debts the current user has
      this.userDebts.set(user.id, sum);
    }
  }

  /**
   * This function will calculate the amount of money the user is owing the members of the showed group in total
   * this number is automatically shown after opening the group-overview
   */
  getBalanceOfUser() {
    //sum up the amounts for every debt the currently logged in user has in the group
    this.userDebts.forEach( (value: number) => {
      this.debtOfUser += value;
    });
  }

  /**
   * This function will calculate the amount of money the groupmembers are owing the current user
   * for every member there is a seperate amount caluclated
   */
  async getDebtsOfMembers() {
    //calculate for every groupmember
    for (const user of this.members) {
      let sum = 0;
      //check every debt
      for (const debt of this.debts) {
        //if there is a debt entry, in which the current user is still a creditor to the currently viewed user
          if (debt.dId === user.id && debt.cId === this.currentUserId && debt.paid === false) {
            //if so, sum it up
            sum += debt.amount;
          }
      }
      //save the amount in the Map, in which all groupmembers are stored with the amount of money
      // they are still owing to the curren user
      this.membersDebt.set(user.id, sum);
    }
  }

  /**
   * This function will sum up for every pair of users what they are owing each other
   *
   * so if user A owes user B for example 10 € and user B owes user A only 5 €, the function will handle
   * the difference and will update the Maps, so that user A only needs to pay 5 € to user B
   */
  async calcUsersDebt() {
    console.log('memberDebts', this.membersDebt);
    console.log('users Debts', this.userDebts);
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
            await this.markDebtAsPaid(keyM, this.currentUserId);
            await this.markDebtAsPaid(this.currentUserId, keyM);
            this.userDebts.delete(keyU);
            this.membersDebt.delete(keyU);
          } else if (debt < 0) { //if the difference is negative, the current user is now a creditor
            this.membersDebt.delete(keyU); //change the value of the amount the member is owing to the current user
            this.membersDebt.set(keyU, (debt * (-1)));
            await this.markDebtAsPaid(keyU, this.currentUserId);
            const newDebtEntry: Debt = new Debt('', this.currentUserId, keyU, debt * (-1), false);
            await this.debtsService.addDebt(this.groupId, newDebtEntry);
            this.userDebts.delete(keyU); //delete the current user as debtor to the member
            await this.markDebtAsPaid(this.currentUserId, keyU); //mark the debts of the current user to the member as paid
          } else if (debt > 0) { //if the difference is positive the current user is still owing money to the member, but the amount is now smaller
            this.userDebts.delete(keyU);
            this.userDebts.set(keyU, debt); //save the new value of money the current user is owing to the member in the map
            await this.markDebtAsPaid(this.currentUserId, keyU);
            const newDebtEntry: Debt = new Debt('', keyU, this.currentUserId, debt, false);
            await this.debtsService.addDebt(this.groupId, newDebtEntry);
            this.membersDebt.delete(keyU); //the member is no debtor anymore, so delete the entry
            await this.markDebtAsPaid(keyU, this.currentUserId); //mark debts from the member to the current user as paid
          }
        }
        console.log('memberDebts', this.membersDebt);
        console.log('users Debts', this.userDebts);
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

  async sendPaymentReminder(debtorId: string) {
    const recipient: User = await this.userService.getUserWithUid(debtorId);
    const sender: User = await this.userService.getUserWithUid(this.currentUserId);

    // eslint-disable-next-line max-len
    const msg: string = 'Hallo ' + recipient.firstName + ', leider habe ich eine Zahlung von dir noch nicht erhalten. Bitte schau doch noch einmal in die Gruppe in der Billie-App und sende mit den Betrag zeinah. Viele Grüße' + sender.firstName;

    Share.canShare().then(canShare => {
      if (canShare.value) {
        Share.share({
          text: msg,
          dialogTitle: 'Zahlungserinnerung senden'
        }).then((v) => console.log('ok: ', v))
          .catch(err => console.log(err));
      } else {
        console.log('Error: Sharing not aviable!');
      }
    });
  }

  /**
   * This function sends a reminder to the user who owes the current user money
   * by clicking on the user card showed in the overview and selecting 'Zahlungserinnerung senden'
   *
   * @example
   * Call it with a userId type of string, this user is in this case a debitor, so its a debitorId
   * sendReminder('2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param debtorId
   */
  public async confirmSendReminder(debtorId: string) {
    //check for every debt of the group
    for (const debt of this.debts) {
      //if there is a entry in which the given debtor is still owing the current user money
      if (debt.dId === debtorId && debt.cId === this.currentUserId && debt.paid === false) {
        //then open the dialog in which the current user can send a reminder
        const alertSendReminder = await this.alertController.create({
          cssClass: 'alert',
          header: 'Möchtest du eine Zahlungserinnerung senden?',
          buttons: [{
            text: 'Ja',
            handler: () => {
              //increment the reminder counter by one to show the alert to the owing user the next time he opens the app
              this.userService.setReminderCount(debtorId);
              this.sendPaymentReminder(debtorId);
              //reload the members array
              this.getMembers();
            }
          }, {
            text: 'Nein',
            role: 'cancel',
          }]
        });
        await alertSendReminder.present();
        await alertSendReminder.onDidDismiss();
      }
      //stop checking the entries, because there has been an entry found which is not paid yet
      break;
    }
  }



  /**************************************************************************
   * Functions for handling navigation, actionsheets, conditional rendering *
   **************************************************************************/

  /**
   * This function will make the user leave the edit-mode
   */
  leaveEditMode() {
    this.editMode = false;
  }

  /**
   * This function will show the action sheet, which is triggered by clicking on
   * the '...' in the header while being on the group-overview page
   */
  async showActions() {
    const actionSheet = await this.actionSheetController.create({
      buttons: [{
        text: 'Mitglieder bearbeiten',
        handler: () => {
          this.editMode = true;
        }
      }, {
        text: 'Gruppe verlassen',
        handler: () => {
          this.deleteUserFromGroup(this.currentUserId);
        }
      }, {
        text: 'Gruppeneinladung versenden',
        handler: () => {
          this.sendInvitationAlert();
        }
      }, {
        text: 'Abbrechen',
        role: 'cancel',
        handler: () => {
          console.log('canceled action sheet group-overview');
        }
      }]
    });
    await actionSheet.present();
  }

  /**
   * This function will navigate the user to the expenses page of the group
   *
   * @example
   * Call it with a groupId type of string
   * sendReminder('2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param groupId
   */
  showExpensesOverview(groupId: string){
    this.router.navigate(['expenses/', {gId: groupId}]).catch((err) => console.log('Error: ', err));
  }
}

