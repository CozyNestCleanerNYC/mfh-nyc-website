// Mobile Menu Toggle for Book Page
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });

        // Close menu when clicking nav links
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
});

// Booking Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');

    if (!bookingForm) return;

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Collect form data
        const formData = new FormData(bookingForm);
        const bookingData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            propertyType: formData.get('propertyType'),
            bedrooms: formData.get('bedrooms'),
            bathrooms: formData.get('bathrooms'),
            squareFootage: formData.get('squareFootage'),
            serviceType: formData.get('serviceType'),
            frequency: formData.get('frequency'),
            preferredDate: formData.get('preferredDate'),
            preferredTime: formData.get('preferredTime'),
            addons: formData.getAll('addons'),
            instructions: formData.get('instructions')
        };

        // Validation
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'serviceType'];
        let isValid = true;
        let firstErrorField = null;

        // Reset all field styles
        bookingForm.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.borderColor = '#e9ecef';
            input.style.boxShadow = 'none';
        });

        // Check required fields
        requiredFields.forEach(field => {
            if (!bookingData[field] || bookingData[field].trim() === '') {
                const input = bookingForm.querySelector(`[name="${field}"]`);
                if (input) {
                    input.style.borderColor = '#dc3545';
                    input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                    isValid = false;
                    if (!firstErrorField) {
                        firstErrorField = input;
                    }
                }
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

        // Phone validation
        const phoneInput = document.getElementById('phone');
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
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
            showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        // Show loading state
        const submitButton = bookingForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Request...';
        submitButton.disabled = true;

        // Create FormData for Formspree submission
        const formData = new FormData();
        Object.keys(bookingData).forEach(key => {
            if (Array.isArray(bookingData[key])) {
                formData.append(key, bookingData[key].join(', '));
            } else {
                formData.append(key, bookingData[key] || '');
            }
        });

        // Send to Formspree
        fetch('https://formspree.io/f/xzzvbybj', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            // Reset button
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;

            if (response.ok) {
                showNotification('Thank you! We\'ve received your booking request and will contact you within 2 hours with your personalized quote.', 'success');
            } else {
                throw new Error('Form submission failed');
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
    if (phoneInput) {
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
    }
});

// Notification system
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);

    // Add CSS if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease-out;
            }

            .notification-success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }

            .notification-error {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }

            .notification-content {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                gap: 8px;
            }

            .notification-content i:first-child {
                font-size: 18px;
            }

            .notification-content span {
                flex: 1;
                font-weight: 500;
            }

            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                opacity: 0.7;
            }

            .notification-close:hover {
                opacity: 1;
                background: rgba(0, 0, 0, 0.1);
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @media (max-width: 768px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
