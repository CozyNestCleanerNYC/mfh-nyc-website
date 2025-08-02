// Calendar Integration - External Script
// This ensures reliable execution by being loaded as an external file

(function() {
    'use strict';
    
    console.log('🔑 Calendar integration script loaded');
    
    // Backend calendar integration
    const CALENDAR_API_BASE = 'https://9yhyi3c80zjm.manus.space';
    
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
            console.log('🚨 Conflict detected!');
            
            // Show generic conflict warning without private details
            container.innerHTML = `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 5px;">
                    <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ Time slot conflict detected!</h4>
                    <p>This time slot is not available. Please select an alternative time.</p>
                    <p style="margin-top: 15px;"><strong>✅ Available alternative time slots for this date:</strong></p>
                    ${result.alternatives.map(alt => `
                        <button onclick="selectAlternativeTime('${alt.slot}')" style="margin: 5px; padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">
                            ${alt.display}
                        </button>
                    `).join('')}
                </div>
            `;
            container.style.display = 'block';
            
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
            let date = dateInput.value;
            const timeSlot = timeSelect.value;
            
            // Fix date format if corrupted or malformed
            if (date) {
                // Handle various date corruption patterns
                if (date.length > 10) {
                    // Pattern: "50802-02-02" -> "2025-08-02"
                    const parts = date.split('-');
                    if (parts.length === 3 && parts[0].length > 4) {
                        const year = parts[0].slice(-4);
                        date = `${year}-${parts[1]}-${parts[2]}`;
                        console.log(`🔧 Fixed corrupted date from ${dateInput.value} to ${date}`);
                    }
                } else if (date.length === 8 && !date.includes('-')) {
                    // Pattern: "20250802" -> "2025-08-02"
                    date = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
                    console.log(`🔧 Fixed compact date from ${dateInput.value} to ${date}`);
                } else if (date.includes('/')) {
                    // Pattern: "08/02/2025" -> "2025-08-02"
                    const parts = date.split('/');
                    if (parts.length === 3) {
                        const [month, day, year] = parts;
                        date = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
                        console.log(`🔧 Fixed slash date from ${dateInput.value} to ${date}`);
                    }
                }
                
                // Validate final date format
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    console.warn(`⚠️ Date format still invalid: ${date}`);
                    return; // Don't proceed with invalid date
                }
            }
            
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
            
            // Add event listeners with better date handling
            dateInput.addEventListener('change', function() {
                console.log('📅 Date changed to:', this.value);
                setTimeout(() => {
                    window.checkConflictsForCurrentSelection();
                }, 200); // Delay to ensure value is properly set
            });
            
            dateInput.addEventListener('blur', function() {
                console.log('📅 Date field blurred with value:', this.value);
                setTimeout(() => {
                    window.checkConflictsForCurrentSelection();
                }, 200);
            });
            
            dateInput.addEventListener('input', function() {
                console.log('📅 Date input event:', this.value);
                // Don't trigger immediately on input, wait for change/blur
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

