// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD0txpbZjCwn6TSWF6rCnPlq46th9L-N5w",
  authDomain: "focustrackerapp-c3b36.firebaseapp.com",
  projectId: "focustrackerapp-c3b36",
  storageBucket: "focustrackerapp-c3b36.firebasestorage.app",
  messagingSenderId: "985621079314",
  appId: "1:985621079314:web:a5f8661196d5e353d5ffcb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let userData = { totalHours:0, streak:0, habits:[], dailyGoal:0 };

// ---------------------------
// DOM Elements
// ---------------------------
const authSection = document.getElementById("authSection");
const mainSection = document.getElementById("mainSection");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const authMessage = document.getElementById("authMessage");

const profileEmail = document.getElementById("profileEmail");
const displayNameInput = document.getElementById("displayNameInput");
const updateProfileBtn = document.getElementById("updateProfileBtn");

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
const exportBtn = document.getElementById("exportBtn");

const postInput = document.getElementById("postInput");
const postBtn = document.getElementById("postBtn");
const postList = document.getElementById("postList");

const themeToggle = document.getElementById("themeToggle");
const logoutBtn = document.getElementById("logoutBtn");

// ---------------------------
// Auth Handlers
// ---------------------------
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const pass = passwordInput.value;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db,"users",cred.user.uid), userData);
    authMessage.textContent = "Sign Up Successful!";
  } catch(e) { authMessage.textContent = e.message; }
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const pass = passwordInput.value;
  try {
    await signInWithEmailAndPassword(auth,email,pass);
  } catch(e){ authMessage.textContent = e.message; }
});

logoutBtn.addEventListener("click", ()=>{ signOut(auth); });

// ---------------------------
// Auth State
// ---------------------------
onAuthStateChanged(auth, async (user)=>{
  if(user){
    authSection.style.display="none";
    mainSection.style.display="block";
    profileEmail.textContent = user.email;
    displayNameInput.value = user.displayName||"";
    const docSnap = await getDoc(doc(db,"users",user.uid));
    if(docSnap.exists()) userData = docSnap.data();
    updateDashboard();
    loadCommunity();
  } else {
    authSection.style.display="block";
    mainSection.style.display="none";
  }
});

// ---------------------------
// Profile Update
// ---------------------------
updateProfileBtn.addEventListener("click", async ()=>{
  if(auth.currentUser){
    await updateProfile(auth.currentUser,{displayName:displayNameInput.value});
    alert("Profile Updated!");
  }
});

// ---------------------------
// Dashboard Functions
// ---------------------------
function updateDashboard(){
  totalHoursEl.textContent = userData.totalHours||0;
  streakEl.textContent = userData.streak||0;
  dashboardHours.textContent = userData.totalHours||0;
  dashboardStreak.textContent = userData.streak||0;
  goalText.textContent = `Goal: ${userData.totalHours||0} / ${userData.dailyGoal||0} hours`;
  goalProgressBar.style.width = userData.dailyGoal?Math.min(userData.totalHours/userData.dailyGoal*100,100)+"%":"0%";
  goalAlert.style.display = (userData.dailyGoal && userData.totalHours>=userData.dailyGoal)?"block":"none";
}

// ---------------------------
// Study Tracker
// ---------------------------
addStudyBtn.addEventListener("click", async ()=>{
  const val = parseFloat(studyInput.value);
  if(!val) return;
  const today = new Date().toDateString();
  if(userData.lastStudyDate!==today){ userData.streak=(userData.streak||0)+1; userData.lastStudyDate=today; }
  userData.totalHours=(userData.totalHours||0)+val;
  studyInput.value="";
  await setDoc(doc(db,"users",auth.currentUser.uid),userData);
  updateDashboard();
});

// ---------------------------
// Daily Goal
// ---------------------------
setGoalBtn.addEventListener("click", async ()=>{
  const val = parseFloat(dailyGoalInput.value);
  if(!val) return;
  userData.dailyGoal = val;
  dailyGoalInput.value="";
  await setDoc(doc(db,"users",auth.currentUser.uid),userData);
  updateDashboard();
});

// ---------------------------
// Export Report
// ---------------------------
exportBtn.addEventListener("click", ()=>{
  let report=`Focus Tracker Report\n\nTotal Hours: ${userData.totalHours}\nStreak: ${userData.streak}\nDaily Goal: ${userData.dailyGoal}\n`;
  const blob = new Blob([report],{type:"text/plain"});
  const a = document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="Focus_Tracker_Report.txt";
  a.click();
  URL.revokeObjectURL(a.href);
});

// ---------------------------
// Community
// ---------------------------
async function loadCommunity(){
  const q = query(collection(db,"posts"),orderBy("timestamp","desc"));
  onSnapshot(q,(snap)=>{
    postList.innerHTML="";
    snap.forEach(doc=>{
      const li = document.createElement("li");
      li.textContent=`${doc.data().author}: ${doc.data().content}`;
      postList.appendChild(li);
    });
  });
}

postBtn.addEventListener("click", async ()=>{
  const val = postInput.value;
  if(!val) return;
  await addDoc(collection(db,"posts"),{author:auth.currentUser.displayName||auth.currentUser.email, content:val, timestamp: new Date()});
  postInput.value="";
});

// ---------------------------
// Theme
// ---------------------------
themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("light");
});
