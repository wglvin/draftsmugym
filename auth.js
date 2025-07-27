// auth.js
import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

  // =============== LANDING PAGE LOGIN/REGISTER MODAL (index.html) ===============
  const modal = document.getElementById('auth-modal');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const errorDiv = document.getElementById('auth-error');

  // Only run modal code if modal exists on this page (index.html)
  if (modal && loginForm && registerForm && errorDiv) {
    // Show modal & set view to login form by default
    document.getElementById('auth-btn').onclick = () => {
      modal.classList.add("show");
      loginForm.style.display = "block";
      registerForm.style.display = "none";
      document.getElementById('show-login').classList.add('active');
      document.getElementById('show-register').classList.remove('active');
      errorDiv.textContent = "";
    };
    // Close modal button
    document.getElementById('close-auth-modal').onclick = () => {
      modal.classList.remove("show");
    };
    // Show Login tab
    document.getElementById('show-login').onclick = () => {
      loginForm.style.display = "block";
      registerForm.style.display = "none";
      errorDiv.textContent = "";
      document.getElementById('show-login').classList.add('active');
      document.getElementById('show-register').classList.remove('active');
    };
    // Show Register tab
    document.getElementById('show-register').onclick = () => {
      registerForm.style.display = "block";
      loginForm.style.display = "none";
      errorDiv.textContent = "";
      document.getElementById('show-register').classList.add('active');
      document.getElementById('show-login').classList.remove('active');
    };
    // Close modal when clicking outside modal content
    window.onclick = e => {
      if (e.target === modal) modal.classList.remove("show");
    };

    // ----- Login Form -----
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      errorDiv.textContent = "";
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        modal.classList.remove("show");
        window.location.href = "dashboard.html";
      } catch (err) {
        errorDiv.textContent = err.message;
      }
    };

    // ----- Register Form -----
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      errorDiv.textContent = "";
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        modal.classList.remove("show");
        window.location.href = "dashboard.html";
      } catch (err) {
        errorDiv.textContent = err.message;
      }
    };
  }


  // =============== DASHBOARD AUTH LOGIC (dashboard.html) ===============
  const logoutBtn = document.getElementById('logout-btn-header');
  const userNameSpan = document.getElementById('user-name');

  // Only run dashboard logic if dashboard/logout elements exist
  if (logoutBtn && userNameSpan) {
    // On dashboard, redirect to index.html if not signed in, else show username
    onAuthStateChanged(auth, user => {
      if (!user) {
        window.location.href = 'index.html';
      } else {
        userNameSpan.textContent = user.email.split('@')[0];
      }
    });

    // Logout button
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.href = 'index.html';
    });
  }

});
