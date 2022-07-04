import { Component, OnInit } from '@angular/core';
import {Income} from '../../models/classes/income';
import {IncomingsService} from '../../services/incomings.service';
import {AlertController, ModalController, NavParams} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../services/user.service';
import {User} from '../../models/classes/User.model';
import {Group} from '../../models/classes/group.model';
import {GroupService} from '../../services/group.service';

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
  // userGroupList = ['Sarah', 'Markus', 'Vera', 'Tim'];
  userGroupList = [];
  groupMembers: Map<string, string> = new Map<string, string>();
  group: Group;
  // Get userlist from Group
  // users: User[] = [];
  errors: Map<string, string> = new Map<string, string>();
  constructor(private incomingService: IncomingsService, private modalCtrl: ModalController,
              private route: ActivatedRoute, private navParams: NavParams,
              private alertCtrl: AlertController, private groupService: GroupService,
              private userService: UserService) {
    this.id = navParams.get('id');
    if(this.id){
      this.editMode = true;
    }
    this.groupId = this.navParams.get('groupId');
  }

  async ngOnInit() {
    this.group = await this.groupService.getGroupById(this.groupId);
    this.userGroupList = this.group.groupMembers;
    await this.getGroupMembers();
  }
  async getGroupMembers(){
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for(let i = 0; i < this.userGroupList.length; ++i){
      const user: User = await this.userService.getUserWithUid(this.userGroupList[i]);
      this.groupMembers.set(this.userGroupList[i], user.firstName);
    }
  }
  save(){
    this.errors.clear();
    if(!this.amount){
      this.errors.set('amount', 'Betrag darf nicht leer sein!');
    } else if(!this.debitor){
      this.errors.set('debitor', 'Feld darf nicht leer sein!');
    } else if(!this.creditor){
      this.errors.set('creditor', 'Feld darf nicht leer sein!');
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
  async addIncome(){
    await this.getMembersName();
    this.entry = new Income('', this.debitorId, this.debitor, this.creditorId, this.creditor, this.amount, this.date, this.groupId);
    console.log(this.debitor + ' ' + this.debitorId);
    console.log(this.creditor + ' ' + this.creditorId);
    this.incomingService.addIncome(this.entry).catch((err) => console.log('Error: ', err));
    console.log('Income added: ', JSON.stringify(this.entry));
    this.dismissModal();
  }
  async updateIncome(){
    await this.getMembersName();
    this.entry = new Income(this.id, this.debitorId, this.debitor, this.creditorId, this.creditor, this.amount, this.date, this.groupId);
    this.incomingService.updateIncome(this.entry);
    console.log('expense updated: ' + JSON.stringify(this.entry));
    this.modalCtrl.dismiss().catch((err) => console.log('Error: ', err));
  }
  async getMembersName(){
    for(const [key, value] of this.groupMembers.entries()){
      if(value === this.debitor){
        this.debitorId = key;
      } else if(value === this.creditor){
        this.creditorId = key;
      }
    }
  }
  async deleteIncome(){
    const alertConfirm = await this.alertCtrl.create({
      header: 'Sind Sie sicher?',
      message: 'Soll der Eintrag wirklich gelöscht werden?',
      buttons: [
        {
          text: 'Ja',
          handler: () => {
            this.incomingService.removeEntry(this.id);
            this.dismissModal();
            // alertSuccess.present();
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        }
      ]
    });
    await alertConfirm.present();
    // const alertSuccess = await this.alertCtrl.create({
    //   header: 'Erfolgreich',
    //   message: 'Ausgabe wurde gelöscht.',
    //   buttons: ['OK']
    // });
  }
  dismissModal(){
    this.modalCtrl.dismiss();
  }
}
