/**
 * Google Calendar Authentication Helper
 * Provides easy sign-in functionality for calendar access
 */

class GoogleCalendarAuth {
    constructor() {
        this.isSignedIn = false;
        this.authInstance = null;
    }

    /**
     * Initialize Google Auth
     */
    async initialize() {
        try {
            if (typeof gapi === 'undefined') {
                console.error('Google API not loaded');
                return false;
            }

            await new Promise((resolve) => {
                gapi.load('auth2', resolve);
            });

            this.authInstance = gapi.auth2.getAuthInstance();
            if (this.authInstance) {
                this.isSignedIn = this.authInstance.isSignedIn.get();
                console.log('Google Auth initialized, signed in:', this.isSignedIn);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to initialize Google Auth:', error);
            return false;
        }
    }

    /**
     * Prompt user to sign in to Google Calendar
     */
    async signIn() {
        try {
            if (!this.authInstance) {
                await this.initialize();
            }

            if (this.authInstance && !this.isSignedIn) {
                console.log('Prompting user to sign in to Google Calendar...');
                await this.authInstance.signIn();
                this.isSignedIn = this.authInstance.isSignedIn.get();
                console.log('Sign in successful:', this.isSignedIn);
                return this.isSignedIn;
            }
            return this.isSignedIn;
        } catch (error) {
            console.error('Sign in failed:', error);
            return false;
        }
    }

    /**
     * Sign out from Google Calendar
     */
    async signOut() {
        try {
            if (this.authInstance && this.isSignedIn) {
                await this.authInstance.signOut();
                this.isSignedIn = false;
                console.log('Signed out from Google Calendar');
            }
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    }

    /**
     * Check if user is currently signed in
     */
    checkSignInStatus() {
        if (this.authInstance) {
            this.isSignedIn = this.authInstance.isSignedIn.get();
        }
        return this.isSignedIn;
    }
}

// Create global instance
window.googleCalendarAuth = new GoogleCalendarAuth();

