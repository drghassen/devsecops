// ==================== DASHBOARD CORE JAVASCRIPT ====================
// Refactored to use PageDataHandler from utils.js with custom thresholds

(function () {
    'use strict';

    /**
     * Dashboard Data Handler
     * Extends PageDataHandler to provide main dashboard functionality
     */
    class DashboardPageHandler extends PageDataHandler {
        constructor() {
            super({
                pageName: 'Dashboard',
                endpoint: '/ws/dashboard/',
                // Keys mapping to data arrays
                dataKeys: ['cpu', 'ram', 'power', 'eco', 'co2'],
                // Metrics to update in top cards
                metrics: [
                    { id: 'avg-cpu', key: 'avg_cpu', suffix: '%' },
                    { id: 'avg-ram', key: 'avg_ram', suffix: '%' },
                    { id: 'avg-power', key: 'avg_power', suffix: ' W' },
                    { id: 'avg-eco', key: 'avg_eco', suffix: '' }
                ],
                // Charts configuration
                charts: [
                    {
                        canvasId: 'cpuRamChart',
                        type: 'line',
                        dataKey: 'cpu', // Primary data key, datasets handled via override
                        label: 'CPU & RAM', // Placeholder
                        color: 'primary'
                    },
                    {
                        canvasId: 'energyChart',
                        type: 'bar',
                        dataKey: 'power',
                        label: 'Watts',
                        color: 'warning'
                    },
                    {
                        canvasId: 'ecoChart',
                        type: 'line',
                        dataKey: 'eco',
                        label: 'Score Éco',
                        color: 'success'
                    },
                    {
                        canvasId: 'co2Chart',
                        type: 'line',
                        dataKey: 'co2',
                        label: 'CO₂ (g)',
                        color: 'danger'
                    }
                ],
                // Table configuration
                tableColumns: 7,
                tableRenderer: (data) => `
                    <tr>
                        <td>${data.id}</td>
                        <td>${data.hardware_sensor_id}</td>
                        <td>${data.cpu_usage}%</td>
                        <td>${data.ram_usage}%</td>
                        <td>${data.power_watts}W</td>
                        <td><span class="badge ${data.eco_score >= 75 ? 'bg-success' : data.eco_score >= 50 ? 'bg-warning' : 'bg-danger'}">${data.eco_score}</span></td>
                        <td>${new Date(data.created_at).toLocaleString('fr-FR')}</td>
                    </tr>
                `
            });

            // Notification thresholds configuration (Based on Averages)
            this.thresholds = {
                cpu: {
                    limit: 80,
                    cmp: '>',
                    title: 'Charge Moyenne Élevée',
                    message: v => `CPU Moyen: ${v}% (Seuil: 80%). Attention à la surcharge.`,
                    type: 'warning'
                },
                ram: {
                    limit: 85,
                    cmp: '>',
                    title: 'Mémoire Saturée',
                    message: v => `RAM Moyenne: ${v}% (Seuil: 85%). Optimisation requise.`,
                    type: 'warning'
                },
                power: { // Note: key matches 'avg_power' from serverAverages logic
                    limit: 250,
                    cmp: '>',
                    title: 'Consommation Excessive',
                    message: v => `Conso Moyenne: ${v}W (Seuil: 250W). Vérifiez les équipements.`,
                    type: 'warning'
                },
                co2: {
                    limit: 150,
                    cmp: '>',
                    title: 'Emissions CO₂ Élevées',
                    message: v => `CO₂ Moyen: ${v}g (Seuil: 150g). Impact environnemental critique.`,
                    type: 'danger'
                },
                eco: { // Note: key matches 'avg_eco'
                    limit: 50,
                    cmp: '<',
                    title: 'Score Éco Insuffisant',
                    message: v => `Score Éco Moyen: ${v} (Seuil: 50). Performance écologique faible.`,
                    type: 'danger'
                }
            };

            // Previous state for change detection
            this.previousAverages = {
                cpu: null,
                ram: null,
                power: null,
                co2: null,
                eco: null
            };
        }

        /**
         * Override getDataKeyMappings to map standard internal keys to element IDs (for initial load)
         */
        getDataKeyMappings() {
            return {
                cpu: 'cpu_data',
                ram: 'ram_data',
                power: 'power_data',
                eco: 'eco_data',
                co2: 'co2_data'
            };
        }

        /**
         * Override loadInitialData to support dashboard.html's single JSON block
         */
        loadInitialData() {
            try {
                const dataElement = document.getElementById('initial-dashboard-data');
                if (dataElement) {
                    const initialData = JSON.parse(dataElement.textContent);

                    // Map initial data to our internal structure
                    this.chartLabels = initialData.chart_labels || [];
                    this.data.cpu = initialData.cpu_data || [];
                    this.data.ram = initialData.ram_data || [];
                    this.data.power = initialData.power_data || [];
                    this.data.eco = initialData.eco_data || [];
                    this.data.co2 = initialData.co2_data || [];

                    // Also handle table data if present
                    if (initialData.latest_data) {
                        this.updateTable(initialData.latest_data);
                    }

                    console.log('Dashboard: Initial data loaded from JSON block', this.data);
                }
            } catch (error) {
                console.error('Dashboard: Error loading initial data', error);
            }
        }

        /**
         * Override initializeCharts to handle the specific CPU definition which differs from generic single-dataset
         */
        initializeCharts() {
            if (!this.chartLabels.length) return;

            ChartUtils.destroyAll(this.charts);
            this.charts = {};

            // CPU & RAM Chart (Combined)
            this.charts.cpuRamChart = ChartUtils.createChart('cpuRamChart', 'line', [
                {
                    label: 'CPU %',
                    data: this.data.cpu || [],
                    borderColor: ChartUtils.colors.primary,
                    backgroundColor: ChartUtils.colors.primaryBg,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'RAM %',
                    data: this.data.ram || [],
                    borderColor: ChartUtils.colors.purple,
                    backgroundColor: ChartUtils.colors.purpleBg,
                    fill: true,
                    tension: 0.4
                }
            ], { labels: this.chartLabels, scales: { y: { min: 0, max: 100 } } });

            // Energy Chart
            this.charts.energyChart = ChartUtils.createChart('energyChart', 'bar', [{
                label: 'Watts',
                data: this.data.power || [],
                backgroundColor: ChartUtils.colors.warning
            }], { labels: this.chartLabels, scales: { y: { min: 0 } } });

            // Eco Chart
            this.charts.ecoChart = ChartUtils.createChart('ecoChart', 'line', [{
                label: 'Score Éco',
                data: this.data.eco || [],
                borderColor: ChartUtils.colors.success,
                backgroundColor: ChartUtils.colors.successBg,
                fill: true,
                tension: 0.4
            }], { labels: this.chartLabels, scales: { y: { min: 0, max: 100 } } });

            // CO2 Chart
            this.charts.co2Chart = ChartUtils.createChart('co2Chart', 'line', [{
                label: 'CO₂ (g)',
                data: this.data.co2 || [],
                borderColor: ChartUtils.colors.danger,
                backgroundColor: ChartUtils.colors.dangerBg,
                fill: true,
                tension: 0.4
            }], { labels: this.chartLabels, scales: { y: { min: 0 } } });
        }

        /**
         * Override parseWebSocketData to map dashboard specific keys
         */
        parseWebSocketData(data) {
            const parseIfString = (val) => typeof val === 'string' ? JSON.parse(val) : (val || []);

            this.data.cpu = parseIfString(data.cpu_data);
            this.data.ram = parseIfString(data.ram_data);
            this.data.power = parseIfString(data.power_data);
            this.data.eco = parseIfString(data.eco_data);
            this.data.co2 = parseIfString(data.co2_data);
        }

        /**
         * Override updateMetrics to also trigger notification checks
         */
        updateMetrics() {
            super.updateMetrics();

            // Get current averages (either from server or calculated)
            const currentAverages = {};

            // We need to calculate/get averages for ALL metrics that have thresholds
            // The super.updateMetrics() only updates UI elements defined in this.config.metrics

            // Let's create a mapping of all keys we need
            const keysToCheck = ['cpu', 'ram', 'power', 'eco', 'co2'];

            keysToCheck.forEach(key => {
                let value = null;
                // Check server side averages first (e.g. avg_cpu)
                const serverKey = 'avg_' + key;
                if (this.serverAverages && this.serverAverages[serverKey] !== undefined) {
                    value = parseFloat(this.serverAverages[serverKey]);
                } else {
                    // Fallback to client-side calculation
                    const dataArray = this.data[key] || [];
                    if (dataArray.length > 0) {
                        const sum = dataArray.reduce((a, b) => a + Number(b), 0);
                        value = parseFloat((sum / dataArray.length).toFixed(1));
                    }
                }
                currentAverages[key] = value;
            });

            // Check thresholds with these averages
            this.checkAverageThresholds(currentAverages);
        }

        /**
         * Check if AVERAGE metrics exceed defined thresholds
         * Same logic as the previous dashboard-core.js but integrated into the class
         */
        checkAverageThresholds(averages) {
            if (!averages) return;

            try {
                const checks = [
                    ['cpu', averages.cpu],
                    ['ram', averages.ram],
                    ['power', averages.power],
                    ['eco', averages.eco],
                    ['co2', averages.co2]
                ];

                for (const [k, v] of checks) {
                    const conf = this.thresholds[k];
                    // Validate value is a number
                    if (conf && v != null && !isNaN(v)) {

                        // Check if threshold is crossed
                        if (this.compare(v, conf)) {
                            const previousValue = this.previousAverages[k];
                            // Trigger notification if:
                            // 1. First time crossing (previous is null)
                            // 2. OR Value has changed significantly (> 2 units)

                            const hasChangedSignificantly = previousValue === null || Math.abs(v - previousValue) > 2;

                            if (hasChangedSignificantly) {
                                this.previousAverages[k] = v; // Update state

                                if (window.notificationSystem) {
                                    window.notificationSystem.addNotification(
                                        conf.type,
                                        conf.title,
                                        conf.message(v),
                                        v
                                    );
                                }
                            }
                        } else {
                            // Reset state if we are back to normal levels
                            this.previousAverages[k] = null;
                        }
                    }
                }
            } catch (e) {
                console.error('Error in checkAverageThresholds:', e);
            }
        }

        compare(val, conf) {
            if (val == null) return false;
            return conf.cmp === '>' ? (val > conf.limit) : (val < conf.limit);
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        // Expose instance for debugging if needed
        window.dashboardHandler = new DashboardPageHandler();
        window.dashboardHandler.init();
    });

})();
