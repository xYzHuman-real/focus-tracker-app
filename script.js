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
  const list = document.getElementById("habitList");
  list.innerHTML = "";
  habits.forEach((habit, index) => {
    const li = document.createElement("li");
    li.textContent = habit;
    li.onclick = () => removeHabit(index);
    list.appendChild(li);
  });
}

function addHabit() {
  const input = document.getElementById("habitInput");
  if (input.value.trim() === "") return;
  habits.push(input.value);
  input.value = "";
  saveData();
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
  document.getElementById("streakCount").textContent = streak;

  input.value = "";
  saveData();
}

document.getElementById("totalHours").textContent = totalHours;
renderHabits();
document.getElementById("streakCount").textContent = streak;
