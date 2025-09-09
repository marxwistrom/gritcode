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
        toggleBtn.textContent = 'Share Your Memory';

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
            ? 'Share Your Memory' 
            : 'Close Form';
    });
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

