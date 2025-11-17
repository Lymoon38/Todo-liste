const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const chat = document.getElementById("chat");
const miaou = document.getElementById("miaou");
const ajouterSon = document.getElementById("ajouter-son");
const micBtn = document.getElementById("mic-btn");

// 📦 Chargement des tâches
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
      <span onclick="speak('${todo.text.replace(/'/g, "\\'")}')">${todo.text}</span>
      <div>
        <button onclick="toggleTodo(${index})">✓</button>
        <button onclick="deleteTodo(${index})">X</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// 👁️ Yeux qui suivent le curseur ou le doigt dans toutes les directions
const eyes = document.querySelectorAll('.eye');

function moveEyes(x, y) {
  const rect = chat.getBoundingClientRect();

  eyes.forEach((eye, index) => {
    const baseX = index === 0 ? 45 : 75;
    const baseY = 50;
    const eyeCenterX = rect.left + baseX * (rect.width / 120);
    const eyeCenterY = rect.top + baseY * (rect.height / 160);

    const dx = x - eyeCenterX;
    const dy = y - eyeCenterY;
    const angle = Math.atan2(dy, dx);

    const radius = 3;
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;

    eye.setAttribute("cx", baseX + offsetX);
    eye.setAttribute("cy", baseY + offsetY);
  });
}

document.addEventListener("mousemove", (e) => {
  moveEyes(e.clientX, e.clientY);
});

document.addEventListener("touchmove", (e) => {
  if (e.touches.length > 0) {
    moveEyes(e.touches[0].clientX, e.touches[0].clientY);
  }
});

// ➕ Ajouter une tâche
function addTodo(text) {
  todos.push({ text, done: false });
  saveTodos();
  renderTodos();

  if (miaou) {
    miaou.currentTime = 0;
    miaou.play();
  }

  if (ajouterSon) {
    ajouterSon.currentTime = 0;
    ajouterSon.play();
  }

  // 🔊 Retour vocal du chat
  speak("Tâche ajoutée !");
}

// 🔊 Lecture vocale
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

// ❌ Supprimer
function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
}

// ✅ Cocher/décocher
function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  saveTodos();
  renderTodos();

  chat.classList.add("bounce");
  setTimeout(() => {
    chat.classList.remove("bounce");
  }, 500);
}

// 🎙️ Reconnaissance vocale manuelle via bouton micro
if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    recognition.start();
  });

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript.trim();
    if (text !== "") {
      addTodo(text);
      input.value = "";
    }
  };
}

// 📥 Envoi manuel
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text !== "") {
    addTodo(text);
    input.value = "";
  }
});

// 📄 Export JSON
document.getElementById("export-btn").addEventListener("click", () => {
  const data = JSON.stringify(todos, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ma_todo_liste.json";
  a.click();

  URL.revokeObjectURL(url);
});

// 🔁 Affichage initial
renderTodos();