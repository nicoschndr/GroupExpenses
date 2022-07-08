export class Payment {
  id?: string;
  amount?: number;
  group?: string;
  date?: Date;
  idCreditor?: string;
  idDebtor?: string;
  state?: boolean;
  reminder?: boolean;

  constructor(
    id?: string,
    amount?: number,
    group?: string,
    date?: Date,
    idCreditor?: string,
    idDebtor?: string,
    state?: boolean,
    reminder?: boolean,
  ) {
    this.id = id;
    this.amount = amount;
    this.group = group;
    this.date = date;
    this.idCreditor = idCreditor;
    this.idDebtor = idDebtor;
    this.state = state;
    this.reminder = reminder;
  }
}
