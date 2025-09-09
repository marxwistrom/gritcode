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

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
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
        const response = await fetch('http://localhost:3000/api/e', {
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
function waitForAuthAndCheck() {
    return new Promise((resolve) => {
        const checkAuth = () => {
            if (window.auth && typeof window.auth.isLoggedIn === 'function') {
                // Auth is loaded, now check if user is logged in
                console.log('Auth module loaded, checking login status...');

                // Debug localStorage state
                if (window.auth.debugLocalStorage) {
                    window.auth.debugLocalStorage();
                }

                console.log('Current user in auth:', window.auth.currentUser);
                console.log('Is logged in:', window.auth.isLoggedIn());

                // Check if user is logged in via auth module OR fallback to localStorage
                let userLoggedIn = window.auth.isLoggedIn();

                // Fallback: check localStorage directly if auth module isn't ready
                if (!userLoggedIn) {
                    try {
                        const storedUser = localStorage.getItem('capture_reality_user');
                        if (storedUser) {
                            const parsedUser = JSON.parse(storedUser);
                            console.log('Fallback check found user in localStorage:', parsedUser);
                            userLoggedIn = true;
                        }
                    } catch (error) {
                        console.log('Fallback localStorage check failed:', error);
                    }
                }

                if (!userLoggedIn) {
                    console.log('User not logged in, redirecting to login');
                    window.location.href = 'login.html';
                } else {
                    console.log('User is logged in, initializing main app');
                    initializeMainApp();
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

    logoutBtn.onclick = (e) => {
        e.preventDefault();
        if (window.auth && window.auth.logout) {
            console.log('Logging out user');
            window.auth.logout();
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
