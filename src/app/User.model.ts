export class User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  gruppen: any;

  constructor(id: string, email: string, firstName: string, lastName: string, password: string, gruppen: any) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.gruppen = gruppen;
  }
}

