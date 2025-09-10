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


//Gör navigationen något mer genomskinlig när användaren scrollar ner
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(15, 15, 35, 0.98)';
    } else {
        navbar.style.background = 'rgba(15, 15, 35, 0.95)';
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};
// Skapar en IntersectionObserver som övervakar när element kommer in i vy
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Applicerar på alla sektioner utom hero dvs intro sidan
document.querySelectorAll('section:not(.hero)').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

document.addEventListener('DOMContentLoaded', async () => {
    // Let the auth module handle authentication checks
    if (window.auth) {
        await window.auth.requireAuth();
    } else {
        // Fallback if auth module isn't loaded yet
        setTimeout(async () => {
            if (window.auth) {
                await window.auth.requireAuth();
            }
        }, 500);
    }
});
    const toggleBtn = document.querySelector('.toggle-form-btn');
    const contactContent = document.querySelector('.contact-content');
    const contactForm = document.getElementById('contact-form');

    contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted'); // Add this log

    const formData = {
        date: document.getElementById('date').value,
        place: document.getElementById('place').value,
        title: document.getElementById('title').value,
        story: document.getElementById('story').value
    };
    console.log('Form data being sent:', formData); // Add this log

    try {
        const response = await fetch('http://localhost:4000/api/e', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status); // Add this log
        const responseData = await response.json();
        console.log('Response data:', responseData); // Add this log

        if (!response.ok) {
            throw new Error('Failed to save memory');
        }

        showSuccessMessage('Memory saved successfully!');
        contactForm.reset();
        contactContent.classList.add('hidden');
        toggleBtn.textContent = 'Save Your Memory';

    } catch (error) {
        console.error('Detailed error:', error); // Add this log
        showErrorMessage('Failed to save memory');
    }
});

    // Ensure form is hidden on page load
    if (contactContent) {
        contactContent.classList.add('hidden');
    }

    // Toggle form visibility when button is clicked
    toggleBtn.addEventListener('click', () => {
        contactContent.classList.toggle('hidden');
        toggleBtn.textContent = contactContent.classList.contains('hidden') 
            ? 'Save Your Memory' 
            : 'Close Form';
    });


    function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('success-message');
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error-message');
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Old authentication check removed - now using auth module

// Wait for auth module to load and then check authentication
async function waitForAuthAndCheck() {
    return new Promise((resolve) => {
        const checkAuth = async () => {
            if (window.auth && typeof window.auth.requireAuth === 'function') {
                // Auth is loaded, use requireAuth to check and handle redirects
                console.log('Auth module loaded, checking authentication...');

                const isAuthenticated = await window.auth.requireAuth();

                if (isAuthenticated) {
                    console.log('User is authenticated, initializing main app');
                    initializeMainApp();
                } else {
                    console.log('User not authenticated, redirect handled by requireAuth');
                }
                resolve();
            } else {
                // Auth not ready yet, check again in 100ms
                setTimeout(checkAuth, 100);
            }
        };
        // Add initial delay to ensure auth module has time to initialize
        setTimeout(() => checkAuth(), 150);
    });
}

// Initialize the main application features
function initializeMainApp() {
    // Add logout functionality to navigation
    addLogoutButton();

    // Add any other main app initialization here
    console.log('Main app initialized successfully');
}

// Add logout button to navigation
function addLogoutButton() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) {
        console.warn('Navigation menu not found');
        return;
    }

    // Create logout button
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.textContent = 'Logout';
    logoutBtn.style.cssText = `
        color: #60a5fa;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.3s ease;
        margin-left: 1rem;
        cursor: pointer;
    `;

    logoutBtn.onmouseover = () => logoutBtn.style.color = '#3b82f6';
    logoutBtn.onmouseout = () => logoutBtn.style.color = '#60a5fa';

    logoutBtn.onclick = async (e) => {
        e.preventDefault();
        if (window.auth && window.auth.logout) {
            console.log('Logging out user');
            await window.auth.logout();
        } else {
            console.warn('Auth module not available for logout');
        }
    };

    // Add to navigation
    navMenu.appendChild(logoutBtn);
    console.log('Logout button added to navigation');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Main.js loaded, waiting for auth module...');
    waitForAuthAndCheck();
});

// Export for use in other files
export { waitForAuthAndCheck, initializeMainApp, addLogoutButton };

// User Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const userIcon = document.getElementById('userIcon');
    const userDropdown = document.getElementById('userDropdown');
    
    // Toggle user menu
    userIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
        
        // Close other menus if open
        document.querySelectorAll('.user-dropdown').forEach(dropdown => {
            if (dropdown !== userDropdown) {
                dropdown.classList.remove('active');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!userIcon.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && userDropdown.classList.contains('active')) {
            userDropdown.classList.remove('active');
        }
    });
    
    // Add smooth transitions to menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
    });
    
    // Handle menu item clicks
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Close menu after clicking
            userDropdown.classList.remove('active');
            
            // You can add specific functionality for each menu item here
            const text = this.textContent.trim();
            
            switch(text) {
                case 'My Profile':
                    console.log('Navigate to profile');
                    break;
                case 'Settings':
                    console.log('Open settings');
                    break;
                case 'Analytics':
                    console.log('Show analytics');
                    break;
                case 'My Memories':
                    console.log('Show memories');
                    break;
                case 'Appearance':
                    console.log('Open appearance settings');
                    break;
                case 'Sign Out':
                    console.log('Sign out user');
                    break;
            }
        });
    });
});
