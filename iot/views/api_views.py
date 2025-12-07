"""
API views for JSON responses and data ingestion
"""
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from ..models import IoTData


@csrf_exempt
@require_http_methods(["POST"])
def iot_data_post(request):
    """
    Handle IoT data ingestion via POST request
    Sends real-time updates via WebSocket to all connected clients
    """
    try:
        data = json.loads(request.body)
        
        # Extract scores data (handle nested structure)
        scores_data = data.get('scores', data)
        
        # Create new IoT data record
        iot_data = IoTData.objects.create(
            hardware_sensor_id=data['hardware_sensor_id'],
            hardware_timestamp=data['hardware_timestamp'],
            age_years=data['age_years'],
            cpu_usage=data['cpu_usage'],
            ram_usage=data['ram_usage'],
            battery_health=data['battery_health'],
            os=data['os'],
            win11_compat=data['win11_compat'],
            energy_sensor_id=data['energy_sensor_id'],
            energy_timestamp=data['energy_timestamp'],
            power_watts=data['power_watts'],
            active_devices=data['active_devices'],
            overheating=data['overheating'],
            co2_equiv_g=data['co2_equiv_g'],
            network_sensor_id=data['network_sensor_id'],
            network_timestamp=data['network_timestamp'],
            network_load_mbps=data['network_load_mbps'],
            requests_per_min=data['requests_per_min'],
            cloud_dependency_score=data['cloud_dependency_score'],
            
            # Scores from nested object or root
            eco_score=scores_data.get('eco_score', 0),
            obsolescence_score=scores_data.get('obsolescence_score', 0),
            bigtech_dependency=scores_data.get('bigtech_dependency', 0),
            co2_savings_kg_year=scores_data.get('co2_savings_kg_year', 0),
            recommendations=scores_data.get('recommendations', {}),
        )
        
        # Send updated data via WebSocket to all connected clients
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        from .. import data_utils
        
        channel_layer = get_channel_layer()
        
        # Define groups and their data functions
        groups = [
            'dashboard_updates',
            'hardware_updates',
            'energy_updates',
            'network_updates',
            'scores_updates'
        ]
        
        data_functions = {
            'dashboard_updates': data_utils.get_dashboard_data_dict,
            'hardware_updates': data_utils.get_hardware_data_dict,
            'energy_updates': data_utils.get_energy_data_dict,
            'network_updates': data_utils.get_network_data_dict,
            'scores_updates': data_utils.get_scores_data_dict,
        }
        
        # Send data to each WebSocket group
        for group in groups:
            try:
                data_dict = data_functions[group]()
                async_to_sync(channel_layer.group_send)(
                    group,
                    {
                        'type': 'data_update',
                        'data': data_dict
                    }
                )
            except Exception as e:
                # Log error but don't block response
                print(f"Error sending WebSocket to group {group}: {e}")
        
        return JsonResponse({
            'message': 'IoT data created successfully',
            'id': iot_data.id
        }, status=201)
        
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_latest_data(request):
    """Get the most recent IoT data record"""
    try:
        latest_data = IoTData.objects.order_by('-created_at').first()
        
        if latest_data:
            data = {
                'id': latest_data.id,
                'hardware_sensor_id': latest_data.hardware_sensor_id,
                'hardware_timestamp': latest_data.hardware_timestamp,
                'age_years': latest_data.age_years,
                'cpu_usage': latest_data.cpu_usage,
                'ram_usage': latest_data.ram_usage,
                'battery_health': latest_data.battery_health,
                'os': latest_data.os,
                'win11_compat': latest_data.win11_compat,
                'energy_sensor_id': latest_data.energy_sensor_id,
                'energy_timestamp': latest_data.energy_timestamp,
                'power_watts': latest_data.power_watts,
                'active_devices': latest_data.active_devices,
                'overheating': latest_data.overheating,
                'co2_equiv_g': latest_data.co2_equiv_g,
                'network_sensor_id': latest_data.network_sensor_id,
                'network_timestamp': latest_data.network_timestamp,
                'network_load_mbps': latest_data.network_load_mbps,
                'requests_per_min': latest_data.requests_per_min,
                'cloud_dependency_score': latest_data.cloud_dependency_score,
                'eco_score': latest_data.eco_score,
                'obsolescence_score': latest_data.obsolescence_score,
                'bigtech_dependency': latest_data.bigtech_dependency,
                'co2_savings_kg_year': latest_data.co2_savings_kg_year,
                'created_at': latest_data.created_at.isoformat(),
            }
            return JsonResponse(data, status=200)
        else:
            return JsonResponse({'error': 'No IoT data available'}, status=404)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_dashboard_data(request):
    """Get dashboard data for WebSocket/API consumption"""
    try:
        from .. import data_utils
        data = data_utils.get_dashboard_data_dict()
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_hardware_data(request):
    """Get hardware data for WebSocket/API consumption"""
    try:
        from .. import data_utils
        data = data_utils.get_hardware_data_dict()
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_energy_data(request):
    """Get energy data for WebSocket/API consumption"""
    try:
        from .. import data_utils
        data = data_utils.get_energy_data_dict()
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_network_data(request):
    """Get network data for WebSocket/API consumption"""
    try:
        from .. import data_utils
        data = data_utils.get_network_data_dict()
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_scores_data(request):
    """Get scores data for WebSocket/API consumption"""
    try:
        from .. import data_utils
        data = data_utils.get_scores_data_dict()
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
