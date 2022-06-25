import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private router: Router
  ) {}

  showGrouplist() {
    this.router.navigate(['grouplist']);
  }

  showLogin() {
    this.router.navigate(['login']);
  }

  addGroup() {
    this.router.navigate(['create-group']);
  }
}
