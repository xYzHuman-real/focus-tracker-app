// ---------------------------
// VARIABLES
// ---------------------------
let totalHours = 0;
let streak = 0;
let habits = [];

// ---------------------------
// LOAD & SAVE DATA
// ---------------------------
function loadData() {
  const savedData = JSON.parse(localStorage.getItem("focusTrackerData"));
  if (savedData) {
    totalHours = savedData.totalHours || 0;
    streak = savedData.streak || 0;
    habits = savedData.habits || [];
  }
}

function saveData() {
  const data = {
    totalHours,
    streak,
    habits
  };
  localStorage.setItem("focusTrackerData", JSON.stringify(data));
}

// ---------------------------
// DASHBOARD UPDATE
// ---------------------------
function updateDashboard() {
  document.getElementById("totalHours").textContent = totalHours;
  document.getElementById("streakCount").textContent = streak;
  document.getElementById("dashboardHours").textContent = totalHours;
  document.getElementById("dashboardStreak").textContent = streak;
}

// ---------------------------
// STUDY TRACKER
// ---------------------------
function addStudy() {
  const input = document.getElementById("studyInput");
  if (input.value.trim() === "" || isNaN(input.value)) return;

  totalHours += parseFloat(input.value); // allows decimals
  streak += 1; // simple increment (can add date logic later)
  input.value = "";

  saveData();
  updateDashboard();
}

// ---------------------------
// HABIT TRACKER
// ---------------------------
function addHabit() {
  const input = document.getElementById("habitInput");
  if (input.value.trim() === "") return;

  habits.push({
    name: input.value,
    completed: false
  });

  input.value = "";
  saveData();
  renderHabits();
}

function renderHabits() {
  const habitList = document.getElementById("habitList");
  habitList.innerHTML = "";

  habits.forEach((habit, index) => {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.completed;

    checkbox.addEventListener("change", () => {
      habits[index].completed = checkbox.checked;
      saveData();
    });

    const span = document.createElement("span");
    span.textContent = habit.name;

    li.appendChild(checkbox);
    li.appendChild(span);
    habitList.appendChild(li);
  });
}

// ---------------------------
// EXPORT REPORT
// ---------------------------
document.getElementById("exportBtn").addEventListener("click", () => {
  let report = "Focus Tracker Report\n\n";

  report += `Total Study Hours: ${totalHours}\n`;
  report += `Daily Streak: ${streak}\n\n`;
  report += "Habits:\n";

  habits.forEach((habit, index) => {
    report += `${index + 1}. ${habit.name} - ${habit.completed ? "✅" : "❌"}\n`;
  });

  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Focus_Tracker_Report.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// ---------------------------
// THEME TOGGLE
// ---------------------------
const themeToggle = document.getElementById("themeToggle");
let theme = localStorage.getItem("theme") || "dark";

function applyTheme() {
  if (theme === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "☀";
  } else {
    document.body.classList.remove("light");
    themeToggle.textContent = "🌙";
  }
}

themeToggle.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", theme);
  applyTheme();
});

// ---------------------------
// INITIALIZE APP
// ---------------------------
loadData();
updateDashboard();
renderHabits();
applyTheme();
