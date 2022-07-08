import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import {User} from '../models/classes/User.model';
import {Group} from '../models/classes/group.model';
import {AlertsService} from './alerts.service';
import {Router} from '@angular/router';
import {deleteUser, getAuth, updatePassword} from '@angular/fire/auth';
import {Payment} from '../models/classes/payment.model';


  @Injectable({
    providedIn: 'root'
  })
  export class UserService {
    isLoggedIn = false;
    google = false;
    currentUser: any[] = [];
    private userCollection: AngularFirestoreCollection<User>;
    private groupCollection: AngularFirestoreCollection<Group>;
    private paymentCollection: AngularFirestoreCollection<Payment>;

    constructor(private afa: AngularFireAuth, private afs: AngularFirestore, public alertsService: AlertsService, private router: Router) {
      this.userCollection = afs.collection<User>('user');
      this.groupCollection = afs.collection<Group>('group');
      this.paymentCollection = afs.collection<Payment>('payment');
    }

    getCurrentUser(): any {
      const auth = getAuth();
      return auth.currentUser;
    }

    getCurrentUserId(): any {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      return currentUser.uid;
    }

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

    async updatePassword(uid, password) {
      const user: User = await this.getUserWithUid(uid);
      const userData = new User(uid, user.email, user.firstName, user.lastName, password, user.gruppen, user.reminderCount);
      await this.setUser(uid, userData);
    }

    async changePassword(password) {
      const currentUser = this.getCurrentUser();
      await updatePassword(currentUser, password);
      const user: User = await this.getUserWithUid(currentUser.uid);
      const userData = new User(user.id, user.email, user.firstName, user.lastName, password, user.gruppen, user.reminderCount);
      await this.setUser(currentUser.uid, userData);
      this.alertsService.errors.clear();
      this.alertsService.errors.set('success', 'Ihr Passwort wurde geändert');
    }

    async getUserWithUid(uid: any): Promise<User> {
      return await this.userCollection.doc(uid).get().toPromise().then(snapshot => snapshot.data());
    }

    async getGroupWithUid(uid: any): Promise<Group> {
      return await this.groupCollection.doc(uid).get().toPromise().then(snapshot => snapshot.data());
    }

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
      window.location.reload();
    }

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

    async deleteUser(uid) {
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`user/${uid}`);
      await userRef.delete();
      const currentUser = this.getCurrentUser();
      await deleteUser(currentUser);
    }

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

    async setReminderCount(uid: string) {
      const userData: User = await this.getUserWithUid(uid);
      ++userData.reminderCount;
      await this.setUser(uid, userData);
    }

    async unsetReminderCount(uId: string) {
      const userData: User = await this.getUserWithUid(uId);
      --userData.reminderCount;
      await this.setUser(uId, userData);
    }
  }
