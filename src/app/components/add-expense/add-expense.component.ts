import {Component, OnInit, ViewChild} from '@angular/core';
import {Expense} from '../../models/classes/expense';
import {ExpensesService} from '../../services/expenses.service';
import {ModalController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
})
export class AddExpenseComponent implements OnInit {
  @ViewChild('popover') popover;
  entry: Expense = new Expense();
  name: string;
  amount: string;
  date: any;
  receipt;
  interval: boolean;
  editMode = false;
  isDatePopOpen = false;
  constructor(private expensesService: ExpensesService, private modalCtrl: ModalController,
              private route: ActivatedRoute) {
    console.log('Expense Component loaded!');
    const expenseId = parseInt(this.route.snapshot.paramMap.get('id'), 20);
    if(expenseId){
      this.editMode = true;
      Object.assign(this.entry, this.expensesService.getEntryById(JSON.stringify(expenseId)));
    }
  }

  ngOnInit() {}
  addExpenseEntry(){
    this.entry = new Expense('', this.name, this.amount, this.date, this.receipt, this.interval, '', '');
    this.expensesService.addExpense(this.entry);
    console.log('expense added: ' + JSON.stringify(this.entry));
  }
  dismissModal(){
    this.modalCtrl.dismiss();
  }
  reloadCurrentPage(){
    window.location.reload();
  }
  openDatePopover(e: Event){
    this.popover.event = e;
    this.isDatePopOpen = true;
  }
}
