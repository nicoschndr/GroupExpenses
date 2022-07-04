import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {NavController} from '@ionic/angular';
import {UserService} from '../../services/user.service';
import {AlertsService} from '../../services/alerts.service';
import {GroupService} from '../../services/group.service';

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.page.html',
  styleUrls: ['./join-group.page.scss'],
})
export class JoinGroupPage implements OnInit {

  public id: string;
  public key: string;

  constructor(private userService: UserService,
              private groupService: GroupService,
              public alertsService: AlertsService,
              public router: Router,
              public navCtrl: NavController,
              ) { }

  ngOnInit() {
  }

  async join(id: string, key: string): Promise<void> {
    const joinSuccess: boolean = await this.groupService.joinGroup(id, key);
    if (joinSuccess) {
      this.id='';
      this.key='';
      await this.router.navigate(['group-overview', {gId: id}]);
    } else  {
      await this.alertsService.showJoinGroupError();
      await this.router.navigate(['join-group']);
    }
  }
}
