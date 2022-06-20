export class User {
  email: string;
  firstName: string;
  lastName: string;
  password: string;

  constructor(email: string, firsName: string, lastName: string, password: string) {
    this.email = email;
    this.firstName = firsName;
    this.lastName = lastName;
    this.password = password;
  }
}

