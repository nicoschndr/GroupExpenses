import {Component} from '@angular/core';
import {ActionSheetController, ModalController} from '@ionic/angular';
import {AddIncomeComponent} from './components/add-income/add-income.component';
import {AddExpenseComponent} from './components/add-expense/add-expense.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private actionSheet: ActionSheetController, private modalCtrl: ModalController,
              private router: Router) {}
  goToProfile(){
    this.router.navigate(['profile']);
  }
  async addExpenseIncomeEntry(){
    const actionSheet = await this.actionSheet.create({
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
    const actionSheet = await this.actionSheet.create({
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
  showGrouplist() {
    this.router.navigate(['grouplist']);
  }
}
