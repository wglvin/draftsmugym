// auth-dashboard.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');

onAuthStateChanged(auth, user => {
    if (user) {
        userEmailSpan.textContent = user.email;
    } else {
        window.location.href = "index.html";
    }
});
if (logoutBtn) {
    logoutBtn.onclick = () => signOut(auth).then(() => window.location.href = "index.html");
}
