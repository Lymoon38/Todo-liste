const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos() {
  list.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = todo.done ? "completed" : "";
    li.innerHTML = `
      <span>${todo.text}</span>
      <div>
        <button onclick="toggleTodo(${index})">✓</button>
        <button onclick="deleteTodo(${index})">X</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function addTodo(text) {
  todos.push({ text, done: false });
  saveTodos();
  renderTodos();
}

const chat = document.getElementById("chat");
chat.classList.add("bounce");
setTimeout(() => chat.classList.remove("bounce"), 500);

function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
}

function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  saveTodos();
  renderTodos();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text !== "") {
    addTodo(text);
    input.value = "";
  }
});

renderTodos();
input.addEventListener("webkitspeechchange", () => {
  const text = input.value.trim();
  if (text !== "") {
    addTodo(text);
    input.value = "";
  }
});
