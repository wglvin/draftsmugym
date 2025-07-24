// app.js
import { db, auth } from "./firebase-config.js";
import {
  collection, addDoc, query, where, getDocs, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const EXERCISES = [
  { name: 'Bench Press', type: 'strength' },
  { name: 'Squat Rack', type: 'strength' },
  { name: 'Treadmill', type: 'cardio' },
  { name: 'Elliptical', type: 'cardio' }
];

let exerciseOptions = EXERCISES.map(x => `<option value="${x.name}" data-type="${x.type}">${x.name}</option>`).join('');

document.getElementById('workout-logger').innerHTML = `
  <h4>Log a Workout</h4>
  <form id="log-form">
    <select id="exercise" required>
      <option value="">Select exercise</option>
      ${exerciseOptions}
    </select>
    <div id="strength-fields">
      <input type="number" id="weight" min="1" placeholder="Weight (kg)">
      <input type="number" id="reps" min="1" placeholder="Reps">
      <input type="number" id="sets" min="1" placeholder="Sets">
    </div>
    <div id="cardio-fields" style="display:none">
      <input type="number" id="duration" min="1" placeholder="Duration (min)">
      <input type="number" id="distance" min="0" step="0.01" placeholder="Distance (km)">
    </div>
    <button type="submit">Log</button>
  </form>
  <div id="log-history"></div>
`;

// Show/hide fields depending on exercise type
document.getElementById('exercise').onchange = function () {
  let selected = this.value;
  let type = EXERCISES.find(x => x.name === selected)?.type;
  document.getElementById('strength-fields').style.display = (type === 'strength') ? '' : 'none';
  document.getElementById('cardio-fields').style.display = (type === 'cardio') ? '' : 'none';
};

document.getElementById('log-form').onsubmit = async (e) => {
  e.preventDefault();
  const exercise = document.getElementById('exercise').value;
  const type = EXERCISES.find(x => x.name === exercise)?.type;
  
  if (!exercise) return alert('Select an exercise');

  let log = {
    userId: user.uid,
    exercise,
    type,
    timestamp: serverTimestamp(),
  };

  if(type === 'strength') {
    let weight = parseInt(document.getElementById('weight').value);
    let reps = parseInt(document.getElementById('reps').value);
    let sets = parseInt(document.getElementById('sets').value);
    if (weight < 1 || reps < 1 || sets < 1) return alert('Please enter valid values');
    log.weight = weight;
    log.reps = reps;
    log.sets = sets;
    log.volume = weight * reps * sets;
  } else {
    let duration = parseInt(document.getElementById('duration').value);
    let distance = parseFloat(document.getElementById('distance').value);
    if (duration < 1 || isNaN(distance) || distance < 0) return alert('Please enter valid values');
    log.duration = duration;
    log.distance = distance;
  }

  await addDoc(collection(db, "workouts"), log);
  alert('Workout logged!');
  loadWorkoutHistory(user.uid);
};


async function loadWorkoutHistory(uid) {
  const q = query(collection(db, "workouts"), where("userId", "==", uid), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);

  // Group by exercise (latest first)
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

    if(type === 'strength')
      html += `<th>SETS</th><th>KG</th><th>REPS</th>`;
    else
      html += `<th>Session</th><th>Duration (min)</th><th>Distance (km)</th>`;

    html += `</tr></thead><tbody>`;

    entries.forEach((d, i) => {
      html += "<tr>";
      if(type === 'strength')
        html += `<td>${d.sets || ''}</td><td>${d.weight || ''}</td><td>${d.reps || ''}</td>`;
      else
        html += `<td>${i+1}</td><td>${d.duration || ''}</td><td>${d.distance != null ? d.distance.toFixed(2) : ''}</td>`;
      html += "</tr>";
    });

    html += `</tbody></table></div>`;
  }

  document.getElementById('log-history').innerHTML = html || "<div style='color:#555'>No workouts yet.</div>";
};

loadWorkoutHistory(user.uid);

