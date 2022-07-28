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
    console.log('onboardingoninit', onboardingShownFromStorage);
    if (onboardingShownFromStorage === null) {
      await localStorage.setItem('onboardingShown', JSON.stringify(false));
    } else {
      await localStorage.setItem('onboardingShown', JSON.stringify(true));
    }
  }

  async getGroup() {
    const gId = localStorage.getItem('gId');
    this.groupId = JSON.parse(gId);
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
          handler: async () => {
            await this.openModalExpense();
          }
        },
        {
          text: 'Einnahme hinzufügen',
          handler: async () => {
            await this.openModalIncome();
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }
}
