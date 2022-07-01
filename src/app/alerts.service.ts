import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  errors: Map<string, string> = new Map<string, string>();

  constructor(
    private alertController: AlertController,
    private router: Router,
  ) { }

  async showLoggedOutAlert() {
    const alertLogin = await this.alertController.create({
      cssClass: 'alertText',
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
      cssClass: 'alertText',
      message: '<img alt="confirmation" style="color: #47517B;" src="/assets/icon/checkmark-circle-outline.svg">'
    });
    await alertSendReminder.present();
    await setTimeout(() => alertSendReminder.dismiss(), 1500);
  }
}
