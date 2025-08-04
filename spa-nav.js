// spa-nav.js
document.addEventListener('DOMContentLoaded', () => {
  const tabs = [
    { navId: 'nav-dashboard', sectionId: 'dashboard-section' },
    { navId: 'nav-workout', sectionId: 'workout-section' },
    { navId: 'nav-food', sectionId: 'food-section' },
    { navId: 'nav-trainer', sectionId: 'trainer-section' },
    { navId: 'nav-profile', sectionId: 'profile-section' }
  ];

  function showTab(idxToShow) {
    tabs.forEach(({ navId, sectionId }, idx) => {
      const navEl = document.getElementById(navId);
      const secEl = document.getElementById(sectionId);
      if (navEl) navEl.classList.toggle('active', idx === idxToShow);
      if (secEl) secEl.style.display = idx === idxToShow ? 'block' : 'none';
    });
    // When Dashboard is shown, fetch all summaries
    if (tabs[idxToShow].navId === 'nav-dashboard') {
      if (window.loadDashboardTrainerBookings) window.loadDashboardTrainerBookings();
      if (window.loadDashboardLatestWorkout) window.loadDashboardLatestWorkout();
      if (window.loadDashboardLatestFoodOrder) window.loadDashboardLatestFoodOrder();
    }
  }

  tabs.forEach(({ navId }, idx) => {
    const navEl = document.getElementById(navId);
    if (navEl) {
      navEl.addEventListener('click', e => {
        e.preventDefault();
        showTab(idx);

        // Optional: Section-specific hooks
        if (navId === 'nav-workout' && typeof window.renderWorkoutUI === 'function') {
          window.renderWorkoutUI();
        }
        if (navId === 'nav-food' && typeof window.renderFoodOrder === 'function') {
          window.renderFoodOrder();
        }
        // ...add more hooks if needed
      });
    }
  });
  // Default: Dashboard shown
  showTab(0);
  if (window.loadDashboardTrainerBookings) window.loadDashboardTrainerBookings();
  if (window.loadDashboardLatestWorkout) window.loadDashboardLatestWorkout();
  if (window.loadDashboardLatestFoodOrder) window.loadDashboardLatestFoodOrder();


});
