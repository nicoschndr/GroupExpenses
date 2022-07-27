import { Component, Input, OnInit } from '@angular/core';

import { Chart, registerables } from 'chart.js'; Chart.register(...registerables);
import { ExpensesService } from '../../services/expenses.service';
import { IncomingsService } from '../../services/incomings.service';


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {

  @Input() grpid = '';

  doughnutChart: any;

  dateStart: Date;
  dateEnd: Date;

  dateStartISO = '';
  dateEndISO = '';


  constructor(
    private expensesService: ExpensesService,
    private incomingsService: IncomingsService,
  ) {
    this.dateEnd = new Date(Date.now());
    this.dateEnd.setHours(23);
    this.dateEnd.setMinutes(59);

    this.dateStart = this.addDays(this.dateEnd, -30);
    this.dateStart.setHours(0);
    this.dateStart.setMinutes(0);

    this.dateEndISO = this.dateEnd.toISOString();
    this.dateStartISO = this.dateStart.toISOString();
  }

  addDays(date, days) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + days,
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    );
  }

  readDateISO() {
    this.dateEnd = new Date(this.dateEndISO);
    this.dateEnd.setHours(23);
    this.dateEnd.setMinutes(59);

    this.dateStart = new Date(this.dateStartISO);
    this.dateStart.setHours(0);
    this.dateStart.setMinutes(0);
  }

  async doughnutChartMethod() {
    this.readDateISO();
    const allExpenses = await this.incomingsService.getAllIncomingbyMonth(this.grpid, new Date(this.dateStart), new Date(this.dateEnd));
    // console.log(allIncomingbyMonth);

    const allIncoming = await this.expensesService.getAllExpensesbyMonth(this.grpid, new Date(this.dateStart), new Date(this.dateEnd));
    // console.log(allExpensesbyMonth);

    let expensesSum = 0;
    for (const expense of allExpenses) {
      expensesSum += expense.amount;
    }

    let incomingSum = 0;
    for (const incoming of allIncoming) {
      incomingSum += incoming.amount;
    }

    const canvasdiv = document.getElementById('canvasdiv');
    canvasdiv.textContent = '';
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas1';
    canvasdiv.append(canvas);

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
            '#A3FADD',
            '#ADC0FF',
          ]
        }]
      }
    });
  }

  ngOnInit() {

    this.doughnutChartMethod();
  }

}
