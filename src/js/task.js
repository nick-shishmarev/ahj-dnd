//

export default class Task {
  constructor(title, type, id) {
    this.title = title;
    this.type = type;
    this.id = id;
  }

  toString() {
    return `${this.id}:${this.type} - ${this.title}`;
  }
}
