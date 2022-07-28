export class Debt {
  id?: string;
  cId?: string;
  dId?: string;
  amount?: number;
  paid?: boolean;

  constructor(
    id?: string,
    cId?: string,
    dId?: string,
    amount?: number,
    paid?: boolean,
  ) {
    this.id = id;
    this.cId = cId;
    this.dId = dId;
    this.amount = amount;
    this.paid = paid;
  }
}
