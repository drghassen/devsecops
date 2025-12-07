// ==================== ENERGY PAGE JAVASCRIPT ====================
// Refactored to use PageDataHandler base class from utils.js

(function () {
    'use strict';

    /**
     * Energy page data handler
     * Extends PageDataHandler with energy-specific configuration
     */
    class EnergyPageHandler extends PageDataHandler {
        constructor() {
            super({
                pageName: 'Energy',
                endpoint: '/ws/energy/',
                dataKeys: ['power', 'co2', 'overheating', 'active_devices'],
                metrics: [
                    { id: 'avg-power', key: 'avg_power', suffix: ' W' },
                    { id: 'avg-co2', key: 'avg_co2', suffix: ' g' },
                    { id: 'avg-overheating', key: 'avg_overheating', suffix: ' °C' },
                    { id: 'avg-active', key: 'avg_active', suffix: '', round: true }
                ],
                charts: [
                    {
                        canvasId: 'powerChart',
                        type: 'bar',
                        dataKey: 'power',
                        label: 'Puissance (W)',
                        color: 'warning'
                    },
                    {
                        canvasId: 'co2Chart',
                        type: 'line',
                        dataKey: 'co2',
                        label: 'CO₂ (g)',
                        color: 'danger'
                    },
                    {
                        canvasId: 'overheatingChart',
                        type: 'line',
                        dataKey: 'overheating',
                        label: 'Température (°C)',
                        color: 'orange'
                    },
                    {
                        canvasId: 'activeDevicesChart',
                        type: 'line',
                        dataKey: 'active_devices',
                        label: "Nombre d'appareils",
                        color: 'success'
                    }
                ],
                tableColumns: 7,
                tableRenderer: (data) => `
                    <tr>
                        <td>${data.id}</td>
                        <td>${data.energy_sensor_id}</td>
                        <td>${data.power_watts}W</td>
                        <td>${data.co2_equiv_g}g</td>
                        <td><span class="badge ${data.overheating > 80 ? 'bg-danger' : data.overheating > 60 ? 'bg-warning' : 'bg-success'}">${data.overheating}°C</span></td>
                        <td>${data.active_devices}</td>
                        <td>${new Date(data.created_at).toLocaleString('fr-FR')}</td>
                    </tr>
                `
            });
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        new EnergyPageHandler().init();
    });
})();
