// ==================== HARDWARE PAGE JAVASCRIPT ====================
// Refactored to use PageDataHandler base class from utils.js

(function () {
    'use strict';

    /**
     * Hardware page data handler
     * Extends PageDataHandler with hardware-specific configuration
     */
    class HardwarePageHandler extends PageDataHandler {
        constructor() {
            super({
                pageName: 'Hardware',
                endpoint: '/ws/hardware/',
                dataKeys: ['cpu', 'ram', 'battery', 'age'],
                metrics: [
                    { id: 'avg-cpu', key: 'avg_cpu', suffix: '%' },
                    { id: 'avg-ram', key: 'avg_ram', suffix: '%' },
                    { id: 'avg-battery', key: 'avg_battery', suffix: '%' },
                    { id: 'avg-age', key: 'avg_age', suffix: ' ans' }
                ],
                charts: [
                    {
                        canvasId: 'cpuRamChart',
                        type: 'line',
                        dataKey: 'cpu',
                        label: 'CPU (%)',
                        color: 'primary'
                    },
                    {
                        canvasId: 'batteryChart',
                        type: 'bar',
                        dataKey: 'battery',
                        label: 'Santé Batterie (%)',
                        color: 'success'
                    },
                    {
                        canvasId: 'ageChart',
                        type: 'line',
                        dataKey: 'age',
                        label: 'Âge (années)',
                        color: 'warning'
                    }
                ],
                tableColumns: 7,
                tableRenderer: (data) => `
                    <tr>
                        <td>${data.id}</td>
                        <td>${data.hardware_sensor_id}</td>
                        <td>${data.cpu_usage}%</td>
                        <td>${data.ram_usage}%</td>
                        <td><span class="badge ${data.battery_health >= 80 ? 'bg-success' : data.battery_health >= 50 ? 'bg-warning' : 'bg-danger'}">${data.battery_health}%</span></td>
                        <td>${data.age_years} ans</td>
                        <td>${new Date(data.created_at).toLocaleString('fr-FR')}</td>
                    </tr>
                `
            });
        }

        /**
         * Override to handle multiple datasets for CPU/RAM chart
         */
        initializeCharts() {
            ChartUtils.destroyAll(this.charts);
            this.charts = {};

            if (!this.chartLabels.length) return;

            // CPU & RAM combined chart
            this.charts.cpuRamChart = ChartUtils.createChart('cpuRamChart', 'line', [
                {
                    label: 'CPU (%)',
                    data: this.data.cpu || [],
                    borderColor: ChartUtils.colors.primary,
                    backgroundColor: ChartUtils.colors.primaryBg,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'RAM (%)',
                    data: this.data.ram || [],
                    borderColor: ChartUtils.colors.info,
                    backgroundColor: ChartUtils.colors.infoBg,
                    fill: true,
                    tension: 0.4
                }
            ], { labels: this.chartLabels });

            // Battery chart
            this.charts.batteryChart = ChartUtils.createChart('batteryChart', 'bar', [{
                label: 'Santé Batterie (%)',
                data: this.data.battery || [],
                backgroundColor: ChartUtils.colors.success
            }], { labels: this.chartLabels });

            // Age chart
            this.charts.ageChart = ChartUtils.createChart('ageChart', 'line', [{
                label: 'Âge (années)',
                data: this.data.age || [],
                borderColor: ChartUtils.colors.warning,
                backgroundColor: ChartUtils.colors.warningBg,
                fill: true,
                tension: 0.4
            }], { labels: this.chartLabels });
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        new HardwarePageHandler().init();
    });
})();
