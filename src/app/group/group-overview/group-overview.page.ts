import {Component, OnInit, ViewChild} from '@angular/core';
import {GroupService} from '../group.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Group} from '../group.model';
import {UserService} from '../../user.service';
import {User} from '../../User.model';
import {ActionSheetController, AlertController, NavController, PopoverController, ViewDidEnter} from '@ionic/angular';
import {Share} from '@capacitor/share';
import {PaymentsService} from '../../payments.service';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {AlertsService} from '../../alerts.service';

@Component({
  selector: 'app-group-overview',
  templateUrl: './group-overview.page.html',
  styleUrls: ['./group-overview.page.scss'],
})
export class GroupOverviewPage implements ViewDidEnter{
  public editMode = false;
  public group: Group = new Group();
  public members: User[] = [];
  private currentUserId: string;
  private groupId: string;
  private isInGroup = false;

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private paymentsService: PaymentsService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private actionSheetController: ActionSheetController,
    private alertsService: AlertsService,
    private alertController: AlertController,
  ) {
  }

  async ionViewDidEnter() {
    await this.getUser();
    await this.getGroup();
    await this.getMembers();
  }

  async getUser() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = await this.userService.getCurrentUser();
      } else {
        await this.router.navigate(['grouplist']);
      }
    });
  }

  async getGroup() {
    this.groupId = this.route.snapshot.paramMap.get('gId');
    this.group = await this.groupService.getGroupById(this.groupId);
  }

  async getMembers(): Promise<void> {
    const users: User[] = [new User()];
    for (const userId of this.group.groupMembers) {
      const user: User = await this.userService.getUserWithUid(userId);
      if (user.id === this.currentUserId) {
        this.isInGroup = true;
        users[0].id = user.id;
        users[0].firstName = 'Ich';
        users[0].lastName = user.lastName;
        users[0].email = user.email;
        users[0].password = user.password;
        users[0].gruppen = user.gruppen;
        users[0].reminderCount = user.reminderCount;
      } else {
        users.push(user);
      }
    }
    this.members = users;
  }

  async deleteUserFromGroup(uId: string) {
    const deleteAction: boolean = await this.groupService.deleteUserFromGroup(uId, this.group.id);
    if (deleteAction) {
      this.editMode = false;
      await this.getMembers();
      await this.alertsService.showConfirmation();
    } else if (deleteAction && this.editMode) {
      await this.getMembers();
      await this.alertsService.showConfirmation();
    }
    else {
      await this.alertsService.showConfirmation();
      await this.router.navigate(['grouplist']);
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
        cssClass: 'alert',
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
      await this.alertsService.showConfirmation();
    } else {
      const alertDeleteUser = await this.alertController.create({
        cssClass: 'alert',
        header: 'Willst du das Gruppenmitglied wirklich entfernen?',
        buttons: [{
          text: 'Ja',
          handler: () => {
            this.deleteUserFromGroup(uId);
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

  async sendReminder(uId: string, fN: string, pId: string) {
    const alertSendReminder = await this.alertController.create({
      cssClass: 'alert',
      header: 'Möchtest du ' + fN + ' eine Zahlungserinnerung senden?',
      buttons: [{
        text: 'Ja',
        handler: () => {
          this.userService.setReminderCount(uId);
          this.paymentsService.setReminderForPayment(pId);
          this.alertsService.showConfirmation();
        }
      }, {
        text: 'Nein',
        role: 'cancel',
      }]
    });
    await alertSendReminder.present();
    await alertSendReminder.onDidDismiss();
  }
  showExpensesOverview(groupId: string){
    this.router.navigate(['expenses/', {gId: groupId}]).catch((err) => console.log('Error: ', err));
  }
}

