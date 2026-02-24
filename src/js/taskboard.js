import Task from "./task";
import "./taskboard.css";
import fillBoard, { createID } from "./tasklist";

export default class TaskBoard {
  constructor(parent, storage) {
    this.parent = parent;
    this.storage = storage;
    const page = `
      <div class="container">
        <div class="column" data-type="todo">
          <div class="tasks">
            <div class="header">TODO</div>
            <div class="task-box">
            </div>
          </div>
          <div class="footer">
            <div class="add">+ Add another card</div>
          </div>
        </div>
        <div class="column" data-type="progress">
          <div class="tasks">
            <div class="header">IN PROGRESS</div>
            <div class="task-box">
            </div>
          </div>
          <div class="footer">
            <div class="add">+ Add another card</div>
          </div>
        </div>
        <div class="column" data-type="done">
          <div class="tasks">
            <div class="header">DONE</div>
            <div class="task-box">
            </div>
          </div>
          <div class="footer">
            <div class="add">+ Add another card</div>
          </div>
        </div>
        <button class="btn">Пример заполнения</button>
      </div>
    `;

    this.newEl = document.createElement("div");
    this.newEl.classList.add("input-box");
    this.newEl.draggable = "true";
    this.newEl.insertAdjacentHTML(
      "beforeend",
      `
        <textarea class="input-task-title" name="input-text"></textarea>
        <div class="input-footer">
          <button class="input-add">Add Card</button>
          <div class="input-close">&times;</div>
        </div>
        `,
    );

    this.blank = document.createElement("div");
    this.blank.classList.add("task");
    this.blank.classList.add("blank");

    this.parent.insertAdjacentHTML("afterbegin", page);

    this.container = parent.querySelector(".container");

    this.columns = this.container.querySelectorAll(".column");

    this.btn = this.container.querySelector(".btn");

    this.columnNames = {
      todo: 0,
      progress: 1,
      done: 2,
    };

    this.registerEvents();
  }

  start() {
    for (const col of this.columns) {
      const box = col.querySelector(".task-box");
      box.innerHTML = '';
    }

    this.taskList = this.storage.getTaskList("taskData");

    for (const task of this.taskList) {
      this.showTask(task);
    }
  }

  registerEvents() {
    this.container.addEventListener("click", (e) => {
      const column = e.target.closest(".column");

      if (e.target.classList.contains("add")) {
        this.addNewTask(column);
      }
    });

    this.container.addEventListener("mousedown", this.onMouseDown);

    this.btn.addEventListener("click", () => {
      fillBoard();
      this.start();
    });
  }

  showTask(task) {
    const box =
      this.columns[this.columnNames[task.type]].querySelector(".task-box");
    const el = `
      <div class="task" data-type="${task.type}" data-id="${task.id}">
        <p class="task-title">${task.title}</p>
        <div class="task-close hidden">&times;</div>
      </div>
    `;
    box.insertAdjacentHTML("beforeend", el);
  }

  addNewTask(column) {
    const footer = column.querySelector(".footer");
    footer.classList.add("hidden");
    column.append(this.newEl);
    const add = this.newEl.querySelector(".input-add");
    const del = this.newEl.querySelector(".input-close");
    const text = this.newEl.querySelector(".input-task-title");
    text.focus();

    add.onclick = () => {
      if (text.value === "") {
        text.focus();
        return;
      }

      const id = createID();
      const task = new Task(text.value, column.dataset.type, id);
      this.showTask(task);
      this.taskList.push(task);
      this.modifyTaskList();
      this.storage.saveTaskList("taskData", this.taskList);
      add.onclick = undefined;
      text.value = "";
      this.newEl.remove();
      footer.classList.remove("hidden");
    };

    del.onclick = () => {
      del.onclick = undefined;
      text.value = "";
      this.newEl.remove();
      footer.classList.remove("hidden");
    };
  }

  deleteTask(taskEl) {
    const task = taskEl.querySelector(".task-title").textContent;
    const id = taskEl.dataset.id;
    const index = this.taskList.findIndex((obj) => obj.id === id);
    if (index > -1) {
      this.taskList.splice(index, 1);
      this.storage.saveTaskList("taskData", this.taskList);
      taskEl.remove();
    }
  }

  onMouseDown = (e) => {
    e.preventDefault();
    const source = e.target.closest(".task");

    if (e.target.classList.contains("task-close")) {
      this.deleteTask(source);
      return;
    }

    if (source) {
      const w = source.offsetWidth;
      const h = source.offsetHeight;

      this.elToDrag = source;
      const { left, top } = this.elToDrag.getBoundingClientRect();
      this.elToDrag.style.width = `${w}px`;
      this.elToDrag.style.height = `${h}px`;
      this.elToDrag.style.cursor = "grabbing";
      this.elToDrag.classList.add("dragged");

      this.dX = e.clientX - left;
      this.dY = e.clientY - top;

      this.blank.style.width = `${w}px`;
      this.blank.style.height = `${h}px`;

      document.documentElement.addEventListener("mouseup", this.onMouseUp);
      document.documentElement.addEventListener("mouseover", this.onMouseOver);
    }
  };

  onMouseOver = (e) => {
    const X0 = this.container.getBoundingClientRect().left;
    const Y0 = this.container.getBoundingClientRect().top;
    this.elToDrag.style.top = e.clientY - this.dY - Y0 + "px";
    this.elToDrag.style.left = e.clientX - this.dX - X0 + "px";

    const target = e.target.closest(".task");
    const box = e.target.closest(".task-box");
    const tasks = e.target.closest(".tasks");

    if (target || box) {
      if (target) {
        const { bottom, top } = target.getBoundingClientRect();
        const middle = (bottom + top) / 2;
        const mouseY = e.clientY;
        if (mouseY > middle) {
          target.after(this.blank);
        } else {
          target.before(this.blank);
        }
      } else {
        box.append(this.blank);
      }
      return;
    }
    if (tasks) {
      tasks.append(this.blank);
    }
  };

  onMouseUp = (e) => {
    const target = e.target.closest(".task");
    const box = e.target.closest(".task-box");
    const tasks = e.target.closest(".tasks");

    if (target || box || tasks) {
      const text = this.elToDrag.querySelector(".task-title").textContent;
      const id = this.elToDrag.dataset.id;
      const type = tasks.closest(".column").dataset.type;

      this.elToDrag.classList.remove("dragged");
      this.elToDrag.dataset.type = type;
      this.elToDrag.style = "";
      this.blank.replaceWith(this.elToDrag);
      this.elToDrag = undefined;

      const index = this.taskList.findIndex((obj) => obj.id === id);
      this.taskList[index].type = type;
      this.modifyTaskList();
      this.storage.saveTaskList("taskData", this.taskList);
    } else {
      this.elToDrag.classList.remove("dragged");
      this.elToDrag.style = "";
      this.blank.remove();
    }

    document.documentElement.removeEventListener("mouseup", this.onMouseUp);
    document.documentElement.removeEventListener("mouseover", this.onMouseOver);
  };

  modifyTaskList() {
    const tasks = this.container.querySelectorAll(".task");
    const newList = [];
    for (const task of tasks) {
      const title = task.querySelector(".task-title").textContent;
      const type = task.dataset.type;
      const id = task.dataset.id;
      newList.push(new Task(title, type, id));
    }
    this.taskList = newList;
  }
}
