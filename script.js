// ---------------------------
// Global Variables
// ---------------------------
let totalHours = parseInt(localStorage.getItem("totalHours")) || 0;
let streak = parseInt(localStorage.getItem("streak")) || 0;
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let theme = localStorage.getItem("theme") || "dark";

// ---------------------------
// Add Study
// ---------------------------
function addStudy() {
  const input = document.getElementById("studyInput");
  if (input.value.trim() === "" || isNaN(input.value)) return;

  totalHours += parseInt(input.value);
  streak += 1;

  input.value = "";

  saveData();
  updateDashboard();
  renderHabits();
}

// ---------------------------
// Add Habit
// ---------------------------
function addHabit() {
  const input = document.getElementById("habitInput");
  if (input.value.trim() === "") return;

  habits.push({ name: input.value.trim(), completed: false });

  input.value = "";
  saveData();
  renderHabits();
}

// ---------------------------
// Save Data to localStorage
// ---------------------------
function saveData() {
  localStorage.setItem("totalHours", totalHours);
  localStorage.setItem("streak", streak);
  localStorage.setItem("habits", JSON.stringify(habits));
}

// ---------------------------
// Update Dashboard
// ---------------------------
function updateDashboard() {
  document.getElementById("totalHours").textContent = totalHours;
  document.getElementById("dashboardHours").textContent = totalHours;
  document.getElementById("streakCount").textContent = streak;
  document.getElementById("dashboardStreak").textContent = streak;
}

// ---------------------------
// Render Habits
// ---------------------------
function renderHabits() {
  const habitList = document.getElementById("habitList");
  habitList.innerHTML = "";

  habits.forEach((habit, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${habit.completed ? "checked" : ""} data-index="${index}" />
      <span>${habit.name}</span>
    `;
    habitList.appendChild(li);
  });

  // Add event listener for checkboxes
  document.querySelectorAll("#habitList input[type=checkbox]").forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
      const idx = e.target.dataset.index;
      habits[idx].completed = e.target.checked;
      saveData();
      renderHabits();
    });
  });

  updateDashboard();
}

// ---------------------------
// Theme System
// ---------------------------
const themeToggle = document.getElementById("themeToggle");

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

applyTheme();

// ---------------------------
// Export Report
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
// Initial Load
// ---------------------------
updateDashboard();
renderHabits();
