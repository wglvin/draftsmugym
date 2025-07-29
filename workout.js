// workout.js
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// EXERCISES — add more as desired, with YouTube URLs!
const EXERCISES = [
  {
    name: "Squat Rack",
    group: "legs",
    image: "https://img.icons8.com/3d-fluency/94/barbell.png",
    desc: "Barbell back or front squat rack",
    video: "https://www.youtube.com/embed/ultWZbUMPL8"
  },
  {
    name: "Bench Press",
    group: "chest",
    image: "https://img.icons8.com/3d-fluency/100/bench-press.png",
    desc: "Classic horizontal bench press exercise",
    video: "https://www.youtube.com/embed/gRVjAtPip0Y"
  },
  {
    name: "Treadmill",
    group: "cardio",
    image: "https://img.icons8.com/3d-fluency/100/running-on-treadmill.png",
    desc: "Steady state running or interval cardio.",
    video: "https://www.youtube.com/embed/HY5n1Q7bG0M"
  },
  {
    name: "Elliptical",
    group: "cardio",
    image: "https://img.icons8.com/3d-fluency/100/elliptical-trainer.png",
    desc: "Low impact cardio session.",
    video: "https://www.youtube.com/embed/CG5F0vv14f4"
  }
];

const CATEGORIES = [
  { key: "all", icon: "https://www.flaticon.com/free-icon/tool_14540378", label: "All" },
  { key: "legs", icon: "https://img.icons8.com/3d-fluency/44/leg.png", label: "Legs" },
  { key: "chest", icon: "https://img.icons8.com/3d-fluency/44/chest.png", label: "Chest" },
  { key: "cardio", icon: "https://img.icons8.com/fluency/44/jogging.png", label: "Cardio" }
];

let selectedGroup = "all";
let sessionExercises = [];
let openedExercise = null;
let openedSets = [];

// --- MAIN RENDER FUNCTION FOR SPA ---
function renderWorkoutUI() {
  const root = document.getElementById("workout-ui-root");
  if (!root) return;

  // Fill with full UI
  root.innerHTML = `
    <div class="workout-ui">
      <div class="workout-searchbar-row">
        <input type="text" id="exercise-search" placeholder="Search for exercises or equipment...">
        <button id="clear-search" title="Clear Search">&times;</button>
      </div>
      <div class="workout-category-bar" id="muscle-filter-chips"></div>
      <div class="exercise-grid" id="exercise-grid"></div>
      <div id="exercise-modal" class="exercise-modal">
        <div class="exercise-modal-content">
          <span class="exercise-modal-close" id="close-exercise-modal">&times;</span>
          <div class="exercise-modal-title" id="exercise-modal-title"></div>
          <iframe id="exercise-modal-video" width="350" height="197" src="" frameborder="0" allowfullscreen></iframe>
          <div id="exercise-modal-desc"></div>
          <form id="add-set-form" class="smu-add-set">
            <div class="input-row">
              <input type="number" id="modal-weight" min="1" placeholder="Weight (kg)" required>
              <input type="number" id="modal-reps" min="1" placeholder="Reps" required>
              <button type="submit" class="exercise-add-btn">Add Set</button>
            </div>
          </form>
          <div id="modal-sets-list"></div>
          <button id="add-exercise-btn" class="exercise-add-btn" style="margin-top:12px;">Add Exercise to Session</button>
        </div>
      </div>
      <div id="session-builder" class="session-builder">
        <h4>Current Session <span id="session-date"></span></h4>
        <div id="session-exercises"></div>
        <button id="log-session-btn" class="log-session-btn" disabled>Log This Session</button>
        <div id="log-session-msg"></div>
      </div>
      <div id="session-history"></div>
    </div>
  `;

  // (Re)initialize all UI/events
  selectedGroup = "all";
  sessionExercises = [];
  openedExercise = null;
  openedSets = [];

  showMuscleChips();
  showExerciseGrid();
  setupSearch();
  setupModal();
  showSessionBuilder();

  // Show session history after auth change
  onAuthStateChanged(auth, user => { if (user) showSessionHistory(); });
}

// -------- UI/Logic Functions unchanged below ----------------
function showMuscleChips() {
  const chips = CATEGORIES.map(cat => `
    <button class="category-chip${cat.key == "all" ? " active" : ""}" data-cat="${cat.key}">
      <img src="${cat.icon}"><span>${cat.label}</span>
    </button>
  `).join('');
  document.getElementById("muscle-filter-chips").innerHTML = chips;
  document.querySelectorAll(".category-chip").forEach(btn => {
    btn.onclick = function () {
      selectedGroup = btn.dataset.cat;
      document.querySelectorAll(".category-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showExerciseGrid();
    };
  });
}

function setupSearch() {
  const search = document.getElementById("exercise-search");
  const clearBtn = document.getElementById("clear-search");
  search.addEventListener("input", showExerciseGrid);
  clearBtn.onclick = () => { search.value = ""; showExerciseGrid(); };
}

function showExerciseGrid() {
  const group = selectedGroup;
  const q = document.getElementById("exercise-search").value.trim().toLowerCase();
  let items = EXERCISES.filter(ex => (group == "all" || ex.group === group) && ex.name.toLowerCase().includes(q));
  document.getElementById("exercise-grid").innerHTML = items.map(ex => `
    <div class="exercise-card" tabindex="0"
     onclick="window.openExerciseModal('${ex.name.replace(/'/g, "\\'")}')"
     onkeypress="if(event.key==='Enter'){ window.openExerciseModal('${ex.name.replace(/'/g, "\\'")}') }">
      <img src="${ex.image}" class="exercise-img" alt="${ex.name}">
      <div class="exercise-title">${ex.name}</div>
      <div class="exercise-muscle">${capitalize(ex.group)}</div>
      <div class="exercise-desc">${ex.desc}</div>
    </div>
  `).join('');
}

// Modal logic (now window-scoped)
window.openExerciseModal = function (name) {
  const ex = EXERCISES.find(x => x.name === name);
  if (!ex) return;
  openedExercise = ex;
  openedSets = [];
  document.getElementById("exercise-modal-title").innerText = ex.name;
  document.getElementById("exercise-modal-video").src = ex.video;
  document.getElementById("exercise-modal-desc").innerText = ex.desc;
  document.getElementById("exercise-modal").classList.add("show");
  refreshModalSetsList();
}

function setupModal() {
  document.getElementById("close-exercise-modal").onclick = () => {
    document.getElementById("exercise-modal").classList.remove("show");
    document.getElementById("exercise-modal-video").src = "";
  };
  document.getElementById("add-set-form").onsubmit = function (e) {
    e.preventDefault();
    let weight = parseFloat(document.getElementById("modal-weight").value);
    let reps = parseInt(document.getElementById("modal-reps").value);
    if (weight > 0 && reps > 0) {
      openedSets.push({ weight, reps });
      document.getElementById("modal-weight").value = '';
      document.getElementById("modal-reps").value = '';
      refreshModalSetsList();
    }
  };
  document.getElementById("add-exercise-btn").onclick = () => {
    if (!openedExercise || !openedSets.length) return;
    sessionExercises.push({
      exercise: openedExercise.name,
      group: openedExercise.group,
      sets: [...openedSets]
    });
    document.getElementById("close-exercise-modal").click();
    showSessionBuilder();
  };
}

function refreshModalSetsList() {
  document.getElementById("modal-sets-list").innerHTML = openedSets.length
    ? ("<div>Sets: </div>" + openedSets.map((s, i) => `
        <span class="set-badge">${s.weight}kg x ${s.reps}
        <button onclick="window.removeOpenedSet(${i})" style="color:#b33;background:none;border:none;margin-left:4px;cursor:pointer;">&times;</button>
        </span>
      `).join(' '))
    : '';
}
window.removeOpenedSet = function (i) {
  openedSets.splice(i, 1);
  refreshModalSetsList();
}

// ==== SESSION BUILDER ======
function showSessionBuilder() {
  document.getElementById("session-date").innerText = '(' + (new Date().toLocaleDateString()) + ')';
  document.getElementById("session-exercises").innerHTML = sessionExercises.length
    ? sessionExercises.map((se, idx) =>
      `<div style="margin-bottom:7px;">
        <b>${se.exercise}</b> ${se.sets.map((s, si) => `<span class="set-badge">${s.weight}kg x ${s.reps}</span>`).join(' ')}
        <button onclick="window.removeSessionExercise(${idx})" style="margin-left:7px;color:#c02;">×</button>
      </div>`).join('')
    : "<i>No exercises. Add from grid above!</i>";
  document.getElementById("log-session-btn").disabled = !sessionExercises.length;

  document.getElementById("log-session-btn").onclick = async function () {
    const user = auth.currentUser;
    const msgDiv = document.getElementById("log-session-msg");
    if (!user) { msgDiv.innerText = "You must be logged in."; return; }
    msgDiv.innerText = "Logging session...";
    await addDoc(collection(db, "workout_sessions"), {
      userId: user.uid,
      date: new Date(),
      session: sessionExercises,
      timestamp: serverTimestamp()
    });
    msgDiv.innerText = "Session logged!";
    sessionExercises = [];
    showSessionBuilder();
    showSessionHistory();
  };
}
window.removeSessionExercise = function (idx) {
  sessionExercises.splice(idx, 1);
  showSessionBuilder();
}

async function showSessionHistory() {
  const user = auth.currentUser;
  const historyDiv = document.getElementById("session-history");
  if (!user || !historyDiv) return;
  const q = query(collection(db, "workout_sessions"),
    where("userId", "==", user.uid),
    orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  let html = "<h4>Your Past Sessions</h4>";
  snap.forEach(doc => {
    const d = doc.data();
    html += `<div class="session-card">
      <div class="session-date">${d.timestamp && d.timestamp.seconds ? new Date(d.timestamp.seconds * 1000).toLocaleString() : d.date}</div>
      <div>${d.session.map(se =>
        `<div class="session-entry">
          <b>${se.exercise}</b> ${se.sets.map(s => `<span class="set-badge">${s.weight}kg x ${s.reps}</span>`).join(' ')}
        </div>`).join('')}
      </div>
    </div>`;
  });
  historyDiv.innerHTML = html;
}

function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ""; }
window.renderWorkoutUI = renderWorkoutUI;
