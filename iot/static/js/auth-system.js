/**
 * ============================================================================
 * ECOTRACK IOT - AUTH SYSTEM
 * ============================================================================
 * Professional authentication and session management system
 * Synchronized with Django's session management via API
 */

class ProfessionalAuthSystem {
    constructor() {
        this.sessionDuration = 30 * 60; // Default 30 minutes (will be updated from server)
        this.warningTime = 5 * 60; // 5 minutes warning
        this.remainingSeconds = this.sessionDuration;
        this.checkInterval = 60 * 1000; // Check session status every minute
        this.countdownInterval = null;
        this.isInitialized = false;

        this.init();
    }

    async init() {
        // Fetch initial session info from server
        await this.syncWithServer();

        // Start the countdown timer
        this.startSessionTimer();

        // Setup activity tracking
        this.setupEventListeners();

        // Update display
        this.updateSessionDisplay();

        this.isInitialized = true;
    }

    async syncWithServer() {
        try {
            const response = await fetch('/api/session-info/', {
                method: 'GET',
                credentials: 'same-origin'
            });

            if (response.status === 401 || response.status === 403) {
                this.handleSessionExpiry();
                return;
            }

            if (response.ok) {
                const data = await response.json();
                this.sessionDuration = data.session_duration;
                this.remainingSeconds = data.remaining_seconds;
                this.username = data.username;

                // Update session start display
                const sessionStartEl = document.getElementById('sessionStart');
                if (sessionStartEl) {
                    const startDate = new Date(data.session_start * 1000);
                    sessionStartEl.textContent = startDate.toLocaleTimeString('fr-FR');
                }
            }
        } catch (error) {
            console.warn('Failed to sync session with server:', error);
        }
    }

    updateSessionDisplay() {
        this.updateCountdown();
    }

    updateCountdown() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;

        const countdownElement = document.getElementById('sessionCountdown');
        if (countdownElement) {
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Change color based on remaining time
            if (this.remainingSeconds <= this.warningTime) {
                countdownElement.style.color = '#ef4444';
                if (countdownElement.previousElementSibling) {
                    countdownElement.previousElementSibling.style.color = '#ef4444';
                }
            } else if (this.remainingSeconds <= 10 * 60) { // 10 minutes
                countdownElement.style.color = '#f59e0b';
                if (countdownElement.previousElementSibling) {
                    countdownElement.previousElementSibling.style.color = '#f59e0b';
                }
            } else {
                countdownElement.style.color = '';
                if (countdownElement.previousElementSibling) {
                    countdownElement.previousElementSibling.style.color = '';
                }
            }

            // Auto expiration
            if (this.remainingSeconds <= 0) {
                this.handleSessionExpiry();
            }
        }
    }

    startSessionTimer() {
        // Update countdown every second
        this.countdownInterval = setInterval(() => {
            if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
            }
            this.updateCountdown();
        }, 1000);

        // Sync with server periodically
        setInterval(() => {
            this.syncWithServer();
        }, this.checkInterval);
    }

    handleSessionExpiry() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        // Show expiration notification
        if (typeof notificationSystem !== 'undefined') {
            notificationSystem.addNotification(
                'warning',
                'Session expirée',
                'Votre session a expiré. Vous allez être redirigé vers la page de connexion.',
                null
            );
        }

        // Redirect after delay
        setTimeout(() => {
            window.location.href = '/api/login/';
        }, 3000);
    }

    setupEventListeners() {
        // User activity to extend session
        let activityTimeout;
        let lastExtendTime = 0;
        const EXTEND_COOLDOWN = 60 * 1000; // Only extend once per minute

        const handleActivity = async () => {
            clearTimeout(activityTimeout);

            const now = Date.now();
            if (now - lastExtendTime > EXTEND_COOLDOWN) {
                activityTimeout = setTimeout(async () => {
                    await this.extendSession();
                    lastExtendTime = Date.now();
                }, 5000); // Wait 5 seconds of activity before extending
            }
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });
    }

    async extendSession() {
        try {
            const response = await fetch('/api/extend-session/', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Sync with server to get updated remaining time
                await this.syncWithServer();
                console.log('Session extended successfully');
            }
        } catch (error) {
            console.warn('Failed to extend session:', error);
        }
    }
}

// Session panel control functions
function showSessionInfo() {
    const sessionInfo = document.getElementById('sessionInfo');
    if (sessionInfo) {
        sessionInfo.classList.remove('hidden');
    }
}

function hideSessionInfo() {
    const sessionInfo = document.getElementById('sessionInfo');
    if (sessionInfo) {
        sessionInfo.classList.add('hidden');
    }
}

// Initialize auth system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthSystem);
} else {
    initAuthSystem();
}

function initAuthSystem() {
    // Initialize the professional authentication system
    const authSystem = new ProfessionalAuthSystem();

    // Hide session panel when clicking outside
    document.addEventListener('click', (e) => {
        const sessionInfo = document.getElementById('sessionInfo');
        const securityIndicator = document.querySelector('.security-indicator');

        if (sessionInfo && securityIndicator) {
            if (!sessionInfo.contains(e.target) && !securityIndicator.contains(e.target)) {
                hideSessionInfo();
            }
        }
    });

    // Make authSystem globally available if needed
    window.authSystem = authSystem;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProfessionalAuthSystem, showSessionInfo, hideSessionInfo };
}
