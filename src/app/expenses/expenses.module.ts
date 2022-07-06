import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpensesPageRoutingModule } from './expenses-routing.module';

import { ExpensesPage } from './expenses.page';
import { AddExpenseComponent } from '../components/add-expense/add-expense.component';
import { DetailsPageComponent} from '../components/details-page/details-page.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ExpensesPageRoutingModule,
    ],
    exports: [
        AddExpenseComponent,
        DetailsPageComponent
    ],
    declarations: [ExpensesPage, AddExpenseComponent, DetailsPageComponent],
    entryComponents: [AddExpenseComponent, DetailsPageComponent],
})
export class ExpensesPageModule {}
