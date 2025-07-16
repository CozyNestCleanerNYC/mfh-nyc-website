// Book Us Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const preferredDateInput = document.getElementById('preferredDate');
    if (preferredDateInput) {
        preferredDateInput.setAttribute('min', today);
    }

    // Form validation and submission
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Collect form data
        const formData = new FormData(bookingForm);
        const bookingData = {};

        // Get regular form fields
        for (let [key, value] of formData.entries()) {
            if (key === 'addons') {
                if (!bookingData.addons) {
                    bookingData.addons = [];
                }
                bookingData.addons.push(value);
            } else {
                bookingData[key] = value;
            }
        }

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'propertyType', 'serviceType'];
        let isValid = true;
        let firstErrorField = null;

        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            const value = bookingData[field];

            if (!value || value.trim() === '') {
                input.style.borderColor = '#dc3545';
                input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                isValid = false;

                if (!firstErrorField) {
                    firstErrorField = input;
                }
            } else {
                input.style.borderColor = '#e9ecef';
                input.style.boxShadow = 'none';
            }
        });

        // Email validation
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (bookingData.email && !emailRegex.test(bookingData.email)) {
            emailInput.style.borderColor = '#dc3545';
            emailInput.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
            isValid = false;
            if (!firstErrorField) {
                firstErrorField = emailInput;
            }
        }

        // Phone validation (basic)
        const phoneInput = document.getElementById('phone');
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = bookingData.phone ? bookingData.phone.replace(/\D/g, '') : '';
        if (bookingData.phone && cleanPhone.length < 10) {
            phoneInput.style.borderColor = '#dc3545';
            phoneInput.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
            isValid = false;
            if (!firstErrorField) {
                firstErrorField = phoneInput;
            }
        }

        if (!isValid) {
            // Scroll to first error field
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }

            // Show error message
            showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        // Show loading state
        const submitButton = bookingForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Request...';
        submitButton.disabled = true;

        // Send to Google Sheets
        fetch('https://script.google.com/macros/s/AKfycbw3DALh1ZCPmorjsSg6MCDOr25uXLB8pNbvDQsI8CzTi1PveaYqo7qWxi2auchIdbG4/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        })
        .then(response => response.json())
        .then(result => {
            // Reset button
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;

            if (result.success) {
                showNotification('Thank you! We\'ve received your booking request and will contact you within 2 hours with your personalized quote.', 'success');
                // Optional: Reset form after successful submission
                // bookingForm.reset();
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }
        })
        .catch(error => {
            // Reset button
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;

            console.error('Error:', error);
            showNotification('There was an error submitting your request. Please try again or call us directly at (347) 759-2000.', 'error');
        });
    });

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';

        if (value.length > 0) {
            if (value.length <= 3) {
                formattedValue = `(${value}`;
            } else if (value.length <= 6) {
                formattedValue = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                formattedValue = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }

        e.target.value = formattedValue;
    });

    // Dynamic service type description
    const serviceTypeSelect = document.getElementById('serviceType');
    serviceTypeSelect.addEventListener('change', function() {
        updateEstimatedCost();
    });

    // Dynamic frequency discount display
    const frequencySelect = document.getElementById('frequency');
    frequencySelect.addEventListener('change', function() {
        updateEstimatedCost();
    });

    // Add-on services change handler
    const addonCheckboxes = document.querySelectorAll('input[name="addons"]');
    addonCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateEstimatedCost();
        });
    });

    function updateEstimatedCost() {
        // This function could calculate and display estimated cost
        // For now, it's a placeholder for future enhancement
        console.log('Updating estimated cost...');
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease-out;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
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
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
                opacity: 0.7;
            }
            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Smooth scrolling for anchor links
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
});



// Mobile Menu Toggle for Book Page
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Handle both mobile-menu-toggle and hamburger classes
    const toggleElement = mobileToggle || hamburger;

    if (toggleElement && navMenu) {
        toggleElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            console.log('Book page mobile toggle clicked'); // Debug log

            navMenu.classList.toggle('active');
            toggleElement.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!toggleElement.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                toggleElement.classList.remove('active');
            }
        });

        // Close menu when clicking nav links
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                toggleElement.classList.remove('active');
            });
        });
    } else {
        console.log('Mobile toggle elements not found:', {
            mobileToggle: !!mobileToggle,
            hamburger: !!hamburger,
            navMenu: !!navMenu
        });
    }
});

