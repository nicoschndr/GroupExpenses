export class Income{
  id?: string;
  debtorId?: string;
  debitor?: string;
  creditorId?: string;
  creditor?: string;
  amount?: number;
  date?: Date;
  groupId?: string;
  constructor(id?: string, debtorId?: string, debitor?: string, creditorId?: string,
              creditor?: string, amount?: number, date?: Date, groupId?: string) {
    this.id = id;
    this.debtorId = debtorId;
    this.debitor = debitor;
    this.creditorId = creditorId;
    this.creditor = creditor;
    this.amount = amount;
    this.date = date;
    this.groupId = groupId;
  }
}
