import { Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {ViewDidEnter} from '@ionic/angular';
import {User} from '../../models/classes/User.model';
import {UserService} from '../../services/user.service';
import {AlertsService} from '../../services/alerts.service';
import {TrackNavService} from '../../services/track-nav.service';
import {Group} from '../../models/classes/group.model';
import {GroupService} from '../../services/group.service';

@Component({
  selector: 'app-grouplist',
  templateUrl: './grouplist.page.html',
  styleUrls: ['./grouplist.page.scss'],
})
export class GrouplistPage implements ViewDidEnter{

  public grouplist: Group[] = [];
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
  ) {
  }

  async ionViewDidEnter() {
    //get value of onboardingShown in localStorage
    this.onboardingShown = await JSON.parse(localStorage.getItem('onboardingShown'));
    //check if onboarding component was shown before
    if (this.onboardingShown === false) {
      await this.router.navigate(['onboarding']);
    } else {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user && this.onboardingShown) {
          await this.showGrouplist();
        } else {
          await this.handleLogout();
        }
      });
    }
  }

  async handleLogout() {
    this.grouplist = [];
    await this.alertsService.showLoggedOutAlert();
    await this.router.navigate(['login']);
  }

  async showGrouplist() {
    this.currentUserId = await this.userService.getCurrentUserId();
    await this.getOldReminderCount();
    await this.setNewReminderCountStorage();
    await this.getAllGroups();
  }

  getOldReminderCount() {
    this.oldReminderCount = JSON.parse(localStorage.getItem('reminderCount'));
  }

  async setNewReminderCountStorage() {
    const userFromService: User = await this.userService.getUserWithUid(this.currentUserId);
    await localStorage.setItem('reminderCount', JSON.stringify(userFromService.reminderCount));
    await this.handleReminderAlertsOnOpen();
  }

  async getAllGroups(): Promise<void> {
    await (await (this.groupService.findGroupsFromUser(this.currentUserId))).subscribe((res) => {
      this.grouplist = res.map((g) => ({
        id: g.payload.doc.id,
        ...g.payload.doc.data() as Group
      }));
    });
  }

  async handleReminderAlertsOnOpen() {
    const newReminderCount: number = await JSON.parse(localStorage.getItem('reminderCount'));
    if (this.oldReminderCount < newReminderCount) {
      await this.alertsService.showPaymentReminderAlert();
      if (newReminderCount === 1 || newReminderCount === 2 || newReminderCount === 3) {
        await this.alertsService.showNewShamementGroupAlert(newReminderCount);
      }
    }
  }

  async navToGroupoverview(groupId: string) {
    await this.router.navigate(['group-overview', {gId: groupId}]);
  }

  async navToCreateGroup() {
    await this.router.navigate(['create-group']);
  }
}
