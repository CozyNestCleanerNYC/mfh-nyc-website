// Stripe Payment Integration
class StripePaymentHandler {
    constructor() {
        // Initialize Stripe with your publishable key
        this.stripe = Stripe('pk_test_51234567890abcdef'); // Replace with your actual publishable key
        this.elements = null;
        this.cardElement = null;
        this.paymentIntent = null;
        this.backendUrl = 'https://0vhlizckekq3.manus.space'; // Your backend URL
    }

    async initializeStripeElements() {
        // Create Stripe Elements instance
        this.elements = this.stripe.elements();
        
        // Create card element
        this.cardElement = this.elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        });

        // Mount the card element
        this.cardElement.mount('#card-element');

        // Handle real-time validation errors from the card Element
        this.cardElement.on('change', ({error}) => {
            const displayError = document.getElementById('card-errors');
            if (error) {
                displayError.textContent = error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }

    async createPaymentIntent(bookingData) {
        try {
            const response = await fetch(`${this.backendUrl}/api/stripe/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: bookingData.totalPrice,
                    service: bookingData.service,
                    date: bookingData.date,
                    time: bookingData.time,
                    name: bookingData.name,
                    email: bookingData.email,
                    phone: bookingData.phone,
                    address: bookingData.address,
                }),
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            this.paymentIntent = data;
            return data;
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    async processPayment(bookingData) {
        try {
            // Show loading state
            this.setPaymentButtonLoading(true);

            // Create payment intent
            await this.createPaymentIntent(bookingData);

            // Confirm payment with card
            const {error, paymentIntent} = await this.stripe.confirmCardPayment(
                this.paymentIntent.client_secret,
                {
                    payment_method: {
                        card: this.cardElement,
                        billing_details: {
                            name: bookingData.name,
                            email: bookingData.email,
                            phone: bookingData.phone,
                            address: {
                                line1: bookingData.address,
                            },
                        },
                    }
                }
            );

            if (error) {
                // Show error to customer
                this.showPaymentError(error.message);
                this.setPaymentButtonLoading(false);
                return false;
            } else {
                // Payment succeeded
                if (paymentIntent.status === 'succeeded') {
                    await this.confirmBooking(paymentIntent.id);
                    this.showPaymentSuccess(paymentIntent);
                    return true;
                }
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            this.showPaymentError('Payment processing failed. Please try again.');
            this.setPaymentButtonLoading(false);
            return false;
        }
    }

    async confirmBooking(paymentIntentId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/stripe/confirm-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_intent_id: paymentIntentId,
                }),
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Booking confirmation failed');
            }

            return data;
        } catch (error) {
            console.error('Error confirming booking:', error);
            throw error;
        }
    }

    setPaymentButtonLoading(loading) {
        const payButton = document.getElementById('stripe-pay-button');
        if (payButton) {
            if (loading) {
                payButton.disabled = true;
                payButton.innerHTML = '<div class="spinner"></div> Processing...';
            } else {
                payButton.disabled = false;
                payButton.innerHTML = `Pay $${window.totalPrice?.toFixed(2) || '0.00'} Now`;
            }
        }
    }

    showPaymentError(message) {
        const errorElement = document.getElementById('payment-errors');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        // Also show alert for immediate feedback
        alert('Payment Error: ' + message);
    }

    showPaymentSuccess(paymentIntent) {
        // Hide payment form
        document.getElementById('stripe-payment-form').style.display = 'none';
        
        // Show success message
        const successElement = document.getElementById('payment-success');
        if (successElement) {
            successElement.innerHTML = `
                <div class="success-content">
                    <h3>🎉 Payment Successful!</h3>
                    <p><strong>Payment ID:</strong> ${paymentIntent.id}</p>
                    <p><strong>Amount Paid:</strong> $${(paymentIntent.amount / 100).toFixed(2)}</p>
                    <p>Your booking has been confirmed! You will receive a confirmation email shortly.</p>
                </div>
            `;
            successElement.style.display = 'block';
        }

        // Close modal after 3 seconds
        setTimeout(() => {
            this.closePaymentModal();
            location.reload(); // Refresh to reset form
        }, 3000);
    }

    closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Create the Stripe payment form HTML
    createStripePaymentForm() {
        return `
            <div id="stripe-payment-form">
                <div class="payment-form-header">
                    <h3>💳 Enter Card Details</h3>
                    <p>Your payment is secured by Stripe</p>
                </div>
                
                <div class="card-input-container">
                    <label for="card-element">Card Information</label>
                    <div id="card-element">
                        <!-- Stripe Elements will create form elements here -->
                    </div>
                    <div id="card-errors" role="alert"></div>
                </div>
                
                <button id="stripe-pay-button" class="stripe-pay-button">
                    Pay $${window.totalPrice?.toFixed(2) || '0.00'} Now
                </button>
                
                <div id="payment-errors" class="payment-errors" style="display: none;"></div>
                
                <div class="payment-security">
                    <p>🔒 Your payment information is secure and encrypted</p>
                </div>
            </div>
            
            <div id="payment-success" class="payment-success" style="display: none;"></div>
        `;
    }

    // Add CSS styles for Stripe form
    addStripeStyles() {
        const styles = `
            <style>
                .card-input-container {
                    margin: 20px 0;
                }
                
                .card-input-container label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                }
                
                #card-element {
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    background: white;
                    transition: border-color 0.3s ease;
                }
                
                #card-element:focus-within {
                    border-color: #4CAF50;
                    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
                }
                
                #card-errors {
                    color: #e53e3e;
                    font-size: 14px;
                    margin-top: 8px;
                    min-height: 20px;
                }
                
                .stripe-pay-button {
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                
                .stripe-pay-button:hover:not(:disabled) {
                    background: linear-gradient(135deg, #45a049, #3d8b40);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                }
                
                .stripe-pay-button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                
                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #ffffff;
                    border-top: 2px solid transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .payment-form-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .payment-form-header h3 {
                    margin: 0 0 8px 0;
                    color: #333;
                }
                
                .payment-form-header p {
                    margin: 0;
                    color: #666;
                    font-size: 0.9rem;
                }
                
                .payment-security {
                    text-align: center;
                    margin-top: 15px;
                }
                
                .payment-security p {
                    font-size: 0.85rem;
                    color: #666;
                    margin: 0;
                }
                
                .payment-errors {
                    background: #fee;
                    color: #c33;
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 10px;
                    border: 1px solid #fcc;
                }
                
                .payment-success {
                    text-align: center;
                    padding: 20px;
                }
                
                .success-content {
                    background: #d4edda;
                    color: #155724;
                    padding: 20px;
                    border-radius: 10px;
                    border: 1px solid #c3e6cb;
                }
                
                .success-content h3 {
                    margin: 0 0 15px 0;
                    font-size: 1.5rem;
                }
                
                .success-content p {
                    margin: 8px 0;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Global Stripe payment handler instance
window.stripePaymentHandler = new StripePaymentHandler();

