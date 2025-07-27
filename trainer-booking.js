import { db, auth } from "./firebase-config.js";
import {
  collection, addDoc, query, where, getDocs, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

function renderTrainerBooking() {
  const form = document.getElementById('trainer-booking-form');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Please log in.");
    const select = form['trainer-select'];
    const trainerName = select?.selectedOptions[0]?.text;
    const trainerId = select?.value;
    const date = form['booking-date']?.value;
    const time = form['booking-time']?.value;
    const msgDiv = document.getElementById('trainer-booking-message');
    msgDiv.textContent = '';
    if (!trainerId || !date || !time) {
      msgDiv.textContent = "All fields required.";
      return;
    }
    if (new Date(`${date}T${time}`) < new Date()) {
      msgDiv.textContent = "Booking must be for a future time.";
      return;
    }
    form.querySelector('button[type="submit"]').disabled = true;
    try {
      await addDoc(collection(db, "trainer_bookings"), {
        userId: user.uid,
        trainer: trainerName,
        trainerId,
        date,
        time,
        timestamp: serverTimestamp()
      });
      msgDiv.textContent = "Booking confirmed!";
      form.reset();
      await loadTrainerBookings();
    } catch (err) {
      msgDiv.textContent = err.message;
    }
    form.querySelector('button[type="submit"]').disabled = false;
  });
}

async function loadTrainerBookings() {
  const user = auth.currentUser;
  const historyDiv = document.getElementById('trainer-bookings-history');
  if (!user || !historyDiv) return;
  const q = query(collection(db, "trainer_bookings"), where("userId", "==", user.uid), orderBy("date", "desc"), orderBy("time", "asc"));
  const snap = await getDocs(q);
  let html = '';
  snap.forEach(doc => {
    const d = doc.data();
    html += `<div class="dashboard-card">
      <strong>${d.trainer}</strong><br>
      <small>${d.date} at ${d.time}</small>
    </div>`;
  });
  historyDiv.innerHTML = html || "<i>No bookings yet.</i>";
}

auth.onAuthStateChanged(user => {
  if (user) {
    renderTrainerBooking();
    loadTrainerBookings();
  }
});

export { renderTrainerBooking, loadTrainerBookings };
