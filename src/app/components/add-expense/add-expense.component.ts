import {Component, OnInit, ViewChild} from '@angular/core';
import {Expense} from '../../models/classes/expense';
import {ExpensesService} from '../../services/expenses.service';
import {AlertController, ModalController, NavController, NavParams} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../services/user.service';
import {User} from '../../models/classes/User.model';
import {PhotoService} from '../../services/photo.service';
import {IncomingsService} from '../../services/incomings.service';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
})
export class AddExpenseComponent implements OnInit {
  @ViewChild('popover') popover;
  pageTitle: string;
  entry: Expense = new Expense();
  id: string;
  name: string;
  amount: number;
  date: Date;
  receipt: any;
  userId: string;
  userName: string;
  groupId: string;
  type: string;
  interval = false;
  editMode = false;
  currentUser: User;
  errors: Map<string, string> = new Map<string, string>();
  fileName: string;
  uploadStatus = false;
  constructor(private expensesService: ExpensesService,
              private incomingService: IncomingsService,
              private modalCtrl: ModalController,
              private route: ActivatedRoute,
              private navCtrl: NavController,
              private navParams: NavParams,
              private userService: UserService,
              private alertCtrl: AlertController,
              private photoService: PhotoService) {
    this.entry = this.navParams.get('data');
    this.id = this.navParams.get('id');
    this.type = this.navParams.get('type');
    this.groupId = this.navParams.get('groupId');
    if(this.entry){
      this.editMode = true;
      this.setValuesInInputs().catch((err) => console.log('Error: ', err));
    }
  }
  ngOnInit() {
    this.setPageTitle().catch((err) => console.log('Error: ', err));
    this.getCurrentUserData().catch((err) => console.log('Error: ', err));
  }

  /**
   * This function will get data from current / logged-in user.
   */
  async getCurrentUserData(){
    this.userId = await this.userService.getCurrentUserId();
    this.currentUser = await this.userService.getUserWithUid(this.userId);
    this.userName = this.currentUser.firstName;
  }

  /**
   * This function will set pageTitle according to the data that was passed to the component.
   */
  async setPageTitle(){
    if(this.type === 'expense' && this.id !== ''){
      this.pageTitle = 'Ausgabe bearbeiten';
    } else if(this.type === 'expense' && this.id === '') {
      this.pageTitle = 'Ausgabe hinzufügen';
    } else if(this.type === 'income' && this.id !== '') {
      this.pageTitle = 'Einnahme bearbeiten';
    } else if(this.type === 'income' && this.id === ''){
      this.pageTitle = 'Einnahme hinzufügen';
    }
  }

  /**
   * This function will get data from one expense by its ID.
   */
  async getExpenseData(){
    this.entry = await this.expensesService.getEntryById(this.id);
  }

  /**
   * This function will set all input values if the user is in edit mode.
   */
  async setValuesInInputs(){
    this.id = this.entry.id;
    this.name = this.entry.name;
    this.amount = this.entry.amount;
    this.date = this.entry.date;
    this.receipt = this.entry.receipt;
    this.type = this.entry.type;
    this.interval = this.entry.interval;
  }
  /**
   * This function will check if all required inputs have values and will add or update entry according to
   * the boolean value of local variable editMode.
   */
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

  /**
   * This function will add data to firebase collection.
   */
  addExpenseEntry(){
    this.entry = new Expense(
      '',
      this.name,
      this.amount,
      this.date,
      this.receipt,
      this.userId,
      this.userName,
      this.groupId,
      this.type,
      this.interval,
      false,
    );
    if(this.type === 'expense'){
      this.expensesService.addExpense(this.entry).catch((err) => console.log('Error: ', err));
    } else if(this.type === 'income'){
      this.incomingService.addIncome(this.entry).catch((err) => console.log('Error: ', err));
    }
    this.modalCtrl.dismiss().catch((err) => console.log('Error: ', err));
  }

  /**
   * This function will update entry in firebase collection.
   */
  updateExpenseEntry(){
    this.entry = new Expense(
      this.id,
      this.name,
      this.amount,
      this.date,
      this.receipt,
      this.userId,
      this.userName,
      this.groupId,
      this.type,
      this.interval
    );
    if(this.type === 'expense'){
      this.expensesService.updateExpense(this.entry);
    } else if(this.type === 'income'){
      this.incomingService.updateIncome(this.entry);
    }
    this.modalCtrl.dismiss().catch((err) => console.log('Error: ', err));
  }

  /**
   * This function will delete entry.
   */
  async deleteExpense(){
    const alertConfirm = await this.alertCtrl.create({
      header: 'Sind Sie sicher?',
      message: 'Soll der Eintrag wirklich gelöscht werden?',
      buttons: [
        {
          text: 'Ja',
          handler: () => {
            this.expensesService.removeEntry(this.id);
            this.dismissModal(this.type);
            alertSuccess.present();
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        }
      ]
    });
    await alertConfirm.present();
    const alertSuccess = await this.alertCtrl.create({
      header: 'Erfolgreich',
      message: 'Ausgabe wurde gelöscht.',
      buttons: ['OK']
    });
  }

  /**
   * This function will be triggered by an event and will pass data to function to add this to the firebase
   * collection.
   *
   * @param event
   */
  uploadPhoto(event){
    this.uploadStatus = true;
    this.receipt = this.photoService.storeImg(event.target.files[0]).then((res: any) => {
      if(res){
        this.uploadStatus = false;
        this.receipt = res;
      }
    },
      (error: any) => {
        this.uploadStatus = false;
        console.log('Error: ', error);
      });
  }

  /**
   * This function will dismiss modal.
   */
  dismissModal(type: string){
    this.modalCtrl.dismiss({type}).catch((err) => console.log('Error: ', err));
  }
}
