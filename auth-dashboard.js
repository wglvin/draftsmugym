// auth-dashboard.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

function getUserName(email) {
    return email.split('@')[0];
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn-header');
    const userEmailSpan = document.getElementById('user-email');

    onAuthStateChanged(auth, user => {
        if (user) {
            if (userEmailSpan) userEmailSpan.textContent = getUserName(user.email);
        } else {
            window.location.href = "index.html";
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = "index.html";
        });
    }
});
