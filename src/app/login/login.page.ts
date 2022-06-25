import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';
import {Router} from '@angular/router';
import {getAuth, onAuthStateChanged} from "@angular/fire/auth";



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit{

  email = '';
  password = '';



  constructor(public userService: UserService, private router: Router) { }

  dologin(): void{
    this.userService.login(this.email, this.password);
    this.email='';
    this.password='';
  }

  loginWithGoogle(): void{
    this.userService.loginWithGoogle();
    this.email='';
    this.password='';
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
