export class Expense {
  id?: string;
  name?: string;
  amount?: number;
  date?: any;
  receipt?: any;
  userId?: string;
  userName?: string;
  groupId?: string;
  type?: string;
  interval?: boolean;
  split?: boolean;
  constructor(id?: string,
              name?: string,
              amount?: number,
              date?: any,
              receipt?: any,
              userId?: string,
              userName?: string,
              groupId?: string,
              type?: string,
              interval?: boolean,
              split?: boolean,
  ) {
    this.id = id;
    this.userId = userId;
    this.userName = userName;
    this.groupId = groupId;
    this.name = name;
    this.amount = amount;
    this.date = date;
    this.receipt = receipt;
    this.type = type;
    this.interval = interval;
    this.split = split;
  }
}
