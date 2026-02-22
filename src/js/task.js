//

export default class Task {
  constructor(title, type) {
    this.title = title;
    this.type = type;
  }

  toString() {
    return `${this.type}: ${this.title}`;
  }
}
