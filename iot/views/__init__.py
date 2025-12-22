"""
IoT Views Package
Organized view modules using data_utils.py as single source of truth
"""

# Import all views to maintain backward compatibility
from .auth_views import login_view, logout_view
from .page_views import dashboard, hardware_view, energy_view, network_view, scores_view, quiz_view
from .api_views import (
    iot_data_post,
    get_latest_data,
    get_dashboard_data,
    get_hardware_data,
    get_energy_data,
    get_network_data,
    get_scores_data,
    get_history_data,
    get_session_info,
    extend_session,
    chatbot_proxy,
    get_system_settings,
    get_quiz_questions,
    submit_quiz_result,
)

__all__ = [
    # Authentication
    "login_view",
    "logout_view",
    # Page Views
    "dashboard",
    "hardware_view",
    "energy_view",
    "network_view",
    "scores_view",
    "quiz_view",
    # API Views
    "iot_data_post",
    "get_latest_data",
    "get_dashboard_data",
    "get_hardware_data",
    "get_energy_data",
    "get_network_data",
    "get_scores_data",
    "get_history_data",
    "get_session_info",
    "extend_session",
    "chatbot_proxy",
    "get_system_settings",
    "get_quiz_questions",
    "submit_quiz_result",
]
