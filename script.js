// DOM Elements
const header = document.querySelector('.header');
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-links a');

// Theme Toggle
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        updateThemeIcon();
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    });

    function updateThemeIcon() {
        const icon = themeToggle.querySelector('i');
        const currentTheme = body.getAttribute('data-theme');
        icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
});

// Component loading utility
const loadComponent = async (url, elementId) => {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Element with id '${elementId}' not found`);
            return;
        }

        // For local development, use XMLHttpRequest instead of fetch
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    element.innerHTML = xhr.responseText;
                    
                    // Reinitialize event listeners for newly loaded components
                    if (url === 'header.html') {
                        initializeNavbar();
                    }
                } else {
                    console.error(`Error loading ${url}: HTTP ${xhr.status}`);
                    element.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <p>Error loading component. Please check the file path.</p>
                        </div>
                    `;
                }
            }
        };
        xhr.send();
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading component. Please check the file path.</p>
                </div>
            `;
        }
    }
};

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize AOS
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });

        // Initialize features
        initializeFeatures();
        
        // Initialize projects if grid exists
        const projectsGrid = document.querySelector('.projects-grid');
        if (projectsGrid) {
            displayProjects();
            setupProjectFilters();
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Initialize all features
function initializeFeatures() {
    // Only initialize if elements exist
    const navbar = document.querySelector('.nav-links');
    const progressBar = document.querySelector('.progress-bar');
    const themeToggle = document.querySelector('.theme-toggle');

    if (navbar) {
        initializeNavbar();
    }
    
    if (progressBar) {
        initializeScrollProgress();
    }
    
    if (themeToggle) {
        initializeTheme();
    }
}

// Initialize navbar functionality
function initializeNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const themeToggle = document.querySelector('.theme-toggle');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // Set initial theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

// Initialize scroll progress
function initializeScrollProgress() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

// Loading Animation
const loader = document.querySelector('.loader');
if (loader) {
    window.addEventListener('load', () => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    });
}


// Blog Section
const MEDIUM_FEED_URL = 'https://medium.com/feed/@ravipatel84184';
const POSTS_PER_PAGE = 3;
let currentPage = 1;
let allPosts = [];

async function fetchMediumPosts() {
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            allPosts = data.items.map(post => ({
                title: post.title,
                link: post.link,
                description: post.description,
                pubDate: new Date(post.pubDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                categories: post.categories || []
            }));
            
            displayPosts(currentPage);
            setupPagination();
        }
    } catch (error) {
        console.error('Error fetching Medium posts:', error);
        showError();
    }
}

function displayPosts(page) {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;

    const start = (page - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const postsToShow = allPosts.slice(start, end);

    blogGrid.innerHTML = postsToShow.map(post => `
        <div class="blog-card" data-aos="fade-up">
            <div class="blog-image">
                <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                     alt="${post.title}">
            </div>
            <div class="blog-content">
                <h3 class="blog-title">${post.title}</h3>
                <div class="blog-meta">
                    <div class="blog-date">
                        <i class="fas fa-calendar"></i>
                        ${post.pubDate}
                    </div>
                    <div class="blog-categories">
                        ${post.categories.map(category => `
                            <span class="blog-category">${category}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function setupPagination() {
    const pagination = document.querySelector('.blog-pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
    pagination.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    pagination.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => changePage(i);
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => changePage(currentPage + 1);
    pagination.appendChild(nextBtn);
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(allPosts.length / POSTS_PER_PAGE)) return;
    
    currentPage = page;
    displayPosts(currentPage);
    setupPagination();
}

function showError() {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;

    blogGrid.innerHTML = `
        <div class="blog-error" data-aos="fade-up">
            <i class="fas fa-exclamation-circle"></i>
            <p>Failed to load blog posts. Please try again later.</p>
        </div>
    `;
}

// Initialize blog if the section exists
if (document.querySelector('.blog')) {
    fetchMediumPosts();
}

// Scroll Progress Indicator
const progressBar = document.querySelector('.progress-bar');
if (progressBar) {
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = document.querySelector('.header').offsetHeight;
            const elementPosition = targetElement.offsetTop;
            const offsetPosition = elementPosition - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Project Details Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the project details page
    if (document.querySelector('.project-details')) {
        initializeProjectDetails();
    }
});

function initializeProjectDetails() {
    // Initialize AOS for project details page
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
        easing: 'ease-out-cubic'
    });

    // Handle image gallery
    const mainImage = document.querySelector('.main-image img');
    const thumbnails = document.querySelectorAll('.thumbnail-gallery img');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            mainImage.src = thumb.src;
            mainImage.alt = thumb.alt;
            
            // Add animation class
            mainImage.classList.add('scale-in');
            setTimeout(() => {
                mainImage.classList.remove('scale-in');
            }, 500);
        });
    });

    // Handle project navigation
    const prevBtn = document.querySelector('.prev-project');
    const nextBtn = document.querySelector('.next-project');

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateProject('prev');
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateProject('next');
        });
    }

    // Add smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // Add reading time estimation
    const content = document.querySelector('.project-content');
    if (content) {
        const text = content.textContent;
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
        const readingTimeElement = document.createElement('div');
        readingTimeElement.className = 'reading-time';
        readingTimeElement.innerHTML = `<i class="fas fa-clock"></i> ${readingTime} min read`;
        document.querySelector('.project-meta').appendChild(readingTimeElement);
    }

    // Add copy code functionality for code snippets
    document.querySelectorAll('pre code').forEach((codeBlock) => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            });
        });

        codeBlock.parentNode.insertBefore(copyButton, codeBlock);
    });
}

function navigateProject(direction) {
    // Get current project ID from URL
    const currentUrl = window.location.href;
    const currentId = parseInt(currentUrl.split('/').pop().replace('.html', ''));
    
    // Calculate next/prev project ID
    const newId = direction === 'next' ? currentId + 1 : currentId - 1;
    
    // Check if project exists (you would need to implement this check based on your project structure)
    if (projectExists(newId)) {
        window.location.href = `project-${newId}.html`;
    } else {
        // If no more projects in that direction, disable the button
        const btn = direction === 'next' ? document.querySelector('.next-project') : document.querySelector('.prev-project');
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
}

function projectExists(id) {
    // This is a placeholder function. You would need to implement actual project existence check
    // For example, you could have an array of project IDs or make an API call
    return id > 0 && id < 10; // Example: assuming we have projects 1-9
}

// Add styles for new elements
const style = document.createElement('style');
style.textContent = `
    .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        z-index: 1000;
        transition: width 0.1s ease;
    }

    .reading-time {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--light-text);
        font-size: 0.9rem;
    }

    .copy-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.5rem;
        background: var(--card-bg);
        border: none;
        border-radius: 5px;
        cursor: pointer;
        color: var(--text-color);
        transition: var(--transition);
    }

    .copy-button:hover {
        background: var(--primary-color);
        color: white;
    }

    .scale-in {
        animation: scaleIn 0.5s ease;
    }

    @keyframes scaleIn {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Scroll Progress Indicator
const scrollProgress = () => {
    const progressBar = document.querySelector('.progress-bar');
    const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${progress}%`;
};

window.addEventListener('scroll', scrollProgress);
window.addEventListener('load', scrollProgress);

// Project loading and display functionality
const projects = [
    {
        id: 1,
        title: "E-Commerce Mobile App",
        category: "Flutter",
        date: "2023",
        description: "A full-featured e-commerce mobile application built with Flutter, featuring product listings, shopping cart, and secure payment integration.",
        image: "images/projects/ecommerce-app.jpg",
        technologies: ["Flutter", "Firebase", "Stripe", "Provider"],
        demo: "https://demo-ecommerce-app.com",
        github: "https://github.com/username/ecommerce-app"
    },
    {
        id: 2,
        title: "Healthcare Management System",
        category: "Mobile",
        date: "2022",
        description: "A comprehensive healthcare management system for clinics and hospitals, including patient records, appointment scheduling, and telemedicine features.",
        image: "images/projects/healthcare-app.jpg",
        technologies: ["Flutter", "Node.js", "MongoDB", "WebRTC"],
        demo: "https://demo-healthcare-app.com",
        github: "https://github.com/username/healthcare-app"
    },
    {
        id: 3,
        title: "Portfolio Website",
        category: "Web",
        date: "2023",
        description: "A modern, responsive portfolio website showcasing projects and skills with smooth animations and interactive elements.",
        image: "images/projects/portfolio-website.jpg",
        technologies: ["HTML5", "CSS3", "JavaScript", "AOS"],
        demo: "https://demo-portfolio.com",
        github: "https://github.com/username/portfolio"
    }
];

// Initialize projects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for AOS to initialize
    setTimeout(() => {
        displayProjects();
        setupProjectFilters();
    }, 500);
});

// Display projects in the grid
function displayProjects(filter = 'all') {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) {
        // console.error('Projects grid element not found');
        return;
    }

    const filteredProjects = filter === 'all' 
        ? projects 
        : projects.filter(project => project.category.toLowerCase() === filter.toLowerCase());

    if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = '<div class="no-projects">No projects found in this category.</div>';
        return;
    }

    projectsGrid.innerHTML = filteredProjects.map(project => `
        <div class="project-card" data-aos="fade-up">
            <div class="project-image">
                <div class="project-overlay">
                    <a href="${project.demo}" target="_blank" class="project-link" title="View Demo">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <a href="${project.github}" target="_blank" class="project-link" title="View Source">
                        <i class="fab fa-github"></i>
                    </a>
                </div>
            </div>
            <div class="project-info">
                <div class="project-meta">
                    <span class="project-category">${project.category}</span>
                    <span class="project-date">${project.date}</span>
                </div>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `
                        <span class="tech-tag">${tech}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Reinitialize AOS for new elements
    AOS.refresh();
}

// Setup project filters
function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (!filterButtons.length) {
        console.error('Filter buttons not found');
        return;
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Filter and display projects
            const filter = button.getAttribute('data-filter');
            displayProjects(filter);
        });
    });
}

// Mobile Menu Toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
});

// Close menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    });
});

// Add active class to current section
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
});

// Handle scroll events
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (header) {
        // Add/remove scrolled class to header
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}); 