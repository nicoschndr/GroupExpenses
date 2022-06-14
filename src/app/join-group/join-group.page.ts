import { Component, OnInit } from '@angular/core';
import {UserService} from '../user.service';

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.page.html',
  styleUrls: ['./join-group.page.scss'],
})
export class JoinGroupPage implements OnInit {

  id = '';
  key = '';

  constructor(private userService: UserService) { }

   join(id, key): void {
      this.userService.joinGroup(id, key);
      this.id='';
      this.key='';
   }

  ngOnInit() {
  }

}
