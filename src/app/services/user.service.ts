import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import {User} from '../models/classes/User.model';
import {Group} from '../models/classes/Group.model';
import {AlertsService} from './alerts.service';
import {Router} from '@angular/router';
import {deleteUser, getAuth, updatePassword} from '@angular/fire/auth';


  @Injectable({
    providedIn: 'root'
  })
  export class UserService {
    isLoggedIn = false;
    google = false;
    currentUser: any[] = [];
    private userCollection: AngularFirestoreCollection<User>;
    private groupCollection: AngularFirestoreCollection<Group>;

    constructor(private afa: AngularFireAuth, private afs: AngularFirestore, public alertsService: AlertsService, private router: Router) {
      this.userCollection = afs.collection<User>('user');
      this.groupCollection = afs.collection<Group>('group');
    }

    /**
     * This function gets the user that is currently logged in with the getAuth() method from firebase.
     */
    getCurrentUser(): any {
      const auth = getAuth();
      return auth.currentUser;
    }

    /**
     * This function gets the id of the user that is currently logged in with the getAuth() method from firebase.
     */
    getCurrentUserId(): any {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      return currentUser.uid;
    }

    /**
     * This function will log in a user by using the signInWithEmailAndPassword() method from AngularFireAuth.
     * Furthermore, it updates the password of the user in the database every time in case that it was changed with the
     * sendPasswordResetEmail() method.
     * It will throw an alert in case of an error occurring in the process by setting an error in the alertsService.
     *
     * @example
     * Call it with an email and a password both as a string.
     * login('max.mustermann@mail.de', '123456')
     *
     * @param email
     * @param password
     */
    async login(email: string, password: string) {
      try {
        await this.afa.signInWithEmailAndPassword(email, password).then(res => {
          this.isLoggedIn = true;
          const currentUser = this.getCurrentUser();
          this.updatePassword(currentUser.uid, password);
        });
      } catch (e) {
        this.alertsService.errors.clear();
        if (e.code === 'auth/internal-error') {
          this.alertsService.errors.set('loginpw', 'Geben Sie ein Passwort ein.');
        }
        if (e.code === 'auth/user-not-found') {
          this.alertsService.errors.set('loginmail', 'Es existiert kein Nutzer mit dieser E-Mail.');
        }
        if (e.code === 'auth/invalid-email') {
          this.alertsService.errors.set('loginmail', 'Ungültige E-Mail.');
        }
        if (e.code === 'auth/wrong-password') {
          this.alertsService.errors.set('loginpw', 'Falsches Passwort.');
        }
      }
    }

    /**
     * This function updates the password of a user by first getting a user with the uid by calling the getUserWithUid()
     * function and then setting the user with the updated data by calling the setUser() function.
     *
     * @example
     * Call it with uid and a password both as a string.
     * updatePassword('h8f5h2gg4', '123456)
     *
     * @param uid
     * @param password
     */
    async updatePassword(uid, password) {
      const user: User = await this.getUserWithUid(uid);
      const userData = new User(uid, user.email, user.firstName, user.lastName, password, user.gruppen, user.reminderCount);
      await this.setUser(uid, userData);
    }

    /**
     * This function changes the password of a user in case that he has not forgotten it but wants to change it anyway.
     * It gets the user that is logged in and then sets the user with the updated data.
     * In case of success it throws an alert.
     *
     * @example
     * Call it with a password as a string.
     * changePassword('1234567')
     *
     * @param password
     */
    async changePassword(password) {
      const currentUser = this.getCurrentUser();
      await updatePassword(currentUser, password);
      const user: User = await this.getUserWithUid(currentUser.uid);
      const userData = new User(user.id, user.email, user.firstName, user.lastName, password, user.gruppen, user.reminderCount);
      await this.setUser(currentUser.uid, userData);
      this.alertsService.errors.clear();
      this.alertsService.errors.set('success', 'Ihr Passwort wurde geändert');
    }

    /**
     * This function gets all data from a user matching the given uid.
     *
     * @example
     * Call it with a uid with type any.
     * getUserWithUid('h8f5h2gg4')
     *
     * @param uid
     */
    async getUserWithUid(uid: any): Promise<User> {
      return await this.userCollection.doc(uid).get().toPromise().then(snapshot => snapshot.data());
    }

    /**
     * This function gets all data from a group matching the given uid.
     *
     * @example
     * Call it with a uid with type any.
     * getGroupWithUid('h8f5h2gg4')
     *
     * @param uid
     */
    async getGroupWithUid(uid: any): Promise<Group> {
      return await this.groupCollection.doc(uid).get().toPromise().then(snapshot => snapshot.data());
    }


    /**
     * This function signs in a user with the Google login from AngularFireAuth by calling the signInWithPopup() method.
     * The user then can choose one of his Google accounts to login. If the user is not in the database yet,
     * it gets the data given from the function (email and uid) and sets the user into the Firestore database.
     * But because we want to have a first- and lastname too, the user get navigated to the profile page and gets
     * requested to make a few more declarations.
     */
    async loginWithGoogle(): Promise<void> {
      await this.afa.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(() => this.isLoggedIn = true);
      const user = this.getCurrentUser();
      const userInDatabase = await this.getUserWithUid(user.uid);
      const userData: User = new User(user.uid, user.email, '', '', '', [],0);
      if (!userInDatabase) {
        await this.setUser(user.uid, userData);
        this.google = true;
        await this.router.navigate(['profile']);
      }
    }

    /**
     * this function is logging out the current user by calling the signOut() method from AngularFireAuth.
     * It then sets the boolean "onboardingShown" to true because we want the Onboarding to only be shown once.
     */
    async logout() {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        await this.afa.signOut();
      }
      this.isLoggedIn = false;
      this.alertsService.errors.clear();
      this.alertsService.errors.set('logout', 'Logout erfolgreich!');
      await this.router.navigate(['login']);
      await localStorage.setItem('onboardingShown', JSON.stringify(true));
      await localStorage.setItem('reminderCount', JSON.stringify(0));
      window.location.reload();
    }

    /**
     * This function is signing up a new user with the createUserWithEmailAndPassword() method from AngularFireAuth.
     * It then sets the user into the database and is logging in the user. In case of an error it throws an alert
     * based on the error code.
     *
     * @example
     * Call it with a firstName, lastName, email and a password all as a string.
     * signUp('Max', 'Mustermann', max@mustermann.de, '123456')
     *
     * @param firstName
     * @param lastName
     * @param email
     * @param password
     */
    async signUp(firstName, lastName, email, password) {
      try {
        await this.afa.createUserWithEmailAndPassword(email, password).then(async res => {
          const uid = res.user.uid;
          const userData: User = new User(uid, email, firstName, lastName, password, [], 0);
          await this.setUser(uid, userData);
          await this.login(email, password);
        });
      } catch (e) {
        this.alertsService.errors.clear();
        if (e.code === 'auth/email-already-in-use') {
          this.alertsService.errors.set('mail', 'Es existiert bereits ein Account mit dieser E-Mail.');
        }
        if (e.code === 'auth/invalid-email') {
          this.alertsService.errors.set('mail', 'Die E-Mail entspricht nicht dem Standardformat.');
        }
        if (e.code === 'auth/wrong-password') {
          this.alertsService.errors.set('password', 'Falsches Passwort.');
        }
        if (e.code === 'auth/weak-password') {
          this.alertsService.errors.set('password', 'Passwort muss mindestens 6 Zeichen lang sein.');
        }
        if (firstName === undefined) {
          this.alertsService.errors.set('firstName', 'Geben Sie einen Vornamen an.');
        }
        if (lastName === undefined) {
          this.alertsService.errors.set('lastName', 'Geben Sie einen Nachnamen an.');
        }
        if (email === undefined) {
          this.alertsService.errors.set('mail', 'Geben Sie eine E-Mail an.');
        }
        if (password === undefined) {
          this.alertsService.errors.set('password', 'Geben Sie ein Passwort an.');
        }
      }
    };

    /**
     * This function sends an Email with a password reset form by calling the sendPasswordResetEmail() method from
     * AngularFireAuth.
     *
     * @example
     * Call it with an email as a string.
     * forgotPassword('max@mustermann.de')
     *
     * @param email
     */
    async forgotPassword(email) {
      await this.afa.sendPasswordResetEmail(email).then(res => {
        console.log('email sent');
        console.log(res);
      })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
        });
    }

    /**
     * This function deletes a user from the database with the given uid.
     *
     * @example
     * Call it with an uid with type any.
     * deleteUser('z5t84hug')
     *
     * @param uid
     */
    async deleteUser(uid) {
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`user/${uid}`);
      await userRef.delete();
      const currentUser = this.getCurrentUser();
      await deleteUser(currentUser);
    }


    /**
     * This function set a user into the Firestore database with the given uid and data.
     *
     * @example
     * Call it with a uid with type any and userData with type "User".
     * setUser('z5t84hug', newUser('z5t84hug', 'max@mustermann.de', 'Max', 'Mustermann', '123456', '[]', 0 ))
     *
     * @param uid
     * @param userData
     */
    async setUser(uid, userData) {
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`user/${uid}`);
      const user: User = {
        id: uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        gruppen: userData.gruppen,
        reminderCount: userData.reminderCount,
      };
      return userRef.set(user, {
        merge: true,
      });
    }

    /**
     * This function increments the reminder Count of a User with the given uid.
     *
     * @example
     * Call it with setReminderCount('z5t84hug')
     *
     * @param uid
     */
    async setReminderCount(uid: string) {
      const userData: User = await this.getUserWithUid(uid);
      console.log(userData);
      ++userData.reminderCount;
      console.log(userData);
      await this.setUser(uid, userData);
    }

    /**
     * This function decrements the reminder Count of a User with the given uid.
     *
     * @example
     * Call it with setReminderCount('z5t84hug')
     *
     * @param uId
     */
    async unsetReminderCount(uId: string) {
      const userData: User = await this.getUserWithUid(uId);
      //check if the counter is bigger than zero, to avoid a negative number
      if (userData.reminderCount > 0) {
        //then decrement it
        --userData.reminderCount;
      }
      //save the new values into firebase
      await this.setUser(uId, userData);
    }
  }
