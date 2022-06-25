import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {Group} from '../group.model';
import {GroupService} from '../group.service';

@Component({
  selector: 'app-grouplist',
  templateUrl: './grouplist.page.html',
  styleUrls: ['./grouplist.page.scss'],
})
export class GrouplistPage implements OnInit {

  grouplist: Group[] = [];
  leftToPay = 0;
  currentUserId: string;


  constructor(
    private router: Router,
    private groupService: GroupService,
  ) {
  }

  ionViewDidEnter() {
    this.getAllGroups();
  }

  ngOnInit() {
    this.getAllGroups();
  }

  async getUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserId = user.uid;
  }

  async getAllGroups(): Promise<void> {
    try {
      await this.getUser();
      this.grouplist = await this.groupService.findGroups(this.currentUserId);
    } catch (e) {
      console.log(e);
    }
  }

  showGroup(groupId: string) {
    this.router.navigate(['group-overview', {gId: groupId}]);
  }

  openCreateGroup() {
    this.router.navigate(['create-group']);
  }
}
