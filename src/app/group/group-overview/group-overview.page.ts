import { Component, OnInit } from '@angular/core';
import {GroupService} from '../group.service';
import {ActivatedRoute} from '@angular/router';
import {Group} from '../group.model';

@Component({
  selector: 'app-group-overview',
  templateUrl: './group-overview.page.html',
  styleUrls: ['./group-overview.page.scss'],
})
export class GroupOverviewPage implements OnInit {

  groupId: string;
  group: Group;
  members: any[];

  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.getGroup();
    this.getMembers();
  }

  async getGroup() {
    this.groupId = this.route.snapshot.paramMap.get('gId');
    this.group = await this.groupService.getGroup(this.groupId);
    console.log(this.group);
  }

  async getMembers(): Promise<void> {
    /*for (const member of this.group.groupMembers) {
      const user = await this.groupService.getUser(member);
      this.members.push(user);
    }*/
    this.members = ['Johanna'];
  }

}
