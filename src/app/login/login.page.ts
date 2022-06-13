import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit{

  email = '';
  password = '';


  constructor(public userService: UserService,) { }

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

  ngOnInit() {
  }

}
