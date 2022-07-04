import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import {User} from '../models/classes/User.model';
import {Group} from '../models/classes/Group.model';
import {AlertsService} from './alerts.service';
import {Router} from '@angular/router';
import {deleteUser, getAuth, updatePassword} from '@angular/fire/auth';
import {Payment} from '../payment.model';




  @Injectable({
    providedIn: 'root'
  })
  export class UserService {
    isLoggedIn = false;
    currentUser: any[] =[];
    private userCollection: AngularFirestoreCollection<User>;
    private groupCollection: AngularFirestoreCollection<Group>;
    private paymentCollection: AngularFirestoreCollection<Payment>;


    constructor(private afa: AngularFireAuth, private afs: AngularFirestore, public alertsService: AlertsService, private router: Router) {
      this.userCollection = afs.collection<User>('user');
      this.groupCollection = afs.collection<Group>('group');
      this.paymentCollection = afs.collection<Payment>('payment');
    }

    getCurrentUser(): any{
      const auth = getAuth();
      return auth.currentUser;
    }

    async login(email: string, password: string) {
      try {
        await this.afa.signInWithEmailAndPassword(email, password).then(res => {
          this.isLoggedIn = true;
          const currentUser = this.getCurrentUser();
          this.updatePassword(currentUser.uid, password);
        });
      }catch (e) {
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
        const userData = new User(user.email, user.firstName, user.lastName, password, user.gruppen);
        await this.setUser(uid, userData);
    }

    async changePassword(password) {
      const currentUser = this.getCurrentUser();
      await updatePassword(currentUser, password);
      const user: User = await this.getUserWithUid(currentUser.uid);
      const userData = new User(user.email, user.firstName, user.lastName, password, user.gruppen);
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
    }

    async joinGroup(id, key) {
      const currentUser = this.getCurrentUser();
      try {
        const groupData = await this.getGroupWithUid(id);
        const userData = await this.getUserWithUid(currentUser.uid);

        const arrayToPush: any = [];
        arrayToPush.push(currentUser.uid);
        groupData.groupMembers.forEach(r => {
          arrayToPush.push(r);
        });
        arrayToPush.push(currentUser.uid);

        const arrayToPush2: any = [];
        userData.gruppen.forEach(t => {
          arrayToPush2.push(t);
        });
        arrayToPush2.push(id);

        if (groupData.key === key) {
          const setGroupData = new Group(arrayToPush, groupData.key, groupData.name);
          const setUserData = new User(userData.email, userData.firstName, userData.lastName, userData.password,
            arrayToPush2);
          await this.setUser(currentUser.uid, setUserData);
          await this.setGroup(id, setGroupData);
          this.router.navigate(['home']);
        } else {
          this.alertsService.errors.clear();
          this.alertsService.errors.set('key', 'Der eingegebene Key ist falsch');
        }
      } catch (e) {
        this.alertsService.errors.clear();
        this.alertsService.errors.set('groupId', 'Die eingegebene ID existiert nicht.');
      }
    }

    async signUp(firstName, lastName, email, password) {
      try {
        await this.afa.createUserWithEmailAndPassword(email, password).then(async res => {
          const uid = res.user.uid;
          const userData: User = new User(email, firstName, lastName, password, []);
          await this.setUser(uid, userData);
          await this.login(email, password);
          this.router.navigate(['home']);
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

    async setGroup(id, groupData) {
      const groupRef: AngularFirestoreDocument<Group> = this.afs.doc(`group/${id}`);
      const group: Group = {
        groupMembers: groupData.groupMembers,
        key: groupData.key,
        name: groupData.name
      };
      return groupRef.set(group, {
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
    async getCurrentUserId(){
      // const auth = getAuth();
      // const user = auth.currentUser;
      const user = JSON.parse(localStorage.getItem('currentUser'));
      // this.currentUserId = user.uid;
      console.log('User Id: ', user.uid);
      return user.uid;
    }
  }
