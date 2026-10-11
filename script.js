const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const chat = document.getElementById("chat");
const miaou = document.getElementById("miaou");
const micBtn = document.getElementById("mic-btn");
const compteur = document.getElementById("compteur");
const clearBtn = document.getElementById("clear-btn");
const exportBtn = document.getElementById("export-btn");

// 📦 Chargement des tâches
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// ✏️ Index de la tâche en cours de modification (null = aucune)
let editingIndex = null;

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// 🧱 Petit utilitaire pour créer un bouton
function makeButton(label, className, ariaLabel, onClick) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.className = className;
  btn.setAttribute("aria-label", ariaLabel);
  btn.addEventListener("click", onClick);
  return btn;
}

function renderTodos() {
  list.innerHTML = "";

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = todo.done ? "completed" : "";

    if (index === editingIndex) {
      // Mode modification : un champ texte à la place du texte
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.value = todo.text;
      editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit(index, editInput.value);
        if (e.key === "Escape") cancelEdit();
      });

      const actions = document.createElement("div");
      actions.append(
        makeButton("💾", "btn-done", "Enregistrer", () => saveEdit(index, editInput.value)),
        makeButton("↩", "btn-delete", "Annuler", cancelEdit)
      );

      li.append(editInput, actions);
      list.appendChild(li);
      editInput.focus();
      return;
    }

    // Texte de la tâche (textContent : plus de souci avec les guillemets ou le HTML)
    const span = document.createElement("span");
    span.textContent = todo.text;
    span.addEventListener("click", () => speak(todo.text));

    const actions = document.createElement("div");
    actions.append(
      makeButton("✓", "btn-done", "Cocher la tâche", () => toggleTodo(index)),
      makeButton("✏️", "btn-edit", "Modifier la tâche", () => startEdit(index)),
      makeButton("X", "btn-delete", "Supprimer la tâche", () => deleteTodo(index))
    );

    li.append(span, actions);
    list.appendChild(li);
  });

  updateStatus();
}

// 🐱 Compteur + humeur du chat
function updateStatus() {
  const total = todos.length;
  const remaining = todos.filter((t) => !t.done).length;
  const doneCount = total - remaining;

  // Le chat dort quand la liste est vide
  chat.classList.toggle("sleep", total === 0);
  if (total === 0) resetEyes();

  if (total === 0) {
    compteur.textContent = "Aucune tâche… le chat fait la sieste 😴";
  } else if (remaining === 0) {
    compteur.textContent = "Bravo Élisa, tout est fait ! 🎉";
  } else {
    compteur.textContent = `${remaining} tâche${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`;
  }

  // Le bouton « Supprimer les terminées » n'apparaît que s'il y en a
  clearBtn.hidden = doneCount === 0;
}

// 👁️ Yeux qui suivent le curseur ou le doigt dans toutes les directions
const eyes = document.querySelectorAll(".eye");

function resetEyes() {
  eyes.forEach((eye, index) => {
    eye.setAttribute("cx", index === 0 ? 45 : 75);
    eye.setAttribute("cy", 50);
  });
}

function moveEyes(x, y) {
  if (chat.classList.contains("sleep")) return; // il dort, il ne regarde pas

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

// 🎬 Joue une animation sur le chat (bounce, joy…)
function animateChat(className, duration) {
  chat.classList.remove("bounce", "joy");
  void chat.getBoundingClientRect(); // relance l'animation si déjà en cours
  chat.classList.add(className);
  setTimeout(() => chat.classList.remove(className), duration);
}

// ➕ Ajouter une tâche
function addTodo(text) {
  todos.push({ text, done: false });
  saveTodos();
  renderTodos();

  if (miaou) {
    miaou.currentTime = 0;
    miaou.play().catch(() => {}); // certains téléphones bloquent le son
  }

  // 🔊 Retour vocal du chat
  speak("Tâche ajoutée !");
}

// 🔊 Lecture vocale
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  speechSynthesis.speak(utterance);
}

// ❌ Supprimer
function deleteTodo(index) {
  todos.splice(index, 1);
  editingIndex = null;
  saveTodos();
  renderTodos();
}

// 🧹 Supprimer toutes les tâches terminées
clearBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);
  editingIndex = null;
  saveTodos();
  renderTodos();
});

// ✅ Cocher/décocher
function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  saveTodos();
  renderTodos();

  // Saut de joie si tout est terminé, petit saut sinon
  const allDone = todos.length > 0 && todos.every((t) => t.done);
  if (allDone) {
    animateChat("joy", 1000);
    if (miaou) {
      miaou.currentTime = 0;
      miaou.play().catch(() => {});
    }
  } else {
    animateChat("bounce", 500);
  }
}

// ✏️ Modifier
function startEdit(index) {
  editingIndex = index;
  renderTodos();
}

function cancelEdit() {
  editingIndex = null;
  renderTodos();
}

function saveEdit(index, newText) {
  const text = newText.trim();
  if (text !== "") {
    todos[index].text = text;
    saveTodos();
  }
  editingIndex = null;
  renderTodos();
}

// 🎙️ Reconnaissance vocale manuelle via bouton micro
// Un seul appui sur 🎤 : ça enregistre, puis la tâche est ajoutée toute seule.
if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    try {
      recognition.start();
    } catch (err) {
      // Déjà en écoute : on arrête proprement, un nouvel appui relancera
      recognition.stop();
    }
  });

  recognition.onstart = () => micBtn.classList.add("listening");
  recognition.onend = () => micBtn.classList.remove("listening");
  recognition.onerror = () => micBtn.classList.remove("listening");

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript.trim();
    if (text !== "") {
      addTodo(text);
      input.value = "";
    }
  };
} else {
  // Le bouton reste visible, mais on explique pourquoi il ne peut pas écouter
  micBtn.addEventListener("click", () => {
    flashMessage("Le micro n'est pas disponible ici. Essaie avec Chrome 🎤");
  });
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

// 📤 Partager la liste en texte lisible (WhatsApp, SMS, Notes…)
function listAsText() {
  const lignes = todos.map((t) => `${t.done ? "✅" : "⬜"} ${t.text}`);
  return "📝 Ma Todo Liste\n\n" + lignes.join("\n");
}

// Affiche un message temporaire à la place du compteur
function flashMessage(message) {
  compteur.textContent = message;
  setTimeout(updateStatus, 2500);
}

exportBtn.addEventListener("click", async () => {
  if (todos.length === 0) {
    flashMessage("La liste est vide, rien à partager 🐱");
    return;
  }

  const text = listAsText();

  // 1) Menu de partage du téléphone
  if (navigator.share) {
    try {
      await navigator.share({ title: "Ma Todo Liste", text });
    } catch (err) {
      // Annulation par l'utilisateur : rien à faire
    }
    return;
  }

  // 2) Sinon : copie dans le presse-papiers
  try {
    await navigator.clipboard.writeText(text);
    flashMessage("Liste copiée ! Colle-la où tu veux 📋");
  } catch (err) {
    flashMessage("Impossible de copier la liste 😿");
  }
});

// 🔁 Affichage initial
renderTodos();
