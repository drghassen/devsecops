import json

from .models import IoTData


def get_latest_iot_data(limit=8):
    """Récupère les dernières données IoT"""
    return IoTData.objects.order_by("-created_at")[:limit]


def calculate_averages(all_data, fields):
    """Calcule les moyennes pour une liste de champs"""
    if not all_data.exists():
        return {field: 0 for field in fields}

    count = all_data.count()
    averages = {}
    for field in fields:
        total = sum(getattr(data, field) for data in all_data)
        averages[field] = round(total / count, 1)
    return averages


def prepare_chart_data(latest_data, field_mappings):
    """Prépare les données pour les graphiques"""
    labels = [str(data.created_at.strftime("%H:%M:%S")) for data in reversed(latest_data)]
    chart_data = {}
    for key, field in field_mappings.items():
        chart_data[key] = [getattr(data, field) for data in reversed(latest_data)]
    return labels, chart_data


# ==================== DATA PREPARATION FUNCTIONS ====================


def get_dashboard_data_dict():
    """Prépare les données pour le dashboard"""
    latest_data = get_latest_iot_data()

    field_mappings = {
        "cpu_data": "cpu_usage",
        "ram_data": "ram_usage",
        "power_data": "power_watts",
        "eco_data": "eco_score",
        "co2_data": "co2_equiv_g",
    }
    labels, chart_data = prepare_chart_data(latest_data, field_mappings)

    table_data = [
        {
            "id": data.id,
            "hardware_sensor_id": data.hardware_sensor_id,
            "cpu_usage": data.cpu_usage,
            "ram_usage": data.ram_usage,
            "power_watts": data.power_watts,
            "eco_score": data.eco_score,
            "created_at": data.created_at.isoformat(),
        }
        for data in latest_data
    ]

    return {
        "chart_labels": json.dumps(labels),
        "cpu_data": json.dumps(chart_data["cpu_data"]),
        "ram_data": json.dumps(chart_data["ram_data"]),
        "power_data": json.dumps(chart_data["power_data"]),
        "eco_data": json.dumps(chart_data["eco_data"]),
        "co2_data": json.dumps(chart_data["co2_data"]),
        "latest_data": table_data,
    }


def get_hardware_data_dict():
    """Prépare les données pour l'interface hardware"""
    latest_data = get_latest_iot_data()
    all_data = IoTData.objects.all()

    avg_fields = ["cpu_usage", "ram_usage", "battery_health", "age_years"]
    averages = calculate_averages(all_data, avg_fields)

    field_mappings = {
        "cpu_data": "cpu_usage",
        "ram_data": "ram_usage",
        "battery_data": "battery_health",
        "age_data": "age_years",
    }
    labels, chart_data = prepare_chart_data(latest_data, field_mappings)

    table_data = [
        {
            "id": data.id,
            "hardware_sensor_id": data.hardware_sensor_id,
            "cpu_usage": data.cpu_usage,
            "ram_usage": data.ram_usage,
            "battery_health": data.battery_health,
            "age_years": data.age_years,
            "created_at": data.created_at.isoformat(),
        }
        for data in latest_data
    ]

    return {
        "chart_labels": json.dumps(labels),
        "cpu_data": json.dumps(chart_data["cpu_data"]),
        "ram_data": json.dumps(chart_data["ram_data"]),
        "battery_data": json.dumps(chart_data["battery_data"]),
        "age_data": json.dumps(chart_data["age_data"]),
        "latest_data": table_data,
        "avg_cpu": averages["cpu_usage"],
        "avg_ram": averages["ram_usage"],
        "avg_battery": averages["battery_health"],
        "avg_age": averages["age_years"],
    }


def get_energy_data_dict():
    """Prépare les données pour l'interface energy"""
    latest_data = get_latest_iot_data()
    all_data = IoTData.objects.all()

    avg_fields = ["power_watts", "co2_equiv_g", "overheating", "active_devices"]
    averages = calculate_averages(all_data, avg_fields)

    field_mappings = {
        "power_data": "power_watts",
        "co2_data": "co2_equiv_g",
        "overheating_data": "overheating",
        "active_devices_data": "active_devices",
    }
    labels, chart_data = prepare_chart_data(latest_data, field_mappings)

    table_data = [
        {
            "id": data.id,
            "energy_sensor_id": data.energy_sensor_id,
            "power_watts": data.power_watts,
            "co2_equiv_g": data.co2_equiv_g,
            "overheating": data.overheating,
            "active_devices": data.active_devices,
            "created_at": data.created_at.isoformat(),
        }
        for data in latest_data
    ]

    return {
        "chart_labels": json.dumps(labels),
        "power_data": json.dumps(chart_data["power_data"]),
        "co2_data": json.dumps(chart_data["co2_data"]),
        "overheating_data": json.dumps(chart_data["overheating_data"]),
        "active_devices_data": json.dumps(chart_data["active_devices_data"]),
        "latest_data": table_data,
        "avg_power": averages["power_watts"],
        "avg_co2": averages["co2_equiv_g"],
        "avg_overheating": averages["overheating"],
        "avg_active": int(averages["active_devices"]),
    }


def get_network_data_dict():
    """Prépare les données pour l'interface network"""
    latest_data = get_latest_iot_data()
    all_data = IoTData.objects.all()

    avg_fields = ["network_load_mbps", "requests_per_min", "cloud_dependency_score"]
    averages = calculate_averages(all_data, avg_fields)

    field_mappings = {
        "network_load_data": "network_load_mbps",
        "requests_data": "requests_per_min",
        "cloud_dependency_data": "cloud_dependency_score",
    }
    labels, chart_data = prepare_chart_data(latest_data, field_mappings)

    table_data = [
        {
            "id": data.id,
            "network_sensor_id": data.network_sensor_id,
            "network_load_mbps": data.network_load_mbps,
            "requests_per_min": data.requests_per_min,
            "cloud_dependency_score": data.cloud_dependency_score,
            "created_at": data.created_at.isoformat(),
        }
        for data in latest_data
    ]

    return {
        "chart_labels": json.dumps(labels),
        "network_load_data": json.dumps(chart_data["network_load_data"]),
        "requests_data": json.dumps(chart_data["requests_data"]),
        "cloud_dependency_data": json.dumps(chart_data["cloud_dependency_data"]),
        "latest_data": table_data,
        "avg_network_load": averages["network_load_mbps"],
        "avg_requests": int(averages["requests_per_min"]),
        "avg_cloud": averages["cloud_dependency_score"],
    }


def get_scores_data_dict():
    """Prépare les données pour l'interface scores"""
    latest_data = get_latest_iot_data()
    all_data = IoTData.objects.all()

    avg_fields = ["eco_score", "obsolescence_score", "bigtech_dependency", "co2_savings_kg_year"]
    averages = calculate_averages(all_data, avg_fields)

    field_mappings = {
        "eco_data": "eco_score",
        "obsolescence_data": "obsolescence_score",
        "bigtech_data": "bigtech_dependency",
        "co2_savings_data": "co2_savings_kg_year",
    }
    labels, chart_data = prepare_chart_data(latest_data, field_mappings)

    table_data = [
        {
            "id": data.id,
            "hardware_sensor_id": data.hardware_sensor_id,
            "eco_score": data.eco_score,
            "obsolescence_score": data.obsolescence_score,
            "bigtech_dependency": data.bigtech_dependency,
            "co2_savings_kg_year": data.co2_savings_kg_year,
            "recommendations": data.recommendations,
            "created_at": data.created_at.isoformat(),
        }
        for data in latest_data
    ]

    return {
        "chart_labels": json.dumps(labels),
        "eco_data": json.dumps(chart_data["eco_data"]),
        "obsolescence_data": json.dumps(chart_data["obsolescence_data"]),
        "bigtech_data": json.dumps(chart_data["bigtech_data"]),
        "co2_savings_data": json.dumps(chart_data["co2_savings_data"]),
        "latest_data": table_data,
        "avg_eco": averages["eco_score"],
        "avg_obsolescence": averages["obsolescence_score"],
        "avg_bigtech": averages["bigtech_dependency"],
        "avg_co2_savings": averages["co2_savings_kg_year"],
    }


def serialize_iot_data(data):
    """
    Serializes a single IoTData instance into a dictionary.
    Used for API responses and WebSocket updates.
    """
    if not data:
        return None

    return {
        "id": data.id,
        "hardware_sensor_id": data.hardware_sensor_id,
        "hardware_timestamp": data.hardware_timestamp,
        "age_years": data.age_years,
        "cpu_usage": data.cpu_usage,
        "ram_usage": data.ram_usage,
        "battery_health": data.battery_health,
        "os": data.os,
        "win11_compat": data.win11_compat,
        "energy_sensor_id": data.energy_sensor_id,
        "energy_timestamp": data.energy_timestamp,
        "power_watts": data.power_watts,
        "active_devices": data.active_devices,
        "overheating": data.overheating,
        "co2_equiv_g": data.co2_equiv_g,
        "network_sensor_id": data.network_sensor_id,
        "network_timestamp": data.network_timestamp,
        "network_load_mbps": data.network_load_mbps,
        "requests_per_min": data.requests_per_min,
        "cloud_dependency_score": data.cloud_dependency_score,
        "eco_score": data.eco_score,
        "obsolescence_score": data.obsolescence_score,
        "bigtech_dependency": data.bigtech_dependency,
        "co2_savings_kg_year": data.co2_savings_kg_year,
        "recommendations": data.recommendations,
        "created_at": data.created_at.isoformat(),
    }


def get_paginated_iot_data(page_number=1, limit=8):
    """
    Retrieves paginated IoT data.
    Returns a dictionary with data and metadata.
    """
    from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator

    # Fetch all data, ordered by newest first
    queryset = IoTData.objects.all().order_by("-created_at")

    paginator = Paginator(queryset, limit)

    try:
        page_obj = paginator.page(page_number)
    except PageNotAnInteger:
        page_obj = paginator.page(1)
    except EmptyPage:
        # If page is out of range, return empty result or last page
        # Here we return empty to indicate end of list
        return {
            "data": [],
            "meta": {
                "total_pages": paginator.num_pages,
                "current_page": page_number,
                "has_next": False,
                "has_previous": False,
                "total_items": paginator.count,
            },
        }

    # Serialize the data
    serialized_data = []
    for data in page_obj:
        # We use a simplified serialization for tables to keep it lighter if needed,
        # but for consistency we can use the full serializer or a specific one.
        # Let's use the individual getters from existing functions logic to ensure consistency with WebSocket
        # or just reuse the manual dict creation which is faster than model_to_dict
        serialized_data.append(
            {
                "id": data.id,
                "hardware_sensor_id": data.hardware_sensor_id,
                "cpu_usage": data.cpu_usage,
                "ram_usage": data.ram_usage,
                "power_watts": data.power_watts,
                "eco_score": data.eco_score,
                "co2_equiv_g": data.co2_equiv_g,
                # Add other specific fields needed for other tables (union of all needed fields)
                "battery_health": data.battery_health,
                "age_years": data.age_years,
                "overheating": data.overheating,
                "active_devices": data.active_devices,
                "network_load_mbps": data.network_load_mbps,
                "requests_per_min": data.requests_per_min,
                "cloud_dependency_score": data.cloud_dependency_score,
                "obsolescence_score": data.obsolescence_score,
                "bigtech_dependency": data.bigtech_dependency,
                "co2_savings_kg_year": data.co2_savings_kg_year,
                "created_at": data.created_at.isoformat(),
            }
        )

    return {
        "data": serialized_data,
        "meta": {
            "total_pages": paginator.num_pages,
            "current_page": page_obj.number,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous(),
            "total_items": paginator.count,
            "start_index": page_obj.start_index(),
            "end_index": page_obj.end_index(),
        },
    }

def calculate_quiz_score(answers, questions):
    """
    Calculates the score and percentage for a list of answers.
    Returns a tuple (score, total, percentage).
    """
    score = 0
    total = len(questions)
    comparable_count = min(len(answers), total)

    for i in range(comparable_count):
        if answers[i] == questions[i].correct_answer:
            score += 1

    percentage = (score / total) * 100 if total > 0 else 0
    return score, total, percentage
