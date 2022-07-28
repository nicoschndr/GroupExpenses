import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {AlertsService} from '../services/alerts.service';
import {IonInput, ViewWillEnter} from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit, ViewWillEnter{
  @ViewChild('emailInput')
  public emailInput: IonInput;

  email = '';
  password = '';



  constructor(public userService: UserService, private router: Router, public alertsService: AlertsService) { }

  /**
   * This function calls the login function of the user Service with the email and password given from the input fields.
   * Afterwards it empties the input fields and navigates the user to the group list Page.
   */
  async dologin() {
    await this.userService.login(this.email, this.password);
    this.email='';
    this.password='';
    await this.router.navigate(['grouplist']);
  }

  /**
   * This function calls the loginWithGoogle function of the user Service.
   * Afterwards it empties the input fields and in case the user is in the database it navigates the user to the group
   * list Page.
   */
  async loginWithGoogle(): Promise<void> {
    this.alertsService.errors.clear();
    await this.userService.loginWithGoogle();
    this.email='';
    this.password='';
    if(this.userService.google===false){
      await this.router.navigate(['grouplist']);
    }
  }

  /**
   * This function navigates the user to the sign-Up page.
   */
  async navigateSignUp() {
    await this.router.navigate(['signup']);
  }

  /**
   * This function navigates the user to the home page.
   */
  async navigateHome() {
    await this.router.navigate(['home']);
  }

  /**
   * This function navigates the user to the forgot password page.
   */
  async forgotPW() {
    await this.router.navigate(['forgot-pw']);
  }

  /**
   * This function attaches an Observer to the user that has logged in order to always get the information about him,
   * while he is logged in.
   */
  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      this.userService.isLoggedIn = !!user;
    });
  }

  /**
   * This function sets tho focus on the first Input field for a good usability.
   */
  ionViewWillEnter() {
    this.emailInput.setFocus();
  }
}
