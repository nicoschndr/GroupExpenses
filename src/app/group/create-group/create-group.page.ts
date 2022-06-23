import { Component, OnInit } from '@angular/core';
import {GroupService} from '../group.service';
import {Group} from '../group.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss'],
})
export class CreateGroupPage implements OnInit {

  groupname: string;

  constructor(
    private groupService: GroupService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  async createGroup(): Promise<void> {
    try {
      const group: Group = await this.groupService.addGroup(this.groupname);
      this.router.navigate(['group-overview/', {id: group.id}]);
    } catch (e) {
      console.log(e);
    }
  }
}
