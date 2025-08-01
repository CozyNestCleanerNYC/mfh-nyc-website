/**
 * Calendar Integration System for Maid For Heaven NYC
 * Handles Google Calendar API integration and conflict detection
 */

class CalendarIntegration {
    constructor() {
        this.apiKey = null;
        this.calendarId = 'primary'; // Default to primary calendar
        this.isInitialized = false;
        this.existingAppointments = [];
    }

    /**
     * Initialize Google Calendar API
     */
    async initialize(apiKey) {
        try {
            this.apiKey = apiKey;
            
            // Load Google Calendar API
            if (typeof gapi === 'undefined') {
                await this.loadGoogleAPI();
            }
            
            await gapi.load('client', async () => {
                await gapi.client.init({
                    apiKey: this.apiKey,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
                });
                this.isInitialized = true;
                console.log('Calendar integration initialized successfully');
            });
            
        } catch (error) {
            console.error('Failed to initialize calendar integration:', error);
            // Fallback to mock data for testing
            this.initializeMockData();
        }
    }

    /**
     * Load Google API script dynamically
     */
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="apis.google.com"]')) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Initialize with mock data for testing when API is not available
     */
    initializeMockData() {
        console.log('Using mock calendar data for testing');
        
        // Mock existing appointments - August 2, 2025 (tomorrow)
        const tomorrow = new Date('2025-08-02');
        
        this.existingAppointments = [
            {
                id: 'mock-1',
                summary: 'Cleaning Appointment',
                start: {
                    dateTime: new Date(2025, 7, 2, 16, 0).toISOString() // 4 PM EST August 2, 2025
                },
                end: {
                    dateTime: new Date(2025, 7, 2, 19, 0).toISOString() // 7 PM EST August 2, 2025
                }
            },
            {
                id: 'mock-2',
                summary: 'Deep Cleaning Service',
                start: {
                    dateTime: new Date(2025, 7, 2, 9, 0).toISOString() // 9 AM EST August 2, 2025
                },
                end: {
                    dateTime: new Date(2025, 7, 2, 12, 0).toISOString() // 12 PM EST August 2, 2025
                }
            }
        ];
        
        this.isInitialized = true;
    }

    /**
     * Fetch events from Google Calendar for a specific date range
     */
    async fetchCalendarEvents(startDate, endDate) {
        if (!this.isInitialized) {
            console.warn('Calendar integration not initialized');
            return this.existingAppointments;
        }

        try {
            if (typeof gapi !== 'undefined' && gapi.client && gapi.client.calendar) {
                const response = await gapi.client.calendar.events.list({
                    calendarId: this.calendarId,
                    timeMin: startDate.toISOString(),
                    timeMax: endDate.toISOString(),
                    singleEvents: true,
                    orderBy: 'startTime'
                });
                
                return response.result.items || [];
            } else {
                // Return mock data if API not available
                return this.existingAppointments;
            }
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            return this.existingAppointments; // Fallback to mock data
        }
    }

    /**
     * Check for scheduling conflicts
     */
    async checkForConflicts(selectedDate, selectedTime) {
        try {
            // Parse selected date and time
            const appointmentDate = new Date(selectedDate);
            const timeSlots = {
                'morning': { start: 9, end: 12 },
                'afternoon': { start: 12, end: 17 },
                'evening': { start: 17, end: 20 }
            };

            const timeSlot = timeSlots[selectedTime];
            if (!timeSlot) {
                throw new Error('Invalid time slot selected');
            }

            // Create start and end times for the selected appointment
            const appointmentStart = new Date(appointmentDate);
            appointmentStart.setHours(timeSlot.start, 0, 0, 0);
            
            const appointmentEnd = new Date(appointmentDate);
            appointmentEnd.setHours(timeSlot.end, 0, 0, 0);

            // Fetch events for the selected date
            const dayStart = new Date(appointmentDate);
            dayStart.setHours(0, 0, 0, 0);
            
            const dayEnd = new Date(appointmentDate);
            dayEnd.setHours(23, 59, 59, 999);

            const existingEvents = await this.fetchCalendarEvents(dayStart, dayEnd);

            // Check for conflicts
            const conflicts = existingEvents.filter(event => {
                if (!event.start || !event.end) return false;
                
                const eventStart = new Date(event.start.dateTime || event.start.date);
                const eventEnd = new Date(event.end.dateTime || event.end.date);

                // Check if there's any overlap
                return (appointmentStart < eventEnd && appointmentEnd > eventStart);
            });

            return {
                hasConflict: conflicts.length > 0,
                conflicts: conflicts,
                selectedSlot: {
                    start: appointmentStart,
                    end: appointmentEnd,
                    timeSlot: selectedTime
                }
            };

        } catch (error) {
            console.error('Error checking for conflicts:', error);
            return {
                hasConflict: false,
                conflicts: [],
                error: error.message
            };
        }
    }

    /**
     * Get alternative time slots for a given date
     */
    async getAlternativeTimeSlots(selectedDate) {
        const timeSlots = ['morning', 'afternoon', 'evening'];
        const alternatives = [];

        for (const timeSlot of timeSlots) {
            const conflictCheck = await this.checkForConflicts(selectedDate, timeSlot);
            if (!conflictCheck.hasConflict) {
                alternatives.push({
                    timeSlot: timeSlot,
                    label: this.getTimeSlotLabel(timeSlot),
                    available: true
                });
            }
        }

        return alternatives;
    }

    /**
     * Get human-readable label for time slot
     */
    getTimeSlotLabel(timeSlot) {
        const labels = {
            'morning': 'Morning (9 AM - 12 PM)',
            'afternoon': 'Afternoon (12 PM - 5 PM)',
            'evening': 'Evening (5 PM - 8 PM)'
        };
        return labels[timeSlot] || timeSlot;
    }

    /**
     * Format conflict information for display
     */
    formatConflictMessage(conflictResult) {
        if (!conflictResult.hasConflict) {
            return null;
        }

        const conflicts = conflictResult.conflicts;
        const conflictTimes = conflicts.map(event => {
            const start = new Date(event.start.dateTime || event.start.date);
            const end = new Date(event.end.dateTime || event.end.date);
            return `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        });

        return {
            message: `⚠️ Time slot conflict detected! You already have ${conflicts.length} appointment(s) during this time:`,
            conflicts: conflicts.map(event => ({
                title: event.summary || 'Busy',
                time: conflictTimes[conflicts.indexOf(event)]
            }))
        };
    }
}

// Global calendar integration instance
window.calendarIntegration = new CalendarIntegration();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarIntegration;
}

