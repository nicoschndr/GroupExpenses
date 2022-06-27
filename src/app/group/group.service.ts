import { Injectable } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  DocumentData,
  collection,
  getDocs,
  addDoc, doc, getDoc
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

  async findAll(): Promise<Group[]> {
    const refWithConverter = this.groupCollectionRef.withConverter(this.groupConverter);
    const recordDocs = await getDocs(refWithConverter);
    const groups: Group[] = [];
    recordDocs.forEach(groupDoc => {
      groups.push(groupDoc.data());
    });
    return groups;
  }

  async addGroup(groupname: string): Promise<any> {
    const refWithConverter = this.groupCollectionRef.withConverter(this.groupConverter);
    const newGroup = new Group(null, groupname, ['u0Nf0Hr3WzwwqgvMkzx6'], groupname.trim().toLowerCase());
    const group = await addDoc(refWithConverter, newGroup);
    return group;
  }

  async getGroup(groupId: string): Promise<Group> {
    const docRef = doc(this.groupCollectionRef.withConverter(this.groupConverter), groupId.toString());
    const recordDoc = await getDoc(docRef);
    return recordDoc.data();
  }
}
