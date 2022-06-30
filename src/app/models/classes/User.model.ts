export class User {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  gruppen?: any;
  reminderCount?: number;

  constructor(email?: string, firstName?: string, lastName?: string, password?: string,
              gruppen?: any, reminderCount?: number) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.gruppen = gruppen;
    this.reminderCount = reminderCount;
  }
}

