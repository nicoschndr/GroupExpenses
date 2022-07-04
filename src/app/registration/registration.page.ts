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

  signUp(): void {
      this.userService.signUp(this.user.firstName, this.user.lastName, this.user.email, this.user.password);
      this.user = {};
  }

  navigateLogin(): void{
    this.router.navigate(['login']);
  }

  ngOnInit() {
  }

}
