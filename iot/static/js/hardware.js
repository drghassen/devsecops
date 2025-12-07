// ==================== HARDWARE PAGE JAVASCRIPT ====================
// Utilise les utilitaires communs depuis utils.js

(function() {
    'use strict';

    // Variables globales pour cette page
    let chartLabels = [];
    let cpuData = [];
    let ramData = [];
    let batteryData = [];
    let ageData = [];
    let charts = {};

    // Initialiser les données depuis le template Django
    function initDataFromTemplate() {
        const labelsEl = document.getElementById('chart-labels-data');
        const cpuEl = document.getElementById('cpu-data');
        const ramEl = document.getElementById('ram-data');
        const batteryEl = document.getElementById('battery-data');
        const ageEl = document.getElementById('age-data');

        if (labelsEl) chartLabels = JSON.parse(labelsEl.textContent || '[]');
        if (cpuEl) cpuData = JSON.parse(cpuEl.textContent || '[]');
        if (ramEl) ramData = JSON.parse(ramEl.textContent || '[]');
        if (batteryEl) batteryData = JSON.parse(batteryEl.textContent || '[]');
        if (ageEl) ageData = JSON.parse(ageEl.textContent || '[]');
    }

    // Mettre à jour les moyennes
    function updateAverages() {
        if (typeof DataUtils !== 'undefined') {
            const avgCpu = DataUtils.calculateAverage(cpuData);
            const avgRam = DataUtils.calculateAverage(ramData);
            const avgBattery = DataUtils.calculateAverage(batteryData);
            const avgAge = DataUtils.calculateAverage(ageData);

            DOMUtils.updateText('avg-cpu', avgCpu + '%');
            DOMUtils.updateText('avg-ram', avgRam + '%');
            DOMUtils.updateText('avg-battery', avgBattery + '%');
            DOMUtils.updateText('avg-age', avgAge + ' ans');
        } else {
            // Fallback si utils.js n'est pas chargé
            const avg = arr => arr.length ? (arr.reduce((a,b) => a + b, 0) / arr.length).toFixed(1) : 0;
            document.getElementById('avg-cpu').textContent = avg(cpuData) + '%';
            document.getElementById('avg-ram').textContent = avg(ramData) + '%';
            document.getElementById('avg-battery').textContent = avg(batteryData) + '%';
            document.getElementById('avg-age').textContent = avg(ageData) + ' ans';
        }
    }

    // Mettre à jour les moyennes depuis l'API
    function updateAveragesFromAPI(data) {
        if (typeof DOMUtils !== 'undefined') {
            DOMUtils.updateText('avg-cpu', data.avg_cpu + '%');
            DOMUtils.updateText('avg-ram', data.avg_ram + '%');
            DOMUtils.updateText('avg-battery', data.avg_battery + '%');
            DOMUtils.updateText('avg-age', data.avg_age + ' ans');
        } else {
            // Fallback si utils.js n'est pas chargé
            const cpuEl = document.getElementById('avg-cpu');
            const ramEl = document.getElementById('avg-ram');
            const batteryEl = document.getElementById('avg-battery');
            const ageEl = document.getElementById('avg-age');
            if (cpuEl) cpuEl.textContent = data.avg_cpu + '%';
            if (ramEl) ramEl.textContent = data.avg_ram + '%';
            if (batteryEl) batteryEl.textContent = data.avg_battery + '%';
            if (ageEl) ageEl.textContent = data.avg_age + ' ans';
        }
    }

    // Créer les graphiques
    function initializeCharts() {
        if (typeof ChartUtils !== 'undefined') {
            ChartUtils.destroyAll(charts);
            charts = {};

            if (chartLabels.length) {
                charts.cpuRamChart = ChartUtils.createChart('cpuRamChart', 'line', [
                    {
                        label: 'CPU (%)',
                        data: cpuData,
                        borderColor: ChartUtils.colors.primary,
                        backgroundColor: ChartUtils.colors.primaryBg,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'RAM (%)',
                        data: ramData,
                        borderColor: ChartUtils.colors.info,
                        backgroundColor: ChartUtils.colors.infoBg,
                        fill: true,
                        tension: 0.4
                    }
                ], { labels: chartLabels });

                charts.batteryChart = ChartUtils.createChart('batteryChart', 'bar', [{
                    label: 'Santé Batterie (%)',
                    data: batteryData,
                    backgroundColor: ChartUtils.colors.success
                }], { labels: chartLabels });

                charts.ageChart = ChartUtils.createChart('ageChart', 'line', [{
                    label: 'Âge (années)',
                    data: ageData,
                    borderColor: ChartUtils.colors.warning,
                    backgroundColor: ChartUtils.colors.warningBg,
                    fill: true,
                    tension: 0.4
                }], { labels: chartLabels });
            }
        } else {
            // Fallback si utils.js n'est pas chargé
            const commonOptions = {
                responsive: true,
                plugins: { legend: { labels: { color: '#e2e8f0' } } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }},
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                }
            };

            Object.values(charts).forEach(c => c.destroy());
            charts = {};

            if (chartLabels.length) {
                const createChart = (id, type, datasets, options = commonOptions) => {
                    const ctx = document.getElementById(id).getContext('2d');
                    return new Chart(ctx, { type, data: { labels: chartLabels, datasets }, options });
                };

                charts.cpuRamChart = createChart('cpuRamChart', 'line', [
                    { label: 'CPU (%)', data: cpuData, borderColor: '#4361ee', backgroundColor: 'rgba(67,97,238,0.2)', fill: true, tension: 0.4 },
                    { label: 'RAM (%)', data: ramData, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.2)', fill: true, tension: 0.4 }
                ]);
                charts.batteryChart = createChart('batteryChart', 'bar', [{ label: 'Santé Batterie (%)', data: batteryData, backgroundColor: '#10b981' }]);
                charts.ageChart = createChart('ageChart', 'line', [{ label: 'Âge (années)', data: ageData, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.2)', fill: true, tension: 0.4 }]);
            }
        }
    }

    // Mettre à jour le tableau
    function updateTable(latestData) {
        const tbody = document.getElementById('data-table-body');
        if (!tbody) return;

        if (latestData && latestData.length > 0) {
            tbody.innerHTML = latestData.map(data => `
                <tr>
                    <td>${data.id}</td>
                    <td>${data.hardware_sensor_id}</td>
                    <td>${data.cpu_usage}%</td>
                    <td>${data.ram_usage}%</td>
                    <td><span class="badge ${data.battery_health >= 80 ? 'bg-success' : data.battery_health >= 50 ? 'bg-warning' : 'bg-danger'}">${data.battery_health}%</span></td>
                    <td>${data.age_years} ans</td>
                    <td>${new Date(data.created_at).toLocaleString('fr-FR')}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-5 opacity-50">Aucune donnée disponible</td></tr>';
        }
    }

    // Traitement des données reçues via WebSocket
    function processData(data) {
        chartLabels = data.chart_labels || [];
        cpuData = data.cpu_data || [];
        ramData = data.ram_data || [];
        batteryData = data.battery_data || [];
        ageData = data.age_data || [];

        updateAveragesFromAPI(data);
        initializeCharts();
        updateTable(data.latest_data || []);

        if (typeof DOMUtils !== 'undefined') {
            DOMUtils.updateLastUpdateTime();
        } else {
            const updateEl = document.getElementById('last-update');
            if (updateEl) {
                updateEl.textContent = new Date().toLocaleTimeString('fr-FR');
            }
        }
    }

    // Initialisation au chargement de la page
    document.addEventListener('DOMContentLoaded', function() {
        initDataFromTemplate();
        updateAverages();
        initializeCharts();
        
        if (typeof DOMUtils !== 'undefined') {
            DOMUtils.updateLastUpdateTime();
        } else {
            const updateEl = document.getElementById('last-update');
            if (updateEl) {
                updateEl.textContent = new Date().toLocaleTimeString('fr-FR');
            }
        }

        // Connexion WebSocket pour les données en temps réel
        const wsClient = new IoTWebSocketClient('/ws/hardware/', {
            onMessage: (data) => {
                processData(data);
            },
            onOpen: () => {
                console.log('WebSocket Hardware connecté');
            },
            onError: (error) => {
                console.error('Erreur WebSocket Hardware:', error);
            },
            onClose: () => {
                console.log('WebSocket Hardware déconnecté');
            }
        });

        wsClient.connect();

        // Nettoyer la connexion à la fermeture de la page
        window.addEventListener('beforeunload', () => {
            wsClient.disconnect();
        });
    });
})();
