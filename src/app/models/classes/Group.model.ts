export class Group{
  groupMembers: string[];
  key: string;
  name: string;

  constructor(groupMembers: string[], key: string, name: string) {
    this.groupMembers = groupMembers;
    this.key = key;
    this.name = name;
  }
}
