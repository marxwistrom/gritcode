// Authentication utilities and session management

/**
 * Authentication class for managing user sessions
 */
class Auth {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'capture_reality_user';
        this.init();
    }

    /**
     * Initialize authentication state
     */
    init() {
        // Delay to ensure localStorage is ready and other scripts have loaded
        setTimeout(() => {
            // Check if user is already logged in from localStorage
            const storedUser = this.getStoredUser();
            if (storedUser) {
                this.currentUser = storedUser;
                console.log('User restored from localStorage:', storedUser);
            } else {
                console.log('No user found in localStorage');
            }
        }, 100); // Increased delay to ensure other scripts are ready
    }

    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Login result
     */
    async login(email, password) {
        try {
            console.log('Attempting login for:', email);
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Login response status:', response.status);
            const data = await response.json();
            console.log('Login response data:', data);

            if (response.ok && data.success) {
                // Create user object
                const user = {
                    email: email,
                    name: data.user?.name || 'User',
                    role: data.user?.role || 'user',
                    loggedInAt: new Date().toISOString()
                };

                console.log('Login successful, user data:', data.user);
                console.log('Created user object:', user);

                this.currentUser = user;
                this.storeUser(user);

                console.log('User stored, currentUser set');
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
        const isLoggedIn = this.currentUser !== null;
        console.log('isLoggedIn() called:', isLoggedIn, 'currentUser:', this.currentUser);
        return isLoggedIn;
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
     * Store user in localStorage
     * @param {Object} user - User object to store
     */
    storeUser(user) {
        try {
            // Check if localStorage is available
            if (typeof Storage === 'undefined') {
                console.error('localStorage is not available');
                return;
            }

            localStorage.setItem(this.storageKey, JSON.stringify(user));
            console.log('User stored in localStorage:', user);
            console.log('Storage key used:', this.storageKey);
        } catch (error) {
            console.error('Error storing user:', error);
        }
    }

    /**
     * Get stored user from localStorage
     * @returns {Object|null} Stored user object
     */
    getStoredUser() {
        try {
            // Check if localStorage is available
            if (typeof Storage === 'undefined') {
                console.error('localStorage is not available');
                return null;
            }

            const stored = localStorage.getItem(this.storageKey);
            console.log('Retrieving user from localStorage:', stored ? 'Found' : 'Not found');
            console.log('Storage key used:', this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                console.log('Parsed user:', parsed);
                return parsed;
            }
            return null;
        } catch (error) {
            console.error('Error retrieving stored user:', error);
            return null;
        }
    }

    /**
     * Clear stored user from localStorage
     */
    clearStoredUser() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('User cleared from localStorage');
        } catch (error) {
            console.error('Error clearing stored user:', error);
        }
    }

    /**
     * Debug method to check localStorage state
     */
    debugLocalStorage() {
        try {
            if (typeof Storage === 'undefined') {
                console.error('localStorage is not supported');
                return;
            }

            console.log('=== localStorage Debug ===');
            console.log('Storage key:', this.storageKey);
            console.log('All localStorage keys:', Object.keys(localStorage));
            console.log('Stored value:', localStorage.getItem(this.storageKey));
            console.log('Current user:', this.currentUser);
            console.log('Is logged in:', this.isLoggedIn());
            console.log('===========================');
        } catch (error) {
            console.error('Error in debugLocalStorage:', error);
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
