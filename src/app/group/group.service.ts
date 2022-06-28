import { Injectable } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  DocumentData,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc, where, query, deleteDoc, updateDoc,
} from '@angular/fire/firestore';
import {Group} from './group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  groupCollectionRef: CollectionReference<DocumentData>;

  groupConverter = {
    fromFirestore: (snapshot, options): Group => {
      const res = Object.assign(new Group(), snapshot.data(options));
      res.id = snapshot.id;
      return res;
    },
    toFirestore: (group): DocumentData => {
      const duplicate = {...group};
      delete duplicate.id;
      return duplicate;
    }
  };

  constructor(private firestore: Firestore) {
    this.groupCollectionRef = collection(firestore, 'group');
  }

  async addGroup(groupname: string, founderId: string): Promise<any> {
    const refWithConverter = this.groupCollectionRef.withConverter(this.groupConverter);
    const newGroup = new Group(null, groupname, [founderId], groupname.trim().toLowerCase());
    return await addDoc(refWithConverter, newGroup);
  }

  async getGroup(groupId: string): Promise<Group> {
    const docRef = doc(this.groupCollectionRef.withConverter(this.groupConverter), groupId);
    const groupDoc = await getDoc(docRef);
    return groupDoc.data();
  }

  async findGroups(uId: string): Promise<Group[]>{
    const filter = query(
      this.groupCollectionRef.withConverter(this.groupConverter),
      where('groupMembers', 'array-contains', uId.toString()));
    const groupDocs = await getDocs(filter);
    const groups: Group[] = [];
    groupDocs.forEach(groupDoc => {
      groups.push(groupDoc.data());
    });
    return groups;
  }

  async deleteUserFromGroup(uId: string, gId: string): Promise<boolean> {
    try {
      const groupToLeave: Group = await this.getGroup(gId);
      let deleteAction = true;
      groupToLeave.groupMembers.forEach(id => {
        if (id === uId) {
          const index: number = groupToLeave.groupMembers.indexOf(id);
          groupToLeave.groupMembers.splice(index, 1);
          const docRef = doc(this.groupCollectionRef.withConverter(this.groupConverter), gId.toString());
          if (groupToLeave.groupMembers.length === 0) {
            deleteDoc(docRef);
            deleteAction = false;
          } else {
            updateDoc(docRef, {
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

  setReminder(uId: string) {
    return uId;
  }
}
