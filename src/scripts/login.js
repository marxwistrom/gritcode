
// Import auth module
import auth from './auth.js';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
        // Use auth module for login
        const result = await auth.login(email, password);

        if (result.success) {
            // Show success message
            showSuccessMessage('Welcome back! Login successful.');

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            throw new Error(result.message || 'Login failed');
        }
    } catch (error) {
        showErrorMessage(error.message);
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

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