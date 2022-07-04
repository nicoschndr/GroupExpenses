import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {

  counter = 1;

  constructor(private router: Router) { }

  count() {
      this.counter = this.counter+1;
  }

  back() {
    this.counter = this.counter-1;
  }

  async getStarted(){
    localStorage.setItem('onboardingShown', JSON.stringify('true'));
    await this.router.navigate(['login']);
  }

  ngOnInit() {
  }

}
