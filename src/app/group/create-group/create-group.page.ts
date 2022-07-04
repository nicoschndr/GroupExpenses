import { Component, OnInit } from '@angular/core';
import {GroupService} from '../group.service';
import {Group} from '../group.model';
import {Router} from '@angular/router';
import {NavController} from '@ionic/angular';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {UserService} from '../../user.service';
import {AlertsService} from '../../alerts.service';

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
        this.founder = await this.userService.getCurrentUser();
      } else {
        await this.router.navigate(['grouplist']);
      }
    });
  }

  async createGroup(): Promise<void> {
    try {
      const key: string = Math.random().toString(36).slice(-5);
      const data: Group = new Group('', this.groupname, [this.founder], key);
      const id = await this.groupService.addGroup(data);
      await this.router.navigate(['group-overview/', {gId: id}]);
      this.groupname = '';
    } catch (e) {
      await this.alertService.showJoinGroupError();
    }
  }

  async navToJoinGroup() {
    await this.router.navigate(['join-group']);
  }
}
