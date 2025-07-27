// auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const modal = document.getElementById('auth-modal');
const showModal = () => modal.classList.add("show");
const hideModal = () => modal.classList.remove("show");

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const errorDiv = document.getElementById('auth-error');

document.addEventListener('DOMContentLoaded', () => {
    // ... all your event handler code ...
    document.getElementById('auth-btn').onclick = () => {
        showModal();
        document.getElementById('login-form').style.display = "block";
        document.getElementById('register-form').style.display = "none";
        document.getElementById('show-login').classList.add('active');
        document.getElementById('show-register').classList.remove('active');
        errorDiv.textContent = "";
    };
    document.getElementById('close-auth-modal').onclick = hideModal;
    document.getElementById('show-login').onclick = () => {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        errorDiv.textContent = "";
        document.getElementById('show-login').classList.add('active');
        document.getElementById('show-register').classList.remove('active');
    };
    document.getElementById('show-register').onclick = () => {
        registerForm.style.display = "block";
        loginForm.style.display = "none";
        errorDiv.textContent = "";
        document.getElementById('show-register').classList.add('active');
        document.getElementById('show-login').classList.remove('active');
    };
    window.onclick = e => {
        if (e.target === modal) hideModal();
    };

    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        errorDiv.textContent = "";
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            hideModal();
            window.location.href = "dashboard.html";
        } catch (err) {
            errorDiv.textContent = err.message;
        }
    };

    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        errorDiv.textContent = "";
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            hideModal();
            window.location.href = "dashboard.html";
        } catch (err) {
            errorDiv.textContent = err.message;
        }
    };
    function showTab(tab) {
        document.getElementById('dashboard-section').style.display = tab === 'dashboard' ? 'block' : 'none';
        document.getElementById('workout-section').style.display = tab === 'workout' ? 'block' : 'none';
        document.getElementById('food-section').style.display = tab === 'food' ? 'block' : 'none';
        document.getElementById('trainer-section').style.display = tab === 'trainer' ? 'block' : 'none';
        // update active link
        // ...
    }

    document.getElementById('nav-dashboard').onclick = () => showTab('dashboard');
    document.getElementById('nav-workout').onclick = () => showTab('workout');
    document.getElementById('nav-food').onclick = () => showTab('food');
    document.getElementById('nav-trainer').onclick = () => showTab('trainer');
    // Initially, show dashboard
    showTab('dashboard');
});

