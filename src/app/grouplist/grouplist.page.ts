import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {User} from '../models/classes/User.model';
import {UserService} from '../services/user.service';
import {AlertsService} from '../services/alerts.service';
import {TrackNavService} from '../services/track-nav.service';
import {Group} from '../models/classes/Group.model';
import {GroupService} from '../services/group.service';
import {DebtsService} from '../services/debts.service';
import {Debt} from '../models/classes/Debt';

@Component({
  selector: 'app-grouplist',
  templateUrl: './grouplist.page.html',
  styleUrls: ['./grouplist.page.scss'],
})
export class GrouplistPage implements ViewWillEnter {

  public grouplist: Group[] = [];
  public debtInGroup: Map<string, number> = new Map();
  private currentUserId: string;
  private oldReminderCount: number;
  private onboardingShown: boolean;
  private reminderShown = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private groupService: GroupService,
    private userService: UserService,
    private trackNav: TrackNavService,
    private alertsService: AlertsService,
    private debtService: DebtsService,
  ) {
  }



  async ionViewWillEnter() {
    //get value of onboardingShown saved in localStorage
    this.onboardingShown = JSON.parse(localStorage.getItem('onboardingShown'));
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      //check if the onboarding page has been already shown
      if (this.onboardingShown === false) {
        //if not show
        await this.router.navigate(['onboarding']);
        // eslint-disable-next-line max-len
      } else if (user && this.onboardingShown && this.reminderShown) { //check if a user is logged in and the onboarding page was shown before
        //show all groups the user is a member from
        this.currentUserId = await this.userService.getCurrentUserId();
        await this.getAllGroupsFromUser(this.currentUserId);
      } else if (user && this.onboardingShown && !this.reminderShown) {
        this.reminderShown = true;
        //show all groups the user is a member from
        this.currentUserId = await this.userService.getCurrentUserId();
        //and handle the payment reminders
        await this.getOldReminderCount(); //save the old value
        await this.getAllGroupsFromUser(this.currentUserId);
        await this.setNewReminderCountStorage();
        //check if there is a difference between the old and new value
        await this.handleReminderAlertsOnOpen();
      } else {
        await this.handleLogout();
      }
    });
    }


  /**
   * This function will empty the grouplist and navigate the user back to the login page
   */
  async handleLogout() {
    this.grouplist = [];
    await this.router.navigate(['login']);
  }

  /***************************************
   * Functions for showing the grouplist *
   **************************************/

  /**
   * This function will get all groups in which the currently logged in user is a member of
   *
   * @example
   * Call it with a userId type of string
   * getIncoming('2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param userId
   */
  async getAllGroupsFromUser(userId: string): Promise<void> {
    (await this.groupService.getGroupsFromUser(userId)).subscribe((res) => {
      this.grouplist = res.map((g) => ({
        id: g.payload.doc.id,
        ...g.payload.doc.data() as Group,
        do: this.getDebtInGroup(g.payload.doc.id),
      }));
    });
  }

  /**
   * This function will calculate the amount of money the current user is owing to the members for every group
   *
   * @example
   * Call it with a groupId type of string
   * getDebtInGroup('2uGkBIjf5WYoL4UZdObrca9T6mv1')
   *
   * @param gId
   */
  async getDebtInGroup(gId: string) {
      let sum = 0;
      //get all debts of the group
      const debts: Debt[] = await this.debtService.getDebts(gId);
      for (const debt of debts) {
        //get all debts which are not paid and from the current user
        if (debt.dId === this.currentUserId && !debt.paid) {
          sum += debt.amount;
        }
      }
      //set the value in the map
      this.debtInGroup.set(gId, sum);
  }


  /*****************************************
   * Functions for handling reminder alerts *
   *****************************************/

  /**
   * This function will get the value of the field reminderCount from the localStorage and saves it
   */
  getOldReminderCount() {
    this.oldReminderCount = JSON.parse(localStorage.getItem('reminderCount'));
  }

  /**
   * This function will save the value of reminderCount from the currently logged in user in the localStorage
   */
  async setNewReminderCountStorage() {
    //get user with its values from the service
    const userFromService: User = await this.userService.getUserWithUid(this.currentUserId);
    const reminderCount: string = userFromService.reminderCount.toString();
    //save the value of reminderCount in the localStorage
    await localStorage.setItem('reminderCount', JSON.stringify(reminderCount));
  }

  /**
   * This function checks if there was a change in the reminderCounter
   */
  async handleReminderAlertsOnOpen() {
    //get the value current value of the counter from localStorage
    const newReminderCount = Number(await JSON.parse(localStorage.getItem('reminderCount')));
    //check if the new value of the counter is bigger than the old one
    if (this.oldReminderCount < newReminderCount) {
      //check if the user is now in a new reminderGroup
      if (newReminderCount === 2 || newReminderCount === 3 || newReminderCount === 4) {
        //then show the alert
        await this.alertsService.showNewShamementAlert(newReminderCount);
        this.reminderShown = true;
      } else {
        //then there has sent somebody a paymentreminder - so show it
        await this.showPaymentReminderAlert();
      }
    }
  }

  /**
   * This function collects all groups in which are still debts for the user
   */
  async showPaymentReminderAlert() {
    const groupsToPay: string[] = [];
    for (const group of this.grouplist) {
      //get all debts from the groups the user is member in
      const debts: Debt[] = await this.debtService.getDebts(group.id);
      for (const debt of debts) {
        //check if there is still a debt open from the current user
        if (!debt.paid && debt.dId === this.currentUserId) {
          //if so, then save the groupname and check the other groups
          groupsToPay.push(group.name);
          break;
        }
      }
    }
    //show the payment reminder alert in the grouplist
    await this.alertsService.showPaymentReminder(groupsToPay);
  }


  /****************************
   * Functions for navigation *
   ***************************/

  async navToGroupoverview(groupId: string) {
    await this.router.navigate(['group-overview', {gId: groupId}]);
  }

  async navToCreateGroup() {
    await this.router.navigate(['create-group']);
  }
}
