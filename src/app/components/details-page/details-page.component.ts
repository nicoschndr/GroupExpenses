import { Component, OnInit } from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {Expense} from '../../models/classes/expense';

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss'],
})
export class DetailsPageComponent implements OnInit {
  entry: Expense;
  pageTitle: string;
  type: string;
  interval: string;
  constructor(private navParams: NavParams, private modalCtrl: ModalController) {
    this.entry = this.navParams.get('data');
    if(this.entry.type === 'expense'){
      this.pageTitle = 'Ausgabe';
    } else if(this.entry.type === 'income'){
      this.pageTitle = 'Einnahme';
    }
    if(this.entry.interval === true){
      this.interval = 'Ja';
    } else if(this.entry.interval === false){
      this.interval = 'Nein';
    } else {
      this.interval = '';
    }
  }

  ngOnInit() {}

  openPhoto(receiptUrl: string){
    window.open(receiptUrl);
  }

  /**
   * This function will dismiss modal.
   */
  dismissModal(type: string){
    this.modalCtrl.dismiss(type).catch((err) => console.log('Error: ', err));
  }
}
