// Calendar Integration - External Script
// This ensures reliable execution by being loaded as an external file

(function() {
    'use strict';
    
    console.log('🔑 Calendar integration script loaded');
    
    // Backend calendar integration
    const CALENDAR_API_BASE = 'https://19hninc17x70.manus.space';
    
    // Calendar conflict detection
    window.checkCalendarConflicts = async function(date, timeSlot) {
        try {
            console.log(`🔄 Checking calendar conflicts for ${date} ${timeSlot}...`);
            
            const response = await fetch(`${CALENDAR_API_BASE}/api/calendar/check-conflicts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: date, time_slot: timeSlot })
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            
            console.log('✅ Calendar conflict check result:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Calendar API error:', error);
            return { has_conflicts: false, conflicts: [], alternatives: [], error: error.message };
        }
    };
    
    // Display conflict results in the UI
    window.displayConflictResults = function(result) {
        let container = document.getElementById('conflict-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'conflict-container';
            container.style.cssText = 'margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;';
            
            const timeField = document.getElementById('preferredTime');
            if (timeField && timeField.parentNode) {
                timeField.parentNode.parentNode.insertBefore(container, timeField.parentNode.nextSibling);
            }
        }
        
        if (result.has_conflicts) {
            let html = `<div style="background: #fff3cd; padding: 15px; border: 1px solid #ffeaa7; border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Time slot conflict detected!</h4>
                <p style="margin: 0 0 10px 0;">You already have ${result.conflicts.length} appointment(s) during this time:</p>
                <ul style="margin: 0 0 15px 0;">`;
            
            result.conflicts.forEach(conflict => {
                html += `<li><strong>${conflict.summary}</strong> (${conflict.start} - ${conflict.end})</li>`;
            });
            
            html += '</ul>';
            
            if (result.alternatives && result.alternatives.length > 0) {
                html += '<p style="margin: 0 0 10px 0; color: #155724;"><strong>✅ Available alternative time slots for this date:</strong></p>';
                result.alternatives.forEach(alt => {
                    if (alt.available) {
                        html += `<button onclick="selectAlternativeTime('${alt.slot}')" style="margin: 5px 5px 5px 0; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">${alt.display}</button>`;
                    }
                });
            }
            
            html += '</div>';
            container.innerHTML = html;
            
            // Disable booking button
            const bookButton = document.querySelector('button[type="submit"], button:contains("Book"), .book-button, #payButton');
            if (bookButton) {
                bookButton.disabled = true;
                bookButton.style.background = '#dc3545';
                bookButton.textContent = 'Resolve Conflicts to Book';
            }
            
        } else {
            container.innerHTML = `<div style="background: #d4edda; padding: 15px; border: 1px solid #c3e6cb; border-radius: 5px; color: #155724;">
                <strong>✅ Time slot available! No conflicts detected.</strong>
            </div>`;
            
            // Re-enable booking button
            const bookButton = document.querySelector('button[type="submit"], button:contains("Book"), .book-button, #payButton');
            if (bookButton) {
                bookButton.disabled = false;
                bookButton.style.background = '';
                bookButton.textContent = 'Complete Form to Book';
            }
        }
    };
    
    // Select alternative time slot
    window.selectAlternativeTime = function(timeSlot) {
        const timeSelect = document.getElementById('preferredTime');
        if (timeSelect) {
            timeSelect.value = timeSlot;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            timeSelect.dispatchEvent(event);
            
            // Re-check conflicts
            checkConflictsForCurrentSelection();
        }
    };
    
    // Check conflicts for current date/time selection
    window.checkConflictsForCurrentSelection = async function() {
        const dateInput = document.getElementById('preferredDate');
        const timeSelect = document.getElementById('preferredTime');
        
        if (dateInput && timeSelect) {
            const date = dateInput.value;
            const timeSlot = timeSelect.value;
            
            if (date && timeSlot) {
                console.log(`🔍 Checking conflicts for ${date} ${timeSlot}...`);
                const result = await window.checkCalendarConflicts(date, timeSlot);
                window.displayConflictResults(result);
            }
        }
    };
    
    // Initialize calendar integration when DOM is ready
    function initializeCalendarIntegration() {
        console.log('🚀 Initializing calendar integration...');
        
        const dateInput = document.getElementById('preferredDate');
        const timeSelect = document.getElementById('preferredTime');
        
        console.log(`Found elements - Date: ${!!dateInput}, Time: ${!!timeSelect}`);
        
        if (dateInput && timeSelect) {
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            
            // Add event listeners
            dateInput.addEventListener('change', function() {
                console.log('📅 Date changed to:', this.value);
                window.checkConflictsForCurrentSelection();
            });
            
            timeSelect.addEventListener('change', function() {
                console.log('⏰ Time changed to:', this.value);
                window.checkConflictsForCurrentSelection();
            });
            
            console.log('✅ Calendar integration initialized successfully');
        } else {
            console.warn('❌ Could not find date or time input fields');
            // Retry after a short delay
            setTimeout(initializeCalendarIntegration, 1000);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCalendarIntegration);
    } else {
        initializeCalendarIntegration();
    }
    
    // Also initialize on window load as backup
    window.addEventListener('load', function() {
        console.log('🔄 Window loaded - ensuring calendar integration is active');
        if (!document.getElementById('preferredDate') || !document.getElementById('preferredTime')) {
            initializeCalendarIntegration();
        }
    });
    
})();

