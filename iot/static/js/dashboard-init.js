/**
 * EcoTrack IoT - Dashboard Initialization
 * Coordinates core systems and UI events
 */

// Global system references
window.notificationSystem = null;
window.chatbotSystem = null;

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Initializing Dashboard Systems...');

    // 1. Initialize core systems
    try {
        window.notificationSystem = new NotificationSystem();
        window.chatbotSystem = new ChatbotSystem();
        console.log('✅ Notification and Chatbot systems initialized globally');
    } catch (e) {
        console.error('❌ Error initializing core systems:', e);
    }

    // 2. Clickable Metric Cards
    document.querySelectorAll('.metric-card-clickable').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function () {
            const url = this.getAttribute('data-navigate');
            if (url) window.location.href = url;
        });
        
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 32px rgba(67, 97, 238, 0.3)';
        });
        
        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });

    // 3. Category Navigation Buttons
    // These URLs are usually infused via Django, but we can handle it generically
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.style.cursor = 'pointer';
        // Redirection logic is already handled by <a> tags in some versions,
        // but this ensures consistency if they are just <div> or <button>
        if (btn.tagName !== 'A') {
            btn.addEventListener('click', (e) => {
                const link = btn.querySelector('a') || btn.closest('a');
                if (link) {
                    window.location.href = link.href;
                }
            });
        }
    });

    console.log('✅ Dashboard UI events and initializations complete');
});


/**
 * Session Info Visibility Handlers
 */
window.showSessionInfo = function() {
    const panel = document.getElementById('sessionInfo');
    if (panel) panel.classList.remove('hidden');
};

window.hideSessionInfo = function() {
    const panel = document.getElementById('sessionInfo');
    if (panel) panel.classList.add('hidden');
};
