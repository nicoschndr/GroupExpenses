import {Component, OnInit, ViewChild} from '@angular/core';
import {Expense} from '../../models/classes/expense';
import {ExpensesService} from '../../services/expenses.service';
import {AlertController, ModalController, NavController, NavParams} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../services/user.service';
import {User} from '../../models/classes/User.model';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
})
export class AddExpenseComponent implements OnInit {
  @ViewChild('popover') popover;
  entry: Expense = new Expense();
  id: string;
  name: string;
  amount: number;
  date: any;
  receipt;
  interval: boolean;
  editMode = false;
  userId: string;
  currentUser: User;
  groupId: string;
  errors: Map<string, string> = new Map<string, string>();
  constructor(private expensesService: ExpensesService, private modalCtrl: ModalController,
              private route: ActivatedRoute, private navCtrl: NavController,
              private navParams: NavParams, private userService: UserService,
              private alertCtrl: AlertController) {
    this.id = navParams.get('id');
    if(this.id){
      this.editMode = true;
    }
    this.getCurrentUserData();
  }

  ngOnInit() {
  }
  async getCurrentUserData(){
    this.currentUser = await this.userService.getCurrentUser();
    this.userId = await this.userService.getCurrentUserId();
  }
  save(){
    this.errors.clear();
    if(!this.name){
      this.errors.set('name', 'Name darf nicht leer sein!');
    } else if (!this.amount) {
      this.errors.set('amount', 'Betrag darf nicht leer sein!');
    } else if (!this.date) {
      this.errors.set('date', 'Datum darf nicht leer sein!');
    } else if(this.errors.size === 0){
      if(this.editMode){
        this.updateExpenseEntry();
      } else {
        this.addExpenseEntry();
      }
    }
  }
  addExpenseEntry(){
    this.entry = new Expense('', this.name, this.amount, this.date, this.receipt, this.interval, this.userId, this.groupId);
    this.expensesService.addExpense(this.entry);
    console.log('expense added: ' + JSON.stringify(this.entry));
    this.modalCtrl.dismiss();
  }
  updateExpenseEntry(){
    this.entry = new Expense(this.id, this.name, this.amount, this.date, this.receipt, this.interval, this.userId, this.groupId);
    this.expensesService.updateExpense(this.entry);
    console.log('expense updated: ' + JSON.stringify(this.entry));
    this.modalCtrl.dismiss();
  }
  async deleteExpense(){
    const alertConfirm = await this.alertCtrl.create({
      header: 'Sind Sie sicher?',
      message: 'Soll der Eintrag wirklich gelöscht werden?',
      buttons: [
        {
          text: 'Ja',
          handler: () => {
            this.expensesService.removeEntry(this.id);
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
