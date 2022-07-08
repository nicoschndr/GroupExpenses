import { Injectable } from '@angular/core';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  errors: Map<string, string> = new Map<string, string>();

  // @ts-ignore
  constructor(
    private alertController: AlertController,
    private router: Router,
  ) { }

  async showLoggedOutAlert() {
    const alertLogin = await this.alertController.create({
      cssClass: 'alertDanger',
      header: 'Ups...',
      message: 'Du bist nicht mehr eingelogt.',
      buttons: [{
        text: 'jetzt anmelden',
        handler: () => {
          this.router.navigate(['login']);
        }
      }]
    });
    await alertLogin.present();
    await alertLogin.onDidDismiss();
  }

  async showConfirmation() {
    const alertSendReminder = await this.alertController.create({
      message: '<img alt="confirmation" style="color: #47517B;" src="/assets/icon/checkmark-circle-outline.svg">'
    });
    await alertSendReminder.present();
    await setTimeout(() => alertSendReminder.dismiss(), 1500);
  }

  async showNewShamementGroupAlert(reminderCount: number) {
    if (reminderCount === 1) {
      const alertShamementGroupOne = await this.alertController.create({
        cssClass: 'alertShamement',
        header: 'Ein Gruppenmitglied wartet auf eine Zahlung...',
        message: '<img alt="confirmation" style="color: #47517B;" src="/assets/icon/hourglass-outline.svg">',
        buttons: [{
          text: 'Ja',
          role: 'cancel',
        }]
      });
      await alertShamementGroupOne.present();
      await alertShamementGroupOne.onDidDismiss();
    } else if (reminderCount === 2) {
      const alertShamementGroupTwo = await this.alertController.create({
        cssClass: 'alertShamement',
        header: 'Schon zwei Gruppenmitglieder warten auf deine Zahlungen...',
        message: '<img alt="confirmation" style="color: #47517B;" src="/assets/icon/hourglass-outline.svg">',
        buttons: [{
          text: 'Ja',
          role: 'cancel',
        }]
      });
      await alertShamementGroupTwo.present();
      await alertShamementGroupTwo.onDidDismiss();
    } else if (reminderCount === 3) {
      const alertShamementGroupThree = await this.alertController.create({
        cssClass: 'alertShamement',
        header: 'Schon mehr als 2 Gruppenmitglieder warten auf deine Zahlungen...',
        message: '<img alt="confirmation" style="color: #47517B;" src="/assets/icon/hourglass-outline.svg">',
        buttons: [{
          text: 'Ja',
          role: 'cancel',
        }]
      });
      await alertShamementGroupThree.present();
      await alertShamementGroupThree.onDidDismiss();
    }
  }

  async showJoinGroupError() {
    const alertShamementGroupThree = await this.alertController.create({
      cssClass: 'alertDanger',
      header: 'Ups..',
      message: 'Die Gruppen-Id oder der Key ist nicht korrekt.',
      buttons: [{
        text: 'Nochmal versuchen',
        role: 'cancel',
      }]
    });
    await alertShamementGroupThree.present();
    await alertShamementGroupThree.onDidDismiss();
  }

  async showPaymentReminder(groupNames: string[]) {
    const alertPayReminder = await this.alertController.create({
      cssClass: 'alertDanger',
      header: 'Da war noch etwas...',
      message: 'Du hast noch offene Beträge in den Gruppen'+ groupNames + ' auszugleichen!',
      buttons: [{
        text: 'Ja',
        role: 'cancel',
      }]
    });
    await alertPayReminder.present();
    await alertPayReminder.onDidDismiss();
  }
}
