// Book Now JavaScript Functionality

class BookingSystem {
    constructor() {
        this.formData = {
            serviceType: '',
            homeSize: '',
            frequency: '',
            address: '',
            distance: 0,
            specialRequests: '',
            contactInfo: {
                name: '',
                email: '',
                phone: ''
            }
        };
        
        this.quote = null;
        this.selectedPaymentMethod = '';
        
        this.serviceTypes = {
            'standard': { name: 'Standard Cleaning', baseRate: 35 },
            'deep': { name: 'Deep Cleaning', baseRate: 45 },
            'moveout': { name: 'Move-Out Cleaning', baseRate: 50 }
        };
        
        this.homeSizes = {
            'studio': { name: 'Studio/1BR', hours: 2 },
            '2br': { name: '2 Bedroom', hours: 3 },
            '3br': { name: '3 Bedroom', hours: 4 },
            '4br': { name: '4+ Bedroom', hours: 5 },
            'large': { name: 'Large Home (5+ BR)', hours: 6 }
        };
        
        this.frequencies = {
            'one-time': { name: 'One-time', discount: 0 },
            'weekly': { name: 'Weekly', discount: 0.15 },
            'biweekly': { name: 'Bi-weekly', discount: 0.10 },
            'monthly': { name: 'Monthly', discount: 0.05 }
        };
        
        this.init();
    }
    
    init() {
        console.log('BookingSystem initializing...');
        this.bindEvents();
        this.updateQuote();
    }
    
    bindEvents() {
        console.log('Binding events...');
        
        // Service type selection
        document.querySelectorAll('.service-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const serviceType = e.currentTarget.dataset.service;
                console.log('Service selected:', serviceType);
                this.selectService(serviceType);
            });
        });
        
        // Form inputs
        const homeSizeSelect = document.getElementById('homeSize');
        if (homeSizeSelect) {
            homeSizeSelect.addEventListener('change', (e) => {
                this.formData.homeSize = e.target.value;
                console.log('Home size selected:', e.target.value);
                this.updateQuote();
            });
        }
        
        const frequencySelect = document.getElementById('frequency');
        if (frequencySelect) {
            frequencySelect.addEventListener('change', (e) => {
                this.formData.frequency = e.target.value;
                console.log('Frequency selected:', e.target.value);
                this.updateQuote();
            });
        }
        
        const addressInput = document.getElementById('address');
        if (addressInput) {
            addressInput.addEventListener('input', (e) => {
                this.handleAddressChange(e.target.value);
            });
        }
        
        // Contact info
        const nameInput = document.getElementById('fullName');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.formData.contactInfo.name = e.target.value;
                this.updateQuote();
            });
        }
        
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                this.formData.contactInfo.email = e.target.value;
                this.updateQuote();
            });
        }
        
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formData.contactInfo.phone = e.target.value;
                this.updateQuote();
            });
        }
        
        const specialRequestsInput = document.getElementById('specialRequests');
        if (specialRequestsInput) {
            specialRequestsInput.addEventListener('input', (e) => {
                this.formData.specialRequests = e.target.value;
            });
        }
        
        // Book now button
        const bookNowBtn = document.getElementById('bookNowBtn');
        if (bookNowBtn) {
            bookNowBtn.addEventListener('click', () => {
                this.handleBookNow();
            });
        }
        
        // Payment modal events
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closePaymentModal();
            });
        }
        
        const cancelPayment = document.getElementById('cancelPayment');
        if (cancelPayment) {
            cancelPayment.addEventListener('click', () => {
                this.closePaymentModal();
            });
        }
        
        const processPayment = document.getElementById('processPayment');
        if (processPayment) {
            processPayment.addEventListener('click', () => {
                this.processPayment();
            });
        }
        
        const closeSuccess = document.getElementById('closeSuccess');
        if (closeSuccess) {
            closeSuccess.addEventListener('click', () => {
                this.closeSuccessModal();
            });
        }
        
        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget.dataset.method);
            });
        });
        
        // Close modal on backdrop click
        const paymentModal = document.getElementById('paymentModal');
        if (paymentModal) {
            paymentModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closePaymentModal();
                }
            });
        }
        
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeSuccessModal();
                }
            });
        }
        
        console.log('Events bound successfully');
    }
    
    selectService(serviceType) {
        // Remove previous selection
        document.querySelectorAll('.service-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        document.querySelector(`[data-service="${serviceType}"]`).classList.add('selected');
        
        this.formData.serviceType = serviceType;
        this.updateQuote();
    }
    
    handleAddressChange(address) {
        this.formData.address = address;
        
        // Simple distance estimation (in real app, would use Google Maps API)
        let estimatedDistance = 0;
        if (address.length > 0) {
            const addressLower = address.toLowerCase();
            if (addressLower.includes('manhattan') || addressLower.includes('downtown')) {
                estimatedDistance = Math.floor(Math.random() * 15) + 5; // 5-20 miles
            } else if (addressLower.includes('brooklyn') || addressLower.includes('queens')) {
                estimatedDistance = Math.floor(Math.random() * 25) + 10; // 10-35 miles
            } else if (addressLower.includes('bronx') || addressLower.includes('staten')) {
                estimatedDistance = Math.floor(Math.random() * 40) + 20; // 20-60 miles
            } else {
                estimatedDistance = Math.floor(Math.random() * 30) + 10; // 10-40 miles
            }
        }
        
        this.formData.distance = estimatedDistance;
        
        // Update distance display
        const distanceInfo = document.getElementById('distanceInfo');
        const distanceText = document.getElementById('distanceText');
        
        if (estimatedDistance > 0) {
            distanceInfo.style.display = 'block';
            distanceText.textContent = `Estimated distance: ${estimatedDistance} miles`;
            
            if (estimatedDistance > 15) {
                distanceText.innerHTML += ' <span style="color: #ffc107;">(Distance surcharge applies)</span>';
            }
        } else {
            distanceInfo.style.display = 'none';
        }
        
        this.updateQuote();
    }
    
    calculateQuote() {
        if (!this.formData.serviceType || !this.formData.homeSize || !this.formData.frequency) {
            return null;
        }
        
        const service = this.serviceTypes[this.formData.serviceType];
        const size = this.homeSizes[this.formData.homeSize];
        const frequency = this.frequencies[this.formData.frequency];
        
        // Base calculation
        const baseHours = size.hours;
        const hourlyRate = service.baseRate;
        const basePrice = baseHours * hourlyRate;
        
        // Distance surcharge (for jobs over 15 miles)
        let distanceSurcharge = 0;
        if (this.formData.distance > 15) {
            const extraMiles = this.formData.distance - 15;
            distanceSurcharge = Math.ceil(extraMiles / 10) * 15; // $15 per 10-mile increment
        }
        
        // Frequency discount
        const discountAmount = basePrice * frequency.discount;
        
        // Final calculations
        const subtotal = basePrice + distanceSurcharge - discountAmount;
        
        // Team approach calculations
        const teamHours = Math.ceil(baseHours / 2); // Team completes in half the time
        const laborCost = teamHours * 22; // Only pay for one person ($22/hour)
        const gasCost = (this.formData.distance * 2 / 25) * 3.20; // Estimated gas cost
        const tollEstimate = this.formData.distance > 30 ? 15 : (this.formData.distance > 20 ? 10 : 0);
        const supplies = 15;
        const totalCosts = laborCost + gasCost + tollEstimate + supplies;
        const profit = subtotal - totalCosts;
        const profitMargin = subtotal > 0 ? profit / subtotal : 0;
        
        // Travel time estimation
        const travelTime = this.formData.distance > 0 ? Math.ceil(this.formData.distance / 20) * 2 : 1;
        const totalTime = teamHours + travelTime;
        
        return {
            basePrice,
            distanceSurcharge,
            discountAmount,
            subtotal,
            teamHours,
            totalTime,
            profitMargin: profitMargin * 100,
            worthIt: profitMargin >= 0.35,
            breakdown: {
                baseHours,
                teamHours,
                hourlyRate,
                gasCost,
                tollEstimate,
                totalCosts,
                profit,
                laborCost,
                supplies,
                travelTime
            }
        };
    }
    
    updateQuote() {
        console.log('Updating quote with data:', this.formData);
        const newQuote = this.calculateQuote();
        this.quote = newQuote;
        
        const quoteCard = document.getElementById('quoteCard');
        const defaultQuote = document.getElementById('defaultQuote');
        
        console.log('Quote calculated:', newQuote);
        
        if (newQuote && quoteCard && defaultQuote) {
            // Show quote card
            quoteCard.style.display = 'block';
            defaultQuote.style.display = 'none';
            
            // Update quote styling
            quoteCard.className = 'quote-card ' + (newQuote.worthIt ? 'profitable' : 'needs-review');
            
            // Update worth it badge
            const worthItBadge = document.getElementById('worthItBadge');
            if (worthItBadge) {
                worthItBadge.className = 'worth-it-badge ' + (newQuote.worthIt ? 'profitable' : 'needs-review');
                worthItBadge.textContent = newQuote.worthIt ? '✅ Profitable Job' : '⚠️ Needs Review';
            }
            
            // Update price breakdown
            const baseServiceText = document.getElementById('baseServiceText');
            const basePrice = document.getElementById('basePrice');
            if (baseServiceText && basePrice) {
                baseServiceText.textContent = 
                    `Base Service (${newQuote.breakdown.baseHours} hrs × $${newQuote.breakdown.hourlyRate}/hr)`;
                basePrice.textContent = `$${newQuote.basePrice}`;
            }
            
            // Distance surcharge
            const distanceLine = document.getElementById('distanceLine');
            if (distanceLine) {
                if (newQuote.distanceSurcharge > 0) {
                    distanceLine.style.display = 'flex';
                    const distanceSurchargeText = document.getElementById('distanceSurchargeText');
                    const distanceSurcharge = document.getElementById('distanceSurcharge');
                    if (distanceSurchargeText && distanceSurcharge) {
                        distanceSurchargeText.textContent = 
                            `Distance Surcharge (${this.formData.distance} miles)`;
                        distanceSurcharge.textContent = `+$${newQuote.distanceSurcharge}`;
                    }
                } else {
                    distanceLine.style.display = 'none';
                }
            }
            
            // Frequency discount
            const discountLine = document.getElementById('discountLine');
            if (discountLine) {
                if (newQuote.discountAmount > 0) {
                    discountLine.style.display = 'flex';
                    const discountAmount = document.getElementById('discountAmount');
                    if (discountAmount) {
                        discountAmount.textContent = `-$${newQuote.discountAmount.toFixed(2)}`;
                    }
                } else {
                    discountLine.style.display = 'none';
                }
            }
            
            // Total price
            const totalPrice = document.getElementById('totalPrice');
            if (totalPrice) {
                totalPrice.textContent = `$${newQuote.subtotal.toFixed(2)}`;
            }
            
            // Service details
            const totalTime = document.getElementById('totalTime');
            const workTime = document.getElementById('workTime');
            const profitMargin = document.getElementById('profitMargin');
            
            if (totalTime) totalTime.textContent = `${newQuote.totalTime} hours total`;
            if (workTime) workTime.textContent = `${newQuote.teamHours} hours cleaning`;
            if (profitMargin) {
                profitMargin.textContent = `${newQuote.profitMargin.toFixed(1)}%`;
                profitMargin.className = 'detail-value ' + 
                    (newQuote.worthIt ? 'profitable' : 'needs-review');
            }
            
            // Cost breakdown
            const laborText = document.getElementById('laborText');
            const laborCost = document.getElementById('laborCost');
            const gasCost = document.getElementById('gasCost');
            
            if (laborText && laborCost) {
                laborText.textContent = `Labor (${newQuote.breakdown.teamHours} hrs × $22)`;
                laborCost.textContent = `$${newQuote.breakdown.laborCost}`;
            }
            if (gasCost) {
                gasCost.textContent = `$${newQuote.breakdown.gasCost.toFixed(2)}`;
            }
            
            const tollsItem = document.getElementById('tollsItem');
            if (tollsItem) {
                if (newQuote.breakdown.tollEstimate > 0) {
                    tollsItem.style.display = 'flex';
                    const tollCost = document.getElementById('tollCost');
                    if (tollCost) {
                        tollCost.textContent = `$${newQuote.breakdown.tollEstimate}`;
                    }
                } else {
                    tollsItem.style.display = 'none';
                }
            }
            
            const ourProfit = document.getElementById('ourProfit');
            if (ourProfit) {
                ourProfit.textContent = `$${newQuote.breakdown.profit.toFixed(2)}`;
            }
            
            // Update book now button
            const bookingActions = document.getElementById('bookingActions');
            const bookNowBtn = document.getElementById('bookNowBtn');
            const bookNowText = document.getElementById('bookNowText');
            
            if (this.isFormComplete() && bookingActions && bookNowBtn && bookNowText) {
                bookingActions.style.display = 'block';
                bookNowText.textContent = `Book Now & Pay Online - $${newQuote.subtotal.toFixed(2)}`;
                bookNowBtn.disabled = false;
                console.log('Book Now button should be visible');
            } else {
                if (bookingActions) bookingActions.style.display = 'none';
                console.log('Form not complete, hiding Book Now button');
            }
            
        } else {
            // Show default quote
            if (quoteCard) quoteCard.style.display = 'none';
            if (defaultQuote) defaultQuote.style.display = 'block';
            console.log('Showing default quote');
        }
    }
    
    isFormComplete() {
        return this.formData.serviceType && 
               this.formData.homeSize && 
               this.formData.frequency && 
               this.formData.address && 
               this.formData.contactInfo.name && 
               this.formData.contactInfo.email && 
               this.formData.contactInfo.phone;
    }
    
    handleBookNow() {
        if (!this.isFormComplete() || !this.quote) {
            alert('Please complete all required fields.');
            return;
        }
        
        this.showPaymentModal();
    }
    
    showPaymentModal() {
        const modal = document.getElementById('paymentModal');
        const paymentTotal = document.getElementById('paymentTotal');
        const paymentServiceType = document.getElementById('paymentServiceType');
        const paymentAddress = document.getElementById('paymentAddress');
        
        paymentTotal.textContent = `$${this.quote.subtotal.toFixed(2)}`;
        paymentServiceType.textContent = this.serviceTypes[this.formData.serviceType].name + 
            ' • ' + this.homeSizes[this.formData.homeSize].name;
        paymentAddress.textContent = this.formData.address;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    closePaymentModal() {
        document.getElementById('paymentModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.selectedPaymentMethod = '';
        
        // Reset payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
        
        // Update UI
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.querySelector(`[data-method="${method}"]`).classList.add('selected');
    }
    
    async processPayment() {
        if (!this.selectedPaymentMethod) {
            alert('Please select a payment method.');
            return;
        }
        
        const processBtn = document.getElementById('processPayment');
        const btnText = document.getElementById('paymentBtnText');
        
        // Show loading state
        processBtn.disabled = true;
        btnText.textContent = 'Processing...';
        
        try {
            // Simulate API call to backend
            const bookingData = {
                ...this.formData,
                quote: this.quote,
                paymentMethod: this.selectedPaymentMethod,
                timestamp: new Date().toISOString()
            };
            
            // In real implementation, this would call your Flask backend
            console.log('Booking data:', bookingData);
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success
            this.showSuccessModal();
            
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again or contact support.');
        } finally {
            // Reset button
            processBtn.disabled = false;
            btnText.textContent = 'Pay Now';
        }
    }
    
    showSuccessModal() {
        this.closePaymentModal();
        
        const successModal = document.getElementById('successModal');
        const confirmationNumber = document.getElementById('confirmationNumber');
        
        // Generate confirmation number
        const confirmationNum = 'CLN-' + Math.floor(Math.random() * 9000 + 1000);
        confirmationNumber.textContent = confirmationNum;
        
        successModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    closeSuccessModal() {
        document.getElementById('successModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        this.resetForm();
    }
    
    resetForm() {
        // Reset form data
        this.formData = {
            serviceType: '',
            homeSize: '',
            frequency: '',
            address: '',
            distance: 0,
            specialRequests: '',
            contactInfo: {
                name: '',
                email: '',
                phone: ''
            }
        };
        
        // Reset UI
        document.querySelectorAll('.service-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.getElementById('bookingForm').reset();
        document.getElementById('distanceInfo').style.display = 'none';
        
        this.updateQuote();
    }
}

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BookingSystem();
});

// Add some utility functions for form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Format phone number as user types
document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
            }
            e.target.value = value;
        });
    }
});

