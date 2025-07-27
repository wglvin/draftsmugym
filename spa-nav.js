// spa-nav.js
document.addEventListener('DOMContentLoaded', () => {
  const tabs = [
    { btn: 'nav-dashboard', section: 'dashboard-section' },
    { btn: 'nav-workout', section: 'workout-section' },
    { btn: 'nav-food', section: 'food-section' },
    { btn: 'nav-trainer', section: 'trainer-section' }
  ];

  tabs.forEach(({ btn, section }) => {
    const navBtn = document.getElementById(btn);
    const sec = document.getElementById(section);
    if (navBtn && sec) {
      navBtn.addEventListener('click', e => {
        e.preventDefault();
        tabs.forEach(({ btn: b, section: s }) => {
          document.getElementById(b)?.classList.remove('active');
          document.getElementById(s)?.style.setProperty('display', 'none');
        });
        navBtn.classList.add('active');
        sec.style.display = 'block';
      });
    }
  });

  // Initially, show only dashboard
  tabs.forEach(({ section, btn }, idx) => {
    const sec = document.getElementById(section);
    const navBtn = document.getElementById(btn);
    if (sec && navBtn) {
      sec.style.display = idx === 0 ? 'block' : 'none';
      if (idx === 0) navBtn.classList.add('active');
      else navBtn.classList.remove('active');
    }
  });
});
