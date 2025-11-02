// DOM Elements
const header = document.querySelector('.header');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const themeToggle = document.querySelector('.theme-toggle');
const themeToggleMobile = document.querySelector('.theme-toggle-mobile');
const navLinks = document.querySelectorAll('.nav-link');
const progressBar = document.querySelector('.progress');
const backToTop = document.querySelector('.back-to-top');
const yearElement = document.getElementById('current-year');
const contactForm = document.getElementById('contact-form');

// GitHub Configuration
const GITHUB_USERNAME = 'bnithin215'; // Your GitHub username
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// Projects loading elements
const projectsGrid = document.getElementById('projects-grid');
const projectsLoading = document.getElementById('projects-loading');
const projectsError = document.getElementById('projects-error');
const sortSelect = document.getElementById('sort-select');

// Store all repositories
let allRepositories = [];

// Initialize the site
function init() {
    // Set current year in footer
    yearElement.textContent = new Date().getFullYear();

    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcons(true);
    }

    // Set up initial scroll progress
    updateScrollProgress();

    // Set up initial active nav item
    updateActiveNavOnScroll();

    // Initialize animations when elements are in view
    initializeAnimations();

    // Fetch GitHub projects
    fetchGitHubProjects();

    // Add sort event listener
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
}

// Handle sort selection change
function handleSortChange() {
    const sortValue = sortSelect.value;
    sortAndDisplayProjects(allRepositories, sortValue);
}

// Sort and display projects based on selected option
function sortAndDisplayProjects(repos, sortBy = 'latest') {
    let sortedRepos = [...repos];

    switch(sortBy) {
        case 'latest':
            sortedRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            break;
        case 'oldest':
            sortedRepos.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
            break;
        case 'stars':
            sortedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            break;
        case 'name':
            sortedRepos.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            sortedRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    displayProjects(sortedRepos);
}

// Fetch projects from GitHub
async function fetchGitHubProjects() {
    try {
        // Show loading state
        projectsLoading.style.display = 'flex';
        projectsError.style.display = 'none';
        projectsGrid.innerHTML = '';

        const response = await fetch(GITHUB_API_URL, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }

        const repos = await response.json();

        // Filter out forked repos and store all repositories
        allRepositories = repos.filter(repo => !repo.fork);

        // Hide loading state
        projectsLoading.style.display = 'none';

        // Display projects with default sort (latest first)
        if (allRepositories.length === 0) {
            projectsGrid.innerHTML = '<p class="no-projects">No projects found.</p>';
        } else {
            sortAndDisplayProjects(allRepositories, 'latest');
        }

    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        projectsLoading.style.display = 'none';
        projectsError.style.display = 'flex';
    }
}

// Display projects in the grid
function displayProjects(repos) {
    projectsGrid.innerHTML = '';

    repos.forEach(repo => {
        const projectCard = createProjectCard(repo);
        projectsGrid.appendChild(projectCard);
    });
}

// Create a project card element
function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Get repository languages
    const languages = repo.language ? [repo.language] : [];

    // Determine project image (you can customize this logic)
    const projectImage = getProjectImage(repo.name);

    card.innerHTML = `
        <div class="project-image">
            <img src="${projectImage}" alt="${repo.name}" onerror="this.src='https://via.placeholder.com/400x300/4f46e5/ffffff?text=${encodeURIComponent(repo.name)}'">
            <div class="project-overlay">
                <a href="${repo.html_url}" class="project-link" target="_blank" rel="noopener noreferrer">View Project</a>
                ${repo.homepage ? `<a href="${repo.homepage}" class="project-link" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ''}
            </div>
        </div>
        <div class="project-info">
            <h3 class="project-title">${repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
            <p class="project-description">${repo.description || 'No description available'}</p>
            <div class="project-tags">
                ${languages.map(lang => `<span class="tag">${lang}</span>`).join('')}
                ${repo.topics && repo.topics.length > 0 ? repo.topics.slice(0, 3).map(topic => `<span class="tag">${topic}</span>`).join('') : ''}
            </div>
            <div class="project-stats">
                <span class="stat"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                <span class="stat"><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                ${repo.size ? `<span class="stat"><i class="fas fa-database"></i> ${formatSize(repo.size)}</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

// Get project image based on repo name (customize this for your specific projects)
function getProjectImage(repoName) {
    const imageMap = {
        'bonafide-certificate-generator': 'imgprj.png',
        'ai-chatbot': 'Aichat.png',
        'aichat': 'Aichat.png',
        // Add more mappings as needed
    };

    const normalizedName = repoName.toLowerCase().replace(/[-_]/g, '');

    // Check if we have a specific image for this repo
    for (const [key, value] of Object.entries(imageMap)) {
        if (normalizedName.includes(key.toLowerCase().replace(/[-_]/g, ''))) {
            return value;
        }
    }

    // Default placeholder image
    return `https://via.placeholder.com/400x300/4f46e5/ffffff?text=${encodeURIComponent(repoName)}`;
}

// Format repository size
function formatSize(kb) {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

// Toggle mobile menu
function toggleMobileMenu() {
    mobileNav.classList.toggle('mobile-nav-active');
    const menuIcon = mobileMenuToggle.querySelector('i');

    if (mobileNav.classList.contains('mobile-nav-active')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-times');
    } else {
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');

    // Update icons
    updateThemeIcons(isDarkMode);

    // Save preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Update theme toggle icons
function updateThemeIcons(isDarkMode) {
    if (isDarkMode) {
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
        themeToggleMobile.querySelector('i').classList.remove('fa-moon');
        themeToggleMobile.querySelector('i').classList.add('fa-sun');
    } else {
        themeToggle.querySelector('i').classList.remove('fa-sun');
        themeToggle.querySelector('i').classList.add('fa-moon');
        themeToggleMobile.querySelector('i').classList.remove('fa-sun');
        themeToggleMobile.querySelector('i').classList.add('fa-moon');
    }
}

// Update scroll progress bar
function updateScrollProgress() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const totalScrollable = docHeight - windowHeight;
    const scrollPercentage = (scrollPosition / totalScrollable) * 100;

    progressBar.style.width = `${scrollPercentage}%`;

    // Show/hide back to top button
    if (scrollPosition > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

// Update active navigation item based on scroll position
function updateActiveNavOnScroll() {
    const sections = ['home', 'about', 'skills', 'projects', 'contact'];

    // Get current scroll position
    const scrollPosition = window.scrollY + window.innerHeight / 2;

    // Find the current section
    for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (!section) continue;

        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));

            // Add active class to corresponding nav links
            document.querySelectorAll(`.nav-link[href="#${sectionId}"]`).forEach(link => {
                link.classList.add('active');
            });

            break;
        }
    }
}

// Initialize animations when elements are in view
function initializeAnimations() {
    // Observe sections for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const formValues = Object.fromEntries(formData.entries());

    // Basic validation
    let isValid = true;
    const requiredFields = ['name', 'email', 'message'];

    requiredFields.forEach(field => {
        const input = contactForm.elements[field];
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--error-color)';
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.email)) {
        isValid = false;
        contactForm.elements.email.style.borderColor = 'var(--error-color)';
    }

    if (isValid) {
        // In a real app, you would send the form data to your server here
        // For this example, we'll just log the data and show a success message

        console.log('Form data:', formValues);

        // Clear form
        contactForm.reset();

        // Show success message (in a real app, you might use a nicer notification system)
        alert('Thank you for your message! I will get back to you soon.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init);
mobileMenuToggle.addEventListener('click', toggleMobileMenu);
themeToggle.addEventListener('click', toggleDarkMode);
themeToggleMobile.addEventListener('click', toggleDarkMode);
window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('scroll', updateActiveNavOnScroll);
contactForm.addEventListener('submit', handleFormSubmit);

// Close mobile menu when clicking a link
mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Add offset for header
            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});