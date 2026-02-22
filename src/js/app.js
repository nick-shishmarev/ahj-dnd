// TODO: write code here

import Storage from "./storage";
import TaskBoard from "./taskboard";

console.log("app.js bundled");

const storage = new Storage(localStorage);
const page = new TaskBoard(document.querySelector("body"), storage);
page.start();
