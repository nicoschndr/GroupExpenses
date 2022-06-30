import {File} from '../interfaces/file';

export class Expense {
  id?: string;
  name?: string;
  amount?: number;
  date?: Date;
  receipt?: File;
  interval?: boolean;
  userId?: string;
  userName?: string;
  groupId?: string;
  constructor(id?: string, name?: string, amount?: number, date?: Date, receipt?: File,
              interval?: boolean, userId?: string, userName?: string, groupId?: string) {
    this.id = id;
    this.userId = userId;
    this.userName = userName;
    this.groupId = groupId;
    this.name = name;
    this.amount = amount;
    this.date = date;
    this.receipt = receipt;
    this.interval = interval;
  }
}
