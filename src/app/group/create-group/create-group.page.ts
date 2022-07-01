import { Component, OnInit } from '@angular/core';
import {GroupService} from '../group.service';
import {Group} from '../group.model';
import {ActivatedRoute, Router} from '@angular/router';
import {NavController} from '@ionic/angular';
import {TrackNavService} from "../../track-nav.service";

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
    const key: string = this.groupname.trim();
    const data: Group = new Group('', this.groupname, [this.founder], key);
    const id = await this.groupService.addGroup(data);
    await this.router.navigate(['group-overview/', {gId: id}]);
    this.groupname = '';
  }

  async navToJoinGroup() {
    await this.router.navigate(['join-group']);
  }
}
