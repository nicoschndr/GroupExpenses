import { Component, OnInit } from '@angular/core';
import {Income} from '../../models/classes/income';
import {IncomingsService} from '../../services/incomings.service';
import {ModalController, NavParams} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-add-income',
  templateUrl: './add-income.component.html',
  styleUrls: ['./add-income.component.scss'],
})
export class AddIncomeComponent implements OnInit {
  entry: Income = new Income();
  id: string;
  creditorId = '';
  creditor = '';
  debitorId = '';
  debitor = '';
  amount: number;
  date: Date;
  groupId: string;
  editMode = false;
  userGroupList = ['Sarah', 'Markus', 'Vera', 'Tim'];
  //Get userlist from Group
  //users: User[] = [];
  errors: Map<string, string> = new Map<string, string>();
  constructor(private incomingService: IncomingsService, private modalCtrl: ModalController,
              private route: ActivatedRoute, private navParams: NavParams) {
    this.id = navParams.get('id');
    if(this.id){
      this.editMode = true;
    }
  }

  ngOnInit() {}
  save(){
    this.errors.clear();
    if(!this.amount){
      this.errors.set('amount', 'Betrag darf nicht leer sein!');
    } else if(!this.debitor){
      this.errors.set('debitor', 'Betrag darf nicht leer sein!');
    } else if(!this.creditor){
      this.errors.set('creditor', 'Betrag darf nicht leer sein!');
    } else if (!this.date) {
      this.errors.set('date', 'Datum darf nicht leer sein!');
    } else if(this.errors.size === 0){
      if(this.editMode === true){
        this.updateIncome();
      } else {
        this.addIncome();
      }
    }
  }
  addIncome(){
    this.entry = new Income('', this.debitorId, this.creditorId, this.amount, this.date, this.groupId);
    this.incomingService.addIncome(this.entry);
    console.log('Income added: ', JSON.stringify(this.entry));
    this.dismissModal();
  }
  updateIncome(){
    this.entry = new Income(this.id, this.debitorId, this.creditorId, this.amount, this.date, this.groupId);
    this.incomingService.updateIncome(this.entry);
    console.log('expense updated: ' + JSON.stringify(this.entry));
    this.modalCtrl.dismiss();
  }
  dismissModal(){
    this.modalCtrl.dismiss();
  }
}
