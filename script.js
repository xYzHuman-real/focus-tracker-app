let theme = localStorage.getItem("theme") || "dark";
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let totalHours = JSON.parse(localStorage.getItem("totalHours")) || 0;
let streak = JSON.parse(localStorage.getItem("streak")) || 0;
let lastStudyDate = localStorage.getItem("lastStudyDate") || null;
function saveData() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("totalHours", JSON.stringify(totalHours));
  localStorage.setItem("streak", JSON.stringify(streak));
  localStorage.setItem("lastStudyDate", lastStudyDate);
}

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
      localStorage.setItem("habits", JSON.stringify(habits));
      renderHabits();
    });
  });
      }

function addHabit() {
  const input = document.getElementById("habitInput");
  if (input.value.trim() === "") return;

  // Push an object with name and completed status
  habits.push({ name: input.value.trim(), completed: false });

  // Clear input
  input.value = "";

  // Save to localStorage
  localStorage.setItem("habits", JSON.stringify(habits));

  // Re-render habit list
  renderHabits();
               }

function removeHabit(index) {
  habits.splice(index, 1);
  saveData();
  renderHabits();
}

function addStudy() {
  const input = document.getElementById("studyInput");
  const hours = parseFloat(input.value);
  if (isNaN(hours) || hours <= 0) return;

  totalHours += hours;

  const today = new Date().toDateString();

  if (lastStudyDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastStudyDate === yesterday.toDateString()) {
      streak++;
    } else if (lastStudyDate !== today) {
      streak = 1;
    }

    lastStudyDate = today;
  }

  document.getElementById("totalHours").textContent = totalHours;
  document.getElementById("dashboardHours").textContent = totalHours;
  document.getElementById("dashboardStreak").textContent = streak;
  document.getElementById("streakCount").textContent = streak;

  input.value = "";
  saveData();
}

document.getElementById("totalHours").textContent = totalHours;
document.getElementById("dashboardHours").textContent = totalHours;
document.getElementById("dashboardStreak").textContent = streak;
document.getElementById("streakCount").textContent = streak;
renderHabits();

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
document.getElementById("exportBtn").addEventListener("click", () => {
  let report = "Focus Tracker Report\n\n";
  
  // Total Hours and Streak
  report += `Total Study Hours: ${totalHours}\n`;
  report += `Daily Streak: ${streak}\n\n`;

  // List habits
  report += "Habits:\n";
  habits.forEach((habit, index) => {
    report += `${index + 1}. ${habit.name} - ${habit.completed ? "✅" : "❌"}\n`;
  });

  // Create file and download
  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Focus_Tracker_Report.txt";
  a.click();
  URL.revokeObjectURL(url);
});
