export class Group {
  id: string;
  name: string;
  groupMembers: string[];
  key: string;

  constructor(id?: string, name?: string, groupMembers?: string[], key?: string) {
    this.id = id;
    this.name = name;
    this.groupMembers = groupMembers;
    this.key = key;
  }
}
