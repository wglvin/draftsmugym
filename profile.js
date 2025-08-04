// profile.js
import { db, auth } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Render profile form
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("profile-root");
  if (!root) return;
  root.innerHTML = `
    <h3>Your Profile</h3>
    <form id="profile-form">
      <label>Body Weight (kg): <input type="number" id="profile-weight" min="1" step="0.1" required></label>
      <button type="submit">Save</button>
      <span id="profile-save-msg" style="margin-left:10px;color:green;"></span>
    </form>
  `;

  auth.onAuthStateChanged(async (user) => {
    if (!user) return;
    // Load existing profile
    const docRef = doc(db, "profiles", user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.bodyWeight) {
        document.getElementById("profile-weight").value = data.bodyWeight;
      }
    }
    // Save handler
    document.getElementById("profile-form").onsubmit = async (e) => {
      e.preventDefault();
      const weight = parseFloat(document.getElementById("profile-weight").value);
      await setDoc(docRef, { bodyWeight: weight }, { merge: true });
      document.getElementById("profile-save-msg").textContent = "Saved!";
      setTimeout(() => (document.getElementById("profile-save-msg").textContent = ""), 1500);
    };
  });
});

// Export a function to get user body weight (for dashboard chart)
export async function getUserBodyWeight(uid) {
  const docRef = doc(db, "profiles", uid);
  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data().bodyWeight) {
    return snap.data().bodyWeight;
  }
  return null;
}