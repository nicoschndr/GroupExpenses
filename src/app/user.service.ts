import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import {User} from './User.model';
import {Group} from './Group.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  isLoggedIn = false;
  currentUser: any[] =[];
  private userCollection: AngularFirestoreCollection<User>;
  private groupCollection: AngularFirestoreCollection<Group>;

  constructor(private afa: AngularFireAuth, private afs: AngularFirestore) {
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
    const userData = new User(user.email, user.firstName, user.lastName, password, user.gruppen);
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
    if(user) {
      await this.afa.signOut();
    }
    localStorage.removeItem('currentUser');
    this.currentUser=[];
    this.isLoggedIn = false;
  }

  async joinGroup(id, key){
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const groupData = await this.getGroupWithUid(id);
    const userData = await this.getUserWithUid(user.uid);
    if (groupData.key === key){
      const setGroupData = new Group([user.uid],groupData.key, groupData.name);
      const setUserData = new User(userData.email, userData.firstName, userData.lastName, userData.password, [id]);
      await this.setUser(user.uid, setUserData);
      await this.setGroup(id, setGroupData);
    }
  }

  async signUp(firstName, lastName, email, password) {
    await this.afa.createUserWithEmailAndPassword(email, password).then(async res => {
      const uid = res.user.uid;
      const userData: User = new User(email,firstName,lastName,password,undefined);
      await this.setUser(uid, userData);
    });
    const user: User = new User(email,firstName,lastName,password, undefined);
    this.isLoggedIn = true;
    localStorage.setItem('currentUser', JSON.stringify(user));
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
    console.log(uid);
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`user/${uid}`);
    const user: User = {
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
