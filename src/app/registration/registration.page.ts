import { Component, OnInit } from '@angular/core';
import {UserService} from '../services/user.service';
import {Router} from '@angular/router';
import {AlertsService} from '../services/alerts.service';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  user: any ={};
  errors: Map<string, string> = new Map<string, string>();

  constructor(private userService: UserService, private router: Router, public alertsService: AlertsService) { }

  /**
   * This function calls the signUp method of the user Service with the data from the input fields and then navigates
   * the user to the grouplist page.
   */
  async signUp(): Promise<void> {
      await this.userService.signUp(this.user.firstName, this.user.lastName, this.user.email, this.user.password);
      this.user = {};
      await this.router.navigate(['grouplist']);
  }

  /**
   * This function navigates the user to the login page.
   */
  navigateLogin(): void{
    this.router.navigate(['login']);
  }

  ngOnInit() {
  }

}
