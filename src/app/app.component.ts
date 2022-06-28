import {Component, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {ActionSheetController} from '@ionic/angular';
import {TrackNavService} from './track-nav.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnChanges {

  @Input() grouplistView = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private trackNav: TrackNavService,
  ) {}

  ngOnInit() {
    this.grouplistView = this.trackNav.trackRouteChanges(this.route.snapshot.paramMap.get('gId'));
    console.log(this.grouplistView + 'onIn');
  }

  ngOnChanges(changes: SimpleChanges) {
    this.grouplistView = this.trackNav.trackRouteChanges(this.route.snapshot.paramMap.get('gId'));
    console.log(this.grouplistView + 'onCh');
  }

  showGrouplist() {
    this.router.navigate(['grouplist']);
  }

  showLogin() {
    this.router.navigate(['login']);
  }

  navToAddGroup() {
    this.router.navigate(['create-group']);
  }

  async showAddActions() {
    const actionSheet = await this.actionSheetController.create({
      buttons: [{
        text: 'Ausgabe hinzufügen',
        handler: () => {
          console.log('add function for adding expense');
        }
      }, {
        text: 'Einnahme hinzufügen',
        handler: () => {
          console.log('add function for adding income');
        }
      }, {
        text: 'Abbrechen',
        role: 'cancel',
        handler: () => {
          console.log('canceled action sheet navbar');
        }
      }]
    });
    await actionSheet.present();
  }



}
