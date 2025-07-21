// === GLOBAL STATE ===
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all"; //default filter
let username = localStorage.getItem("username") || "";

const taskContainer = document.getElementById("taskList");
const progressCircle = document.getElementById("progressCircle");
const progressText = document.getElementById("progressText");
const nameForm = document.getElementById("nameForm");
const usernameInput = document.getElementById("username");
const welcomeMsg = document.getElementById("welcome-msg");

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  updateDate();
  if (username) {
    displayWelcome();
  }
  filterTasks("all");
});

// === DARK MODE TOGGLE ===
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

// Apply saved mode on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("mode");
  if (savedMode === "dark") {
    body.classList.add("dark-mode");
  }
});

// Toggle dark mode and save to localStorage
darkModeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  const isDark = body.classList.contains("dark-mode");
  localStorage.setItem("mode", isDark ? "dark" : "light");
});

// === DATE DISPLAY ===
function updateDate() {
  const dateSpan = document.getElementById("today-date");
  const today = new Date();
  const options = {
    year: "numeric",
    day: "numeric",
    month: "long",
  };
  dateSpan.textContent = today.toLocaleDateString(undefined, options);
}

// === USERNAME SUBMISSION ===
nameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  username = usernameInput.value.trim();
  if (username) {
    localStorage.setItem("username", username);
    displayWelcome();
  }
});

function displayWelcome() {
  nameForm.style.display = "none";
  welcomeMsg.style.display = "block";
  welcomeMsg.innerHTML = `Welcome, <span contenteditable="true" onblur="editUsername(this.textContent)">${username}</span>!<span class="blinking-cursor">|</span>`;
}

function editUsername(newName) {
  username = newName.trim();
  localStorage.setItem("username", username);
}

// ==== TASK MANAGEMENT ====
function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const date = document.getElementById("taskDate").value;
  if (!title || !date) return;

  tasks.push({ title, date, completed: false });
  saveTasks();
  renderTasks();
  clearInputs();
  showNotification();
}

//==== CLEAR TASK INPUTS ====
function clearInputs() {
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDate").value = "";
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
  updateProgress();

  // Play sound if task marked as completed
  if (tasks[index].completed) {
    const sound = document.getElementById("completeSound");
    if (sound) {
      sound.volume = 0.2;
      sound.play();
    }
  }
}

//==== DELETE TASK CONFIRMATION ===
function deleteTask(index) {
  const confirmDelete = confirm(
    `Are you sure you want to delete the task: "${tasks[index].title}"?`
  );
  if (!confirmDelete) return;

  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

//==== EDIT A TASK ====
function editTask(index, newTitle) {
  tasks[index].title = newTitle.trim();
  saveTasks();
  renderTasks();
}

//==== ACTIVE FILTER ====
function updateFilterUI(activeType) {
  const buttons = document.querySelectorAll(".task-filters button");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === activeType);
  });
}

// === TASK FILTERING ===
function filterTasks(type) {
  currentFilter = type;
  updateFilterUI(type);
  renderTasks();
}

//==== DISPLAYING THE TASKS FILTERED ====
function renderTasks() {
  taskContainer.innerHTML = "";

  let filtered = tasks;
  if (currentFilter === "completed") {
    filtered = tasks.filter((t) => t.completed);
  } else if (currentFilter === "pending") {
    filtered = tasks.filter((t) => !t.completed);
  }

  filtered.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task-item" + (task.completed ? " completed" : "");
    taskDiv.innerHTML = `
      <div class="task-content">
      <div>
        <strong class="task-title" contenteditable="true" onblur="editTask(${index}, this.textContent)">
          ${task.title}
        </strong>
         ${task.completed ? '<span class="completed-tag">Completed</span>' : ""}
      </div>
        <div class="task-meta">Due: ${task.date}</div>
      </div>
      <div class="task-actions">
        <button onclick="toggleComplete(${index})">${
      task.completed ? "Undo" : "Complete"
    }</button>
        <button onclick="deleteTask(${index})">Delete</button>
      </div>
    `;
    taskContainer.appendChild(taskDiv);
  });

  updateProgress();

  const emptyState = document.getElementById("emptyState");

  if (tasks.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
}

// === PROGRESS CIRCLE ===
function updateProgress() {
  if (tasks.length === 0) {
    progressCircle.style.background = `conic-gradient(#ccc 0%, #ccc 100%)`;
    progressText.textContent = "0%";
    return;
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const percent = Math.round((completedCount / tasks.length) * 100);

  progressCircle.style.background = `conic-gradient(var(--accent-color) ${percent}%, #ccc ${percent}%)`;
  progressText.textContent = `${percent}%`;

  // Add pulse animation
  progressCircle.classList.remove("pulse"); // reset if still applied
  void progressCircle.offsetWidth; // force reflow (animation restart trick)
  progressCircle.classList.add("pulse");
}

// === SAVE TASKS ===
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// === New Task Notifications ===
function showNotification(message = "Task added ♥︎") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000); // visible for 2 seconds
}

//Uncommented code for clearing local storage
// localStorage.clear();
