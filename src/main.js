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


document.getElementById("contact-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const date = document.getElementById("day-date").value.trim();
    const location = document.getElementById("place-location").value.trim();
    const story = document.getElementById("story-experience").value.trim();


    if (!date || !location || !story) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/experiences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: date,
                location: location,
                story: story
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Thank you! Your experience has been saved successfully.`);
            this.reset();
        } else {
            alert(`Error: ${data.error}`);
        }

    } catch (error) {
        console.error("Network error:", error);
        alert("There was an error saving your experience. Please make sure the server is running.");
    }
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

