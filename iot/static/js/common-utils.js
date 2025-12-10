/**
 * EcoTrack IoT - Common Utilities
 * General helper functions, DOM manipulation, and Sidebar management
 */

// ==================== DATA UTILITIES ====================

const DataUtils = {
    // Calculate average of an array
    calculateAverage(arr) {
        if (!arr || !arr.length) return 0;
        return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
    },

    // Format date to French locale
    formatDate(date) {
        return new Date(date).toLocaleString('fr-FR');
    },

    // Format time to French locale
    formatTime(date) {
        return new Date(date).toLocaleTimeString('fr-FR');
    },

    // Get badge class based on value and thresholds
    getBadgeClass(value, goodThreshold, warningThreshold, inverse = false) {
        if (inverse) {
            // Lower is better (e.g., overheating)
            if (value <= goodThreshold) return 'bg-success';
            if (value <= warningThreshold) return 'bg-warning';
            return 'bg-danger';
        } else {
            // Higher is better (e.g., battery health, eco score)
            if (value >= goodThreshold) return 'bg-success';
            if (value >= warningThreshold) return 'bg-warning';
            return 'bg-danger';
        }
    }
};

// ==================== DOM UTILITIES ====================

const DOMUtils = {
    // Update element text content safely
    updateText(elementId, text) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = text;
    },

    // Update last update time
    updateLastUpdateTime() {
        this.updateText('last-update', DataUtils.formatTime(new Date()));
    },

    // Generate table row HTML
    generateTableRow(data, columns) {
        return `<tr>${columns.map(col => `<td>${col}</td>`).join('')}</tr>`;
    },

    // Show empty table message
    getEmptyTableRow(colspan) {
        return `<tr><td colspan="${colspan}" class="text-center py-5 opacity-50">Aucune donnée disponible</td></tr>`;
    }
};

// ==================== SIDEBAR MANAGEMENT ====================

const SidebarManager = {
    init() {
        const sidebar = document.getElementById('sidebar');
        const toggle = document.getElementById('sidebarToggle');

        if (!sidebar || !toggle) return;

        let expanded = false;

        const setExpanded = (exp) => {
            sidebar.classList.toggle('expanded', !!exp);
            document.body.classList.toggle('sidebar-open', !!exp);
        };

        toggle.addEventListener('click', () => {
            expanded = !expanded;
            setExpanded(expanded);
        });

        const handleDesktop = () => {
            sidebar.addEventListener('mouseenter', () => setExpanded(true));
            sidebar.addEventListener('mouseleave', () => setExpanded(false));
        };

        if (window.innerWidth >= 992) {
            handleDesktop();
        } else {
            setExpanded(true);
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth < 992) {
                setExpanded(true);
            }
        });
    }
};

// ==================== API UTILITIES ====================

const APIUtils = {
    baseUrl: '/api',

    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
        }
    },

    // Generic data refresh function
    async refreshPageData(endpoint, updateCallback) {
        const data = await this.fetchData(endpoint);
        if (data) {
            updateCallback(data);
            DOMUtils.updateLastUpdateTime();
        }
    }
};

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    SidebarManager.init();
});
