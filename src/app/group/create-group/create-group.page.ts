import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {IonInput, NavController, ViewWillLeave} from '@ionic/angular';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {AlertsService} from '../../services/alerts.service';
import {UserService} from '../../services/user.service';
import {GroupService} from '../../services/group.service';
import {Group} from '../../models/classes/group.model';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss'],
})
export class CreateGroupPage implements OnInit, ViewWillLeave {

  public groupName: string;
  #input: IonInput;
  private founder: string;

  set input(ip: IonInput) {
    if(ip) {
      ip.setFocus();
      this.#input = ip;
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private alertService: AlertsService,
    private router: Router,
    public navCtrl: NavController,
  ) { }

  ionViewWillLeave() {
    this.groupName = '';
  }

  async ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      //check if the user is still logged in
      if (user) {
        //if so, set him as the founder of any new created group
        this.founder = await this.userService.getCurrentUserId();
      } else {
        //if not, redirect to the grouplist-page where the logout is handled
        await this.router.navigate(['grouplist']);
      }
    });
  }

  /**
   * This function will handle the process of creating a new group
   */
  async createGroup(groupName: string) {
    console.log(groupName);
      //check if the given groupname is not empty
    if (groupName === undefined) {
      await this.alertService.showError('Du musst einen Gruppennnamen eingeben!');
    } else if (groupName.trim() !== '') {
        //if not, generate a random group-key
        const key: string = Math.random().toString(36);
        //bundle data for creating a new group for the service
        const data: Group = new Group('id', groupName, [this.founder], key.slice(3, -2));
        //send request for generating a new group to the service
        const id = await this.groupService.addGroup(data);
        //navigate the user to the new created group
        await this.router.navigate(['group-overview/', {gId: id}]);
        //reset the inputfield for the groupname
        this.groupName = '';
      } else {
        await this.alertService.showError('Du musst einen Gruppennnamen eingeben!');
    }
  }

  /**
   * This function will navigate the user to the page join-group
   * after clicking on the button 'Mit Gruppen-Id teilnehmen'
   */
  async navToJoinGroup() {
    await this.router.navigate(['join-group']);
  }
}
