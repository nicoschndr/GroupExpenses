import { Component, OnInit } from '@angular/core';
import {GroupService} from '../group.service';
import {Group} from '../group.model';
import {ActivatedRoute, Router} from '@angular/router';
import {NavController} from '@ionic/angular';
import {TrackNavService} from '../../track-nav.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss'],
})
export class CreateGroupPage implements OnInit {

  groupname: string;
  founder: string;

  constructor(
    private groupService: GroupService,
    private router: Router,
    private route: ActivatedRoute,
    public navCtrl: NavController,
    private trackNav: TrackNavService,
  ) { }

  ngOnInit() {
    this.getUser();
    this.trackNav.trackRouteChanges(this.route.snapshot.paramMap.get('gId'));
  }

  async createGroup(): Promise<void> {
    try {
      const group: Group = await this.groupService.addGroup(this.groupname, this.founder);
      this.router.navigate(['group-overview/', {gId: group.id}]);
    } catch (e) {
      console.log(e);
    }
  }

  async getUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.founder = user.uid;
  }

  joinGroup() {
    this.router.navigate(['join-group']);
  }
}
