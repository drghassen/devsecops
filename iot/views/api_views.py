"""
API views for JSON responses and data ingestion
"""

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from ..models import IoTData, SystemSetting, QuizQuestion, QuizResult, QuizFact, QuizMood, QuizResultMessage
import requests


@csrf_exempt
@require_http_methods(["POST"])
def iot_data_post(request):
    """
    Handle IoT data ingestion via POST request
    Sends real-time updates via WebSocket to all connected clients
    """
    try:
        data = json.loads(request.body)

        # Extract nested data structures (from Node-RED format)
        # Support both nested format and flat format for backwards compatibility
        hardware_data = data.get("hardware", data)
        energy_data = data.get("energy", data)
        network_data = data.get("network", data)
        scores_data = data.get("scores", data)

        # Create new IoT data record
        iot_data = IoTData.objects.create(
            # Hardware fields - try nested first, then root
            hardware_sensor_id=hardware_data.get("sensor_id", data.get("hardware_sensor_id", "unknown")),
            hardware_timestamp=hardware_data.get("timestamp", data.get("hardware_timestamp", 0)),
            age_years=hardware_data.get("age_years", data.get("age_years", 0)),
            cpu_usage=hardware_data.get("cpu_usage", data.get("cpu_usage", 0)),
            ram_usage=hardware_data.get("ram_usage", data.get("ram_usage", 0)),
            battery_health=hardware_data.get("battery_health", data.get("battery_health", 0)),
            os=hardware_data.get("os", data.get("os", "unknown")),
            win11_compat=hardware_data.get("win11_compat", data.get("win11_compat", False)),
            # Energy fields
            energy_sensor_id=energy_data.get("sensor_id", data.get("energy_sensor_id", "unknown")),
            energy_timestamp=energy_data.get("timestamp", data.get("energy_timestamp", 0)),
            power_watts=energy_data.get("power_watts", data.get("power_watts", 0)),
            active_devices=energy_data.get("active_devices", data.get("active_devices", 0)),
            overheating=energy_data.get("overheating", data.get("overheating", 0)),
            co2_equiv_g=energy_data.get("co2_equiv_g", data.get("co2_equiv_g", 0)),
            # Network fields
            network_sensor_id=network_data.get("sensor_id", data.get("network_sensor_id", "unknown")),
            network_timestamp=network_data.get("timestamp", data.get("network_timestamp", 0)),
            network_load_mbps=network_data.get("network_load_mbps", data.get("network_load_mbps", 0)),
            requests_per_min=network_data.get("requests_per_min", data.get("requests_per_min", 0)),
            cloud_dependency_score=network_data.get("cloud_dependency_score", data.get("cloud_dependency_score", 0)),
            # Scores from nested object or root
            eco_score=scores_data.get("eco_score", 0),
            obsolescence_score=scores_data.get("obsolescence_score", 0),
            bigtech_dependency=scores_data.get("bigtech_dependency", 0),
            co2_savings_kg_year=scores_data.get("co2_savings_kg_year", 0),
            recommendations=scores_data.get("recommendations", {}),
        )

        # Send updated data via WebSocket to all connected clients
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        from .. import data_utils

        channel_layer = get_channel_layer()

        # Define groups and their data functions
        groups = ["dashboard_updates", "hardware_updates", "energy_updates", "network_updates", "scores_updates"]

        data_functions = {
            "dashboard_updates": data_utils.get_dashboard_data_dict,
            "hardware_updates": data_utils.get_hardware_data_dict,
            "energy_updates": data_utils.get_energy_data_dict,
            "network_updates": data_utils.get_network_data_dict,
            "scores_updates": data_utils.get_scores_data_dict,
        }

        # Send data to each WebSocket group
        for group in groups:
            try:
                data_dict = data_functions[group]()
                async_to_sync(channel_layer.group_send)(group, {"type": "data_update", "data": data_dict})
            except Exception as e:
                # Log error but don't block response
                print(f"Error sending WebSocket to group {group}: {e}")

        return JsonResponse({"message": "IoT data created successfully", "id": iot_data.id}, status=201)

    except KeyError as e:
        return JsonResponse({"error": f"Missing field: {str(e)}"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_latest_data(request):
    """Get the most recent IoT data record"""
    try:
        from .. import data_utils

        latest_data = IoTData.objects.order_by("-created_at").first()

        if latest_data:
            data = data_utils.serialize_iot_data(latest_data)
            return JsonResponse(data, status=200)
        else:
            return JsonResponse({"error": "No IoT data available"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_dashboard_data(request):
    """Get dashboard data for WebSocket/API consumption"""
    try:
        from .. import data_utils

        data = data_utils.get_dashboard_data_dict()
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_hardware_data(request):
    """Get hardware data for WebSocket/API consumption"""
    try:
        from .. import data_utils

        data = data_utils.get_hardware_data_dict()
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_energy_data(request):
    """Get energy data for WebSocket/API consumption"""
    try:
        from .. import data_utils

        data = data_utils.get_energy_data_dict()
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_network_data(request):
    """Get network data for WebSocket/API consumption"""
    try:
        from .. import data_utils

        data = data_utils.get_network_data_dict()
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_scores_data(request):
    """Get scores data for WebSocket/API consumption"""
    try:
        from .. import data_utils

        data = data_utils.get_scores_data_dict()
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_history_data(request):
    """
    Get paginated history data.
    Params:
        page: int, default 1
        limit: int, default 8
    """
    try:
        page = int(request.GET.get("page", 1))
        limit = int(request.GET.get("limit", 8))

        from .. import data_utils

        data = data_utils.get_paginated_iot_data(page, limit)
        return JsonResponse(data, status=200)
    except ValueError:
        return JsonResponse({"error": "Invalid page or limit parameter"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_session_info(request):
    """
    Get session information including expiry time.
    Used to synchronize client-side session timer with Django's session.
    """
    from django.conf import settings
    import time

    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False}, status=401)

    # Get session expiry settings
    session_cookie_age = getattr(settings, "SESSION_COOKIE_AGE", 1800)  # Default 30 min

    # Get or set session start time
    if "session_start_time" not in request.session:
        request.session["session_start_time"] = time.time()

    session_start = request.session["session_start_time"]
    current_time = time.time()
    elapsed = current_time - session_start
    remaining = max(0, session_cookie_age - elapsed)

    # Update last activity
    request.session["last_activity"] = current_time

    return JsonResponse(
        {
            "authenticated": True,
            "username": request.user.username,
            "session_start": session_start,
            "session_duration": session_cookie_age,
            "elapsed_seconds": int(elapsed),
            "remaining_seconds": int(remaining),
            "server_time": current_time,
        },
        status=200,
    )


@require_http_methods(["POST"])
@csrf_exempt
def extend_session(request):
    """
    Extend the session by resetting the session start time.
    Called when user is active.
    """
    import time

    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    # Reset session start time
    request.session["session_start_time"] = time.time()
    request.session["last_activity"] = time.time()

    return JsonResponse({"message": "Session extended", "success": True}, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def chatbot_proxy(request):
    """
    Proxy requests to the external Chatbot API.
    Hides the external API URL from the frontend and handles connection errors.
    """
    try:
        # Get Chatbot URL from settings
        setting = SystemSetting.objects.filter(key="chatbot_url").first()
        chatbot_url = setting.value if setting else "http://37.59.116.54:8000/chat"

        data = json.loads(request.body)

        # Forward request to external service
        response = requests.post(chatbot_url, json=data, headers={"Content-Type": "application/json"}, timeout=10)

        if response.ok:
            return JsonResponse(response.json())
        else:
            return JsonResponse({"error": "Chatbot service error"}, status=502)

    except requests.exceptions.ConnectionError:
        return JsonResponse(
            {"error": "La connexion au service IA a échoué. Veuillez vérifier si le serveur est en ligne."}, status=503
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_system_settings(request):
    """
    Expose specific system settings (thresholds) to the frontend.
    """
    # Define which keys are safe to expose
    safe_keys = ["cpu_threshold", "ram_threshold", "power_threshold", "co2_threshold", "eco_threshold"]

    settings = SystemSetting.objects.filter(key__in=safe_keys)
    settings_dict = {s.key: s.value for s in settings}

    # Provide defaults if not in DB
    defaults = {
        "cpu_threshold": "80",
        "ram_threshold": "85",
        "power_threshold": "250",
        "co2_threshold": "150",
        "eco_threshold": "50",
    }

    for key, val in defaults.items():
        if key not in settings_dict:
            settings_dict[key] = val

    return JsonResponse(settings_dict)


@require_http_methods(["GET"])
def get_quiz_questions(request):
    """
    Get all active quiz questions ordered by 'order' fields.
    Also returns random facts, moods, and result messages for the frontend.
    """
    questions = QuizQuestion.objects.filter(is_active=True).order_by("order")
    facts = QuizFact.objects.filter(is_active=True)
    moods = QuizMood.objects.all()
    results = QuizResultMessage.objects.all()

    data = {
        "questions": [
            {
                "id": q.id,
                "q": q.question,
                "options": q.options,
                "answer": q.correct_answer,
                "reactions": {"correct": q.reactions_correct, "wrong": q.reactions_wrong},
                "funFact": q.fun_fact,
            }
            for q in questions
        ],
        "facts": [f.text for f in facts],
        "moods": [{"emoji": m.emoji, "text": m.text, "color": m.color, "min_percentage": m.min_percentage} for m in moods],
        "results": [
            {
                "min_percentage": r.min_percentage,
                "title": r.title,
                "message": r.message,
                "emoji": r.emoji,
                "color_class": r.color_class,
                "badge_text": r.badge_text,
            }
            for r in results
        ],
    }

    return JsonResponse(data)


@csrf_exempt
@require_http_methods(["POST"])
def submit_quiz_result(request):
    """
    Submit quiz results and save to database.
    Calculates score server-side for integrity.
    """
    try:
        data = json.loads(request.body)
        answers = data.get("answers", [])  # List of indices

        if not answers:
            return JsonResponse({"error": "No answers provided"}, status=400)

        questions = QuizQuestion.objects.filter(is_active=True).order_by("order")

        # Calculate score
        score = 0
        total = len(questions)

        # Ensure we don't index out of bounds if question count changed
        comparable_count = min(len(answers), total)

        for i in range(comparable_count):
            if answers[i] == questions[i].correct_answer:
                score += 1

        percentage = (score / total) * 100 if total > 0 else 0

        # Save result
        user = request.user if request.user.is_authenticated else None

        result = QuizResult.objects.create(user=user, score=score, total_questions=total, percentage=percentage)

        # Find appropriate result message
        result_msg = QuizResultMessage.objects.filter(min_percentage__lte=percentage).order_by("-min_percentage").first()

        return JsonResponse(
            {
                "success": True,
                "score": score,
                "total": total,
                "percentage": percentage,
                "message": result_msg.message if result_msg else "Quiz completed",
                "title": result_msg.title if result_msg else "Result",
                "emoji": result_msg.emoji if result_msg else "📝",
            }
        )

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
