import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Group} from '../group.model';
import {GroupService} from '../group.service';
import {TrackNavService} from '../../track-nav.service';
import {UserService} from '../../user.service';
import {User} from '../../User.model';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-grouplist',
  templateUrl: './grouplist.page.html',
  styleUrls: ['./grouplist.page.scss'],
})
export class GrouplistPage implements OnInit {

  public grouplist: Group[] = [];
  public leftToPay = 0;
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
    private alertController: AlertController,
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
    this.currentUserId = await this.userService.getCurrentUser();
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
      const alertPayReminder = await this.alertController.create({
        cssClass: 'alertText',
        header: 'Da war noch etwas...',
        message: 'Du schuldest ' + 'Name' + ' noch ' + 'Betrag' +'€!',
        buttons: [{
          text: 'Ja',
          role: 'cancel',
        }]
      });
      await alertPayReminder.present();
      await alertPayReminder.onDidDismiss();
    }
  }

  async navToGroupoverview(groupId: string) {
    await this.router.navigate(['group-overview', {gId: groupId}]);
  }

  async navToCreateGroup() {
    await this.router.navigate(['create-group']);
  }
}
