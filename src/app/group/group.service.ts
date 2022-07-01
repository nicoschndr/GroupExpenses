import { Injectable } from '@angular/core';
import {
  getDocs,
  doc,
  getDoc,
  where,
  query,
  deleteDoc,
  updateDoc,
  Firestore,
  collection,
  addDoc,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import {Group} from './group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private groupCollection: AngularFirestoreCollection<Group>;
  private groups: Observable<Group[]>;

  constructor(private afs: AngularFirestore,
              private userService: UserService,
              private alertsService: AlertsService,
  ) {
    this.groupCollection = afs.collection<Group>('groups');
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
    return this.afs.collection('groups', docRef => docRef.where('groupMembers', 'array-contains', id)).snapshotChanges();
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

  async joinGroup(id, key) {
    const currentUser = this.userService.getCurrentUser();
    try {
      const groupData: Group = await this.getGroupById(id);
      const userData = await this.userService.getUserWithUid(currentUser.uid);

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
        const setGroupData: Group = new Group(id, groupData.name, arrayToPush, groupData.key);
        const setUserData = new User(userData.email, userData.firstName, userData.lastName, userData.password,
          arrayToPush2, userData.reminderCount);
        await this.userService.setUser(currentUser.uid, setUserData);
        await this.setGroup(setGroupData);
      } else {
        this.alertsService.errors.clear();
        this.alertsService.errors.set('key', 'Der eingegebene Key ist falsch');
      }
    } catch (e) {
      this.alertsService.errors.clear();
      this.alertsService.errors.set('groupId', 'Die eingegebene ID existiert nicht.');
    }
  }
}
