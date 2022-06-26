import { Component, OnInit } from '@angular/core';
import {GroupService} from '../group.service';
import {ActivatedRoute, Router} from '@angular/router';
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
  editMode = false;

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    public actionSheetController: ActionSheetController,
  ) {
  }

  ngOnInit() {
    this.getGroup();
    this.getUser();
  }

  ionViewDidEnter() {
    this.getMembers();
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

  editGroup() {
    this.editMode = true;
  }

  async deleteUserFromGroup(uId: string) {
    const deleteAction: boolean = await this.groupService.deleteUserFromGroup(uId, this.group.id);
    if (deleteAction) {
      this.editMode = false;
      this.members.splice(0, this.members.length);
      await this.getMembers();
    } else if (deleteAction && this.editMode) {
      this.router.navigate(['grouplist']);
    }
    else {
      this.router.navigate(['grouplist']);
    }
  }

  leaveEditMode() {
    this.editMode = false;
  }


  async showActions() {
    console.log('ationSheet');
    const actionSheet = await this.actionSheetController.create({
      //cssClass: 'my-custom-class',
      buttons: [{
        text: 'Mitglieder bearbeiten',
        handler: () => {
          this.editMode = true;
        }
      }, {
        text: 'Gruppe verlassen',
        handler: () => {
          this.deleteUserFromGroup(this.currentUserId);
        }
      }, {
        text: 'Abbrechen',
        role: 'cancel',
        handler: () => {
          console.log('canceled action sheet group-overview');
        }
      }]
    });
    console.log('bevore present');
    await actionSheet.present();
    console.log('after present');
  }

}
