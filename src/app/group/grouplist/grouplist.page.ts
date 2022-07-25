import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {ViewDidEnter, ViewWillEnter} from '@ionic/angular';
import {User} from '../../models/classes/User.model';
import {UserService} from '../../services/user.service';
import {AlertsService} from '../../services/alerts.service';
import {TrackNavService} from '../../services/track-nav.service';
import {Group} from '../../models/classes/group.model';
import {GroupService} from '../../services/group.service';
import {DebtsService} from '../../services/debts.service';
import {Debt} from '../../models/classes/debt';

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private groupService: GroupService,
    private userService: UserService,
    private trackNav: TrackNavService,
    private alertsService: AlertsService,
    private debtService: DebtsService,
  ) {
    //get value of onboardingShown in localStorage
    this.onboardingShown = JSON.parse(localStorage.getItem('onboardingShown'));
    //check if onboarding page was shown before
    if (this.onboardingShown === false) {
      //if not show
      this.router.navigate(['onboarding']);
    }
  }

  async ionViewWillEnter() {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        //check if a user is logged in and the onboarding page was shown before
        if (user && this.onboardingShown) {
          //show all groups the user is a member from
          this.currentUserId = await this.userService.getCurrentUserId();
          await this.getOldReminderCount();
          await this.getAllGroupsFromUser(this.currentUserId);
          await this.getDebtInGroup();
          await this.setNewReminderCountStorage();
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
    await (await (this.groupService.getGroupsFromUser(userId))).subscribe((res) => {
      this.grouplist = res.map((g) => ({
        id: g.payload.doc.id,
        ...g.payload.doc.data() as Group
      }));
    });
  }

  /**
   * This function will calculate the amount of money the user is owing to the members for every group
   */
  async getDebtInGroup() {
    for (const group of this.grouplist) {
      let sum = 0;
      //get all debts of the group
      const debts: Debt[] = await this.debtService.getDebts(group.id);
      for (const debt of debts) {
        //get all debts which are not payed and from the current user
        if (debt.dId === this.currentUserId && !debt.paid) {
          sum += debt.amount;
        }
      }
      //set the value in the map
      this.debtInGroup.set(group.id, sum);
    }
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
    //save the value of reminderCount in the localStorage
    await localStorage.setItem('reminderCount', JSON.stringify(userFromService.reminderCount));
    //check if there is a difference between the old and new value
    await this.handleReminderAlertsOnOpen();
  }

  /**
   * This function checks if there was a change in the reminderCounter
   */
  async handleReminderAlertsOnOpen() {
    //get the value current value of the counter from localStorage
    const newReminderCount: number = await JSON.parse(localStorage.getItem('reminderCount'));
    //check if the new value of the counter is bigger than the old one
    if (this.oldReminderCount < newReminderCount) {
      //then there has sent somebody a paymentreminder - so show it
      await this.showPaymentReminderAlert();
      //check if the user is now in a new reminderGroup
      if (newReminderCount === 1 || newReminderCount === 2 || newReminderCount === 3) {
        //then show the alert
        await this.alertsService.showNewShamementAlert(newReminderCount);
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
