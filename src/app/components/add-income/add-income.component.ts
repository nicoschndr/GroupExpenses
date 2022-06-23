import { Component, OnInit } from '@angular/core';
import {Income} from '../../models/classes/income';
import {IncomingsService} from '../../services/incomings.service';
import {ModalController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-add-income',
  templateUrl: './add-income.component.html',
  styleUrls: ['./add-income.component.scss'],
})
export class AddIncomeComponent implements OnInit {
  entry: Income = new Income();
  toUserId = '';
  fromUserId = '';
  amount;
  date: Date;
  editMode = false;
  userGroupList = ['Sarah', 'Markus', 'Vera', 'Tim'];
  //Get userlist from Group
  //users: User[] = [];
  constructor(private incomingService: IncomingsService, private modalCtrl: ModalController,
              private route: ActivatedRoute) {
    console.log('Income Component loaded!');
    const incomeId = parseInt(this.route.snapshot.paramMap.get('id'), 20);
    if(incomeId){
      this.editMode = true;
      Object.assign(this.entry, this.incomingService.getEntryById(JSON.stringify(incomeId)));
    }
  }

  ngOnInit() {}
  addIncome(){
    this.entry = new Income('', this.fromUserId, this.toUserId, this.amount, this.date);
    this.incomingService.addIncome(this.entry);
    console.log('Income added: ', JSON.stringify(this.entry));
    // this.dismissModal();
  }
  dismissModal(){
    this.modalCtrl.dismiss();
  }
}
