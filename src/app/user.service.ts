import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import {User} from './User.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  isLoggedIn = false;
  private userCollection: AngularFirestoreCollection<User>;

  constructor(private afa: AngularFireAuth, private afs: AngularFirestore) {
    this.userCollection = afs.collection<User>('user');
  }

  async login(email: string ,password: string){
    await this.afa.signInWithEmailAndPassword(email, password).then(
      res=>{
        this.isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(res.user));
      }
    );
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
    this.isLoggedIn = false;
  }
}
