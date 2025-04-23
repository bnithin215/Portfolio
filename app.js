const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const darkModeToggle = document.getElementById('darkModeToggle');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
