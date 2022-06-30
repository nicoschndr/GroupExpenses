import {Component, OnInit, ViewChild} from '@angular/core';
import {GroupService} from '../group.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Group} from '../group.model';
import {UserService} from '../../services/user.service';
import {User} from '../../models/classes/User.model';
import {ActionSheetController, AlertController, NavController, PopoverController} from '@ionic/angular';
import {Share} from '@capacitor/share';
import {TrackNavService} from '../../track-nav.service';
import {PaymentsService} from '../../payments.service';

@Component({
  selector: 'app-group-overview',
  templateUrl: './group-overview.page.html',
  styleUrls: ['./group-overview.page.scss'],
})
export class GroupOverviewPage implements OnInit {

  @ViewChild('popover') popover;

  groupId: string;
  group: Group = new Group();
  members: User[] = [];
  currentUserId: string;
  editMode = false;

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private paymentsService: PaymentsService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private trackNav: TrackNavService,
  ) {
  }

  ngOnInit() {
    this.getUser();
  }

  ionViewWillEnter() {
    this.trackNav.trackRouteChanges(this.route.snapshot.paramMap.get('gId'));
    this.getGroup();
  }

  async getUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserId = user.uid;
  }

  async getGroup() {
    this.groupId = this.route.snapshot.paramMap.get('gId');
    this.group = await this.groupService.getGroup(this.groupId);
    // await this.getMembers();
  }

  // async getMembers(): Promise<void> {
  //   this.members = [];
  //   for (const userId of this.group.groupMembers) {
  //     const user: User = await this.userService.getUserWithUid(userId);
  //     if (user.id === this.currentUserId) {
  //       user.firstName = 'Ich';
  //       this.members.push(user);
  //     } else {
  //       this.members.push(user);
  //     }
  //   }
  // }

  async deleteUserFromGroup(uId: string) {
    const deleteAction: boolean = await this.groupService.deleteUserFromGroup(uId, this.group.id);
    if (deleteAction) {
      this.editMode = false;
      this.members.splice(0, this.members.length);
      await this.getGroup();
    } else if (deleteAction && this.editMode) {
      this.router.navigate(['grouplist']);
    }
    else {
      this.router.navigate(['grouplist']);
    }
  }

  leaveEditMode() {
    this.editMode = false;
  }

  async showActions() {
    const actionSheet = await this.actionSheetController.create({
      //cssClass: 'my-custom-class',
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

  async sendInvitationAlert() {
      const alert = await this.alertController.create({
        cssClass: 'alertText',
        header: 'Sende eine Gruppeneinladung!',
        message: 'Gruppen-ID: ' + this.group.id + '<br>' +
          'Key: ' + this.group.key,
        buttons: [{
          text: 'teilen',
          handler: () => {
            this.sendInvitation();
          }
        }]
      });
      await alert.present();
      await alert.onDidDismiss();
    }

  sendInvitation() {
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

  async confirmDeleteAction(uId: string) {
    if (uId === this.currentUserId) {
      const alertLeaveGroup = await this.alertController.create({
        cssClass: 'alertText',
        header: 'Willst du die Gruppe wirklich verlassen?',
        buttons: [{
          text: 'Ja',
          handler: () => {
            this.deleteUserFromGroup(uId);
          }
        }, {
          text: 'Nein',
          role: 'cancel',
        }]
      });
      await alertLeaveGroup.present();
      await alertLeaveGroup.onDidDismiss();
      await this.showConfirmation();
    } else {
      const alertDeleteUser = await this.alertController.create({
        cssClass: 'alertText',
        header: 'Willst du das Gruppenmitglied wirklich entfernen?',
        buttons: [{
          text: 'Ja',
          handler: () => {
            this.deleteUserFromGroup(uId);
          }
        }, {
          text: 'Nein',
          role: 'cancel',
        }]
      });
      await alertDeleteUser.present();
      await alertDeleteUser.onDidDismiss();
      await this.showConfirmation();
    }
  }

  back() {
    console.log('pop');
    this.navCtrl.pop();
  }

  async sendReminder(uId: string, fN: string, pId: string) {
    const alertSendReminder = await this.alertController.create({
      cssClass: 'alertText',
      header: 'Möchtest du ' + fN + ' eine Zahlungserinnerung senden?',
      buttons: [{
        text: 'Ja',
        handler: () => {
          this.userService.setReminderCount(uId);
          this.paymentsService.setReminderForPayment(pId);
          this.showConfirmation();
        }
      }, {
        text: 'Nein',
        role: 'cancel',
      }]
    });
    await alertSendReminder.present();
    await alertSendReminder.onDidDismiss();
  }

  async showConfirmation() {
    const alertSendReminder = await this.alertController.create({
      cssClass: 'alertText',
      message: '<img alt="confirmation" style="color: #47517B;" src="/assets/icon/checkmark-circle-outline.svg">'
    });
    await alertSendReminder.present();
    await setTimeout(() => alertSendReminder.dismiss(), 1500);
  }
  showExpensesOverview(groupId: string){
    this.router.navigate(['expenses/', {gId: groupId}]);
  }
}

