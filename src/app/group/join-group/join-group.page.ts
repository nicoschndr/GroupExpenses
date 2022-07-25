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

  /**
   * This function will handle the join of the current user into a existing group
   *
   * @example
   * Call it with a userId type of string
   * join('16rblKzkgIr8HiTohxZ', 'bj6so1g')
   *
   * @param userId
   * @param key
   */
  async join(userId: string, key: string): Promise<void> {
    //send request for joining to the service
    const joinSuccess: boolean = await this.groupService.joinGroup(userId, key);
    //check if join into the existing group was successfull
    if (joinSuccess) {
      //if so reset the input-fields
      this.id='';
      this.key='';
      //navigate the user to the group-overview of the group he joined
      await this.router.navigate(['group-overview', {gId: this.id}]);
    } else  {
      //if not, show an error
      await this.alertsService.showJoinGroupError();
    }
  }
}
