import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  user: any ={};

  constructor(private userService: UserService, private router: Router) { }

  signUp(): void {
    this.userService.signUp(this.user.firstName, this.user.lastName, this.user.email, this.user.password);
    this.user = {};
    this.router.navigate(['home']);
  }

  navigateLogin(): void{
    this.router.navigate(['login']);
  }

  ngOnInit() {
  }

}
