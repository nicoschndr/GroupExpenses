import {Component} from '@angular/core';
import {ActionSheetController} from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private actionSheet: ActionSheetController) {}
  async addExpenseIncomeEntry(){
    const actionSheet = await this.actionSheet.create({
      header: '',
      buttons: [
        {text: 'Ausgabe hinzufügen'},
        {text: 'Einnahme hinzufügen'},
        {text: 'Abbrechen', role: 'cancel'},
      ],
    });
    await actionSheet.present();
  }
}
