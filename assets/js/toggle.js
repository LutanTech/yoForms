const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

const enableDarkMode = () => {
  body.classList.add('dark-mode');
  localStorage.setItem('darkMode', 'enabled');
  darkModeToggle.innerHTML = '🔆';
};

const disableDarkMode = () => {
  body.classList.remove('dark-mode');
  localStorage.setItem('darkMode', 'disabled');
  darkModeToggle.innerHTML = '🌙';
};

// On page load
if (localStorage.getItem('darkMode') === 'enabled') {
  enableDarkMode();
} else {
  disableDarkMode();
}

darkModeToggle.addEventListener('click', () => {
  const isEnabled = localStorage.getItem('darkMode') === 'enabled';
  if (isEnabled) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
});