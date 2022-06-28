import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';
import {AlertsService} from '../alerts.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NavController} from '@ionic/angular';
import {TrackNavService} from '../track-nav.service';

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.page.html',
  styleUrls: ['./join-group.page.scss'],
})
export class JoinGroupPage implements OnInit {

  id = '';
  key = '';

  constructor(private userService: UserService,
              public alertsService: AlertsService,
              public router: Router,
              private route: ActivatedRoute,
              public navCtrl: NavController,
              private trackNav: TrackNavService,
              ) { }

   async join(id, key): Promise<void> {
      await this.userService.joinGroup(id, key);
      this.id='';
      this.key='';
      this.router.navigate(['group-overview', {gId: id}]);
   }

  ngOnInit() {
    this.trackNav.trackRouteChanges(this.route.snapshot.paramMap.get('gId'));
  }

}
