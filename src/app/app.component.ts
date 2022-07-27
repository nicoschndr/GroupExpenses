import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionSheetController, ModalController, ViewDidEnter} from '@ionic/angular';
import {AddExpenseComponent} from './components/add-expense/add-expense.component';
import {TrackNavService} from './services/track-nav.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, ViewDidEnter {

  public inGroupView: boolean;
  public groupId: string;

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

  async ionViewDidEnter() {
    await this.getGroup();
  }

  async getGroup(){
    this.groupId = this.route.snapshot.paramMap.get('gId');
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

  async openModalExpense(){
    console.log('gId: ', this.groupId);
    this.groupId = this.route.snapshot.paramMap.get('gId');
    console.log('gId: ', this.groupId);
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
      componentProps: {
        groupId: this.groupId,
        id: '',
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
        groupId: this.groupId,
        id: '',
        type: 'income'
      }
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async showAddActions(){
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
          }
        },
      ],
    });
    await actionSheet.present();
  }
}
