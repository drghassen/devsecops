// ==================== NETWORK PAGE JAVASCRIPT ====================
// Refactored to use PageDataHandler base class from utils.js

(function () {
    'use strict';

    /**
     * Network page data handler
     * Extends PageDataHandler with network-specific configuration
     */
    class NetworkPageHandler extends PageDataHandler {
        constructor() {
            super({
                pageName: 'Network',
                endpoint: '/ws/network/',
                dataKeys: ['network_load', 'requests', 'cloud_dependency'],
                metrics: [
                    { id: 'avg-network-load', key: 'avg_network_load', suffix: ' Mbps' },
                    { id: 'avg-requests', key: 'avg_requests', suffix: '', round: true },
                    { id: 'avg-cloud', key: 'avg_cloud', suffix: '%' }
                ],
                charts: [
                    {
                        canvasId: 'networkLoadChart',
                        type: 'line',
                        dataKey: 'network_load',
                        label: 'Charge Réseau (Mbps)',
                        color: 'primary'
                    },
                    {
                        canvasId: 'requestsChart',
                        type: 'bar',
                        dataKey: 'requests',
                        label: 'Requêtes par minute',
                        color: 'warning'
                    },
                    {
                        canvasId: 'cloudDependencyChart',
                        type: 'line',
                        dataKey: 'cloud_dependency',
                        label: 'Score de dépendance (%)',
                        color: 'danger'
                    }
                ],
                tableColumns: 6,
                tableRenderer: (data) => `
                    <tr>
                        <td>${data.id}</td>
                        <td>${data.network_sensor_id}</td>
                        <td>${data.network_load_mbps} Mbps</td>
                        <td>${data.requests_per_min}</td>
                        <td><span class="badge ${data.cloud_dependency_score > 80 ? 'bg-danger' : data.cloud_dependency_score > 50 ? 'bg-warning' : 'bg-success'}">${data.cloud_dependency_score}%</span></td>
                        <td>${new Date(data.created_at).toLocaleString('fr-FR')}</td>
                    </tr>
                `
            });
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        new NetworkPageHandler().init();
    });
})();
