import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, ref, set, get, update, push, onValue } from "firebase/database";

// ---------- Firebase ----------
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
const db = getDatabase(app);

let currentUser = null;
let totalHours = 0, streak = 0, habits = [], dailyGoal = 0;

// ---------- AUTH ----------
document.getElementById("signupBtn").addEventListener("click",()=>{
  const email=document.getElementById("emailInput").value;
  const password=document.getElementById("passwordInput").value;
  createUserWithEmailAndPassword(auth,email,password)
    .then(cred=>{ currentUser=cred.user; set(ref(db,'users/'+currentUser.uid),{totalHours:0,streak:0,habits:[],dailyGoal:0}); showApp(); })
    .catch(e=>alert(e.message));
});

document.getElementById("loginBtn").addEventListener("click",()=>{
  const email=document.getElementById("emailInput").value;
  const password=document.getElementById("passwordInput").value;
  signInWithEmailAndPassword(auth,email,password)
    .then(cred=>{ currentUser=cred.user; showApp(); })
    .catch(e=>alert(e.message));
});

document.getElementById("logoutBtn").addEventListener("click",()=>{ signOut(auth).then(()=>location.reload()); });

// ---------- LOAD USER ----------
function showApp(){ document.getElementById("authContainer").style.display="none"; document.getElementById("appContainer").style.display="block"; loadUserData(); }

function loadUserData(){
  if(!currentUser) return;
  get(ref(db,'users/'+currentUser.uid)).then(snap=>{
    if(snap.exists()){ const d=snap.val(); totalHours=d.totalHours||0; streak=d.streak||0; habits=d.habits||[]; dailyGoal=d.dailyGoal||0; updateDashboard(); renderHabits(); updateGoalProgress(); }
  });
}

function saveUserData(){ if(!currentUser) return; update(ref(db,'users/'+currentUser.uid),{totalHours,streak,habits,dailyGoal}); }

// ---------- DASHBOARD ----------
function updateDashboard(){ document.getElementById("totalHours").textContent=totalHours; document.getElementById("streakCount").textContent=streak; }

// ---------- HABITS ----------
function addHabit(name){ if(!name) return; habits.push({name,completed:false}); saveUserData(); renderHabits(); }
function renderHabits(){
  const l=document.getElementById("habitList"); l.innerHTML="";
  habits.forEach((h,i)=>{
    const li=document.createElement("li");
    const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=h.completed;
    cb.addEventListener("change",()=>{ habits[i].completed=cb.checked; saveUserData(); });
    const span=document.createElement("span"); span.textContent=h.name;
    const del=document.createElement("button"); del.textContent="❌"; del.addEventListener("click",()=>{ habits.splice(i,1); saveUserData(); renderHabits(); });
    li.appendChild(cb); li.appendChild(span); li.appendChild(del); l.appendChild(li);
  });
}

// ---------- STUDY ----------
function addStudy(hours){
  const today=new Date().toDateString();
  if(!localStorage.getItem('lastStudyDate') || localStorage.getItem('lastStudyDate')!==today){ streak+=1; localStorage.setItem('lastStudyDate',today); }
  totalHours+=parseFloat(hours); saveUserData(); updateDashboard(); updateGoalProgress();
}

// ---------- GOAL ----------
function setDailyGoal(goal){ dailyGoal=parseFloat(goal); saveUserData(); updateGoalProgress(); }
function updateGoalProgress(){
  const p=dailyGoal?Math.min(totalHours/dailyGoal*100,100):0;
  const bar=document.getElementById("goalProgressBar");
  const text=document.getElementById("goalText");
  const alert=document.getElementById("goalAlert");
  bar.style.width=p+"%"; text.textContent=`Goal: ${totalHours} / ${dailyGoal} hours`; alert.style.display=p>=100?"block":"none";
}

// ---------- COMMUNITY ----------
const groupRef=ref(db,'groups/');
document.getElementById("createGroupBtn").addEventListener("click",()=>{
  const name=document.getElementById("groupInput").value; if(!name) return;
  push(groupRef,{name,createdBy:currentUser.uid}); document.getElementById("groupInput").value="";
});

onValue(groupRef,snap=>{
  const list=document.getElementById("groupList"); const select=document.getElementById("groupSelect");
  list.innerHTML=""; select.innerHTML="";
  snap.forEach(s=>{
    const g=s.val(); const id=s.key;
    const li=document.createElement("li"); li.textContent=g.name; list.appendChild(li);
    const opt=document.createElement("option"); opt.value=id; opt.textContent=g.name; select.appendChild(opt);
  });
});

// ---------- POSTS & NOTIFICATIONS ----------
document.getElementById("postBtn").addEventListener("click",()=>{
  const groupId=document.getElementById("groupSelect").value;
  const msg=document.getElementById("postInput").value; if(!groupId || !msg) return;
  push(ref(db,'posts/'+groupId),{user:currentUser.email,msg,date:new Date().toLocaleString()});
  document.getElementById("postInput").value="";
});

onValue(ref(db,'posts/'),snap=>{
  const list=document.getElementById("postList"); const notif=document.getElementById("notificationsList"); list.innerHTML=""; notif.innerHTML="";
  snap.forEach(gSnap=>{
    gSnap.forEach(pSnap=>{
      const d=pSnap.val(); const li=document.createElement("li");
      li.textContent=`[${d.date}] ${d.user}: ${d.msg}`; list.appendChild(li);

      // Notification for posts not by current user
      if(d.user!==currentUser.email){
        const nli=document.createElement("li"); nli.textContent=`New post in ${gSnap.key} by ${d.user}`; notif.appendChild(nli);
      }
    });
  });
});

// ---------- BUTTONS ----------
document.getElementById("addHabitBtn").addEventListener("click",()=>{ addHabit(document.getElementById("habitInput").value); document.getElementById("habitInput").value=""; });
document.getElementById("addStudyBtn").addEventListener("click",()=>{ addStudy(document.getElementById("studyInput").value); document.getElementById("studyInput").value=""; });
document.getElementById("setGoalBtn").addEventListener("click",()=>{ setDailyGoal(document.getElementById("dailyGoalInput").value); document.getElementById("dailyGoalInput").value=""; });
document.getElementById("exportBtn").addEventListener("click",()=>{
  let report=`Total Hours: ${totalHours}\nStreak: ${streak}\nDaily Goal: ${dailyGoal}\nHabits:\n`;
  habits.forEach((h,i)=>report+=`${i+1}. ${h.name} - ${h.completed?'✅':'❌'}\n`);
  const blob=new Blob([report],{type:"text/plain"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="Focus_Tracker_Report.txt"; a.click(); URL.revokeObjectURL(url);
});
