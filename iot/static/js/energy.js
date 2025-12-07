// ==================== ENERGY PAGE JAVASCRIPT ====================
// Utilise les utilitaires communs depuis utils.js

(function() {
    'use strict';

    // Variables globales pour cette page
    let chartLabels = [];
    let powerData = [];
    let co2Data = [];
    let overheatingData = [];
    let activeDevicesData = [];
    let charts = {};

    // Initialiser les données depuis le template Django
    function initDataFromTemplate() {
        const labelsEl = document.getElementById('chart-labels-data');
        const powerEl = document.getElementById('power-data');
        const co2El = document.getElementById('co2-data');
        const overheatingEl = document.getElementById('overheating-data');
        const activeEl = document.getElementById('active-devices-data');

        if (labelsEl) chartLabels = JSON.parse(labelsEl.textContent || '[]');
        if (powerEl) powerData = JSON.parse(powerEl.textContent || '[]');
        if (co2El) co2Data = JSON.parse(co2El.textContent || '[]');
        if (overheatingEl) overheatingData = JSON.parse(overheatingEl.textContent || '[]');
        if (activeEl) activeDevicesData = JSON.parse(activeEl.textContent || '[]');
    }

    // Mettre à jour les moyennes
    function updateAverages() {
        if (typeof DataUtils !== 'undefined') {
            const avgPower = DataUtils.calculateAverage(powerData);
            const avgCo2 = DataUtils.calculateAverage(co2Data);
            const avgOverheating = DataUtils.calculateAverage(overheatingData);
            const avgActive = Math.round(DataUtils.calculateAverage(activeDevicesData));

            DOMUtils.updateText('avg-power', avgPower + ' W');
            DOMUtils.updateText('avg-co2', avgCo2 + ' g');
            DOMUtils.updateText('avg-overheating', avgOverheating + ' °C');
            DOMUtils.updateText('avg-active', avgActive);
        } else {
            // Fallback si utils.js n'est pas chargé
            const avg = arr => arr.length ? (arr.reduce((a,b) => a + b, 0) / arr.length).toFixed(1) : 0;
            document.getElementById('avg-power').textContent = avg(powerData) + ' W';
            document.getElementById('avg-co2').textContent = avg(co2Data) + ' g';
            document.getElementById('avg-overheating').textContent = avg(overheatingData) + ' °C';
            document.getElementById('avg-active').textContent = Math.round(avg(activeDevicesData));
        }
    }

    // Mettre à jour les moyennes depuis l'API
    function updateAveragesFromAPI(data) {
        if (typeof DOMUtils !== 'undefined') {
            DOMUtils.updateText('avg-power', data.avg_power + ' W');
            DOMUtils.updateText('avg-co2', data.avg_co2 + ' g');
            DOMUtils.updateText('avg-overheating', data.avg_overheating + ' °C');
            DOMUtils.updateText('avg-active', data.avg_active);
        } else {
            // Fallback si utils.js n'est pas chargé
            const powerEl = document.getElementById('avg-power');
            const co2El = document.getElementById('avg-co2');
            const overheatingEl = document.getElementById('avg-overheating');
            const activeEl = document.getElementById('avg-active');
            if (powerEl) powerEl.textContent = data.avg_power + ' W';
            if (co2El) co2El.textContent = data.avg_co2 + ' g';
            if (overheatingEl) overheatingEl.textContent = data.avg_overheating + ' °C';
            if (activeEl) activeEl.textContent = data.avg_active;
        }
    }

    // Créer les graphiques
    function initializeCharts() {
        if (typeof ChartUtils !== 'undefined') {
            ChartUtils.destroyAll(charts);
            charts = {};

            if (chartLabels.length) {
                charts.powerChart = ChartUtils.createChart('powerChart', 'bar', [{
                    label: 'Puissance (W)',
                    data: powerData,
                    backgroundColor: ChartUtils.colors.warning
                }], { labels: chartLabels });

                charts.co2Chart = ChartUtils.createChart('co2Chart', 'line', [{
                    label: 'CO₂ (g)',
                    data: co2Data,
                    borderColor: ChartUtils.colors.danger,
                    backgroundColor: ChartUtils.colors.dangerBg,
                    fill: true,
                    tension: 0.4
                }], { labels: chartLabels });

                charts.overheatingChart = ChartUtils.createChart('overheatingChart', 'line', [{
                    label: 'Température (°C)',
                    data: overheatingData,
                    borderColor: ChartUtils.colors.orange,
                    backgroundColor: ChartUtils.colors.orangeBg,
                    fill: true,
                    tension: 0.4
                }], { labels: chartLabels });

                charts.activeDevicesChart = ChartUtils.createChart('activeDevicesChart', 'line', [{
                    label: "Nombre d'appareils",
                    data: activeDevicesData,
                    borderColor: ChartUtils.colors.success,
                    backgroundColor: ChartUtils.colors.successBg,
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

                charts.powerChart = createChart('powerChart', 'bar', [{
                    label: 'Puissance (W)',
                    data: powerData,
                    backgroundColor: '#f59e0b'
                }]);

                charts.co2Chart = createChart('co2Chart', 'line', [{
                    label: 'CO₂ (g)',
                    data: co2Data,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.2)',
                    fill: true,
                    tension: 0.4
                }]);

                charts.overheatingChart = createChart('overheatingChart', 'line', [{
                    label: 'Température (°C)',
                    data: overheatingData,
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249,115,22,0.2)',
                    fill: true,
                    tension: 0.4
                }]);

                charts.activeDevicesChart = createChart('activeDevicesChart', 'line', [{
                    label: "Nombre d'appareils",
                    data: activeDevicesData,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34,197,94,0.2)',
                    fill: true,
                    tension: 0.4
                }]);
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
                    <td>${data.energy_sensor_id}</td>
                    <td>${data.power_watts}W</td>
                    <td>${data.co2_equiv_g}g</td>
                    <td><span class="badge ${data.overheating > 80 ? 'bg-danger' : data.overheating > 60 ? 'bg-warning' : 'bg-success'}">${data.overheating}°C</span></td>
                    <td>${data.active_devices}</td>
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
        powerData = data.power_data || [];
        co2Data = data.co2_data || [];
        overheatingData = data.overheating_data || [];
        activeDevicesData = data.active_devices_data || [];

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
        const wsClient = new IoTWebSocketClient('/ws/energy/', {
            onMessage: (data) => {
                processData(data);
            },
            onOpen: () => {
                console.log('WebSocket Energy connecté');
            },
            onError: (error) => {
                console.error('Erreur WebSocket Energy:', error);
            },
            onClose: () => {
                console.log('WebSocket Energy déconnecté');
            }
        });

        wsClient.connect();

        // Nettoyer la connexion à la fermeture de la page
        window.addEventListener('beforeunload', () => {
            wsClient.disconnect();
        });
    });
})();
