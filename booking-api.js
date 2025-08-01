// Booking API Client for connecting to backend email service
class BookingAPI {
    constructor() {
        // Use the deployed backend service URL
        this.baseURL = 'https://nghki1cl33dk.manus.space/api';
    }
    
    async submitBooking(bookingData) {
        try {
            const response = await fetch(`${this.baseURL}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Booking submission failed:', error);
            throw error;
        }
    }
    
    async processPayment(paymentData) {
        try {
            const response = await fetch(`${this.baseURL}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Payment processing failed:', error);
            throw error;
        }
    }
    
    // Helper method to format booking data for backend
    formatBookingData(formData) {
        return {
            serviceType: formData.selectedService,
            homeSize: formData.selectedBedroomHours,
            frequency: formData.selectedFrequency || 'one-time',
            address: formData.address,
            dateTime: `${formData.preferredDate}, ${formData.preferredTime}`,
            specialRequests: formData.specialRequests || '',
            contactInfo: {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone
            },
            quote: {
                total: formData.finalPrice,
                service: formData.selectedService,
                hours: formData.selectedBedroomHours
            }
        };
    }
}

// Initialize the API client
const bookingAPI = new BookingAPI();

