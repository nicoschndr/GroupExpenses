import { Component, Input, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

import { Chart, registerables } from 'chart.js'; Chart.register(...registerables);
import { ExpensesService } from '../../services/expenses.service';


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {

  @Input() grpid = '';

  doughnutChart: any;


  constructor(
    private expensesService: ExpensesService
  ) {
  }

  async doughnutChartMethod() {
    // console.log('groupid: ', this.grpid);

    const allExpenses = await this.expensesService.getAllExpensesArray(this.grpid);
    // console.log(allExpenses);

    const allIncoming = await this.expensesService.getAllIncoming(this.grpid);
    // console.log(allIncoming);

    let expensesSum = 0;
    for (const expense of allExpenses) {
      expensesSum += expense.amount;
    }

    let incomingSum = 0;
    for (const incoming of allIncoming) {
      incomingSum += incoming.amount;
    }

    this.doughnutChart = new Chart('canvas1', {
      type: 'doughnut',
      data: {
        labels: ['Einnahmen', 'Ausgaben'],
        datasets: [{
          data: [incomingSum, expensesSum],
          backgroundColor: [
            '#86E3CB',
            '#8698E3',
          ],
          hoverBackgroundColor: [
            '#86E3CB',
            '#8698E3',
          ]
        }]
      }
    });
  }

  ngOnInit() {

    this.doughnutChartMethod();
  }

}
