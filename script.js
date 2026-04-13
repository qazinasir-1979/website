// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Toggle hamburger icon animation
            const spans = menuToggle.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Contact form submission handle
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Just a UI demo
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;
            
            btn.textContent = 'Message Sent!';
            btn.style.backgroundColor = '#10b981'; // Green color for success
            
            contactForm.reset();
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = ''; // Reset to default CSS
            }, 3000);
        });
    }

    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
