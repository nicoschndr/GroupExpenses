import { Injectable } from '@angular/core';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  /**
   * Map containing error name and message. Can be setted, getted and cleared.
   */
  errors: Map<string, string> = new Map<string, string>();

  // @ts-ignore
  constructor(
    private alertController: AlertController,
  ) { }

  /**
   * This function will display an alert, which shows the user, that an action has been successfull
   */
  async showConfirmation() {
    const alertSendReminder = await this.alertController.create({
      //show icon as img
      message: '<img alt="confirmation" style="color: #47517B;" src="/assets/icon/checkmark-circle-outline.svg">'
    });
    await alertSendReminder.present();
    //dismiss automatically after 1,5 seconds
    await setTimeout(() => alertSendReminder.dismiss(), 1500);
  }

  /**
   * This function will display an certain alert, which shows the user, that a group member is waiting for his payment
   * there are three different shamement-groups
   * if one member is waiting for a payment: shamementGroup 1 (color: yellow)
   * if two members are waiting for their payments: shamementGroup 2 (color: orange)
   * if three members are waiting for their payments: shamementGroup 3 (color: red)
   * these alerts are only shown after the first opening of the app for a session
   *
   * @example
   * Call it with a number, which counts the amount of reminder, the user has got by his groupmembers
   * showNewShamementAlert(2)
   *
   * @param reminderCount
   */
  async showNewShamementAlert(reminderCount: number) {
    //check reminderCount
    if (reminderCount === 2) {
      const alertShamementGroupOne = await this.alertController.create({
        cssClass: 'alertShamement',
        header: 'Schon zwei Gruppenmitglieder warten auf deine Zahlungen...',
        message: 'Du hast eine neue Shamement-Stufe erreicht. Dies ist nun in allen Gruppen sichtbar!',
        buttons: [{
          text: 'Verstanden',
          role: 'cancel',
        }]
      });
      await alertShamementGroupOne.present();
      await alertShamementGroupOne.onDidDismiss();
    } else if (reminderCount === 3) { //check reminderCount
      const alertShamementGroupTwo = await this.alertController.create({
        cssClass: 'alertShamement',
        header: 'Schon drei Gruppenmitglieder warten auf deine Zahlungen...',
        message: 'Du hast eine neue Shamement-Stufe erreicht. Dies ist nun in allen Gruppen sichtbar!',
        buttons: [{
          text: 'Verstanden',
          role: 'cancel',
        }]
      });
      await alertShamementGroupTwo.present();
      await alertShamementGroupTwo.onDidDismiss();
    } else if (reminderCount > 3) { //check reminderCount
      const alertShamementGroupThree = await this.alertController.create({
        cssClass: 'alertShamement',
        header: 'Schon mehr als 3 Gruppenmitglieder warten auf deine Zahlungen...',
        message: 'Du hast eine neue Shamement-Stufe erreicht. Dies ist nun in allen Gruppen sichtbar!',
        buttons: [{
          text: 'Verstanden',
          role: 'cancel',
        }]
      });
      await alertShamementGroupThree.present();
      await alertShamementGroupThree.onDidDismiss();
    }
  }

  /**
   * This function will display an alert, which shows the user, that the join into the group was not successfull
   */
  async showError (msg: string) {
    const alertShamementGroupThree = await this.alertController.create({
      cssClass: 'alertDanger',
      header: 'Ups..',
      message: msg,
      buttons: [{
        //dismiss the alert, so the user is able to correct the data of the input fields and tries again
        text: 'Nochmal versuchen',
        role: 'cancel',
      }]
    });
    await alertShamementGroupThree.present();
    await alertShamementGroupThree.onDidDismiss();
  }

  /**
   * This function will display an alert, which shows the user, every group in which he still owes a groupmember some money
   *
   * @example
   * Call it with an array of strings, which is storing all groupnames, so the user can check the groups
   * showPaymentReminder(['WG Bahnhofstraße', 'Reisegruppe London'])
   *
   * @param groupNames
   *
   */
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
