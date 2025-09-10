
// Wait for auth module to load
function waitForAuth() {
    return new Promise((resolve) => {
        console.log('Waiting for auth module...');
        if (window.auth) {
            console.log('Auth module found immediately');
            resolve(window.auth);
        } else {
            console.log('Auth module not ready, checking every 50ms...');
            const checkAuth = setInterval(() => {
                if (window.auth) {
                    console.log('Auth module loaded after waiting');
                    clearInterval(checkAuth);
                    resolve(window.auth);
                }
            }, 50);
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    const auth = await waitForAuth();

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        console.log('Starting login process for:', email);
        // Use auth module for login
        const result = await auth.login(email, password);
        console.log('Login result:', result);

        if (result.success) {
            console.log('Login successful, preparing redirect...');

            // Debug auth state after successful login
            if (window.auth && window.auth.debugLocalStorage) {
                console.log('=== Auth state after successful login ===');
                window.auth.debugLocalStorage();
            }

            // Show success message
            showSuccessMessage('Welcome back! Login successful.');

            // Redirect after a short delay
            setTimeout(() => {
                console.log('Redirecting to main page...');
                window.location.href = '/';
            }, 1500);
        } else {
            console.log('Login failed:', result.message);
            throw new Error(result.message || 'Login failed');
        }
    } catch (error) {
        showErrorMessage(error.message);
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
    }); // Close the form submit event listener
}); // Close the DOMContentLoaded event listener
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message success-message';
    messageDiv.innerHTML = `<div class="message-content">✅ ${message}</div>`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => document.body.removeChild(messageDiv), 300);
    }, 3000);
}

function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message error-message';
    messageDiv.innerHTML = `<div class="message-content">❌ ${message}</div>`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => document.body.removeChild(messageDiv), 300);
    }, 5000);
}