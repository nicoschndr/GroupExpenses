import {Component, OnInit,} from '@angular/core';
import {UserService} from '../services/user.service';
import {User } from '../models/classes/User.model';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {AlertsService} from '../services/alerts.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: any = {};
  editMode = false;
  password = false;
  pw='';
  pw2='';
  altespw='';

  constructor(private userService: UserService, public alertsService: AlertsService) {
  }

  changeMode() {
    this.editMode = this.editMode === false;
  }

  async ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const result = await this.userService.getUserWithUid(user.uid);
        Object.assign(this.user, result);
      } else {
      }
    });
  }

  async updateUser() {
    const auth = getAuth();
    const user = auth.currentUser;
    const result = await this.userService.getUserWithUid(user.uid);
    const userData = new User(this.user.email, this.user.firstName, this.user.lastName, result.password, result.gruppen);
    await this.userService.setUser(user.uid, userData);
  }

  async changePassword() {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const user = await this.userService.getUserWithUid(currentUser.uid);
    if(user.password === this.altespw && this.pw === this.pw2) {
      this.password = true;
      await this.userService.changePassword(this.pw);
      this.password=false;
      this.editMode=false;
      this.pw='';
      this.pw2='';
      this.altespw='';
    }else{
      this.alertsService.errors.clear();
      this.alertsService.errors.set('changePW','Ihre Angaben waren fehlerhaft');
    }
  }

  async deleteUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    await this.userService.deleteUser(currentUser.uid);
    this.logout();
  }


  logout() {
    this.userService.logout();
  }
}

