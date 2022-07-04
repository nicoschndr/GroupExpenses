import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionSheetController} from '@ionic/angular';
import {TrackNavService} from './services/track-nav.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  public inGroupView: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    public trackNav: TrackNavService,
  ) {
    this.trackNav.checkIfInGroupView().subscribe( inGroupView => this.inGroupView = inGroupView);
  }

  async ngOnInit() {
    const onboardingShownFromStorage: boolean = await JSON.parse(localStorage.getItem('onboardingShown'));
    if (onboardingShownFromStorage) {
      await localStorage.setItem('onboardingShown', JSON.stringify(true));
    } else {
      await localStorage.setItem('onboardingShown', JSON.stringify(false));
    }
    await localStorage.setItem('reminderCount', JSON.stringify(0));
  }

  async navToGrouplist() {
    await this.router.navigate(['grouplist']);
  }

  async navToProfile() {
    await this.router.navigate(['profile']);
  }

  async navToAddGroup() {
    await this.router.navigate(['create-group']);
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
