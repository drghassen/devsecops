// ==================== NETWORK PAGE JAVASCRIPT ====================
// Utilise les utilitaires communs depuis utils.js

(function() {
    'use strict';

    // Variables globales pour cette page
    let chartLabels = [];
    let networkLoadData = [];
    let requestsData = [];
    let cloudDependencyData = [];
    let charts = {};

    // Initialiser les données depuis le template Django
    function initDataFromTemplate() {
        const labelsEl = document.getElementById('chart-labels-data');
        const networkEl = document.getElementById('network-load-data');
        const requestsEl = document.getElementById('requests-data');
        const cloudEl = document.getElementById('cloud-dependency-data');

        if (labelsEl) chartLabels = JSON.parse(labelsEl.textContent || '[]');
        if (networkEl) networkLoadData = JSON.parse(networkEl.textContent || '[]');
        if (requestsEl) requestsData = JSON.parse(requestsEl.textContent || '[]');
        if (cloudEl) cloudDependencyData = JSON.parse(cloudEl.textContent || '[]');
    }

    // Mettre à jour les moyennes
    function updateAverages() {
        if (typeof DataUtils !== 'undefined') {
            const avgNetwork = DataUtils.calculateAverage(networkLoadData);
            const avgRequests = Math.round(DataUtils.calculateAverage(requestsData));
            const avgCloud = DataUtils.calculateAverage(cloudDependencyData);

            DOMUtils.updateText('avg-network-load', avgNetwork + ' Mbps');
            DOMUtils.updateText('avg-requests', avgRequests);
            DOMUtils.updateText('avg-cloud', avgCloud + '%');
        } else {
            // Fallback si utils.js n'est pas chargé
            const avg = arr => arr.length ? (arr.reduce((a,b) => a + b, 0) / arr.length).toFixed(1) : 0;
            document.getElementById('avg-network-load').textContent = avg(networkLoadData) + ' Mbps';
            document.getElementById('avg-requests').textContent = Math.round(avg(requestsData));
            document.getElementById('avg-cloud').textContent = avg(cloudDependencyData) + '%';
        }
    }

    // Mettre à jour les moyennes depuis l'API
    function updateAveragesFromAPI(data) {
        if (typeof DOMUtils !== 'undefined') {
            DOMUtils.updateText('avg-network-load', data.avg_network_load + ' Mbps');
            DOMUtils.updateText('avg-requests', data.avg_requests);
            DOMUtils.updateText('avg-cloud', data.avg_cloud + '%');
        } else {
            // Fallback si utils.js n'est pas chargé
            const networkEl = document.getElementById('avg-network-load');
            const requestsEl = document.getElementById('avg-requests');
            const cloudEl = document.getElementById('avg-cloud');
            if (networkEl) networkEl.textContent = data.avg_network_load + ' Mbps';
            if (requestsEl) requestsEl.textContent = data.avg_requests;
            if (cloudEl) cloudEl.textContent = data.avg_cloud + '%';
        }
    }

    // Créer les graphiques
    function initializeCharts() {
        if (typeof ChartUtils !== 'undefined') {
            ChartUtils.destroyAll(charts);
            charts = {};

            if (chartLabels.length) {
                charts.networkLoadChart = ChartUtils.createChart('networkLoadChart', 'line', [{
                    label: 'Charge Réseau (Mbps)',
                    data: networkLoadData,
                    borderColor: ChartUtils.colors.primary,
                    backgroundColor: ChartUtils.colors.primaryBg,
                    fill: true,
                    tension: 0.4
                }], { labels: chartLabels });

                charts.requestsChart = ChartUtils.createChart('requestsChart', 'bar', [{
                    label: 'Requêtes par minute',
                    data: requestsData,
                    backgroundColor: ChartUtils.colors.warning
                }], { labels: chartLabels });

                charts.cloudDependencyChart = ChartUtils.createChart('cloudDependencyChart', 'line', [{
                    label: 'Score de dépendance (%)',
                    data: cloudDependencyData,
                    borderColor: ChartUtils.colors.danger,
                    backgroundColor: ChartUtils.colors.dangerBg,
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

                charts.networkLoadChart = createChart('networkLoadChart', 'line', [{
                    label: 'Charge Réseau (Mbps)',
                    data: networkLoadData,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67,97,238,0.2)',
                    fill: true,
                    tension: 0.4
                }]);
                charts.requestsChart = createChart('requestsChart', 'bar', [{
                    label: 'Requêtes par minute',
                    data: requestsData,
                    backgroundColor: '#f59e0b'
                }]);
                charts.cloudDependencyChart = createChart('cloudDependencyChart', 'line', [{
                    label: 'Score de dépendance (%)',
                    data: cloudDependencyData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.2)',
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
                    <td>${data.network_sensor_id}</td>
                    <td>${data.network_load_mbps} Mbps</td>
                    <td>${data.requests_per_min}</td>
                    <td><span class="badge ${data.cloud_dependency_score > 80 ? 'bg-danger' : data.cloud_dependency_score > 50 ? 'bg-warning' : 'bg-success'}">${data.cloud_dependency_score}%</span></td>
                    <td>${new Date(data.created_at).toLocaleString('fr-FR')}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 opacity-50">Aucune donnée disponible</td></tr>';
        }
    }

    // Traitement des données reçues via WebSocket
    function processData(data) {
        chartLabels = data.chart_labels || [];
        networkLoadData = data.network_load_data || [];
        requestsData = data.requests_data || [];
        cloudDependencyData = data.cloud_dependency_data || [];

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
        const wsClient = new IoTWebSocketClient('/ws/network/', {
            onMessage: (data) => {
                processData(data);
            },
            onOpen: () => {
                console.log('WebSocket Network connecté');
            },
            onError: (error) => {
                console.error('Erreur WebSocket Network:', error);
            },
            onClose: () => {
                console.log('WebSocket Network déconnecté');
            }
        });

        wsClient.connect();

        // Nettoyer la connexion à la fermeture de la page
        window.addEventListener('beforeunload', () => {
            wsClient.disconnect();
        });
    });
})();

