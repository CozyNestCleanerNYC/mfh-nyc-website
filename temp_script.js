        // Booking system variables
        let selectedService = null;
        let selectedServicePrice = 0;
        let totalPrice = 0;
        let estimatedHours = 0;
        window.totalPrice = 0;

        // Service selection - FIXED to prevent double-click bug
        document.querySelectorAll('.service-option').forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🎯 Service clicked:', this.dataset.service);
                
                // Remove selected class from all options
                document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                this.classList.add('selected');
                
                // Store selected service data
                selectedService = this.dataset.service;
                selectedServicePrice = parseInt(this.dataset.price);
                
                console.log('✅ Service selected:', selectedService, 'Price:', selectedServicePrice);
                
                // Update quote display
                updateQuote();
                checkFormCompletion();
            });
        });

        // Form field change listeners
        document.getElementById('bedrooms').addEventListener('change', function() {
            updateQuote();
            checkFormCompletion();
        });

        document.getElementById('bathrooms').addEventListener('change', function() {
            updateQuote();
            checkFormCompletion();
        });

        document.getElementById('preferredDate').addEventListener('change', function() {
            checkCalendarConflicts();
            checkFormCompletion();
        });

        document.getElementById('preferredTime').addEventListener('change', function() {
            checkCalendarConflicts();
            checkFormCompletion();
        });

        document.getElementById('frequency').addEventListener('change', function() {
            updateQuote();
            checkFormCompletion();
        });

        // Other form fields
        ['address', 'name', 'email', 'phone'].forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', checkFormCompletion);
            }
        });

        function updateQuote() {
            const bedrooms = document.getElementById('bedrooms').value;
            const bathrooms = document.getElementById('bathrooms').value;
            
            // Always update service name if service is selected
            if (selectedService) {
                const serviceElement = document.getElementById('quoteService');
                if (serviceElement) {
                    serviceElement.textContent = getServiceName(selectedService);
                }
                
                const rateElement = document.getElementById('quoteRate');
                if (rateElement) {
                    if (selectedService === 'deep') {
                        rateElement.textContent = 'Flat Rate';
                    } else {
                        rateElement.textContent = '$' + selectedServicePrice + '/hr';
                    }
                }
            }
            
            if (!selectedService || !bedrooms || !bathrooms) {
                return;
            }
            
            // Calculate estimated hours based on property size
            estimatedHours = calculateEstimatedHours(bedrooms, bathrooms, selectedService);
            
            // Calculate total price - different logic for deep cleaning
            if (selectedService === 'deep') {
                // Deep cleaning uses flat rates from chart
                totalPrice = calculateDeepCleaningPrice(bedrooms, parseFloat(bathrooms));
            } else {
                // Standard and move-out use hourly rates
                totalPrice = selectedServicePrice * estimatedHours;
            }
            
            // Apply frequency discount
            const frequencyValue = document.getElementById('frequency')?.value;
            if (frequencyValue) {
                const discount = getFrequencyDiscount(frequencyValue);
                totalPrice = totalPrice * (1 - discount);
            }
            
            window.totalPrice = totalPrice;
            
            // Update display with error checking
            const sizeElement = document.getElementById('quoteSize');
            if (sizeElement) {
                sizeElement.textContent = getPropertySize(bedrooms, bathrooms);
            }
            
            const timeElement = document.getElementById('quoteTime');
            if (timeElement) {
                timeElement.textContent = estimatedHours + ' hours';
            }
            
            // Update frequency display
            const frequencyElement = document.getElementById('quoteFrequency');
            if (frequencyElement) {
                if (frequencyValue) {
                    const frequencyText = getFrequencyDisplayText(frequencyValue);
                    frequencyElement.textContent = frequencyText;
                } else {
                    frequencyElement.textContent = 'Select frequency';
                }
            }
            
            const rateElement = document.getElementById('quoteRate');
            if (rateElement) {
                if (selectedService === 'deep') {
                    rateElement.textContent = 'Flat Rate';
                } else {
                    rateElement.textContent = '$' + selectedServicePrice + '/hr';
                }
            }
            
            const totalElement = document.getElementById('quoteTotal');
            if (totalElement) {
                totalElement.textContent = '$' + totalPrice.toFixed(2);
            }
            
            console.log('✅ Quote updated:', {
                service: selectedService,
                bedrooms: bedrooms,
                bathrooms: bathrooms,
                hours: estimatedHours,
                rate: selectedServicePrice,
                total: totalPrice
            });
        }

        function calculateEstimatedHours(bedrooms, bathrooms, service) {
            const bathroomCount = parseFloat(bathrooms);
            
            if (service === 'deep') {
                // Deep cleaning uses flat rate chart
                return calculateDeepCleaningHours(bedrooms, bathroomCount);
            } else if (service === 'standard') {
                // Standard cleaning: 1 bed 1 bath = 3 hours minimum
                // Add 45 minutes (0.75 hours) per additional bedroom
                // Add 1 hour per additional bathroom
                let hours = 3; // Base for 1 bed 1 bath
                
                // Calculate additional bedrooms
                let bedroomCount = 1;
                switch(bedrooms) {
                    case 'studio': bedroomCount = 0.5; hours = 2.5; break; // Studio is less than 1 bedroom
                    case '1br': bedroomCount = 1; break;
                    case '2br': bedroomCount = 2; break;
                    case '3br': bedroomCount = 3; break;
                    case '4br': bedroomCount = 4; break;
                    case '5br': bedroomCount = 5; break;
                }
                
                if (bedroomCount > 1) {
                    hours += (bedroomCount - 1) * 0.75; // 45 minutes per additional bedroom
                }
                
                if (bathroomCount > 1) {
                    hours += (bathroomCount - 1) * 1; // 1 hour per additional bathroom
                }
                
                return Math.ceil(hours * 4) / 4; // Round to nearest 0.25
            } else if (service === 'moveout') {
                // Move-out cleaning: use standard calculation * 1.5
                let standardHours = calculateEstimatedHours(bedrooms, bathrooms, 'standard');
                return Math.ceil(standardHours * 1.5 * 4) / 4;
            }
            
            return 3; // Default fallback
        }
        
        function calculateDeepCleaningHours(bedrooms, bathroomCount) {
            // Deep cleaning flat rate chart
            if (bedrooms === 'studio' && bathroomCount === 1) {
                return 4; // Studio / 1 Bath: 4 hrs
            } else if (bedrooms === '1br' && bathroomCount === 1) {
                return 6; // 1 Bed / 1 Bath: 6 hrs
            } else if (bedrooms === '2br' && bathroomCount === 1) {
                return 7; // 2 Bed / 1 Bath: 7 hrs
            } else if (bedrooms === '2br' && bathroomCount === 2) {
                return 8; // 2 Bed / 2 Bath: 8 hrs
            } else if (bedrooms === '3br' && bathroomCount === 2) {
                return 9; // 3 Bed / 2 Bath: 9 hrs
            } else if (bedrooms === '3br' && bathroomCount >= 3) {
                return 10; // 3 Bed / 3 Bath: 10 hrs
            } else if (bedrooms === '4br') {
                return 11; // 4 Bed / 2-3 Bath: 11 hrs
            } else if (bedrooms === '5br') {
                return 13; // 5 Bed+ / Large Homes: 12-14+ hrs (using 13 as average)
            }
            
            // Default calculation for edge cases
            return 8;
        }
        
        function calculateDeepCleaningPrice(bedrooms, bathroomCount) {
            // Deep cleaning flat rate chart
            if (bedrooms === 'studio' && bathroomCount === 1) {
                return 230; // Studio / 1 Bath: $230
            } else if (bedrooms === '1br' && bathroomCount === 1) {
                return 320; // 1 Bed / 1 Bath: $320
            } else if (bedrooms === '2br' && bathroomCount === 1) {
                return 365; // 2 Bed / 1 Bath: $365
            } else if (bedrooms === '2br' && bathroomCount === 2) {
                return 415; // 2 Bed / 2 Bath: $415
            } else if (bedrooms === '3br' && bathroomCount === 2) {
                return 475; // 3 Bed / 2 Bath: $475
            } else if (bedrooms === '3br' && bathroomCount >= 3) {
                return 530; // 3 Bed / 3 Bath: $530
            } else if (bedrooms === '4br') {
                return 590; // 4 Bed / 2-3 Bath: $590
            } else if (bedrooms === '5br') {
                return 725; // 5 Bed+ / Large Homes: $650-800+ (using $725 as average)
            }
            
            // Default calculation for edge cases
            return 400;
        }

        function getServiceName(service) {
            switch(service) {
                case 'standard': return 'Standard Cleaning';
                case 'deep': return 'Deep Cleaning';
                case 'moveout': return 'Move-Out Cleaning';
                default: return 'Select service';
            }
        }

        function getPropertySize(bedrooms, bathrooms) {
            const bedroomText = bedrooms.replace('br', ' BR').replace('studio', 'Studio');
            const cleanerInfo = getCleanerInfo(bedrooms, parseFloat(bathrooms));
            return bedroomText + ', ' + bathrooms + ' Bath' + cleanerInfo;
        }
        
        function getFrequencyDisplayText(frequency) {
            switch(frequency) {
                case 'one-time': return 'One-time cleaning';
                case 'weekly': return 'Weekly';
                case 'bi-weekly': return 'Bi-weekly (every 2 weeks)';
                case 'monthly': return 'Monthly';
                case 'custom': return 'Custom schedule';
                default: return 'Select frequency';
            }
        }
        
        function getFrequencyDiscount(frequency) {
            switch(frequency) {
                case 'one-time': return 0.15; // 15% off
                case 'monthly': return 0.15;  // 15% off
                case 'bi-weekly': return 0.25; // 25% off
                case 'weekly': return 0.30;    // 30% off
                case 'custom': return 0.15;    // 15% off (treat as one-time)
                default: return 0; // No discount
            }
        }
        
        function getCleanerInfo(bedrooms, bathroomCount) {
            // 2 cleaners for anything over 1 bed 1 bath
            if (bedrooms === 'studio' || (bedrooms === '1br' && bathroomCount === 1)) {
                return ' (1 cleaner)';
            } else {
                return ' (2 cleaners)';
            }
        }

        function checkFormCompletion() {
            const bookNowBtn = document.getElementById('bookNowBtn');
            if (!bookNowBtn) return;
            
            // Simple validation - check if all required fields have values
            const requiredFields = [
                { element: selectedService, name: 'Service' },
                { element: document.getElementById('bedrooms')?.value, name: 'Bedrooms' },
                { element: document.getElementById('bathrooms')?.value, name: 'Bathrooms' },
                { element: document.getElementById('preferredDate')?.value, name: 'Date' },
                { element: document.getElementById('preferredTime')?.value, name: 'Time' },
                { element: document.getElementById('frequency')?.value, name: 'Frequency' },
                { element: document.getElementById('address')?.value?.trim(), name: 'Address' },
                { element: document.getElementById('name')?.value?.trim(), name: 'Name' },
                { element: document.getElementById('email')?.value?.trim(), name: 'Email' },
                { element: document.getElementById('phone')?.value?.trim(), name: 'Phone' }
            ];
            
            const missingFields = requiredFields.filter(field => !field.element).map(field => field.name);
            
            if (missingFields.length === 0) {
                // All fields completed - enable button
                bookNowBtn.disabled = false;
                bookNowBtn.textContent = 'Book Now & Pay Online';
                bookNowBtn.style.backgroundColor = '#4CAF50';
                bookNowBtn.style.cursor = 'pointer';
                bookNowBtn.style.opacity = '1';
                console.log('✅ All fields completed - button enabled');
            } else {
                // Some fields missing - disable button
                bookNowBtn.disabled = true;
                if (missingFields.length <= 3) {
                    bookNowBtn.textContent = 'Complete: ' + missingFields.join(', ');
                } else {
                    bookNowBtn.textContent = 'Complete Form to Book (' + missingFields.length + ' fields)';
                }
                bookNowBtn.style.backgroundColor = '#cccccc';
                bookNowBtn.style.cursor = 'not-allowed';
                bookNowBtn.style.opacity = '0.6';
                console.log(`Missing fields: ${missingFields.join(', ')}`);
            }
        }

        // Book Now button click
        document.getElementById('bookNowBtn').addEventListener('click', function() {
            if (!this.disabled) {
                openPaymentModal();
            }
        });

        function openPaymentModal() {
            // Populate payment modal with booking details
            document.getElementById('paymentService').textContent = getServiceName(selectedService);
            
            const date = document.getElementById('preferredDate').value;
            const time = document.getElementById('preferredTime').value;
            document.getElementById('paymentDateTime').textContent = formatDateTime(date, time);
            
            document.getElementById('paymentAddress').textContent = document.getElementById('address').value;
            document.getElementById('paymentDuration').textContent = estimatedHours + ' hours';
            document.getElementById('paymentTotal').textContent = '$' + totalPrice.toFixed(2);
            
            // Show modal
            document.getElementById('paymentModal').style.display = 'flex';
            
            // Reset payment method selection
            document.querySelectorAll('input[name="payment"]').forEach(radio => {
                radio.checked = false;
            });
            document.querySelectorAll('.payment-method').forEach(method => {
                method.classList.remove('selected');
            });
            
            updatePayButton();
        }

        function closePaymentModal() {
            document.getElementById('paymentModal').style.display = 'none';
        }

        function formatDateTime(date, time) {
            const dateObj = new Date(date);
            const dateStr = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            let timeStr = '';
            switch(time) {
                case 'morning': timeStr = '8:00 AM - 12:00 PM'; break;
                case 'afternoon': timeStr = '12:00 PM - 5:00 PM'; break;
                case 'evening': timeStr = '5:00 PM - 8:00 PM'; break;
            }
            
            return dateStr + ', ' + timeStr;
        }

        // Stripe integration
        let stripe = null;
        let elements = null;
        let cardElement = null;

        // Initialize Stripe
        function initializeStripe() {
            // Your actual Stripe publishable key
            stripe = Stripe('pk_live_51RqIC7CcPlxCeVwQlIuWJDBfGc3OUKA6wWegt0ASVjhROtmOknVaZ3VVLjZJxNGVIXQdO2AXB2wrqXzNBtTag8DC00FAkZ17tb');
            elements = stripe.elements();
            
            // Create card element
            cardElement = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                },
            });
        }

        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', function() {
                // Remove selected class from all methods
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
                
                // Add selected class to clicked method
                this.classList.add('selected');
                
                // Check the radio button
                const radio = this.querySelector('input[type="radio"]');
                radio.checked = true;
                
                // Show/hide credit card form based on selection
                const creditCardForm = document.getElementById('creditCardForm');
                if (radio.value === 'card') {
                    creditCardForm.style.display = 'block';
                    
                    // Initialize Stripe if not already done
                    if (!stripe) {
                        initializeStripe();
                    }
                    
                    // Mount card element if not already mounted
                    if (cardElement && !cardElement._mounted) {
                        cardElement.mount('#card-element');
                        cardElement._mounted = true;
                        
                        // Handle real-time validation errors from the card Element
                        cardElement.on('change', function(event) {
                            const displayError = document.getElementById('card-errors');
                            if (event.error) {
                                displayError.textContent = event.error.message;
                            } else {
                                displayError.textContent = '';
                            }
                        });
                    }
                    
                    // Auto-fill name from booking form
                    const customerName = document.getElementById('name').value;
                    if (customerName) {
                        document.getElementById('cardName').value = customerName;
                    }
                    
                    // Auto-fill billing address from service address
                    const serviceAddress = document.getElementById('address').value;
                    if (serviceAddress) {
                        // Parse the address to fill separate fields
                        const addressParts = parseAddress(serviceAddress);
                        document.getElementById('billingStreet').value = addressParts.street || '';
                        document.getElementById('billingCity').value = addressParts.city || '';
                        document.getElementById('billingState').value = addressParts.state || '';
                        document.getElementById('billingZip').value = addressParts.zip || '';
                    }
                } else {
                    creditCardForm.style.display = 'none';
                }
                
                updatePayButton();
            });
        });

        function updatePayButton() {
            const payButton = document.getElementById('payButton');
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            
            if (selectedPayment) {
                const method = selectedPayment.value;
                if (method === 'later') {
                    payButton.textContent = 'Book Now and Pay Later';
                } else {
                    payButton.textContent = 'Pay $' + totalPrice.toFixed(2) + ' Now';
                }
                payButton.disabled = false;
            } else {
                payButton.textContent = 'Select Payment Method';
                payButton.disabled = true;
            }
        }

        function simulatePayment() {
            console.log('🎉 Payment function called!');
            
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) return;
            
            const paymentMethod = selectedPayment.value;
            
            // Handle credit card payment with Stripe
            if (paymentMethod === 'card') {
                handleStripePayment();
                return;
            }
            
            // Handle other payment methods (PayPal, Venmo/Zelle)
            handleOtherPayments(paymentMethod);
        }
        
        async function handleStripePayment() {
            if (!stripe || !cardElement) {
                alert('Payment system not initialized. Please refresh the page and try again.');
                return;
            }
            
            const payButton = document.getElementById('payButton');
            payButton.disabled = true;
            payButton.textContent = 'Processing Payment...';
            
            try {
                // Get card holder name and billing address from separate fields
                const cardName = document.getElementById('cardName').value;
                const billingStreet = document.getElementById('billingStreet').value;
                const billingCity = document.getElementById('billingCity').value;
                const billingState = document.getElementById('billingState').value;
                const billingZip = document.getElementById('billingZip').value;
                
                if (!cardName || !billingStreet || !billingCity || !billingState || !billingZip) {
                    throw new Error('Please fill in all credit card and billing address fields');
                }
                
                // Create payment method
                const {error, paymentMethod} = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                    billing_details: {
                        name: cardName,
                        address: {
                            line1: billingStreet,
                            city: billingCity,
                            state: billingState,
                            postal_code: billingZip,
                            country: 'US',
                        },
                    },
                });
                
                if (error) {
                    throw error;
                }
                
                // Get booking data for payment processing
                const bookingData = getBookingData();
                const bookingId = '#MFH' + Date.now();
                
                // Process real payment through backend API
                const paymentResponse = await fetch('https://kkh7ikcyg7ze.manus.space/api/process-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        payment_method_id: paymentMethod.id,
                        amount: totalPrice,
                        currency: 'usd',
                        booking_data: {
                            ...bookingData,
                            booking_id: bookingId
                        }
                    })
                });
                
                const paymentResult = await paymentResponse.json();
                
                if (!paymentResult.success) {
                    throw new Error(paymentResult.error || 'Payment processing failed');
                }
                
                // Payment successful - send confirmations
                console.log('✅ Payment processed successfully:', paymentResult);
                
                // Send confirmation email
                sendConfirmationEmail(bookingData, bookingId, 'Credit Card');
                
                // Send SMS confirmation
                sendSMSConfirmation(bookingData, bookingId, 'Credit Card');
                
                // Show success message
                alert('🎉 Payment Successful!\n\n' +
                      'Booking ID: ' + bookingId + '\n' +
                      'Payment ID: ' + paymentResult.payment_intent_id + '\n' +
                      'Amount Charged: $' + paymentResult.amount_received + '\n\n' +
                      'Service: ' + getServiceName(selectedService) + '\n' +
                      'Date: ' + formatDateTime(bookingData.date, bookingData.time) + '\n' +
                      'Total: $' + totalPrice.toFixed(2) + '\n' +
                      'Payment Method: Credit Card\n\n' +
                      'Confirmation email & SMS sent to:\n' +
                      '📧 ' + bookingData.email + '\n' +
                      '📱 ' + bookingData.phone + '\n\n' +
                      'Thank you for choosing Maid For Heaven NYC!');
                
                // Send booking to backend
                if (window.bookingAPI) {
                    window.bookingAPI.submitBooking({...bookingData, paymentMethod: 'credit_card', bookingId: bookingId});
                }
                
                closePaymentModal();
                
                // Redirect to homepage after 2 seconds
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);           
            } catch (error) {
                console.error('Payment error:', error);
                alert('Payment failed: ' + error.message);
                payButton.disabled = false;
                payButton.textContent = 'Pay $' + totalPrice.toFixed(2) + ' Now';
            }
        }
        
        function handleOtherPayments(paymentMethod) {
            console.log('🎯 Processing payment method:', paymentMethod);
            
            // Get booking details
            const bookingData = getBookingData();
            
            // Generate booking ID
            const bookingId = '#MFH' + Date.now();
            
            let paymentText = '';
            if (paymentMethod === 'paypal') {
                paymentText = 'PayPal';
            } else if (paymentMethod === 'later') {
                paymentText = 'Pay on service day (Venmo/Zelle)';
            }
            
            // Send confirmation email
            sendConfirmationEmail(bookingData, bookingId, paymentText);
            
            // Send SMS confirmation
            sendSMSConfirmation(bookingData, bookingId, paymentText);
            
            // Show success message
            alert('🎉 Booking Confirmed!\n\n' +
                  'Booking ID: ' + bookingId + '\n\n' +
                  'Service: ' + getServiceName(selectedService) + '\n' +
                  'Date: ' + formatDateTime(bookingData.date, bookingData.time) + '\n' +
                  'Total: $' + totalPrice.toFixed(2) + '\n' +
                  'Payment Method: ' + paymentText + '\n\n' +
                  'Confirmation email & SMS sent to:\n' +
                  '📧 ' + bookingData.email + '\n' +
                  '📱 ' + bookingData.phone + '\n\n' +
                  'Thank you for choosing Maid For Heaven NYC!');
            
            // Send booking to backend
            if (window.bookingAPI) {
                window.bookingAPI.submitBooking({...bookingData, paymentMethod: paymentMethod, bookingId: bookingId});
            }
            
            console.log('✅ Booking completed successfully');
            closePaymentModal();
            
            // Redirect to homepage after 3 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        }
        
        // Email confirmation system
        function sendConfirmationEmail(bookingData, bookingId, paymentMethod) {
            console.log('📧 Sending confirmation email...');
            
            const emailData = {
                customerName: bookingData.name,
                bookingId: bookingId,
                service: getServiceName(selectedService),
                date: formatDateTime(bookingData.date, bookingData.time),
                address: bookingData.address,
                phone: bookingData.phone,
                estimatedHours: estimatedHours,
                totalPrice: totalPrice,
                paymentMethod: paymentMethod,
                instructions: bookingData.instructions || 'None',
                email: bookingData.email
            };
            
            // Send email via EmailJS
            if (typeof emailjs !== 'undefined') {
                emailjs.send('service_to99nwh', 'template_631z0ql', emailData)
                    .then(function(response) {
                        console.log('✅ Email sent successfully:', response);
                    })
                    .catch(function(error) {
                        console.error('❌ Email sending failed:', error);
                        // Still continue with booking even if email fails
                    });
            } else {
                console.error('❌ EmailJS not loaded');
            }
        }
        
        // Parse address string into components
        function parseAddress(addressString) {
            // Simple address parsing - handles common formats
            const parts = addressString.split(',').map(part => part.trim());
            
            let street = '';
            let city = '';
            let state = '';
            let zip = '';
            
            if (parts.length >= 1) {
                street = parts[0];
            }
            
            if (parts.length >= 2) {
                city = parts[1];
            }
            
            if (parts.length >= 3) {
                // Last part might contain state and zip
                const lastPart = parts[parts.length - 1];
                const stateZipMatch = lastPart.match(/([A-Z]{2})\s*(\d{5})/);
                
                if (stateZipMatch) {
                    state = stateZipMatch[1];
                    zip = stateZipMatch[2];
                } else {
                    // Try to extract just state if no zip found
                    const stateMatch = lastPart.match(/([A-Z]{2})/);
                    if (stateMatch) {
                        state = stateMatch[1];
                    }
                }
            }
            
            return { street, city, state, zip };
        }

        // SMS confirmation system
        function sendSMSConfirmation(bookingData, bookingId, paymentMethod) {
            console.log('📱 Sending SMS confirmation...');
            
            const smsMessage = `🎉 Booking Confirmed - Maid For Heaven NYC
            
Booking ID: ${bookingId}
Service: ${getServiceName(selectedService)}
Date: ${formatDateTime(bookingData.date, bookingData.time)}
Address: ${bookingData.address}
Total: $${totalPrice.toFixed(2)}
Payment: ${paymentMethod}

We'll call you 24hrs before to confirm.
Questions? Call (347) 759-2000

Thank you for choosing us! ✨`;

            const smsData = {
                to: bookingData.phone,
                message: smsMessage,
                customerName: bookingData.name,
                bookingId: bookingId
            };
            
            // Send SMS via backend API (Twilio)
            fetch('https://zmhqivcmgm9o.manus.space/api/send-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(smsData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('✅ SMS sent successfully:', data);
            })
            .catch(error => {
                console.error('❌ SMS sending failed:', error);
                // Continue with booking even if SMS fails
            });
        }
        
        function getBookingData() {
            return {
                service: selectedService,
                bedrooms: document.getElementById('bedrooms').value,
                bathrooms: document.getElementById('bathrooms').value,
                date: document.getElementById('preferredDate').value,
                time: document.getElementById('preferredTime').value,
                frequency: document.getElementById('frequency').value,
                address: document.getElementById('address').value,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                instructions: document.getElementById('instructions').value,
                totalPrice: totalPrice,
                estimatedHours: estimatedHours
            };
        }

        // Initialize booking system
        function initializeBookingSystem() {
            console.log('Initializing booking system...');
            
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('preferredDate').setAttribute('min', today);
            
            // Initialize calendar integration if available
            if (typeof initializeCalendar === 'function') {
                initializeCalendar();
            }
            
            console.log('✅ Booking system initialized');
        }

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initializeBookingSystem);

        // Close modal when clicking outside
        document.getElementById('paymentModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closePaymentModal();
            }
        });
        
        // FIX BOOKING BUTTON - Enable and add click handler
        function fixBookingButton() {
            const buttons = document.querySelectorAll('button');
            let bookingButton = null;
            buttons.forEach(btn => {
                if (btn.textContent.includes('Complete Form') || btn.textContent.includes('Book Now')) {
                    bookingButton = btn;
                }
            });

            if (bookingButton && !bookingButton.dataset.fixed) {
                // Enable the button
                bookingButton.disabled = false;
                
                // Add click handler
                bookingButton.onclick = function(e) {
                    e.preventDefault();
                    console.log('🎉 Booking button clicked!');
                    
                    // Check if service is selected
                    const service = document.querySelector('.service-option.selected');
                    if (!service) {
                        alert('⚠️ Please select a service type first.');
                        return;
                    }
                    
                    // Open payment modal
                    const modal = document.getElementById('paymentModal');
                    if (modal) {
                        modal.style.display = 'flex';
                        console.log('✅ Payment modal opened!');
                        
                        // Update modal with booking details
                        updatePaymentModal();
                    } else {
                        // If no modal, just show confirmation
                        alert('🎉 Booking Confirmed!\n\nBooking ID: #MFH' + Date.now() + '\n\nWe will contact you within 24 hours to confirm details.\n\nThank you for choosing Maid For Heaven NYC!');
                        setTimeout(() => location.reload(), 2000);
                    }
                };
                
                // Style the button to show it's active
                bookingButton.style.cssText = 'background: #28a745 !important; color: white !important; cursor: pointer !important; opacity: 1 !important;';
                bookingButton.dataset.fixed = 'true';
                
                console.log('✅ Booking button fixed and enabled!');
            }
        }
        
        // Fix pay button in modal
        function fixPayButton() {
            const payButton = document.getElementById('payButton');
            if (payButton && !payButton.dataset.fixed) {
                payButton.onclick = function(e) {
                    e.preventDefault();
                    console.log('💳 Pay button clicked!');
                    simulatePayment();
                };
                payButton.dataset.fixed = 'true';
                console.log('✅ Pay button fixed!');
            }
        }
        
        // Update payment modal with booking details
        function updatePaymentModal() {
            // Update service
            const serviceElement = document.getElementById('paymentService');
            if (serviceElement) {
                serviceElement.textContent = getServiceName(selectedService);
            }
            
            // Update date & time
            const dateTimeElement = document.getElementById('paymentDateTime');
            if (dateTimeElement) {
                const date = document.getElementById('preferredDate').value;
                const time = document.getElementById('preferredTime').value;
                dateTimeElement.textContent = formatDateTime(date, time);
            }
            
            // Update address
            const addressElement = document.getElementById('paymentAddress');
            if (addressElement) {
                addressElement.textContent = document.getElementById('address').value;
            }
            
            // Update duration
            const durationElement = document.getElementById('paymentDuration');
            if (durationElement) {
                durationElement.textContent = estimatedHours + ' hours';
            }
            
            // Update total
            const totalElement = document.getElementById('paymentTotal');
            if (totalElement) {
                totalElement.textContent = '$' + totalPrice.toFixed(2);
            }
            
            // Fix pay button
            setTimeout(fixPayButton, 100);
        }
        
        // Run the fixes
        document.addEventListener('DOMContentLoaded', function() {
            fixBookingButton();
            fixPayButton();
        });
        window.addEventListener('load', function() {
            fixBookingButton();
            fixPayButton();
        });
        setTimeout(function() {
            fixBookingButton();
            fixPayButton();
        }, 1000);
