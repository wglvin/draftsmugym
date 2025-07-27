import { db, auth } from "./firebase-config.js";
import {
  collection, addDoc, query, where, getDocs, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const MEALS = [
  { id: 1, name: "Meal 1", desc: "High protein chicken bowl." },
  { id: 2, name: "Meal 2", desc: "Vegetarian pasta with chickpeas." },
  { id: 3, name: "Meal 3", desc: "Omelette and brown rice set." }
];

const GYMS = [
  { name: "SMU Gym", code: "SMU" },
  { name: "ActiveSG Toa Payoh", code: "ASG-TP" },
  { name: "Anytime Fitness Raffles", code: "AF-RAFFLES" }
];

export function renderFoodOrder() {
  const foodSection = document.getElementById('food-order-section');
  if (!foodSection) return;
  let mealOptions = MEALS.map(m =>
    `<option value="${m.id}">${m.name} – ${m.desc}</option>`
  ).join('');
  let gymOptions = GYMS.map(g =>
    `<option value="${g.code}">${g.name}</option>`
  ).join('');
  foodSection.innerHTML = `
    <form id="food-order-form" autocomplete="off">
      <label>Choose Meal:</label>
      <select id="meal" required>
        <option value="">Select...</option>
        ${mealOptions}
      </select>
      <br>
      <label>Collection Date:</label>
      <input type="date" id="collection-date" required min="${new Date().toISOString().split('T')[0]}">
      <br>
      <label>Pickup Gym Location:</label>
      <select id="gym-location" required>
        <option value="">Select gym...</option>
        ${gymOptions}
      </select>
      <br>
      <button type="submit">Order Meal</button>
    </form>
    <div id="food-order-message"></div>
  `;
  document.getElementById('food-order-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to order.");
    const mealId = document.getElementById('meal').value;
    const meal = MEALS.find(m => m.id == mealId);
    const date = document.getElementById('collection-date').value;
    const gym = GYMS.find(g => g.code === document.getElementById('gym-location').value);
    const messageDiv = document.getElementById('food-order-message');
    if (!meal || !gym) {
      messageDiv.textContent = "Please select valid options.";
      return;
    }
    document.querySelector('#food-order-form button[type="submit"]').disabled = true;
    try {
      await addDoc(collection(db, "food_orders"), {
        userId: user.uid,
        meal: meal.name,
        gym: gym.name,
        desc: meal.desc,
        date,
        timestamp: serverTimestamp()
      });
      messageDiv.textContent =
        `Order placed! Collect your meal after your workout from the vending machine outside ${gym.name} on ${date}.`;
      e.target.reset();
      await loadFoodOrders();
    } catch (err) {
      messageDiv.textContent = err.message;
    }
    document.querySelector('#food-order-form button[type="submit"]').disabled = false;
  });
}

export async function loadFoodOrders() {
  const user = auth.currentUser;
  const historyDiv = document.getElementById('food-order-history');
  if (!user || !historyDiv) return;
  const q = query(collection(db, "food_orders"), where("userId", "==", user.uid), orderBy("date", "desc"));
  const snap = await getDocs(q);
  let html = '';
  snap.forEach(doc => {
    const d = doc.data();
    html += `
      <div class="dashboard-card">
        <strong>${d.meal}</strong> • ${d.gym}<br>
        <small>Collection: ${d.date}</small><br>
        <small>${d.desc}</small>
      </div>
    `;
  });
  historyDiv.innerHTML = html || "<i>No meal orders yet.</i>";
}

auth.onAuthStateChanged(async user => {
  if (user) {
    renderFoodOrder();
    await loadFoodOrders();
  }
});
