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

