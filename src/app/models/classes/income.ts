export class Income{
  id?: string;
  debtorId?: string;
  creditorId?: string;
  amount?: number;
  date?: Date;
  groupId?: string;
  constructor(id?: string, debtorId?: string, creditorId?: string, amount?: number, date?: Date,
              groupId?: string) {
    this.id = id;
    this.debtorId = debtorId;
    this.creditorId = creditorId;
    this.amount = amount;
    this.date = date;
    this.groupId = groupId;
  }
}
