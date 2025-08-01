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
    async initialize(apiKey = null) {
        try {
            // Load credentials first
            console.log('Initializing Google Calendar integration...');
            
            // Try to load credentials if not already loaded
            if (!window.GOOGLE_CALENDAR_API_KEY && window.loadCalendarCredentials) {
                await window.loadCalendarCredentials();
            }
            
            // Check if we have credentials
            if (!window.GOOGLE_CALENDAR_API_KEY || !window.GOOGLE_CALENDAR_CLIENT_ID) {
                console.log('📋 No credentials available, using mock data with current appointment');
                this.initializeMockDataWithCurrentAppointment();
                return;
            }
            
            // Load Google Calendar API
            if (typeof gapi === 'undefined') {
                await this.loadGoogleAPI();
            }
            
            // Initialize with live API credentials
            await new Promise((resolve, reject) => {
                gapi.load('client:auth2', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: window.GOOGLE_CALENDAR_API_KEY,
                            clientId: window.GOOGLE_CALENDAR_CLIENT_ID,
                            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                            scope: 'https://www.googleapis.com/auth/calendar.readonly'
                        });
                        
                        console.log('Google Calendar API loaded with live credentials');
                        this.isInitialized = true;
                        resolve();
                    } catch (error) {
                        console.error('Failed to initialize Google Calendar API:', error);
                        // Fallback to mock data with current appointment
                        this.initializeMockDataWithCurrentAppointment();
                        resolve();
                    }
                });
            });
            
        } catch (error) {
            console.error('Failed to initialize calendar integration:', error);
            // Fallback to mock data with your current appointment
            this.initializeMockDataWithCurrentAppointment();
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
     * Using your actual appointment: August 1st, 4-8 PM
     */
    initializeMockDataWithCurrentAppointment() {
        console.log('Using mock calendar data with your current appointment');
        
        // Your actual appointment: August 1st, 2025, 4-8 PM EST
        const today = new Date('2025-08-01');
        
        this.existingAppointments = [
            {
                id: 'current-appointment',
                summary: 'Client Cleaning Appointment',
                start: {
                    dateTime: new Date(2025, 7, 1, 16, 0).toISOString() // 4 PM EST August 1, 2025
                },
                end: {
                    dateTime: new Date(2025, 7, 1, 20, 0).toISOString() // 8 PM EST August 1, 2025
                }
            }
        ];
        
        console.log('Mock appointment set for August 1st, 4-8 PM:', this.existingAppointments);
        this.isInitialized = true;
    }

    /**
     * Legacy mock data function (keeping for compatibility)
     */
    initializeMockData() {
        // Redirect to current appointment data
        this.initializeMockDataWithCurrentAppointment();
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
            // Try to fetch from live Google Calendar first
            if (typeof gapi !== 'undefined' && gapi.client && gapi.client.calendar) {
                // Check if user is authenticated
                const authInstance = gapi.auth2.getAuthInstance();
                
                if (!authInstance.isSignedIn.get()) {
                    // Try to sign in silently first
                    try {
                        await authInstance.signIn({ prompt: 'none' });
                    } catch (silentError) {
                        console.log('Silent sign-in failed, will prompt user when needed');
                        // Fall back to mock data for now
                        return this.existingAppointments;
                    }
                }
                
                if (authInstance.isSignedIn.get()) {
                    // Fetch events from primary calendar
                    const response = await gapi.client.calendar.events.list({
                        calendarId: 'primary', // Use primary calendar
                        timeMin: startDate.toISOString(),
                        timeMax: endDate.toISOString(),
                        singleEvents: true,
                        orderBy: 'startTime'
                    });
                    
                    console.log('✅ Fetched LIVE calendar events:', response.result.items);
                    return response.result.items || [];
                } else {
                    console.log('User not signed in, using mock data');
                    return this.existingAppointments;
                }
            } else {
                // Return mock data if API not available
                console.log('Google Calendar API not available, using mock data');
                return this.existingAppointments;
            }
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            // Return mock data as fallback
            console.log('Falling back to mock data due to error');
            return this.existingAppointments;
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

