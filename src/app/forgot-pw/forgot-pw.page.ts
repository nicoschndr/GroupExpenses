import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-forgot-pw',
  templateUrl: './forgot-pw.page.html',
  styleUrls: ['./forgot-pw.page.scss'],
})
export class ForgotPWPage implements OnInit {

  email='';

  constructor(private userService: UserService, private router: Router, private alertController: AlertController) { }

  ngOnInit() {
  }

  /**
   * This function navigates the user to the login page.
   */
  async navigateLogin() {
    await this.router.navigate(['login']);
  }

  /**
   * This function call the forgotPassword function from the user Service with email in the input field. It then creates
   * an alert to give the user feedback. If its dismissed the user gets navigated to the login.
   */
  forgotPW(): void{
    this.userService.forgotPassword(this.email);
    this.alertController.create({
      header:'Passwort zurücksetzen:',
      message:`Checken Sie ihr Postfach!<br><br> Wir haben eine Mail zum Zurücksetzen des Passworts and die angegebene Adresse gesendet.`,
      buttons:[
        {
          text: 'OK',
          handler:() => {
            this.alertController.dismiss();
            this.router.navigate(['login']);
          }
        }
      ]
    }).then(res => res.present());
    this.email='';
  }
}
