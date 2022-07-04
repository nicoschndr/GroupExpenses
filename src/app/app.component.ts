import {Component, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {ActionSheetController, ModalController} from '@ionic/angular';
import {TrackNavService} from './track-nav.service';
import {AddIncomeComponent} from './components/add-income/add-income.component';
import {AddExpenseComponent} from './components/add-expense/add-expense.component';



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
    private modalCtrl: ModalController
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

  navToGrouplist() {
    this.router.navigate(['grouplist']);
  }

  navToProfile() {
    this.router.navigate(['profile']);
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
