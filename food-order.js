// food-order.js
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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
  let mealOptions = MEALS.map(m => 
    `<option value="${m.id}">${m.name} – ${m.desc}</option>`
  ).join('');
  
  let gymOptions = GYMS.map(g => 
    `<option value="${g.code}">${g.name}</option>`
  ).join('');
  
  document.getElementById('food-order-section').innerHTML = `
    <h4>Order Post-Workout Meal</h4>
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
  
  document.getElementById('food-order-form').onsubmit = async function(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to order.");
    const mealId = document.getElementById('meal').value;
    const meal = MEALS.find(m => m.id == mealId);
    const date = document.getElementById('collection-date').value;
    const gym = GYMS.find(g => g.code === document.getElementById('gym-location').value);
    try {
      await addDoc(collection(db, "food_orders"), {
        userId: user.uid,
        meal: meal.name,
        gym: gym.name,
        desc: meal.desc,
        date,
        timestamp: serverTimestamp()
      });
      document.getElementById('food-order-message').textContent =
        `Order placed! Collect your meal after your workout from the vending machine outside ${gym.name} on ${date}.`;
      e.target.reset();
    } catch (err) {
      document.getElementById('food-order-message').textContent = err.message;
    }
  };
}
