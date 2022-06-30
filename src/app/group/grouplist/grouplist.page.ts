import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Group} from '../group.model';
import {GroupService} from '../group.service';
import {TrackNavService} from '../../track-nav.service';
import {UserService} from '../../services/user.service';
import {User} from '../../models/classes/User.model';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-grouplist',
  templateUrl: './grouplist.page.html',
  styleUrls: ['./grouplist.page.scss'],
})
export class GrouplistPage implements OnInit {

  grouplist: Group[] = [];
  leftToPay = 0;
  currentUserId: string;
  oldReminderCount: number;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private groupService: GroupService,
    private userService: UserService,
    private trackNav: TrackNavService,
    private alertController: AlertController,
  ) {
  }

  ionViewDidEnter() {
    this.getAllGroups();
    this.trackNav.trackRouteChanges(this.route.snapshot.paramMap.get('gId'));
  }

  ngOnInit() {
    localStorage.setItem('reminderCount', JSON.stringify(0));
    this.getUser();
    this.getAllGroups();
    this.getOldReminderCount();
  }

  async getUser() {
    const user = await JSON.parse(localStorage.getItem('currentUser'));
    const uId: string = user.uid;
    this.currentUserId = uId;
    await this.setReminderCountStorage();
  }

  async setReminderCountStorage() {
    console.log('setReminderCounterNew');
    const userFromService: User = await this.userService.getUserWithUid(this.currentUserId);
    await localStorage.setItem('reminderCount', JSON.stringify(userFromService.reminderCount));
    await this.handleReminderAlertsOnOpen();
  }

  async getAllGroups(): Promise<void> {
    try {
      this.grouplist = await this.groupService.findGroups(this.currentUserId);
    } catch (e) {
      console.log(e);
    }
  }

  showGroup(groupId: string) {
    this.router.navigate(['group-overview', {gId: groupId}]);
  }

  openCreateGroup() {
    this.router.navigate(['create-group']);
  }

  async handleReminderAlertsOnOpen() {
    const newReminderCount: number = JSON.parse(localStorage.getItem('reminderCount'));
    if (this.oldReminderCount < newReminderCount) {
      const alertPayReminder = await this.alertController.create({
        cssClass: 'alertText',
        header: 'Da war noch etwas...',
        message: 'Du schuldest ' + 'Name' + ' noch ' + 'Betrag' +'€!',
        buttons: [{
          text: 'Ja',
          handler: () => {
            this.userService.unsetReminderCount(this.currentUserId);
            this.getUser();
          }
        }]
      });
      await alertPayReminder.present();
      await alertPayReminder.onDidDismiss();
    }
  }

  getOldReminderCount() {
    console.log('getOldRemindercount');
    this.oldReminderCount = JSON.parse(localStorage.getItem('reminderCount'));
  }
}
