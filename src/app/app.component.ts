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
export class AppComponent implements OnInit, OnChanges {

  @Input() grouplistView = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private trackNav: TrackNavService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.grouplistView = this.trackNav.trackRouteChanges(this.route.snapshot.paramMap.get('gId'));
    console.log(this.grouplistView + 'onIn');
  }

  ngOnChanges(changes: SimpleChanges) {
    this.grouplistView = this.trackNav.trackRouteChanges(this.route.snapshot.paramMap.get('gId'));
    console.log(this.grouplistView + 'onCh');
  }
  goToProfile(){
    this.router.navigate(['profile']);
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
      component: AddExpenseComponent
    });
    await modal
      .present()
      .then(() => console.log('No error with presenting modal'))
      .catch(err => console.log('error modal: ', err));
    await modal.onDidDismiss();
  }
  async openModalIncome(){
    const modal = await this.modalCtrl.create({
      component: AddIncomeComponent
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
