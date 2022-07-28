import {Component, OnInit, ViewChild,} from '@angular/core';
import {UserService} from '../services/user.service';
import {User } from '../models/classes/User.model';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {AlertsService} from '../services/alerts.service';
import {AlertController, IonInput, ViewDidLeave} from '@ionic/angular';
import {Router} from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, ViewDidLeave {
  @ViewChild('firstName')
  public firstName: IonInput;

  user: any = {};
  editMode = false;
  password = false;
  pw='';
  pw2='';
  altespw='';

  constructor(private userService: UserService,
              public alertsService: AlertsService,
              private router: Router,
              private alrtCtrl: AlertController) {
    /**
     * If the Page is called while the boolean "google" is on true it throws an alert. That is the case when a new User
     * that is not in the database yet signs in with the Google provider.
     */
    if (this.userService.google === true) {
      this.editMode = true;
      this.alertsService.errors.clear();
      this.alertsService.errors.set('googleUser', 'Bitte machen Sie noch ein Paar Angaben!');
    }
  }

  /**
   * This function changes the boolean "editMode". If it was false it gets set true and the other way round.
   */
  changeMode() {
    this.editMode = this.editMode === false;
    if(this.editMode) {
      this.firstName.setFocus();
    }
  }

  /**
   * This function attaches an Observer to the user that has logged in order to always get the information about him,
   * while he is logged in. If a user is logged in it gets the data from this user by calling the getUserWithUid()
   * method of the user Service with the uid of the user that is logged in and assigns it to the input fields on the
   * page. In case a new User that is not in the database yet signs in with the Google provider, the input field
   * with the firstname is focused.
   */
  async ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const result = await this.userService.getUserWithUid(user.uid);
        Object.assign(this.user, result);
        if(this.editMode){
          await this.firstName.setFocus();
        }
      } else {
      }
    });
  }

  /**
   * This function deletes all errors, when the user leaves the view.
   */
  ionViewDidLeave() {
    this.alertsService.errors.clear();
  }

  /**
   * This function gets the User that is logged in and the data according to him by calling the getCurrentUser() and
   * getUserWithUid() methods of the user Service and then sets it again but with the updated data by calling the
   * setUser() method of the user Service. In case of success it throws an alert.
   */
  async updateUser() {
    const currentUser = this.userService.getCurrentUser();
    const result = await this.userService.getUserWithUid(currentUser.uid);
    const userData = new User(
      this.user.id,
      this.user.email,
      this.user.firstName,
      this.user.lastName,
      result.password,
      result.gruppen,
      result.reminderCount
    );
    await this.userService.setUser(currentUser.uid, userData);
    this.alertsService.errors.clear();
    this.alertsService.errors.set('success', 'Bearbeitung erfolgreich!');
  }

  /**
   * This function gets the User that is logged in and the data according to him by calling the getCurrentUser() and
   * getUserWithUid() methods of the user Service. It then checks if the old password given from the input field matches
   * the old password in the database and if the new password that has to be written two times is both the same.
   * It then changes the boolean "password" to true in order that the right content is shown and calls the
   * changePassword() method of the user Service with the password from the input fields. At last, it changes the
   * booleans "password" and "editMode" to false in order that the right content is shown and the input fields no
   * longer can be changed. In case of an error it throws an alert.
   */
  async changePassword() {
    const currentUser = this.userService.getCurrentUser();
    const user = await this.userService.getUserWithUid(currentUser.uid);
    if(user.password === this.altespw && this.pw === this.pw2) {
      this.password = true;
      await this.userService.changePassword(this.pw);
      this.password=false;
      this.editMode=false;
      this.pw='';
      this.pw2='';
      this.altespw='';
    } else {
      this.alertsService.errors.clear();
      this.alertsService.errors.set('changePW','Ihre Angaben waren fehlerhaft');
    }
  }

  /**
   * This function calls the deleteUser function of the user Service with the uid of the current user that is got
   * with the getCurrentUser() method of the user Service.
   */
  async deleteUser() {
    await this.alrtCtrl.create({
      header: 'Profil löschen',
      message:'Möchtest du dein Profil wirklich unwiderruflich löschen?',
      buttons: [
        {
          text: 'ja',
          handler: async ()=>{
            const currentUser = this.userService.getCurrentUser();
            await this.userService.deleteUser(currentUser.uid);
            this.logout();
          }
        },{
        text:'abbrechen',
          handler: () => {
          this.alrtCtrl.dismiss();
          }
        }
      ]
    }).then(res=>res.present());
  }


  /**
   * This function calls the logout method of the user Service.
   */
  logout() {
    this.userService.logout();
  }

  /**
   * This function navigates the user to the grouplist Page.
   */
  navigateGrouplist(){
    this.router.navigate(['grouplist']);
  }

  /**
   * This function navigates the user to the profile Page.
   */
  navigateProfile(){
    this.router.navigate(['profile']);
  }
}

