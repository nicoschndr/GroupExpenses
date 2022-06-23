import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../user.service';

@Component({
  selector: 'app-forgot-pw',
  templateUrl: './forgot-pw.page.html',
  styleUrls: ['./forgot-pw.page.scss'],
})
export class ForgotPWPage implements OnInit {
  email='';

  constructor(private userService: UserService, private router: Router) { }

  navigateLogin(): void{
    this.router.navigate(['login']);
  }

  forgotPW(): void{
    this.userService.forgotPassword(this.email);
    this.email='';
  }

  ngOnInit() {
  }

}
