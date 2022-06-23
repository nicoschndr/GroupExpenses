export class Income{
  id?: string;
  debtorId?: string;
  creditorId?: string;
  amount?: number;
  date?: Date;
  constructor(id?: string, debtorId?: string, creditorId?: string, amount?: number, date?: Date) {
    this.id = id;
    this.debtorId = debtorId;
    this.creditorId = creditorId;
    this.amount = amount;
    this.date = date;
  }
}
