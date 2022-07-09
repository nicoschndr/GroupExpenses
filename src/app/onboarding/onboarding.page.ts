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

  /**
   * This function increments the counter in order that the right content is shown.
   */
  count() {
      this.counter = this.counter+1;
  }

  /**
   * This function decrements the counter in order that the right content is shown.
   */
  back() {
    this.counter = this.counter-1;
  }

  /**
   * This function sets an item in the local storage that says that the onboarding was shown, so that it will not be
   * shown next time.
   */
  async getStarted(){
    localStorage.setItem('onboardingShown', JSON.stringify('true'));
    await this.router.navigate(['login']);
  }

  ngOnInit() {
  }

}
