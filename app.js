import { db, auth } from "./firebase-config.js";
import {
  collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, deleteDoc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// --- Expose these methods for spa-nav.js hooks ---
window.renderLogger = renderLogger;

// --- Available exercises ---
const EXERCISES = [
  { name: "Bench Press", type: "strength" },
  { name: "Squat Rack", type: "strength" },
  { name: "Treadmill", type: "cardio" },
  { name: "Elliptical", type: "cardio" },
];

let workoutSession = [];

// --- Render logger form/UI ---
function renderLogger() {
  const logger = document.getElementById("workout-logger");
  if (!logger) return;
  logger.innerHTML = `
    <h4>Log a Workout</h4>
    <form id="workout-select-form" autocomplete="off">
      <input type="text" id="exercise-search" placeholder="Search exercise..." required list="exercise-list">
      <datalist id="exercise-list">
        ${EXERCISES.map(x => `<option value="${x.name}"></option>`).join("")}
      </datalist>
    </form>
    <div id="exercise-log-fields"></div>
    <div id="session-sets-list"></div>
  `;

  document.getElementById("exercise-search").oninput = () => handleExerciseInput();
  renderSetsList();
}

// --- Input handler -----
function handleExerciseInput() {
  const selected = document.getElementById("exercise-search").value;
  const exObj = EXERCISES.find(
    (x) => x.name.toLowerCase() === selected.toLowerCase()
  );
  const fields = document.getElementById("exercise-log-fields");
  workoutSession = [];
  if (!exObj) {
    if (fields) fields.innerHTML = "";
    renderSetsList();
    return;
  }
  // Form for strength or cardio
  if (exObj.type === "strength") {
    fields.innerHTML = `
      <form id="add-set-form" class="smu-add-set">
        <input type="number" id="weight" min="1" placeholder="Weight (kg)" required>
        <input type="number" id="reps" min="1" placeholder="Reps" required>
        <button type="submit">+ Add Set</button>
      </form>`;
  } else {
    fields.innerHTML = `
      <form id="add-set-form" class="smu-add-set">
        <input type="number" id="duration" min="1" placeholder="Duration (min)" required>
        <input type="number" id="distance" min="0" step="0.01" placeholder="Distance (km)" required>
        <button type="submit">+ Add Session</button>
      </form>`;
  }
  document.getElementById("add-set-form").onsubmit = (e) => {
    e.preventDefault();
    if (exObj.type === "strength") {
      let weight = parseFloat(document.getElementById("weight").value);
      let reps = parseInt(document.getElementById("reps").value);
      if (weight < 1 || reps < 1) return alert("Invalid");
      workoutSession.push({ exercise: selected, type: exObj.type, weight, reps });
    } else {
      let duration = parseInt(document.getElementById("duration").value);
      let distance = parseFloat(document.getElementById("distance").value);
      if (duration < 1 || isNaN(distance) || distance < 0) return alert("Invalid");
      workoutSession.push({ exercise: selected, type: exObj.type, duration, distance });
    }
    renderSetsList();
    e.target.reset();
  };
  renderSetsList();
}

// --- Renders sets table (in-memory before saving) ---
function renderSetsList() {
  const listDiv = document.getElementById("session-sets-list");
  if (!listDiv) return;
  if (workoutSession.length === 0) {
    listDiv.innerHTML = "";
    return;
  }
  const type = workoutSession[0]?.type;
  let html = `<table class="smu-sets-table"><thead><tr>`;
  if (type === "strength")
    html += `<th>Set</th><th>Weight (kg)</th><th>Reps</th><th></th>`;
  else html += `<th>Session</th><th>Duration (min)</th><th>Distance (km)</th><th></th>`;
  html += `</tr></thead><tbody>`;
  workoutSession.forEach((set, i) => {
    html += "<tr>";
    html += `<td>${i + 1}</td>`;
    if (type === "strength")
      html += `<td>${set.weight}</td><td>${set.reps}</td>`;
    else html += `<td>${set.duration}</td><td>${set.distance.toFixed(2)}</td>`;
    html += `<td><button class="remove-set-btn" data-idx="${i}" style="color:#a52e2e;background:none;border:none;cursor:pointer;font-weight:bold;">×</button></td>`;
    html += "</tr>";
  });
  html += `</tbody></table>`;
  html += `<button id="save-all-sets" class="smu-save-btn" style="margin-top:8px;">Save All to Log</button>`;
  listDiv.innerHTML = html;

  listDiv.querySelectorAll(".remove-set-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx, 10);
      workoutSession.splice(idx, 1);
      renderSetsList();
    });
  });

  document.getElementById("save-all-sets").onclick = async function () {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");
    for (const set of workoutSession) {
      const entry = {
        userId: user.uid,
        exercise: set.exercise,
        type: set.type,
        timestamp: serverTimestamp(),
      };
      if (set.type === "strength") {
        entry.weight = set.weight;
        entry.reps = set.reps;
        entry.sets = 1;
        entry.volume = set.weight * set.reps;
      } else {
        entry.duration = set.duration;
        entry.distance = set.distance;
      }
      await addDoc(collection(db, "workouts"), entry);
    }
    alert("Workout(s) logged!");
    workoutSession = [];
    renderSetsList();
    await loadWorkoutHistory(user.uid);
    document.getElementById("exercise-search").value = "";
    document.getElementById("exercise-log-fields").innerHTML = "";
  };
}

// --- Fetch and display workout history for user ---
async function loadWorkoutHistory(uid) {
  const logDiv = document.getElementById("log-history");
  if (!logDiv) return;
  const q = query(
    collection(db, "workouts"),
    where("userId", "==", uid),
    orderBy("timestamp", "desc")
  );
  const snap = await getDocs(q);

  let logs = {};
  snap.forEach((docRef) => {
    const d = docRef.data();
    let exer = d.exercise;
    if (!logs[exer]) logs[exer] = [];
    logs[exer].push(d);
  });

  let html = "";
  for (const [exerciseName, entries] of Object.entries(logs)) {
    const type = EXERCISES.find((x) => x.name === exerciseName)?.type || "strength";
    html += `<div class="smu-exercise-card"><div class="smu-ex-header">
      <img src="https://img.icons8.com/ios-filled/40/004aad/dumbbell.png" class="smu-ex-icon" />
      <span class="smu-ex-title">${exerciseName}</span>
    </div>
    <table class="smu-sets-table">
      <thead><tr>`;
    if (type === "strength")
      html += `<th>Set</th><th>Weight (kg)</th><th>Reps</th>`;
    else html += `<th>Session</th><th>Duration (min)</th><th>Distance (km)</th>`;
    html += `</tr></thead><tbody>`;
    entries.forEach((d, i) => {
      html += "<tr>";
      if (type === "strength")
        html += `<td>${i + 1}</td><td>${d.weight || ""}</td><td>${d.reps || ""}</td>`;
      else
        html += `<td>${i + 1}</td><td>${d.duration || ""}</td><td>${d.distance != null ? d.distance.toFixed(2) : ""}</td>`;
      html += "</tr>";
    });
    html += `</tbody></table></div>`;
  }
  logDiv.innerHTML = html || "<div style='color:#555'>No workouts yet.</div>";
}

auth.onAuthStateChanged((user) => {
  if (!user) return;
  renderLogger();
  loadWorkoutHistory(user.uid);
});
