// ==================== SCORES PAGE JAVASCRIPT ====================
// Refactored to use PageDataHandler base class from utils.js

(function () {
    'use strict';

    /**
     * Scores page data handler
     * Extends PageDataHandler with scores-specific configuration
     */
    class ScoresPageHandler extends PageDataHandler {
        constructor() {
            super({
                pageName: 'Scores',
                endpoint: '/ws/scores/',
                dataKeys: ['eco_score', 'obsolescence', 'bigtech', 'co2_savings'],
                metrics: [
                    { id: 'avg-eco', key: 'avg_eco_score', suffix: '' },
                    { id: 'avg-obsolescence', key: 'avg_obsolescence', suffix: '' },
                    { id: 'avg-bigtech', key: 'avg_bigtech', suffix: '' },
                    { id: 'avg-co2-savings', key: 'avg_co2_savings', suffix: ' kg' }
                ],
                charts: [
                    {
                        canvasId: 'ecoChart',
                        type: 'line',
                        dataKey: 'eco_score',
                        label: 'Score Écologique',
                        color: 'success'
                    },
                    {
                        canvasId: 'obsolescenceChart',
                        type: 'bar',
                        dataKey: 'obsolescence',
                        label: 'Niveau d\'Obsolescence',
                        color: 'warning'
                    },
                    {
                        canvasId: 'bigtechChart',
                        type: 'line',
                        dataKey: 'bigtech',
                        label: 'Dépendance BigTech',
                        color: 'danger'
                    },
                    {
                        canvasId: 'co2SavingsChart',
                        type: 'line',
                        dataKey: 'co2_savings',
                        label: 'Économies CO₂ (kg/an)',
                        color: 'success'
                    }
                ],
                tableColumns: 8,
                tableRenderer: (data) => `
                    <tr>
                        <td>${data.id}</td>
                        <td>${data.hardware_sensor_id}</td>
                        <td><span class="badge ${data.eco_score >= 75 ? 'bg-success' : data.eco_score >= 50 ? 'bg-warning' : 'bg-danger'}">${data.eco_score}</span></td>
                        <td>${data.obsolescence_score}</td>
                        <td>${data.bigtech_dependency}</td>
                        <td>${data.co2_savings_kg_year} kg/an</td>
                        <td>${new Date(data.created_at).toLocaleString('fr-FR')}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" 
                                onclick="showRecommendations('${encodeURIComponent(JSON.stringify(data.recommendations || {}))}')"
                                title="Voir les recommandations">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `
            });
        }

        /**
         * Override loadInitialData to handle the specific table data source in scores.html
         */
        loadInitialData() {
            super.loadInitialData(); // Load chart data

            try {
                const el = document.getElementById('latest-data-source');
                if (el) {
                    const data = JSON.parse(el.textContent);
                    this.updateTable(data);
                }
            } catch (e) {
                console.error('Scores: Error loading initial table data', e);
            }
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        new ScoresPageHandler().init();
    });
})();
