import { Component, OnInit } from '@angular/core';
import {GroupService} from '../group.service';
import {ActivatedRoute} from '@angular/router';
import {Group} from '../group.model';
import {UserService} from '../../user.service';
import {User} from '../../User.model';
import {ActionSheetController} from '@ionic/angular';

@Component({
  selector: 'app-group-overview',
  templateUrl: './group-overview.page.html',
  styleUrls: ['./group-overview.page.scss'],
})
export class GroupOverviewPage implements OnInit {

  groupId: string;
  group: Group = new Group();
  members: User[] = [];
  currentUserId: string;

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
  ) {
  }

  ngOnInit() {
    this.getGroup();
    this.getUser();
  }

  async getUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserId = user.uid;
  }

  async getGroup() {
    this.groupId = this.route.snapshot.paramMap.get('gId');
    this.group = await this.groupService.getGroup(this.groupId);
    await this.getMembers();
  }

  async getMembers(): Promise<void> {
    for (const userId of this.group.groupMembers) {
      const user: User = await this.userService.getUserWithUid(userId);
      if (user.id === this.currentUserId) {
        user.firstName = 'Ich';
        this.members.push(user);
      } else {
        this.members.push(user);
      }
    }
  }

  async showActions(): Promise<void> {
    console.log('triggered');
      const actionSheet = await this.actionSheetController.create({
        header: 'Albums',
        cssClass: 'my-custom-class',
        buttons: [{
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          id: 'delete-button',
          data: {
            type: 'delete'
          },
          handler: () => {
            console.log('Delete clicked');
          }
        }, {
          text: 'Share',
          icon: 'share',
          data: 10,
          handler: () => {
            console.log('Share clicked');
          }
        }, {
          text: 'Play (open modal)',
          icon: 'caret-forward-circle',
          data: 'Data value',
          handler: () => {
            console.log('Play clicked');
          }
        }, {
          text: 'Favorite',
          icon: 'heart',
          handler: () => {
            console.log('Favorite clicked');
          }
        }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
      });
      await actionSheet.present();
    }
}
