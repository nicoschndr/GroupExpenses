export class Expense {
  id?: string;
  name?: string;
  amount?: string;
  date?: Date;
  receipt?: string;
  interval?: boolean;
  userId?: string;
  groupId?: string;
  constructor(id?: string, name?: string, amount?: string, date?: Date, receipt?: string,
              interval?: boolean, userId?: string, groupId?: string) {
    this.id = id;
    this.userId = userId;
    this.groupId = groupId;
    this.name = name;
    this.amount = amount;
    this.date = date;
    this.receipt = receipt;
    this.interval = interval;
  }
}
