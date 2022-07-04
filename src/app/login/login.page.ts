import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {AlertsService} from '../services/alerts.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit{

  email = '';
  password = '';



  constructor(public userService: UserService, private router: Router, public alertsService: AlertsService) { }

  async dologin() {
    await this.userService.login(this.email, this.password);
    this.email='';
    this.password='';
    await this.router.navigate(['grouplist']);
  }

  async loginWithGoogle() {
    await this.userService.loginWithGoogle();
    this.email='';
    this.password='';
    await this.router.navigate(['grouplist']);
  }

  async navigateSignUp() {
    await this.router.navigate(['signup']);
  }

  async navigateHome() {
    await this.router.navigate(['home']);
  }

  async forgotPW() {
    await this.router.navigate(['forgot-pw']);
  }

  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      this.userService.isLoggedIn = !!user;
    });
  }

}
