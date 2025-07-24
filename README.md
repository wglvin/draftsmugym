# SMU Gymnasium Workout Tracker – README

## 🚀 Overview

This is a modern web app for the Singapore Management University (SMU) Gymnasium, allowing authenticated users to:
- **Log their workouts** (strength & cardio)
- **See their own workout history** (in grouped, SMU-branded cards)
- **Sign up / Log in** securely (using Firebase Auth)
- All workouts stored privately in the cloud (Firebase Firestore)
- Clean SMU-styled dashboard, with modal login/signup and responsive UI

## 🛠 How to Run Locally

1. **Clone or copy all project files** (`index.html`, `dashboard.html`, `firebase-config.js`, `auth.js`, `app.js`, `styles.css`)

2. **Install Python (if not already)** (Python 3 recommended).

3. **Start a local server** in your project folder.  
   In command prompt or terminal:
   ```
   python -m http.server 8000
   ```
   (You can also use VSCode’s Live Server or any static host.)

4. **Visit the site** in your browser at:  
   ```
   http://localhost:8000/
   ```

5. **Sign up / Log in**  
   Click the "Login / Sign Up" button (top-right), then use the modal to create an account or sign in.

6. **Log your workouts**  
   Once logged in, you’ll be redirected to the dashboard page where you can:
   - Select an exercise type (strength/cardio)
   - Enter sets/reps/weight OR duration/distance as appropriate
   - Submit and see your entries appear in grouped tables

## 🔐 Dependencies

- Cloud: [Firebase Authentication](https://firebase.google.com/docs/auth) and [Cloud Firestore](https://firebase.google.com/docs/firestore)
- Front-end: Vanilla HTML/CSS/JS (no frameworks)
- CDN imports for Firebase JS SDK (v10+)
- No build system or bundler required

## 💡 Functionality

| Feature           | Details                                                                                       |
|-------------------|----------------------------------------------------------------------------------------------|
| **Sign up/Log in**| Secure modal (Firebase): Email/password, all user data private                               |
| **Log workout**   | Choose exercise (Bench Press, Squat, Treadmill, etc.), input correct fields per type         |
| **Strength**      | Input: Weight (kg), Reps, Sets. Calculates volume and displays sets per session              |
| **Cardio**        | Input: Duration (min), Distance (km). No weight/reps for Treadmill/Elliptical, etc.          |
| **History**       | Grouped cards, one per exercise, latest first. Nicely styled with SMU color palette.         |
| **Responsive**    | Looks good on desktop and mobile                                                             |

## ⚡️ Dev Tips & Troubleshooting

- ALL Firebase config values must match your project (from Firebase Console).
- Make sure you create and enable Firestore (database) and enable Email/Password sign-in in your Firebase project.
- If you run into issues connecting to Firestore: check your network, Firestore security rules, and ensure you’re not running from `file://`.
- You can deploy to Vercel/Netlify just by uploading your static files; no server-code needed.

## 📁 Project Structure

```
.
├── index.html            # Homepage with SMU info & modal login/signup
├── dashboard.html        # Authenticated user dashboard
├── styles.css            # All styles (SMU branding + dashboard cards)
├── firebase-config.js    # Firebase config & initialization
├── auth.js               # Auth modal logic (homepage)
├── auth-dashboard.js     # Auth state/logout logic (dashboard)
├── app.js                # Dashboard workout log/history logic
└── (gym.png, icons etc)  # Optional static images/icons
```

## 🙋‍♂️ Questions?

- **Need to add new exercise types?**  
  Edit the `EXERCISES` array in `app.js`.
- **Want to change field appearance?**  
  Tweak `styles.css` as desired.
- **Need group workouts by date, or analytics?**  
  Expand `app.js` logic (ask for code sample😉).
- **Trouble signing in/logging workouts?**  
  Double-check Firebase setup and your local server status.

**Enjoy your SMU Gym workout tracker!**  
— If you want to extend or enhance further, just ask!