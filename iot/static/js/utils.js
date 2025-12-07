/**
 * EcoTrack IoT - Shared Utilities
 * Common functions used across all pages
 */

// ==================== CHART UTILITIES ====================

const ChartUtils = {
    // Common chart options
    getBaseOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#e2e8f0',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 500,
                easing: 'easeInOutQuart'
            }
        };
    },

    // Create a chart with default options
    createChart(canvasId, type, datasets, customOptions = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas element not found: ${canvasId}`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const baseOptions = this.getBaseOptions();

        // Merge options
        const options = {
            ...baseOptions,
            ...customOptions,
            plugins: {
                ...baseOptions.plugins,
                ...(customOptions.plugins || {})
            },
            scales: {
                ...baseOptions.scales,
                ...(customOptions.scales || {})
            }
        };

        // Extract labels from customOptions
        const labels = customOptions.labels || [];

        return new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: options
        });
    },

    // Destroy all charts in an object
    destroyAll(charts) {
        if (!charts) return;
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    },

    // Get chart colors
    colors: {
        primary: '#4361ee',
        primaryBg: 'rgba(67, 97, 238, 0.1)',
        purple: '#a78bfa',
        purpleBg: 'rgba(167, 139, 250, 0.1)',
        success: '#10b981',
        successBg: 'rgba(16, 185, 129, 0.2)',
        warning: '#f59e0b',
        warningBg: 'rgba(245, 158, 11, 0.2)',
        danger: '#ef4444',
        dangerBg: 'rgba(239, 68, 68, 0.2)',
        info: '#38bdf8',
        infoBg: 'rgba(56, 189, 248, 0.2)',
        orange: '#f97316',
        orangeBg: 'rgba(249, 115, 22, 0.2)'
    }
};

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

// ==================== PAGE DATA MANAGER ====================

class PageDataManager {
    constructor(config) {
        this.config = config;
        this.charts = {};
        this.data = {};
        this.refreshInterval = config.refreshInterval || 1500;
    }

    async init() {
        SidebarManager.init();
        await this.refreshData();
        this.startAutoRefresh();
    }

    async refreshData() {
        const data = await APIUtils.fetchData(this.config.endpoint);
        if (data) {
            this.data = data;
            this.updateAverages(data);
            this.updateCharts(data);
            this.updateTable(data);
            DOMUtils.updateLastUpdateTime();
        }
    }

    updateAverages(data) {
        if (this.config.averages) {
            this.config.averages.forEach(({ elementId, dataKey, suffix }) => {
                const value = data[dataKey] !== undefined ? data[dataKey] : DataUtils.calculateAverage(data[`${dataKey}_data`] || []);
                DOMUtils.updateText(elementId, value + (suffix || ''));
            });
        }
    }

    updateCharts(data) {
        ChartUtils.destroyAll(this.charts);
        this.charts = {};

        if (this.config.charts) {
            this.config.charts.forEach(chartConfig => {
                const labels = data.chart_labels || [];
                if (labels.length > 0) {
                    this.charts[chartConfig.id] = ChartUtils.createChart(
                        chartConfig.canvasId,
                        chartConfig.type,
                        chartConfig.getDatasets(data),
                        { labels, ...chartConfig.options }
                    );
                }
            });
        }
    }

    updateTable(data) {
        const tbody = document.getElementById('data-table-body');
        if (!tbody || !this.config.tableRenderer) return;

        const latestData = data.latest_data || [];
        tbody.innerHTML = latestData.length > 0
            ? latestData.map(row => this.config.tableRenderer(row)).join('')
            : DOMUtils.getEmptyTableRow(this.config.tableColumns || 7);
    }

    startAutoRefresh() {
        setInterval(() => this.refreshData(), this.refreshInterval);
    }
}

// ==================== PAGE DATA HANDLER (WebSocket) ====================

/**
 * Base class for page data handlers using WebSocket connections
 * Used by energy.js, network.js, hardware.js, scores.js
 */
class PageDataHandler {
    constructor(config) {
        this.config = config;
        this.charts = {};
        this.data = {};
        this.chartLabels = [];
        this.socket = null;
        this.serverAverages = {};
    }

    /**
     * Initialize the page data handler
     */
    init() {
        console.log(`Initializing ${this.config.pageName} page handler...`);

        // Initialize sidebar
        SidebarManager.init();

        // Load initial data from embedded JSON scripts
        this.loadInitialData();

        // Initialize charts with the data
        this.initializeCharts();

        // Update metric cards
        this.updateMetrics();

        // Connect to WebSocket for real-time updates
        this.connectWebSocket();
    }

    /**
     * Load initial data from embedded JSON script tags in the template
     */
    loadInitialData() {
        try {
            // Get chart labels
            const labelsEl = document.getElementById('chart-labels-data');
            if (labelsEl) {
                this.chartLabels = JSON.parse(labelsEl.textContent || '[]');
            }

            // Load data for each configured data key
            const dataKeyMappings = this.getDataKeyMappings();
            Object.entries(dataKeyMappings).forEach(([dataKey, elementId]) => {
                const el = document.getElementById(elementId);
                if (el) {
                    this.data[dataKey] = JSON.parse(el.textContent || '[]');
                }
            });

            console.log(`${this.config.pageName}: Initial data loaded`, this.data);
        } catch (error) {
            console.error(`${this.config.pageName}: Error loading initial data`, error);
        }
    }

    /**
     * Get mapping of data keys to element IDs based on page config
     */
    getDataKeyMappings() {
        const mappings = {};
        if (this.config.pageName === 'Energy') {
            mappings.power = 'power-data';
            mappings.co2 = 'co2-data';
            mappings.overheating = 'overheating-data';
            mappings.active_devices = 'active-devices-data';
        } else if (this.config.pageName === 'Network') {
            mappings.network_load = 'network-load-data';
            mappings.requests = 'requests-data';
            mappings.cloud_dependency = 'cloud-dependency-data';
        } else if (this.config.pageName === 'Hardware') {
            mappings.cpu = 'cpu-data';
            mappings.ram = 'ram-data';
            mappings.battery = 'battery-data';
            mappings.age = 'age-data';
        } else if (this.config.pageName === 'Scores') {
            mappings.eco_score = 'eco-data';
            mappings.obsolescence = 'obsolescence-data';
            mappings.bigtech = 'bigtech-data';
            mappings.co2_savings = 'co2-savings-data';
        }
        return mappings;
    }

    /**
     * Initialize all charts defined in the config
     */
    initializeCharts() {
        ChartUtils.destroyAll(this.charts);
        this.charts = {};

        if (!this.chartLabels.length) {
            console.warn(`${this.config.pageName}: No chart labels available`);
            return;
        }

        if (!this.config.charts) return;

        this.config.charts.forEach(chartConfig => {
            const chartData = this.data[chartConfig.dataKey] || [];
            const color = ChartUtils.colors[chartConfig.color] || ChartUtils.colors.primary;
            const bgColor = ChartUtils.colors[chartConfig.color + 'Bg'] || ChartUtils.colors.primaryBg;

            const datasets = [{
                label: chartConfig.label,
                data: chartData,
                borderColor: color,
                backgroundColor: chartConfig.type === 'bar' ? color : bgColor,
                fill: chartConfig.type !== 'bar',
                tension: 0.4
            }];

            this.charts[chartConfig.canvasId] = ChartUtils.createChart(
                chartConfig.canvasId,
                chartConfig.type,
                datasets,
                { labels: this.chartLabels }
            );
        });
    }

    /**
     * Update metric cards with average values
     */
    updateMetrics() {
        if (!this.config.metrics) return;

        this.config.metrics.forEach(metric => {
            const el = document.getElementById(metric.id);
            if (!el) return;

            let value = '-';

            // First check if we have server-side averages stored
            if (this.serverAverages && this.serverAverages[metric.key] !== undefined) {
                value = this.serverAverages[metric.key];
            } else {
                // Otherwise calculate from data array
                const dataArray = this.data[metric.key.replace('avg_', '')] || [];
                if (dataArray.length > 0) {
                    const sum = dataArray.reduce((a, b) => a + b, 0);
                    value = metric.round ? Math.round(sum / dataArray.length) : (sum / dataArray.length).toFixed(1);
                }
            }

            el.textContent = value + (metric.suffix || '');
        });
    }

    /**
     * Connect to WebSocket for real-time updates
     */
    connectWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}${this.config.endpoint}`;

        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log(`${this.config.pageName}: WebSocket connected`);
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketData(data);
            };

            this.socket.onerror = (error) => {
                console.error(`${this.config.pageName}: WebSocket error`, error);
            };

            this.socket.onclose = () => {
                console.log(`${this.config.pageName}: WebSocket closed, reconnecting in 3s...`);
                setTimeout(() => this.connectWebSocket(), 3000);
            };
        } catch (error) {
            console.error(`${this.config.pageName}: Failed to connect WebSocket`, error);
        }
    }

    /**
     * Handle incoming WebSocket data
     */
    handleWebSocketData(data) {
        console.log(`${this.config.pageName}: Received WebSocket data`, data);

        // Parse chart labels
        if (data.chart_labels) {
            this.chartLabels = typeof data.chart_labels === 'string'
                ? JSON.parse(data.chart_labels)
                : data.chart_labels;
        }

        // Store server-side averages
        this.extractServerAverages(data);

        // Parse data arrays based on page type
        this.parseWebSocketData(data);

        // Update charts and metrics
        this.initializeCharts();
        this.updateMetrics();
        this.updateTable(data.latest_data || []);

        // Update last update time
        DOMUtils.updateLastUpdateTime();
    }

    /**
     * Extract server-side averages from WebSocket data
     */
    extractServerAverages(data) {
        // Look for keys that start with 'avg_'
        Object.keys(data).forEach(key => {
            if (key.startsWith('avg_')) {
                this.serverAverages[key] = data[key];
            }
        });
    }

    /**
     * Parse WebSocket data based on page type
     */
    parseWebSocketData(data) {
        const parseIfString = (val) => typeof val === 'string' ? JSON.parse(val) : (val || []);

        if (this.config.pageName === 'Energy') {
            this.data.power = parseIfString(data.power_data);
            this.data.co2 = parseIfString(data.co2_data);
            this.data.overheating = parseIfString(data.overheating_data);
            this.data.active_devices = parseIfString(data.active_devices_data);
        } else if (this.config.pageName === 'Network') {
            this.data.network_load = parseIfString(data.network_load_data);
            this.data.requests = parseIfString(data.requests_data);
            this.data.cloud_dependency = parseIfString(data.cloud_dependency_data);
        } else if (this.config.pageName === 'Hardware') {
            this.data.cpu = parseIfString(data.cpu_data);
            this.data.ram = parseIfString(data.ram_data);
            this.data.battery = parseIfString(data.battery_data);
            this.data.age = parseIfString(data.age_data);
        } else if (this.config.pageName === 'Scores') {
            this.data.eco_score = parseIfString(data.eco_data);
            this.data.obsolescence = parseIfString(data.obsolescence_data);
            this.data.bigtech = parseIfString(data.bigtech_data);
            this.data.co2_savings = parseIfString(data.co2_savings_data);
        }
    }

    /**
     * Update the data table
     */
    updateTable(latestData) {
        const tbody = document.getElementById('data-table-body');
        if (!tbody || !this.config.tableRenderer) return;

        tbody.innerHTML = latestData.length > 0
            ? latestData.map(row => this.config.tableRenderer(row)).join('')
            : DOMUtils.getEmptyTableRow(this.config.tableColumns || 7);
    }
}

// ==================== INITIALIZE ON DOM READY ====================

document.addEventListener('DOMContentLoaded', () => {
    SidebarManager.init();
});

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ChartUtils,
        DataUtils,
        DOMUtils,
        SidebarManager,
        APIUtils,
        PageDataManager,
        PageDataHandler
    };
}