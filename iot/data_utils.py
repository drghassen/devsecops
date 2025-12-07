"""
Utilitaires pour préparer les données pour les WebSockets et les vues API
"""
from .models import IoTData
from .views import (
    get_latest_iot_data, calculate_averages, prepare_chart_data, prepare_table_data
)


def get_dashboard_data_dict():
    """Prépare les données pour le dashboard"""
    latest_data = get_latest_iot_data(10)
    
    labels = [str(data.created_at.strftime('%H:%M:%S')) for data in reversed(latest_data)]
    cpu_data = [data.cpu_usage for data in reversed(latest_data)]
    ram_data = [data.ram_usage for data in reversed(latest_data)]
    power_data = [data.power_watts for data in reversed(latest_data)]
    eco_data = [data.eco_score for data in reversed(latest_data)]
    co2_data = [data.co2_equiv_g for data in reversed(latest_data)]
    
    table_data = [
        {
            'id': data.id,
            'hardware_sensor_id': data.hardware_sensor_id,
            'cpu_usage': data.cpu_usage,
            'ram_usage': data.ram_usage,
            'power_watts': data.power_watts,
            'eco_score': data.eco_score,
            'created_at': data.created_at.isoformat(),  # Format ISO pour JavaScript
        } for data in latest_data
    ]
    
    return {
        'chart_labels': labels,
        'cpu_data': cpu_data,
        'ram_data': ram_data,
        'power_data': power_data,
        'eco_data': eco_data,
        'co2_data': co2_data,
        'latest_data': table_data,
    }


def get_hardware_data_dict():
    """Prépare les données pour l'interface hardware"""
    latest_data = get_latest_iot_data(10)
    all_data = IoTData.objects.all()
    
    avg_fields = ['cpu_usage', 'ram_usage', 'battery_health', 'age_years']
    averages = calculate_averages(all_data, avg_fields)
    
    field_mappings = {
        'cpu_data': 'cpu_usage',
        'ram_data': 'ram_usage',
        'battery_data': 'battery_health',
        'age_data': 'age_years'
    }
    labels, chart_data = prepare_chart_data(latest_data, field_mappings)
    
    table_data = [
        {
            'id': data.id,
            'hardware_sensor_id': data.hardware_sensor_id,
            'cpu_usage': data.cpu_usage,
            'ram_usage': data.ram_usage,
            'battery_health': data.battery_health,
            'age_years': data.age_years,
            'created_at': data.created_at.isoformat(),
        } for data in latest_data
    ]
    
    return {
        'chart_labels': labels,
        **chart_data,
        'latest_data': table_data,
        'avg_cpu': averages['cpu_usage'],
        'avg_ram': averages['ram_usage'],
        'avg_battery': averages['battery_health'],
        'avg_age': averages['age_years'],
    }


def get_energy_data_dict():
    """Prépare les données pour l'interface energy"""
    latest_data = get_latest_iot_data(10)
    all_data = IoTData.objects.all()
    
    avg_fields = ['power_watts', 'co2_equiv_g', 'overheating', 'active_devices']
    averages = calculate_averages(all_data, avg_fields)
    
    field_mappings = {
        'power_data': 'power_watts',
        'co2_data': 'co2_equiv_g',
        'overheating_data': 'overheating',
        'active_devices_data': 'active_devices'
    }
    labels, chart_data = prepare_chart_data(latest_data, field_mappings)
    
    table_data = [
        {
            'id': data.id,
            'energy_sensor_id': data.energy_sensor_id,
            'power_watts': data.power_watts,
            'co2_equiv_g': data.co2_equiv_g,
            'overheating': data.overheating,
            'active_devices': data.active_devices,
            'created_at': data.created_at.isoformat(),
        } for data in latest_data
    ]
    
    return {
        'chart_labels': labels,
        **chart_data,
        'latest_data': table_data,
        'avg_power': averages['power_watts'],
        'avg_co2': averages['co2_equiv_g'],
        'avg_overheating': averages['overheating'],
        'avg_active': int(averages['active_devices']),
    }


def get_network_data_dict():
    """Prépare les données pour l'interface network"""
    latest_data = get_latest_iot_data(10)
    all_data = IoTData.objects.all()
    
    avg_fields = ['network_load_mbps', 'requests_per_min', 'cloud_dependency_score']
    averages = calculate_averages(all_data, avg_fields)
    
    field_mappings = {
        'network_load_data': 'network_load_mbps',
        'requests_data': 'requests_per_min',
        'cloud_dependency_data': 'cloud_dependency_score'
    }
    labels, chart_data = prepare_chart_data(latest_data, field_mappings)
    
    table_data = [
        {
            'id': data.id,
            'network_sensor_id': data.network_sensor_id,
            'network_load_mbps': data.network_load_mbps,
            'requests_per_min': data.requests_per_min,
            'cloud_dependency_score': data.cloud_dependency_score,
            'created_at': data.created_at.isoformat(),
        } for data in latest_data
    ]
    
    return {
        'chart_labels': labels,
        **chart_data,
        'latest_data': table_data,
        'avg_network_load': averages['network_load_mbps'],
        'avg_requests': int(averages['requests_per_min']),
        'avg_cloud': averages['cloud_dependency_score'],
    }


def get_scores_data_dict():
    """Prépare les données pour l'interface scores"""
    latest_data = get_latest_iot_data(10)
    all_data = IoTData.objects.all()
    
    avg_fields = ['eco_score', 'obsolescence_score', 'bigtech_dependency', 'co2_savings_kg_year']
    averages = calculate_averages(all_data, avg_fields)
    
    field_mappings = {
        'eco_data': 'eco_score',
        'obsolescence_data': 'obsolescence_score',
        'bigtech_data': 'bigtech_dependency',
        'co2_savings_data': 'co2_savings_kg_year'
    }
    labels, chart_data = prepare_chart_data(latest_data, field_mappings)
    
    table_data = [
        {
            'id': data.id,
            'eco_score': data.eco_score,
            'obsolescence_score': data.obsolescence_score,
            'bigtech_dependency': data.bigtech_dependency,
            'co2_savings_kg_year': data.co2_savings_kg_year,
            'created_at': data.created_at.isoformat(),
        } for data in latest_data
    ]
    
    return {
        'chart_labels': labels,
        **chart_data,
        'latest_data': table_data,
        'avg_eco': averages['eco_score'],
        'avg_obsolescence': averages['obsolescence_score'],
        'avg_bigtech': averages['bigtech_dependency'],
        'avg_co2_savings': averages['co2_savings_kg_year'],
    }

