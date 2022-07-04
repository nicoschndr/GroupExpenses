import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpensesPageRoutingModule } from './expenses-routing.module';

import { ExpensesPage } from './expenses.page';
import {AddExpenseComponent} from '../components/add-expense/add-expense.component';
import {AddIncomeComponent} from '../components/add-income/add-income.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ExpensesPageRoutingModule,
    ],
    exports: [
        AddExpenseComponent
    ],
    declarations: [ExpensesPage, AddExpenseComponent, AddIncomeComponent],
    entryComponents: [AddExpenseComponent, AddIncomeComponent],
})
export class ExpensesPageModule {}
