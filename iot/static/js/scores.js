// ==================== SCORES PAGE JAVASCRIPT ====================
// Utilise les utilitaires communs depuis utils.js

(function() {
    'use strict';

    // Variables globales pour cette page
    let chartLabels = [];
    let ecoData = [];
    let obsolescenceData = [];
    let bigtechData = [];
    let co2SavingsData = [];
    let charts = {};

    // Initialiser les données depuis le template Django
    function initDataFromTemplate() {
        const labelsEl = document.getElementById('chart-labels-data');
        const ecoEl = document.getElementById('eco-data');
        const obsolescenceEl = document.getElementById('obsolescence-data');
        const bigtechEl = document.getElementById('bigtech-data');
        const co2SavingsEl = document.getElementById('co2-savings-data');

        if (labelsEl) chartLabels = JSON.parse(labelsEl.textContent || '[]');
        if (ecoEl) ecoData = JSON.parse(ecoEl.textContent || '[]');
        if (obsolescenceEl) obsolescenceData = JSON.parse(obsolescenceEl.textContent || '[]');
        if (bigtechEl) bigtechData = JSON.parse(bigtechEl.textContent || '[]');
        if (co2SavingsEl) co2SavingsData = JSON.parse(co2SavingsEl.textContent || '[]');
    }

    // Mettre à jour les moyennes
    function updateAverages() {
        if (typeof DataUtils !== 'undefined') {
            const avgEco = DataUtils.calculateAverage(ecoData);
            const avgObsolescence = DataUtils.calculateAverage(obsolescenceData);
            const avgBigtech = DataUtils.calculateAverage(bigtechData);
            const avgCo2Savings = DataUtils.calculateAverage(co2SavingsData);

            DOMUtils.updateText('avg-eco', avgEco);
            DOMUtils.updateText('avg-obsolescence', avgObsolescence);
            DOMUtils.updateText('avg-bigtech', avgBigtech);
            DOMUtils.updateText('avg-co2-savings', avgCo2Savings + ' kg');
        } else {
            // Fallback si utils.js n'est pas chargé
            const avg = arr => arr.length ? (arr.reduce((a,b) => a + b, 0) / arr.length).toFixed(1) : 0;
            document.getElementById('avg-eco').textContent = avg(ecoData);
            document.getElementById('avg-obsolescence').textContent = avg(obsolescenceData);
            document.getElementById('avg-bigtech').textContent = avg(bigtechData);
            document.getElementById('avg-co2-savings').textContent = avg(co2SavingsData) + ' kg';
        }
    }

    // Mettre à jour les moyennes depuis l'API
    function updateAveragesFromAPI(data) {
        if (typeof DOMUtils !== 'undefined') {
            DOMUtils.updateText('avg-eco', data.avg_eco);
            DOMUtils.updateText('avg-obsolescence', data.avg_obsolescence);
            DOMUtils.updateText('avg-bigtech', data.avg_bigtech);
            DOMUtils.updateText('avg-co2-savings', data.avg_co2_savings + ' kg');
        } else {
            // Fallback si utils.js n'est pas chargé
            const ecoEl = document.getElementById('avg-eco');
            const obsolescenceEl = document.getElementById('avg-obsolescence');
            const bigtechEl = document.getElementById('avg-bigtech');
            const co2SavingsEl = document.getElementById('avg-co2-savings');
            if (ecoEl) ecoEl.textContent = data.avg_eco;
            if (obsolescenceEl) obsolescenceEl.textContent = data.avg_obsolescence;
            if (bigtechEl) bigtechEl.textContent = data.avg_bigtech;
            if (co2SavingsEl) co2SavingsEl.textContent = data.avg_co2_savings + ' kg';
        }
    }

    // Créer les graphiques
    function initializeCharts() {
        if (typeof ChartUtils !== 'undefined') {
            ChartUtils.destroyAll(charts);
            charts = {};

            if (chartLabels.length) {
                charts.ecoChart = ChartUtils.createChart('ecoChart', 'line', [{
                    label: 'Score Écologique',
                    data: ecoData,
                    borderColor: ChartUtils.colors.success,
                    backgroundColor: ChartUtils.colors.successBg,
                    fill: true,
                    tension: 0.4
                }], { labels: chartLabels });

                charts.obsolescenceChart = ChartUtils.createChart('obsolescenceChart', 'bar', [{
                    label: "Score d'Obsolescence",
                    data: obsolescenceData,
                    backgroundColor: ChartUtils.colors.warning
                }], { labels: chartLabels });

                charts.bigtechChart = ChartUtils.createChart('bigtechChart', 'line', [{
                    label: 'Dépendance BigTech',
                    data: bigtechData,
                    borderColor: ChartUtils.colors.danger,
                    backgroundColor: ChartUtils.colors.dangerBg,
                    fill: true,
                    tension: 0.4
                }], { labels: chartLabels });

                charts.co2SavingsChart = ChartUtils.createChart('co2SavingsChart', 'line', [{
                    label: 'Économies CO₂ (kg/an)',
                    data: co2SavingsData,
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

                charts.ecoChart = createChart('ecoChart', 'line', [{
                    label: 'Score Écologique',
                    data: ecoData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.2)',
                    fill: true,
                    tension: 0.4
                }]);
                charts.obsolescenceChart = createChart('obsolescenceChart', 'bar', [{
                    label: "Score d'Obsolescence",
                    data: obsolescenceData,
                    backgroundColor: '#f59e0b'
                }]);
                charts.bigtechChart = createChart('bigtechChart', 'line', [{
                    label: 'Dépendance BigTech',
                    data: bigtechData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.2)',
                    fill: true,
                    tension: 0.4
                }]);
                charts.co2SavingsChart = createChart('co2SavingsChart', 'line', [{
                    label: 'Économies CO₂ (kg/an)',
                    data: co2SavingsData,
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
                    <td>${data.id}</td>
                    <td><span class="badge ${data.eco_score >= 75 ? 'bg-success' : data.eco_score >= 50 ? 'bg-warning' : 'bg-danger'}">${data.eco_score}</span></td>
                    <td>${data.obsolescence_score}</td>
                    <td>${data.bigtech_dependency}</td>
                    <td>${data.co2_savings_kg_year} kg/an</td>
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
        ecoData = data.eco_data || [];
        obsolescenceData = data.obsolescence_data || [];
        bigtechData = data.bigtech_data || [];
        co2SavingsData = data.co2_savings_data || [];

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
        const wsClient = new IoTWebSocketClient('/ws/scores/', {
            onMessage: (data) => {
                processData(data);
            },
            onOpen: () => {
                console.log('WebSocket Scores connecté');
            },
            onError: (error) => {
                console.error('Erreur WebSocket Scores:', error);
            },
            onClose: () => {
                console.log('WebSocket Scores déconnecté');
            }
        });

        wsClient.connect();

        // Nettoyer la connexion à la fermeture de la page
        window.addEventListener('beforeunload', () => {
            wsClient.disconnect();
        });
    });
})();
