import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {NavController} from '@ionic/angular';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {AlertsService} from '../../services/alerts.service';
import {UserService} from '../../services/user.service';
import {GroupService} from '../../services/group.service';
import {Group} from '../../models/classes/group.model';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss'],
})
export class CreateGroupPage implements OnInit {

  public groupname: string;
  private founder: string;

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private alertService: AlertsService,
    private router: Router,
    public navCtrl: NavController,
  ) { }

  async ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.founder = await this.userService.getCurrentUserId();
      } else {
        await this.router.navigate(['grouplist']);
      }
    });
  }

  async createGroup(): Promise<void> {
    try {
      if (this.groupname !== '') {
        const key: string = Math.random().toString(36);
        const data: Group = new Group('', this.groupname, [this.founder], key.slice(3, -2));
        const id = await this.groupService.addGroup(data);
        await this.router.navigate(['group-overview/', {gId: id}]);
        this.groupname = '';
      }
    } catch (e) {
      await this.alertService.showJoinGroupError();
    }
  }

  async navToJoinGroup() {
    await this.router.navigate(['join-group']);
  }
}
