// Authentication utilities and session management

/**
 * Authentication class for managing user sessions
 */
class Auth {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'capture_reality_user';
        this.init();
    }

    /**
     * Initialize authentication state
     */
    init() {
        // Check if user is already logged in from session storage
        const storedUser = this.getStoredUser();
        if (storedUser) {
            this.currentUser = storedUser;
        }
    }

    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Login result
     */
    async login(email, password) {
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Create user object
                const user = {
                    email: email,
                    name: data.user?.name || 'User',
                    role: data.user?.role || 'user',
                    loggedInAt: new Date().toISOString()
                };

                this.currentUser = user;
                this.storeUser(user);

                return { success: true, user: user };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Logout current user
     */
    logout() {
        this.currentUser = null;
        this.clearStoredUser();
        window.location.href = 'login.html';
    }

    /**
     * Check if user is logged in
     * @returns {boolean} Login status
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * Get current user
     * @returns {Object|null} Current user object
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if current user has specific role
     * @param {string} role - Role to check
     * @returns {boolean} Whether user has role
     */
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    /**
     * Store user in session storage
     * @param {Object} user - User object to store
     */
    storeUser(user) {
        try {
            sessionStorage.setItem(this.sessionKey, JSON.stringify(user));
        } catch (error) {
            console.error('Error storing user:', error);
        }
    }

    /**
     * Get stored user from session storage
     * @returns {Object|null} Stored user object
     */
    getStoredUser() {
        try {
            const stored = sessionStorage.getItem(this.sessionKey);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error retrieving stored user:', error);
            return null;
        }
    }

    /**
     * Clear stored user from session storage
     */
    clearStoredUser() {
        try {
            sessionStorage.removeItem(this.sessionKey);
        } catch (error) {
            console.error('Error clearing stored user:', error);
        }
    }

    /**
     * Require authentication for a page
     * Redirects to login if not authenticated
     */
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    /**
     * Prevent access to login page if already authenticated
     * Redirects to index if already logged in
     */
    preventAuthPage() {
        if (this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
}

// Create global auth instance
const auth = new Auth();

// Export for use in other modules
window.Auth = Auth;
window.auth = auth;

// Auto-initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth initialized');

    // Check authentication status
    if (auth.isLoggedIn()) {
        console.log('User is logged in:', auth.getCurrentUser());
    } else {
        console.log('User is not logged in');
    }
});

export default auth;
