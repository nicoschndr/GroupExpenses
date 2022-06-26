export class User {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  gruppen: any;

  constructor(email: string, firstName: string, lastName: string, password: string, gruppen: any) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.gruppen = gruppen;
  }
}

