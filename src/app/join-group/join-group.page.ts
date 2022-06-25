import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';
import {AlertsService} from '../alerts.service';
import {Router} from '@angular/router';

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
              ) { }

   join(id, key): void {
      this.userService.joinGroup(id, key);
      this.router.navigate(['group-overview', {gId: id}]);
      this.id='';
      this.key='';
   }

  ngOnInit() {
  }

}
