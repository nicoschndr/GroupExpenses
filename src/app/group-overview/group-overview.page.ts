import {Component, OnInit} from '@angular/core';
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
import {User} from '../models/classes/User.model';
import {UserService} from '../services/user.service';
import {AlertsService} from '../services/alerts.service';
import {Group} from '../models/classes/Group.model';
import {GroupService} from '../services/group.service';
import {DebtsService} from '../services/debts.service';
import {Debt} from '../models/classes/Debt';


@Component({
  selector: 'app-group-overview',
  templateUrl: './group-overview.page.html',
  styleUrls: ['./group-overview.page.scss'],
})
export class GroupOverviewPage implements ViewWillEnter {
  public editMode = false;
  public group: Group = new Group('', '', [], '');
  public members: User[] = [];
  public membersDebt: Map<string, number> = new Map();
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
    await this.getMembers();
    //check if the current user is a member of the group
    if (!this.isInGroup) {
      //if not, redirect to the grouplist
      await this.router.navigate(['grouplist']);
    } else {
      //if the user is a member, then load all debts
      await this.getDebtsOfCurrentGroup();
      await this.getDebtOfCurrentUser();
      await this.getDebtsOfMembers();
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
    localStorage.setItem('gId', JSON.stringify(this.groupId));
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

  /******************************************
   * Functions for handling delete actions *
   ******************************************

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
            //trigger the function which checks if the delete actions is allowed
            this.checkDeleteAction(uId);
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
            this.checkDeleteAction(uId);
            //show the remaining members
            this.getMembers();
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
   * This function checks if its allowed to remove the selected user from the group
   * to avoid, that somebody doesnt receive or pays their money
   *
   * @example
   * Call it with a userId type of string
   * checkDeleteAction('2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param uId
   */
  async checkDeleteAction(uId: string) {
    //check if the current user wants to leave the group
    if (uId === this.currentUserId) {
      //if so, check if he has still money to pay
      if (this.debtOfUser > 0) {
        //if so avoid delete action and leave edit mode
        await this.alertsService.showError('Du musst deine Schulden begleichen, bevor du die Gruppe verlässt.');
        this.editMode = false;
      } else {
        //if not, delete current user from group
        await this.deleteUserFromGroup(uId);
      }
    } else { //if the current user wants to remove a member from the group
      //check every debt, if the member, which should be removed gets still money or is still  owing money
      for (const debt of this.debts) {
        if (debt.dId === uId && debt.paid === false || debt.cId === uId && debt.paid === false) {
          //if so, avoid the delete action and leave the edit mode
          await this.alertsService.showError('Du kannst das Mitglied erst entfernen, wenn es alle Zahlungen erhalten und beglichen hat!');
          this.editMode = false;
          break;
        } else {
          //delete member from group
          await this.deleteUserFromGroup(uId);
        }
      }
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
    //check if the delete function was successfully and if the delete action was made in the edit
    // mode and if the current user wants to leave the group or removed a memberr
    if (deleteAction && this.editMode && uId !== this.currentUserId) {
      //if so, leave the edit mode, update the members and show the confirmation alert for the user
      this.editMode = false;
      await this.alertsService.showConfirmation();
      await this.getGroup();
      await this.getMembers();
    } else {
      //if the user left the group, redirect to the grouplist-page
      await this.router.navigate(['grouplist']);
    }
  }

  /*********************************
   * Functions for handling debts *
   ********************************/

  /**
   * This function will get all debt-entries for the currently shown group
   */
   async getDebtsOfCurrentGroup() {
     //request debts from service with groupId
    this.debts = await this.debtsService.getDebts(this.groupId);
  }

  /**
   * This function will sum up all debts the current user has for the currently shown group
   * and will be directly shown in the group-overview page
   */
  async getDebtOfCurrentUser() {
    let sum = 0;
    //check for every debt
    for (const debt of this.debts) {
      //if the debitor is the current user and if the debt is still not paid
      if (debt.dId === this.currentUserId && !debt.paid) {
        //if so, sum it up
        sum += debt.amount;
      }
    }
    this.debtOfUser = sum;
  }

  /**
   * This function will calculate the amount of money the groupmembers are owing the current user
   * for every member there is a seperate amount caluclated
   */
  async getDebtsOfMembers() {
    //calculate the amount of debts for every groupmember
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
   * This function will mark all debts from a user to the current user
   * after clicking on the card of a user and selecting 'Zahlung erhalten'
   *
   * @example
   * Call it with a userIds type of string
   * markDebtAsPaid('2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param dId
   */
  public async markDebtAsPaid(dId: string) {
    //check for every debt
    for (const debt of this.debts) {
      //if the debitor and creditor are matching the given ids
      if (debt.dId === dId && debt.cId === this.currentUserId && !debt.paid) {
        //then delete them
        await this.debtsService.deletePaidDebtsById(this.groupId, debt.id);
        //set back the reminder count, because the payment is now made
        await this.userService.unsetReminderCount(dId);
        //reload the data
        await this.getMembers(); //to renew the shown shamements
        await this.getDebtsOfCurrentGroup(); //to renew the shown debts
        await this.getDebtOfCurrentUser();
        await this.getDebtsOfMembers();
      }
    }
  }

  /********************************************
   * Functions for handling group-invitations *
   ********************************************

   /**
   * This function will show the alert in which you can send an invitation
   */
  async sendInvitationAlert() {
    const alert = await this.alertController.create({
      cssClass: 'alert',
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

  /**
   * This function will let the user share the data for joining a group with other apps
   */
  sendInvitation() {
    //define the message, which is showed when sharing the group
    // eslint-disable-next-line max-len
    const msg: string = 'Hallo! Nehme an meiner Gruppe ' +
      // eslint-disable-next-line max-len
      this.group.name + ' teil, um unsere Ausgaben über die App Billie zu teilen! Lade die Billie-App aus dem App-Store und lege ein Konto an. Gebe anschließend folgende Daten im Bereich -Gruppe erstellen / Mit Gruppen-id teilnehmen- ein. Gruppen-Id: ' +
      this.group.id +
      ', Key:' +
      this.group.key +
      '. Viele Grüße';

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

  /*******************************************************
   * Functions for handling payments & payment-reminders *
   *******************************************************/

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
            handler: async () => {
              //increment the reminder counter by one to show the alert to the owing user the next time he opens the app
              await this.userService.setReminderCount(debtorId);
              //reload all needed data
              await this.getMembers();
              await this.getDebtsOfCurrentGroup();
              await this.getDebtsOfMembers();
              await this.sendPaymentReminder(this.group.name, debtorId);
            }
          }, {
            text: 'Nein',
            role: 'cancel',
          }]
        });
        await alertSendReminder.present();
        await alertSendReminder.onDidDismiss();
        //stop checking the entries, because there has been an entry found which is not paid yet
        break;
      }
    }
  }

  /**
   * This function opens other apps for sharing the data of the payment-reminder to the debtor
   * Its triggered after clicking on 'Ja' in the alertSendReminder
   *
   * @example
   * Call it with a groupName type string and a debitroId type string
   * sendReminder('WG Bahnhofstraße, '2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param groupName
   * @param debtorId
   */
  async sendPaymentReminder(groupName: string, debtorId: string) {

    //define recipient and sender for showing in the message
    const recipient: User = await this.userService.getUserWithUid(debtorId);
    const sender: User = await this.userService.getUserWithUid(this.currentUserId);

    //define the message which is later sent to the recipient
    const msg: string = 'Hallo ' +
      recipient.firstName +
      ', leider habe ich eine Zahlung von dir noch nicht erhalten. Bitte schau doch noch einmal in die Gruppe ' +
      groupName +
      ' in der Billie-App und sende mir den Betrag zeitnah. Viele Grüße ' +
      sender.firstName;

    //then share
    Share.canShare().then(canShare => {
      //check if sharing is aviable
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
          this.checkDeleteAction(this.currentUserId);
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
   * This function will navigate the user to the expenses-page of the group
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

