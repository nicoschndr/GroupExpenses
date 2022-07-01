import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';
import {Router} from '@angular/router';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {AlertsService} from '../alerts.service';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit{

  email = '';
  password = '';



  constructor(public userService: UserService, private router: Router, public alertsService: AlertsService) { }

  dologin(): void{
    this.userService.login(this.email, this.password);
    this.email='';
    this.password='';
    this.router.navigate(['grouplist']);
  }

  loginWithGoogle(): void{
    this.userService.loginWithGoogle();
    this.email='';
    this.password='';
    this.router.navigate(['grouplist']);
  }

  navigateSignUp(): void{
    this.router.navigate(['signup']);
  }

  navigateHome(): void{
    this.router.navigate(['home']);
  }

  forgotPW(): void{
    this.router.navigate(['forgot-pw']);
  }

  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      this.userService.isLoggedIn = !!user;
    });
  }

}
