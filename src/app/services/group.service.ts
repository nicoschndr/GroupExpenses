import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import {User} from '../models/classes/User.model';
import {UserService} from './user.service';
import {Group} from '../models/classes/Group.model';

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

  /**
   * This function will add a new group-document to the collection
   *
   * @example
   * Call it with a group object of type Group
   * addGroup(Group)
   *
   * @param group
   */
  async addGroup(group: Group): Promise<string> {
    group.id = this.afs.createId();
    const data = JSON.parse(JSON.stringify(group));
    await this.groupCollection.doc(group.id).set(data);
    return group.id;
  }

  /**
   * This function will return an object of type Group containing the data from the requested group
   *
   * @example
   * Call it with a groupId of type string
   * getGroupById('SEf39sf324osfj32')
   *
   * @param groupId
   */
  async getGroupById(groupId: string): Promise<Group> {
    const document = await this.groupCollection.doc(groupId).get().toPromise();
    return document.data() as Group;
  }

  /**
   * This function will return an array of objects type of Group in which the user is a member of
   *
   * @example
   * Call it with a userId type of string
   * getGroupsFromUser('SEf39sf324osfj32')
   *
   * @param userId
   */
  async getGroupsFromUser(userId: string) {
    const id: string = userId;
    return this.afs.collection('group', docRef => docRef.where('groupMembers', 'array-contains', id)).snapshotChanges();
  }

  /**
   * This function will remove the user from the given group and will also remove the groupId from the
   * array of groups stored in the user-document and returns a boolean which shows whether the delete-action
   * was successfull or not
   *
   * @example
   * Call it with a userId and groupId type of string
   * deleteUserFromGroup('SEf39sf324osfj32', 'sdf983S3w42sSDsf2se')
   *
   * @param userId
   * @param groupId
   */
  async deleteUserFromGroup(userId: string, groupId: string): Promise<boolean> {
    try {
      //get group-data from firebase
      const groupToLeave: Group = await this.getGroupById(groupId);
      let deleteAction = true;
      //check for every member of the group
      groupToLeave.groupMembers.forEach(id => {
        //if the currently viewed member matches the user which needs to be removed from the group
        if (id === userId) {
          //if so save the index of the user in the members array
          const index: number = groupToLeave.groupMembers.indexOf(id);
          //then remove the userId from the members array
          groupToLeave.groupMembers.splice(index, 1);
          //check if there is still a member left in the group
          if (groupToLeave.groupMembers.length === 0) {
            //if the group is empty, delete the whole group
            this.groupCollection.doc(groupId).delete();
            deleteAction = false;
          } else { //if not, update the group members
            this.groupCollection.doc(groupId).update({
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

  /**
   * This function will update the data of the group
   *
   * @example
   * Call it with an object type of Group
   * setGroup(groupData: Group)
   *
   * @param groupData
   */
  async setGroup(groupData: Group) {
    const groupRef: AngularFirestoreDocument<Group> = this.afs.doc(`group/${groupData.id}`);
    return groupRef.set(groupData, {
      merge: true,
    });
  }

  /**
   * This function will handle the join of a new user into a existing group
   * It will add the groupId to the group-array of the user-document and will
   * also add the userId to the members-array of the group-document
   * it returns a boolean, which shows whether the join was successfull or not
   *
   * @example
   * Call it with a groupId and key, both type of string
   * joinGroup('sf0e3sljk3323dS', 'e3ks45')
   *
   * @param groupId
   * @param key
   */
  async joinGroup(groupId: string, key: string): Promise<boolean> {
    //the currentUser is always joining the group
    const currentUser: string = this.userService.getCurrentUserId();
    //get groupdata for adding the userId to the members array
    const groupData: Group = await this.getGroupById(groupId);
    //get the userdata for adding the groupId to the groups array
    const userData: User = await this.userService.getUserWithUid(currentUser);

    //check if the groupExists
    if (groupData) {
      //if so add the groupId to the groups-array of the user-document
      userData.gruppen.push(groupId);
      //and add the userId to the members array of the group-document
      groupData.groupMembers.push(currentUser);
      //check if the given data are matching the requested group
      if (groupData.id === groupId && groupData.key === key) {
        //then save the changes
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
