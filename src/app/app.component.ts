import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionSheetController, ModalController} from '@ionic/angular';
import {AddExpenseComponent} from './components/add-expense/add-expense.component';
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
    private modalCtrl: ModalController,
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
  async addExpenseIncomeEntry(){
    const actionSheet = await this.actionSheetController.create({
      header: 'Ausgaben & Einnahmen',
      buttons: [
        {text: 'Ausgabe hinzufügen'},
        {text: 'Einnahme hinzufügen'},
        {text: 'Abbrechen', role: 'cancel'},
      ],
    });
    await actionSheet.present();
  }
  async openModalExpense(){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        type: 'expense'
      }
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async openModalIncome(){
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        type: 'income'
      }
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async openActionSheet(){
    console.log('Open Action Sheet');
    const actionSheet = await this.actionSheetController.create({
      header: 'Neuer Eintrag',
      buttons: [
        {
          text: 'Ausgabe hinzufügen',
          handler: () => {
            console.log('Ausgabe hinzufügen');
            this.openModalExpense();
          }
        },
        {
          text: 'Einnahme hinzufügen',
          handler: () => {
            console.log('Einnahme hinzufügen');
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
            console.log('Vorgang abgebrochen');
            this.openModalIncome();
          }
        },
      ],
    });
    await actionSheet.present();
  }
}
