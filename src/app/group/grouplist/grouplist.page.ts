import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Group} from '../group.model';
import {GroupService} from '../group.service';
import {TrackNavService} from '../../track-nav.service';
import {UserService} from '../../user.service';
import {User} from '../../User.model';
import {PaymentsService} from '../../payments.service';
import {AlertController} from "@ionic/angular";
import {Payment} from "../../payment.model";

@Component({
  selector: 'app-grouplist',
  templateUrl: './grouplist.page.html',
  styleUrls: ['./grouplist.page.scss'],
})
export class GrouplistPage implements OnInit {

  grouplist: Group[] = [];
  leftToPay = 0;
  currentUserId: string;
  userFromService: User;
  oldReminderCount: number;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private groupService: GroupService,
    private userService: UserService,
    private trackNav: TrackNavService,
    private alertController: AlertController,
    private paymentsService: PaymentsService,
  ) {
  }

  ionViewDidEnter() {
    this.getAllGroups();
    this.trackNav.trackRouteChanges(this.route.snapshot.paramMap.get('gId'));
  }

  ngOnInit() {
    this.getAllGroups();
    this.getOldReminderCount();
    this.getUser();
    this.handleReminderAlertsOnOpen();
  }

  async getUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserId = user.uid;
  }

  async getAllGroups(): Promise<void> {
    try {
      await this.getUser();
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
    if (this.oldReminderCount < this.userFromService.reminderCount) {
      const alertPayReminder = await this.alertController.create({
        cssClass: 'alertText',
        header: 'Da war noch etwas...',
        message: 'Du schuldest ' + 'Name' + ' noch ' + 'Betrag' +'€!',
        buttons: [{
          text: 'Ja',
          handler: () => {

          }
        }]
      });
      await alertPayReminder.present();
      await alertPayReminder.onDidDismiss();
    }
  }

  private getOldReminderCount() {
    this.oldReminderCount = JSON.parse(localStorage.getItem('reminderCount'));
  }
}
