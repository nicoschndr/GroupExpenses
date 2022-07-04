import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import {User} from '../models/classes/User.model';
import {UserService} from './user.service';
import {Group} from '../models/classes/group.model';

@Injectable({
  providedIn: 'root'
})

export class GroupService {

  private groupCollection: AngularFirestoreCollection<Group>;
  private group: Observable<Group[]>;

  constructor(private afs: AngularFirestore,
              private userService: UserService,
  ) {
    this.groupCollection = afs.collection<Group>('group');
  }

  async addGroup(group: Group): Promise<string> {
    group.id = this.afs.createId();
    const data = JSON.parse(JSON.stringify(group));
    await this.groupCollection.doc(group.id).set(data);
    return group.id;
  }

  async getGroupById(id: string): Promise<Group> {
    const document = await this.groupCollection.doc(id).get().toPromise();
    return document.data() as Group;
  }

  async findGroupsFromUser(uId: string) {
    const id: string = uId;
    return this.afs.collection('group', docRef => docRef.where('groupMembers', 'array-contains', id)).snapshotChanges();
  }

  async deleteUserFromGroup(uId: string, gId: string): Promise<boolean> {
    try {
      const groupToLeave: Group = await this.getGroupById(gId);
      let deleteAction = true;
      groupToLeave.groupMembers.forEach(id => {
        if (id === uId) {
          const index: number = groupToLeave.groupMembers.indexOf(id);
          groupToLeave.groupMembers.splice(index, 1);
          if (groupToLeave.groupMembers.length === 0) {
            this.groupCollection.doc(gId).delete();
            deleteAction = false;
          } else {
            this.groupCollection.doc(gId).update({
              groupMembers: groupToLeave.groupMembers,
            });
          }
        }
      });
      return deleteAction;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async setGroup(groupData: Group) {
    const groupRef: AngularFirestoreDocument<Group> = this.afs.doc(`group/${groupData.id}`);
    return groupRef.set(groupData, {
      merge: true,
    });
  }

  async joinGroup(id: string, key: string): Promise<boolean> {
    const currentUser: string = this.userService.getCurrentUserId();
    const groupData: Group = await this.getGroupById(id);
    const userData: User = await this.userService.getUserWithUid(currentUser);

    if (groupData) {
      userData.gruppen.push(id);
      groupData.groupMembers.push(currentUser);
      if (groupData.id === id && groupData.key === key) {
        await this.userService.setUser(currentUser, userData);
        await this.setGroup(groupData);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
