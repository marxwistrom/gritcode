// Authentication utilities and session management

/**
 * Authentication class for managing JWT-based sessions
 */
class Auth {
    constructor() {
        this.currentUser = null;
        this.baseURL = 'http://localhost:4000';
        this.init();
    }

    /**
     * Initialize authentication state
     */
    init() {
        // Small delay to ensure everything is ready
        setTimeout(async () => {
            console.log('🔄 Initializing auth module...');
            await this.checkAuthStatus();
            console.log('✅ Auth module initialized');
        }, 100);
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
            const response = await fetch(`${this.baseURL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // Important for cookies
            });

            console.log('Login response status:', response.status);
            const data = await response.json();
            console.log('Login response data:', data);

            if (response.ok && data.success) {
                // Create user object from server response
                const user = {
                    email: email,
                    name: data.user?.name || email,
                    role: data.user?.role || 'user',
                    loggedInAt: new Date().toISOString()
                };

                console.log('Login successful, user data:', data.user);
                console.log('Created user object:', user);

                this.currentUser = user;
                console.log('User set in memory');

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
    async logout() {
        try {
            // Call server logout endpoint to clear the cookie
            await fetch(`${this.baseURL}/api/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        }

        // Clear local state
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    /**
     * Check authentication status with server
     */
    async checkAuthStatus() {
        try {
            console.log('🔍 Checking auth status with server...');
            const response = await fetch(`${this.baseURL}/api/auth/status`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('🔍 Auth status response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Auth status response data:', data);

                if (data.success && data.authenticated && data.user) {
                    this.currentUser = {
                        userId: data.user.userId,
                        email: data.user.email,
                        role: data.user.role,
                        loggedInAt: new Date().toISOString()
                    };
                    console.log('✅ User authenticated from server:', this.currentUser);
                    return true;
                } else {
                    // Only clear currentUser if server explicitly says not authenticated
                    if (data.authenticated === false) {
                        console.log('❌ Server says user not authenticated');
                        this.currentUser = null;
                    } else {
                        console.log('⚠️ Server response unclear, keeping current state');
                    }
                    return false;
                }
            } else if (response.status === 401) {
                // Unauthorized - definitely not authenticated
                console.log('❌ Server returned 401 - user not authenticated');
                this.currentUser = null;
                return false;
            } else {
                console.log('❌ Auth status check failed, status:', response.status);
                // Don't clear currentUser for other errors (network issues, etc.)
                return false;
            }
        } catch (error) {
            console.error('❌ Auth status check error:', error);
            // Don't clear currentUser on network errors
            return false;
        }
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
     * Refresh authentication status
     * Useful after login/logout to ensure current state
     */
    async refreshAuthStatus() {
        await this.checkAuthStatus();
    }

    /**
     * Debug method to check authentication state
     */
    async debugAuthState() {
        console.log('🔍 === Authentication Debug ===');
        console.log('🔍 Base URL:', this.baseURL);
        console.log('🔍 Current user:', this.currentUser);
        console.log('🔍 Is logged in:', this.isLoggedIn());
        console.log('🔍 Current URL:', window.location.href);

        // Check auth status with server
        try {
            console.log('🔍 Checking server auth status...');
            const response = await fetch(`${this.baseURL}/api/auth/status`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log('🔍 Server response status:', response.status);
            console.log('🔍 Server auth data:', data);
        } catch (error) {
            console.log('🔍 Server auth check failed:', error);
        }

        // Check cookies
        console.log('🔍 Checking cookies...');
        try {
            const cookies = document.cookie;
            console.log('🔍 Document cookies:', cookies || 'No cookies found');
        } catch (error) {
            console.log('🔍 Error checking cookies:', error);
        }

        console.log('🔍 ===========================');

        // Return debug info for easy access
        return {
            baseURL: this.baseURL,
            currentUser: this.currentUser,
            isLoggedIn: this.isLoggedIn(),
            currentURL: window.location.href
        };
    }

    /**
     * Require authentication for a page
     * Redirects to login if not authenticated
     */
    async requireAuth() {
        console.log('🔍 requireAuth called, checking authentication status...');

        // Always check auth status first to ensure we have latest state
        const authStatus = await this.checkAuthStatus();
        console.log('🔍 Auth status result:', authStatus);

        const isLoggedIn = this.isLoggedIn();
        console.log('🔍 isLoggedIn result:', isLoggedIn);
        console.log('🔍 currentUser:', this.currentUser);

        if (!isLoggedIn) {
            console.log('❌ User not authenticated, redirecting to login');
            window.location.href = '/login';
            return false;
        }
        console.log('✅ User authenticated, staying on page');
        return true;
    }

    /**
     * Prevent access to login page if already authenticated
     * Redirects to main page if already logged in
     */
    async preventAuthPage() {
        await this.checkAuthStatus();
        if (this.isLoggedIn()) {
            window.location.href = '/';
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
    console.log('🔄 Auth module loaded');

    // Add global debug function for easy testing
    window.debugAuth = async () => {
        if (window.auth) {
            return await window.auth.debugAuthState();
        } else {
            console.log('❌ Auth module not available');
        }
    };

    console.log('💡 Type "debugAuth()" in console to check authentication status');
});

export default auth;
