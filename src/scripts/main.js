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

// Contact form functionality
function initializeContactForm() {
    const toggleBtn = document.querySelector('.toggle-form-btn');
    const contactContent = document.querySelector('.contact-content');
    const contactForm = document.getElementById('contact-form');

    if (!contactForm || !toggleBtn || !contactContent) {
        console.warn('Contact form elements not found');
        return;
    }

    // Ensure form is hidden on page load
    contactContent.classList.add('hidden');

    // Handle form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted');

        const formData = {
            date: document.getElementById('date').value,
            place: document.getElementById('place').value,
            title: document.getElementById('title').value,
            story: document.getElementById('story').value
        };
        console.log('Form data being sent:', formData);

        try {
            const response = await fetch('http://localhost:4000/api/e', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (!response.ok) {
                throw new Error('Failed to save memory');
            }

            showSuccessMessage('Memory saved successfully!');
            contactForm.reset();
            contactContent.classList.add('hidden');
            toggleBtn.textContent = 'Save Your Memory';

        } catch (error) {
            console.error('Detailed error:', error);
            showErrorMessage('Failed to save memory');
        }
    });

    // Toggle form visibility when button is clicked
    toggleBtn.addEventListener('click', () => {
        contactContent.classList.toggle('hidden');
        toggleBtn.textContent = contactContent.classList.contains('hidden')
            ? 'Save Your Memory'
            : 'Close Form';
    });
}


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

// Authentication and initialization functions
async function waitForAuthAndCheck() {
    return new Promise((resolve) => {
        const checkAuth = async () => {
            if (window.auth && typeof window.auth.requireAuth === 'function') {
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

function initializeMainApp() {
    // Initialize contact form functionality
    initializeContactForm();

    // Add logout functionality to navigation
    addLogoutButton();

    console.log('Main app initialized successfully');
}

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
        console.log('Logout button clicked - calling simple logout approach');

        try {
            // Call server logout endpoint
            console.log('Calling server logout endpoint...');
            await fetch('http://localhost:4000/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            console.log('Server logout completed');

            // Show success message
            showSuccessMessage('Logged out successfully!');

            // Redirect to login page after short delay
            setTimeout(() => {
                console.log('Redirecting to login page...');
                window.location.href = '/login';
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
            showErrorMessage('Logout failed, but redirecting anyway...');

            // Still redirect even if server call fails
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }
    };

    // Add to navigation
    navMenu.appendChild(logoutBtn);
    console.log('Logout button added to navigation');
}


// User Menu Toggle Functionality
function initializeUserMenu() {
    let userIcon = document.getElementById('userIcon');
    let userDropdown = document.getElementById('userDropdown');

    console.log('=== INITIALIZING USER MENU ===');
    console.log('User icon element:', userIcon);
    console.log('User dropdown element:', userDropdown);
    console.log('User icon found:', !!userIcon);
    console.log('User dropdown found:', !!userDropdown);

    if (!userIcon || !userDropdown) {
        console.warn('❌ User menu elements not found - trying fallback selectors');

        // Try to find elements by different selectors as fallback
        const alternativeIcon = document.querySelector('.user-icon');
        const alternativeDropdown = document.querySelector('.user-dropdown');
        console.log('Alternative user icon:', alternativeIcon);
        console.log('Alternative user dropdown:', alternativeDropdown);

        if (alternativeIcon && alternativeDropdown) {
            console.log('✅ Using alternative selectors for menu elements');
            // Use the alternative elements and continue
            userIcon = alternativeIcon;
            userDropdown = alternativeDropdown;
        } else {
            console.error('❌ No menu elements found with any selector - menu functionality disabled');

            // Try again in 1 second in case DOM wasn't ready
            setTimeout(() => {
                console.log('🔄 Retrying menu initialization in 1 second...');
                initializeUserMenu();
            }, 1000);

            return;
        }
    }

    console.log('✅ User menu elements found - proceeding with initialization');

    // Toggle user menu
    userIcon.addEventListener('click', function(e) {
        console.log('User icon clicked');
        e.stopPropagation();

        const wasActive = userDropdown.classList.contains('active');
        userDropdown.classList.toggle('active');
        console.log('Dropdown toggled:', !wasActive ? 'opened' : 'closed');

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
    console.log('Found menu items:', menuItems.length);
    menuItems.forEach((item, index) => {
        console.log(`Menu item ${index}:`, item.textContent.trim());
        item.style.animationDelay = `${index * 0.05}s`;
    });

    // Handle menu item clicks
    menuItems.forEach(item => {
        item.addEventListener('click', async function(e) {
            console.log('Menu item element clicked:', this);
            console.log('Menu item HTML:', this.innerHTML);
            console.log('Menu item textContent:', this.textContent);

            // Close menu after clicking
            userDropdown.classList.remove('active');

            // Extract clean text from menu item (handle emoji + text with whitespace)
            let text = this.textContent.replace(/\s+/g, ' ').trim();
            console.log('Menu item clicked - processed text:', text);

            // Also try extracting just the text spans if the above doesn't work
            const textSpans = this.querySelectorAll('span:not(.menu-icon)');
            if (textSpans.length > 0) {
                const spanText = Array.from(textSpans).map(span => span.textContent.trim()).join(' ');
                console.log('Menu item clicked - span text:', spanText);
                if (spanText) {
                    text = spanText;
                }
            }

            console.log('Final text for switch statement:', text);

            switch(text) {
                case 'My Profile':
                    console.log('Navigate to profile');
                    break;
                case 'Settings':
                    console.log('Open settings');
                    break;
                case 'Gallery':
                    console.log('Show gallery');
                    break;
                case 'My Memories':
                    console.log('Show memories');
                    break;
                case 'Appearance':
                    console.log('Open appearance settings');
                    break;
                case 'Sign Out':
                case '🚪 Sign Out':
                    console.log('✅ SIGN OUT DETECTED - calling logout function');

                    // Simple logout without auth module dependency
                    try {
                        // Call server logout endpoint
                        console.log('Calling server logout endpoint...');
                        await fetch('http://localhost:4000/api/logout', {
                            method: 'POST',
                            credentials: 'include'
                        });
                        console.log('Server logout completed');

                        // Clear any local storage/session storage if needed
                        // localStorage.removeItem('user');
                        // sessionStorage.clear();

                        // Show success message
                        showSuccessMessage('Logged out successfully!');

                        // Redirect to login page after short delay
                        setTimeout(() => {
                            console.log('Redirecting to login page...');
                            window.location.href = '/login';
                        }, 1000);

                    } catch (error) {
                        console.error('Logout error:', error);
                        showErrorMessage('Logout failed, but redirecting anyway...');

                        // Still redirect even if server call fails
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 1000);
                    }
                    break;
            }
        });
    });
}

// Single consolidated DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('Main.js loaded, initializing application...');
    console.log('Auth module available at load:', !!window.auth);

    // Initialize user menu functionality
    console.log('About to initialize user menu...');
    initializeUserMenu();

    // Start authentication check and app initialization
    waitForAuthAndCheck();
});

// Export for use in other files
export { waitForAuthAndCheck, initializeMainApp, addLogoutButton, initializeContactForm, initializeUserMenu };
