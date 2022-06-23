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


  constructor(
    private router: Router,
    private groupService: GroupService,
  ) {
  }

  ngOnInit() {
    this.getAllGroups();
  }

  async getAllGroups(): Promise<void> {
    try {
      this.grouplist = await this.groupService.findAll();
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
