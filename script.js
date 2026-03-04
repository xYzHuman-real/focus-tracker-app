// ---------------------------
// VARIABLES
// ---------------------------
let totalHours = 0;
let streak = 0;
let habits = [];
let lastStudyDate = null;
let dailyGoal = 0;

// ---------------------------
// LOAD & SAVE DATA
// ---------------------------
function loadData() {
  const savedData = JSON.parse(localStorage.getItem("focusTrackerData"));
  if (savedData) {
    totalHours = savedData.totalHours || 0;
    streak = savedData.streak || 0;
    habits = savedData.habits || [];
    lastStudyDate = savedData.lastStudyDate || null;
    dailyGoal = savedData.dailyGoal || 0;
  }
}

function saveData() {
  const data = { totalHours, streak, habits, lastStudyDate, dailyGoal };
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
  updateGoalProgress();
}

// ---------------------------
// STUDY TRACKER
// ---------------------------
function addStudy() {
  const input = document.getElementById("studyInput");
  if (input.value.trim() === "" || isNaN(input.value)) return;

  const today = new Date().toDateString();
  if (lastStudyDate !== today) {
    streak += 1;
    lastStudyDate = today;
  }

  totalHours += parseFloat(input.value);
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

  habits.push({ name: input.value, completed: false });
  input.value = "";
  saveData();
  renderHabits();
}

function renderHabits() {
  const habitList = document.getElementById("habitList");
  habitList.innerHTML = "";

  habits.forEach((habit, index) => {
    const li = document.createElement("li");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.completed;
    checkbox.addEventListener("change", () => {
      habits[index].completed = checkbox.checked;
      saveData();
    });

    // Habit Name
    const span = document.createElement("span");
    span.textContent = habit.name;

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", () => {
      habits.splice(index, 1); // Remove this habit
      saveData();
      renderHabits(); // Re-render the list
    });

    // Append everything to li
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    habitList.appendChild(li);
  });
}

// ---------------------------
// DAILY GOAL & PROGRESS
// ---------------------------
function updateGoalProgress() {
  const progress = dailyGoal ? Math.min((totalHours / dailyGoal) * 100, 100) : 0;
  const progressBar = document.getElementById("goalProgressBar");
  const alert = document.getElementById("goalAlert");

  progressBar.style.width = progress + "%";

  if (progress >= 100) {
    progressBar.style.backgroundColor = "#2ecc71"; // green when goal reached
    alert.style.display = "block"; // show alert
  } else {
    progressBar.style.backgroundColor = "#ff4757"; // normal red
    alert.style.display = "none"; // hide alert
  }

  document.getElementById("goalText").textContent = `Goal: ${totalHours} / ${dailyGoal} hours`;
}

// ---------------------------
// EXPORT REPORT
// ---------------------------
function exportReport() {
  let report = "Focus Tracker Report\n\n";
  report += `Total Study Hours: ${totalHours}\n`;
  report += `Daily Streak: ${streak}\n\n`;
  report += "Habits:\n";

  habits.forEach((habit, index) => {
    report += `${index + 1}. ${habit.name} - ${habit.completed ? "✅" : "❌"}\n`;
  });

  report += `\nDaily Goal: ${dailyGoal} hours`;

  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Focus_Tracker_Report.txt";
  a.click();
  URL.revokeObjectURL(url);
}

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
// BUTTON EVENT LISTENERS
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addHabitBtn").addEventListener("click", addHabit);
  document.getElementById("addStudyBtn").addEventListener("click", addStudy);
  document.getElementById("exportBtn").addEventListener("click", exportReport);

  document.getElementById("setGoalBtn").addEventListener("click", () => {
    const input = document.getElementById("dailyGoalInput");
    if (input.value.trim() === "" || isNaN(input.value)) return;

    dailyGoal = parseFloat(input.value);
    input.value = "";
    saveData();
    updateGoalProgress();
  });
});
