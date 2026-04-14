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
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;
            
            // Add loading state
            btn.textContent = 'Sending...';
            btn.disabled = true;

            try {
                const response = await fetch("https://formsubmit.co/ajax/contact@qazinasir.com", {
                    method: "POST",
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        message: document.getElementById('message').value
                    })
                });

                if (response.ok) {
                    btn.textContent = 'Message Sent!';
                    btn.style.backgroundColor = '#10b981'; // Green color for success
                    contactForm.reset();
                } else {
                    btn.textContent = 'Error Sending';
                    btn.style.backgroundColor = '#ef4444'; // Red color for error
                }
            } catch (error) {
                console.error("Error sending form:", error);
                btn.textContent = 'Error Sending';
                btn.style.backgroundColor = '#ef4444';
            }

            // Reset button after 3 seconds
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.disabled = false;
            }, 3000);
        });
    }

    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
