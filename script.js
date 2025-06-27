// 📌 On récupère les éléments du DOM
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const chat = document.getElementById("chat");
const miaou = document.getElementById("miaou");

// 📦 Chargement initial des tâches stockées dans le navigateur
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// 💾 Enregistrement des tâches dans localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// 🖼️ Affichage dynamique de la liste des tâches
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
// 👀 Animation des yeux de gauche à droite
const eyes = document.querySelectorAll('.eye');

let eyeDirection = 1;
let eyeOffset = 0;

function animateEyes() {
  eyeOffset += eyeDirection * 0.3;
  if (eyeOffset > 3 || eyeOffset < -3) eyeDirection *= -1;

  eyes.forEach((eye, index) => {
    const baseX = index === 0 ? 45 : 75; // Position initiale
    eye.setAttribute('cx', baseX + eyeOffset);
  });

  requestAnimationFrame(animateEyes);
}

animateEyes();

// ➕ Ajouter une nouvelle tâche
function addTodo(text) {
  todos.push({ text, done: false });
  saveTodos();
  renderTodos();

  // 🐱💬 Lecture du son miaou si l’élément audio est présent
  if (miaou) {
    miaou.currentTime = 0; // pour rejouer le son même s’il a déjà été lancé
    miaou.play();
  }
}

// 🔊 Fonction pour lire le texte à voix haute
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

// ❌ Supprimer une tâche
function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
}

// ✅ Cocher/décocher une tâche comme terminée
function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  saveTodos();
  renderTodos();

// 🕺 Animation de danse du chat
  chat.classList.add("bounce"); // déclenche l'animation CSS

  setTimeout(() => {
    chat.classList.remove("bounce"); // la retire après 0.5s
  }, 500);
}

// 🎙️ 🎤 Support vocal sécurisé : activé uniquement si disponible
if ("webkitSpeechRecognition" in window || "speechSynthesis" in window || "onwebkitspeechchange" in input) {
  input.addEventListener("webkitspeechchange", () => {
    const text = input.value.trim();
    if (text !== "") {
      addTodo(text);
      input.value = "";
    }
  });
}

// 📥 Envoi manuel via le formulaire
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text !== "") {
    addTodo(text);
    input.value = "";
  }
});

// 🔁 Affichage de la liste au chargement de la page
renderTodos();