/**
 * EcoTrack IoT - Chart Utilities
 * Handles all Chart.js configurations and helpers
 */

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
