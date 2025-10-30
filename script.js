// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize animations
    initAnimations();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize form handling
    initForms();
});

// Theme Toggle Functionality
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(themeIcon, savedTheme);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(themeIcon, newTheme);
    });
}

function updateThemeIcon(icon, theme) {
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Navigation Functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Update active link
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Animations
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .portfolio-item, .section-header');
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
    
    // Add CSS for scroll animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animate-on-scroll.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .service-card.animate-on-scroll {
            transition-delay: 0.1s;
        }
        
        .portfolio-item.animate-on-scroll {
            transition-delay: 0.2s;
        }
    `;
    document.head.appendChild(style);
}

// Smooth Scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form Handling
function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple form validation
            const inputs = this.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Show success message
                showNotification('Message sent successfully!', 'success');
                this.reset();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
        
        // Remove error class on input
        const formInputs = form.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('error');
                }
            });
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles for notification
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 15px;
            max-width: 350px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            animation: slideInRight 0.3s ease;
        }
        
        .notification.success {
            background-color: #4CAF50;
        }
        
        .notification.error {
            background-color: #F44336;
        }
        
        .notification.info {
            background-color: #2196F3;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            line-height: 1;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    // Append to document
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Add slideOutRight animation
    const slideOutStyle = document.createElement('style');
    slideOutStyle.textContent = `
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(slideOutStyle);
}

// Page Loader (optional)
window.addEventListener('load', function() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
});

// Add this to your existing script.js file

// Contact Form Handling
function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // For contact form specifically
            if (this.id === 'contact-form') {
                await handleContactForm(this);
            } else {
                // Simple validation for other forms
                const inputs = this.querySelectorAll('input[required], textarea[required]');
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });
                
                if (isValid) {
                    showNotification('Message sent successfully!', 'success');
                    this.reset();
                } else {
                    showNotification('Please fill in all required fields.', 'error');
                }
            }
        });
        
        // Remove error class on input
        const formInputs = form.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('error');
                }
            });
        });
    });
}

// Handle Contact Form Submission to MongoDB
async function handleContactForm(form) {
    const submitBtn = form.querySelector('#submit-btn');
    const submitText = form.querySelector('#submit-text');
    const submitSpinner = form.querySelector('#submit-spinner');
    
    // Get form data
    const formData = {
        name: form.querySelector('#name').value,
        email: form.querySelector('#email').value,
        subject: form.querySelector('#subject').value,
        budget: form.querySelector('#budget').value,
        message: form.querySelector('#message').value
    };
    
    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';
    submitSpinner.style.display = 'inline-block';
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            form.reset();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Send Message';
        submitSpinner.style.display = 'none';
    }
}

// Test server connection
async function testServerConnection() {
    try {
        const response = await fetch('/api/test');
        const result = await response.json();
        showNotification(`✅ Server is working! ${result.message}`, 'success');
        console.log('Server test result:', result);
    } catch (error) {
        showNotification('❌ Server connection failed! Make sure server is running.', 'error');
        console.error('Server test failed:', error);
    }
}

// Contact Form Handling - UPDATED
async function handleContactForm(form) {
    const submitBtn = form.querySelector('#submit-btn');
    const submitText = form.querySelector('#submit-text');
    
    // Get form data
    const formData = {
        name: form.querySelector('#name').value,
        email: form.querySelector('#email').value,
        subject: form.querySelector('#subject').value,
        budget: form.querySelector('#budget').value,
        message: form.querySelector('#message').value
    };
    
    console.log('Form data being sent:', formData);
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';
    
    try {
        console.log('Sending request to /api/contact...');
        
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Server response:', result);
        
        if (result.success) {
            showNotification(result.message, 'success');
            form.reset(); // Clear the form
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Network error. Please make sure the server is running on port 5000.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Send Message';
    }
}

// TEST SERVER CONNECTION
async function testServerConnection() {
    const statusDiv = document.getElementById('server-status');
    statusDiv.innerHTML = '🔄 Testing connection...';
    
    try {
        const response = await fetch('/api/test');
        const result = await response.json();
        
        if (result.success) {
            statusDiv.innerHTML = `✅ ${result.message} (${result.time})`;
            statusDiv.style.color = '#2e7d32';
            console.log('✅ Server test passed:', result);
        } else {
            statusDiv.innerHTML = '❌ Server responded with error';
            statusDiv.style.color = '#d32f2f';
        }
    } catch (error) {
        statusDiv.innerHTML = '❌ Cannot connect to server. Make sure server is running on port 5000.';
        statusDiv.style.color = '#d32f2f';
        console.error('❌ Server test failed:', error);
    }
}

// CONTACT FORM HANDLING
async function handleContactForm(form) {
    const submitBtn = form.querySelector('#submit-btn');
    const submitText = form.querySelector('#submit-text');
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        budget: document.getElementById('budget').value,
        message: document.getElementById('message').value.trim()
    };
    
    console.log('📤 Sending form data:', formData);
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
        showNotification('❌ Please fill in all required fields (name, email, message).', 'error');
        return;
    }
    
    // Show loading
    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        console.log('📨 Server response:', result);
        
        if (result.success) {
            showNotification(result.message, 'success');
            form.reset(); // Clear form
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('❌ Form submission error:', error);
        showNotification('❌ Network error. Please check if server is running.', 'error');
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitText.textContent = 'Send Message';
    }
}

// Initialize form when page loads
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm(this);
        });
    }
    
    // Auto-test server when contact page loads
    if (window.location.pathname.includes('contact.html')) {
        setTimeout(testServerConnection, 1000);
    }
});

// Enhanced test function
async function testServerConnection() {
    const statusDiv = document.getElementById('server-status');
    statusDiv.innerHTML = '🔄 Testing server and database...';
    
    try {
        const response = await fetch('/api/test');
        const result = await response.json();
        
        if (result.success) {
            statusDiv.innerHTML = `✅ ${result.message}`;
            statusDiv.style.color = '#2e7d32';
            console.log('✅ Server test passed:', result);
        } else {
            statusDiv.innerHTML = '❌ Server error';
            statusDiv.style.color = '#d32f2f';
        }
    } catch (error) {
        statusDiv.innerHTML = '❌ Cannot connect to server. Make sure server is running.';
        statusDiv.style.color = '#d32f2f';
        console.error('❌ Server test failed:', error);
    }
}

// Enhanced form handler
async function handleContactForm(form) {
    const submitBtn = form.querySelector('#submit-btn');
    const submitText = form.querySelector('#submit-text');
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        budget: document.getElementById('budget').value,
        message: document.getElementById('message').value.trim()
    };
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
        showNotification('❌ Please fill in all required fields.', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        console.log('Server response:', result);
        
        if (result.success) {
            const storageType = result.storage === 'mongodb' ? 'database' : 'temporary storage';
            showNotification(`✅ ${result.message} (Saved to ${storageType})`, 'success');
            form.reset();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('❌ Network error. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitText.textContent = 'Send Message';
    }
}