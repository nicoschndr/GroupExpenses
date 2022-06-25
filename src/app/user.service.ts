import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import {User} from './User.model';
import {Group} from './Group.model';
import {AlertsService} from './alerts.service';
import {Router} from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  isLoggedIn = false;
  currentUser: any[] =[];
  private userCollection: AngularFirestoreCollection<User>;
  private groupCollection: AngularFirestoreCollection<Group>;

  constructor(private afa: AngularFireAuth, private afs: AngularFirestore, public alertsService: AlertsService, private router: Router) {
    this.userCollection = afs.collection<User>('user');
    this.groupCollection = afs.collection<Group>('group');
  }

  async login(email: string ,password: string){
    await this.afa.signInWithEmailAndPassword(email, password).then(
      res=>{
        this.isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        this.updatePassword(res.user.uid, password);
      }
    );
  }

  async updatePassword(uid, password){
    const user: User  = await this.getUserWithUid(uid);
    const userData = new User(user.id, user.email, user.firstName, user.lastName, password, user.gruppen);
    await this.setUser(uid, userData);
  }

  async getUserWithUid(uid: any): Promise<User>{
    return await this.userCollection.doc(uid).get().toPromise().then(snapshot => snapshot.data());
  }

  async getGroupWithUid(uid: any): Promise<Group>{
    return await this.groupCollection.doc(uid).get().toPromise().then(snapshot => snapshot.data());
  }

  async loginWithGoogle(): Promise<void> {
    await this.afa.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(() => this.isLoggedIn = true);
  }

  async logout(){
    const user = localStorage.getItem('currentUser');
    console.log(user);
    if(user) {
      await this.afa.signOut();
    }
    localStorage.removeItem('currentUser');
    this.currentUser=[];
    this.isLoggedIn = false;
  }

  async joinGroup(id, key){
    const user = JSON.parse(localStorage.getItem('currentUser'));
    try {
      const groupData = await this.getGroupWithUid(id);
      const userData = await this.getUserWithUid(user.uid);

      const arrayToPush: any = [];
      arrayToPush.push(user.uid);
      groupData.groupMembers.forEach(r => {
        arrayToPush.push(r);
      });
      arrayToPush.push(user.uid);

      const arrayToPush2: any = [];
      userData.gruppen.forEach(t => {
        arrayToPush2.push(t);
      });
      arrayToPush2.push(id);

      if (groupData.key === key) {
        const setGroupData = new Group(arrayToPush, groupData.key, groupData.name);
        const setUserData = new User(userData.id, userData.email, userData.firstName, userData.lastName, userData.password,
          arrayToPush2);
        await this.setUser(user.uid, setUserData);
        await this.setGroup(id, setGroupData);
        this.router.navigate(['home']);
      }else{
        this.alertsService.errors.clear();
        this.alertsService.errors.set('key', 'Der eingegebene Key ist falsch');
      }
    }catch (e) {
      this.alertsService.errors.clear();
      this.alertsService.errors.set('groupId', 'Die eingegebene ID existiert nicht.');
    }
  }

  async signUp(firstName, lastName, email, password) {
    try {
      await this.afa.createUserWithEmailAndPassword(email, password).then(async res => {
        const uid = res.user.uid;
        const userData: User = new User(uid, email, firstName, lastName, password, []);
        await this.setUser(uid, userData);
        await this.login(email,password);
        this.router.navigate(['home']);
      });
    } catch (e){
      this.alertsService.errors.clear();
      if(e.code==='auth/email-already-in-use') {
        this.alertsService.errors.set('mail', 'The email address is already in use.');
      }
      if(e.code==='auth/invalid-email') {
        this.alertsService.errors.set('mail', 'The email address is badly formatted.');
      }
      if(e.code==='auth/wrong-password') {
        this.alertsService.errors.set('password', 'Wrong Password.');
      }
      if(e.code==='auth/weak-password') {
        this.alertsService.errors.set('password', 'Your Password has to be at least 6 characters long.');
      }
      if(firstName===undefined){
        this.alertsService.errors.set('firstName', 'Please enter your Firstname');
      }
      if(lastName===undefined){
        this.alertsService.errors.set('lastName', 'Please enter your Lastname');
      }
      if(email===undefined){
        this.alertsService.errors.set('mail', 'Please enter your email');
      }
      if(password===undefined){
        this.alertsService.errors.set('password', 'Please enter your password');
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

  async setUser(uid, userData){
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`user/${uid}`);
    const user: User = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
      gruppen: userData.gruppen
    };
    return userRef.set(user, {
      merge: true,
    });
  }
  async setGroup(id, groupData){
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
}
