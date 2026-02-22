import Task from "./task";

export default class Storage {
  constructor(storage) {
    this.storage = storage;
  }

  getTaskList(key) {
    const json = this.storage.getItem(key);
    //   console.log(json)

    let taskData;
    let taskList = [];

    try {
      taskData = JSON.parse(json);
    } catch (error) {
      console.log(error);
    }

    if (taskData) {
      for (const task of taskData) {
        taskList.push(new Task(task.title, task.type));
      }
    }

    return taskList;
  }

  saveTaskList(key, obj) {
    this.storage.setItem(key, JSON.stringify(obj));
  }
}
