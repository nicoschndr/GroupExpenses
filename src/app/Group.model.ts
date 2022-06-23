export class Group{
  groupMembers: [any];
  key: string;
  name: string;

  constructor(groupMembers: [any], key: string, name: string) {
    this.groupMembers = groupMembers;
    this.key = key;
    this.name = name;
  }
}
