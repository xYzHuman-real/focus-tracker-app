// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD0txpbZjCwn6TSWF6rCnPlq46th9L-N5w",
  authDomain: "focustrackerapp-c3b36.firebaseapp.com",
  projectId: "focustrackerapp-c3b36",
  storageBucket: "focustrackerapp-c3b36.firebasestorage.app",
  messagingSenderId: "985621079314",
  appId: "1:985621079314:web:a5f8661196d5e353d5ffcb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let userData = { totalHours:0, streak:0, dailyGoal:0, lastStudyDate:null };

// DOM
const authSection = document.getElementById("authSection");
const mainSection = document.getElementById("mainSection");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const authMessage = document.getElementById("authMessage");

const totalHoursEl = document.getElementById("totalHours");
const streakEl = document.getElementById("streakCount");
const dashboardHours = document.getElementById("dashboardHours");
const dashboardStreak = document.getElementById("dashboardStreak");
const studyInput = document.getElementById("studyInput");
const addStudyBtn = document.getElementById("addStudyBtn");
const dailyGoalInput = document.getElementById("dailyGoalInput");
const setGoalBtn = document.getElementById("setGoalBtn");
const goalProgressBar = document.getElementById("goalProgressBar");
const goalText = document.getElementById("goalText");
const goalAlert = document.getElementById("goalAlert");

const themeToggle = document.getElementById("themeToggle");
const logoutBtn = document.getElementById("logoutBtn");

// ---------------------------
// Auth
signupBtn.addEventListener("click", async ()=>{
  try{
    const cred = await createUserWithEmailAndPassword(auth,emailInput.value,passwordInput.value);
    await setDoc(doc(db,"users",cred.user.uid), userData);
    authMessage.textContent="Sign Up Successful!";
  }catch(e){ authMessage.textContent=e.message; }
});

loginBtn.addEventListener("click", async ()=>{
  try{ await signInWithEmailAndPassword(auth,emailInput.value,passwordInput.value); }
  catch(e){ authMessage.textContent=e.message; }
});

logoutBtn.addEventListener("click", ()=>signOut(auth));

onAuthStateChanged(auth, async (user)=>{
  if(user){
    authSection.style.display="none";
    mainSection.style.display="block";
    const docSnap = await getDoc(doc(db,"users",user.uid));
    if(docSnap.exists()) userData = docSnap.data();
    updateDashboard();
  }else{
    authSection.style.display="block";
    mainSection.style.display="none";
  }
});

// ---------------------------
// Dashboard
function updateDashboard(){
  totalHoursEl.textContent = userData.totalHours;
  streakEl.textContent = userData.streak;
  dashboardHours.textContent = userData.totalHours;
  dashboardStreak.textContent = userData.streak;

  const progress = userData.dailyGoal ? Math.min(userData.totalHours/userData.dailyGoal*100,100) : 0;
  goalProgressBar.style.width = progress + "%";
  goalText.textContent = `Goal: ${userData.totalHours} / ${userData.dailyGoal} hours`;
  goalAlert.style.display = userData.dailyGoal && userData.totalHours>=userData.dailyGoal?"block":"none";
}

// ---------------------------
// Study Tracker
addStudyBtn.addEventListener("click", async ()=>{
  const val=parseFloat(studyInput.value);
  if(!val) return;
  const today=new Date().toDateString();
  if(userData.lastStudyDate!==today){ userData.streak+=1; userData.lastStudyDate=today; }
  userData.totalHours+=val;
  studyInput.value="";
  await setDoc(doc(db,"users",auth.currentUser.uid),userData);
  updateDashboard();
});

// ---------------------------
// Daily Goal
setGoalBtn.addEventListener("click", async ()=>{
  const val=parseFloat(dailyGoalInput.value);
  if(!val) return;
  userData.dailyGoal=val; dailyGoalInput.value="";
  await setDoc(doc(db,"users",auth.currentUser.uid),userData);
  updateDashboard();
});

// ---------------------------
// Theme
themeToggle.addEventListener("click", ()=>document.body.classList.toggle("light"));
