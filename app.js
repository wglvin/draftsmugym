// app.js
import { db, auth } from "./firebase-config.js";
import {
  collection, addDoc, query, where, getDocs, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { renderFoodOrder } from "./food-order.js";

const EXERCISES = [
  { name: 'Bench Press', type: 'strength' },
  { name: 'Squat Rack', type: 'strength' },
  { name: 'Treadmill', type: 'cardio' },
  { name: 'Elliptical', type: 'cardio' }
];

let workoutSession = []; // Array of { exercise, type, weight, reps, etc. } for *current* exercise before saving

function renderLogger() {
  document.getElementById('workout-logger').innerHTML = `
  <h4>Log a Workout</h4>
  <form id="workout-select-form" autocomplete="off">
    <input type="text" id="exercise-search" placeholder="Search exercise..." required list="exercise-list">
    <datalist id="exercise-list">
      ${EXERCISES.map(x => `<option value="${x.name}"></option>`).join('')}
    </datalist>
  </form>
  <div id="exercise-log-fields"></div>
  <div id="session-sets-list"></div>
  <div id="log-history"></div>
`;

  // This is the only input handler needed now!
  document.getElementById('exercise-search').oninput = function () {
    const selected = this.value;
    const exObj = EXERCISES.find(x => x.name.toLowerCase() === selected.toLowerCase());
    if (!exObj) {
      document.getElementById('exercise-log-fields').innerHTML = '';
      workoutSession = [];
      renderSetsList();
      return;
    }

    workoutSession = [];
    if (exObj.type === 'strength') {
      document.getElementById('exercise-log-fields').innerHTML = `
        <form id="add-set-form" class="smu-add-set">
          <input type="number" id="weight" min="1" placeholder="Weight (kg)" required>
          <input type="number" id="reps" min="1" placeholder="Reps" required>
          <button type="submit">+ Add Set</button>
        </form>
      `;
      document.getElementById('add-set-form').onsubmit = (e) => {
        e.preventDefault();
        let weight = parseFloat(document.getElementById('weight').value);
        let reps = parseInt(document.getElementById('reps').value);
        if (weight < 1 || reps < 1) {
          alert('Please enter valid values');
          return;
        }
        workoutSession.push({ exercise: selected, type: exObj.type, weight, reps });
        renderSetsList();
        e.target.reset();
      }
    } else {
      document.getElementById('exercise-log-fields').innerHTML = `
        <form id="add-set-form" class="smu-add-set">
          <input type="number" id="duration" min="1" placeholder="Duration (min)" required>
          <input type="number" id="distance" min="0" step="0.01" placeholder="Distance (km)" required>
          <button type="submit">+ Add Session</button>
        </form>
      `;
      document.getElementById('add-set-form').onsubmit = (e) => {
        e.preventDefault();
        let duration = parseInt(document.getElementById('duration').value);
        let distance = parseFloat(document.getElementById('distance').value);
        if (duration < 1 || isNaN(distance) || distance < 0) {
          alert('Please enter valid values');
          return;
        }
        workoutSession.push({ exercise: selected, type: exObj.type, duration, distance });
        renderSetsList();
        e.target.reset();
      }
    }
    renderSetsList();
  };

  renderSetsList();
}

function renderSetsList() {
  // Small table of sets for the *current* exercise
  let html = '';
  if (workoutSession.length === 0) {
    document.getElementById('session-sets-list').innerHTML = '';
    // Optionally, show a "Save All" button only if there are sets!
    return;
  }
  const type = workoutSession[0]?.type;
  html += `<table class="smu-sets-table"><thead><tr>`;
  if (type === 'strength')
    html += `<th>Set</th><th>Weight (kg)</th><th>Reps</th><th></th>`;
  else
    html += `<th>Session</th><th>Duration (min)</th><th>Distance (km)</th><th></th>`;
  html += `</tr></thead><tbody>`;
  workoutSession.forEach((set, i) => {
    html += '<tr>';
    html += `<td>${i + 1}</td>`;
    if (type === 'strength') {
      html += `<td>${set.weight}</td><td>${set.reps}</td>`;
    } else {
      html += `<td>${set.duration}</td><td>${set.distance.toFixed(2)}</td>`;
    }
    html += `<td><button onclick="removeSet(${i})" style="color:#a52e2e;background:none;border:none;cursor:pointer;font-weight:bold;">×</button></td>`;
    html += '</tr>';
  });
  html += '</tbody></table>';
  html += `<button id="save-all-sets" class="smu-save-btn" style="margin-top:8px;">Save All to Log</button>`;
  document.getElementById('session-sets-list').innerHTML = html;

  document.getElementById('save-all-sets').onclick = async function () {
    // Save all sets to Firestore individually
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");
    for (const set of workoutSession) {
      const entry = {
        userId: user.uid,
        exercise: set.exercise,
        type: set.type,
        timestamp: serverTimestamp()
      };
      if (set.type === 'strength') {
        entry.weight = set.weight;
        entry.reps = set.reps;
        // Only 1 set at a time, so set sets: 1 (or just omit)
        entry.sets = 1;
        entry.volume = set.weight * set.reps;
      } else {
        entry.duration = set.duration;
        entry.distance = set.distance;
      }
      await addDoc(collection(db, "workouts"), entry);
    }
    alert('Workout(s) logged!');
    workoutSession = [];
    renderSetsList();
    await loadWorkoutHistory(user.uid);
    // Optionally: clear exercise select
    document.getElementById('exercise').value = '';
    document.getElementById('exercise-log-fields').innerHTML = '';
  };
}

// Make removeSet globally callable
window.removeSet = (index) => {
  workoutSession.splice(index, 1);
  renderSetsList();
};

// ---- refactor loadWorkoutHistory as before ---- //
async function loadWorkoutHistory(uid) {
  const q = query(collection(db, "workouts"), where("userId", "==", uid), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);

  // Group by exercise
  let logs = {};
  snap.forEach(doc => {
    const d = doc.data();
    let exer = d.exercise;
    if (!logs[exer]) logs[exer] = [];
    logs[exer].push(d);
  });

  let html = '';
  for (const [exerciseName, entries] of Object.entries(logs)) {
    // Determine type
    const type = EXERCISES.find(x => x.name === exerciseName)?.type || 'strength';
    html += `<div class="smu-exercise-card"><div class="smu-ex-header">
      <img src="https://img.icons8.com/ios-filled/40/004aad/dumbbell.png" class="smu-ex-icon" />
      <span class="smu-ex-title">${exerciseName}</span>
    </div>
    <table class="smu-sets-table">
      <thead><tr>`;

    if (type === 'strength')
      html += `<th>Set</th><th>Weight (kg)</th><th>Reps</th>`;
    else
      html += `<th>Session</th><th>Duration (min)</th><th>Distance (km)</th>`;
    html += `</tr></thead><tbody>`;

    entries.forEach((d, i) => {
      html += "<tr>";
      if (type === 'strength')
        html += `<td>${i + 1}</td><td>${d.weight || ''}</td><td>${d.reps || ''}</td>`;
      else
        html += `<td>${i + 1}</td><td>${d.duration || ''}</td><td>${d.distance != null ? d.distance.toFixed(2) : ''}</td>`;
      html += "</tr>";
    });

    html += `</tbody></table></div>`;
  }

  document.getElementById('log-history').innerHTML = html || "<div style='color:#555'>No workouts yet.</div>";
}

// ---- INITIALIZE ON LOGIN ---- //
auth.onAuthStateChanged(user => {
  if (!user) return;
  renderLogger();
  loadWorkoutHistory(user.uid);
  renderFoodOrder();
});


