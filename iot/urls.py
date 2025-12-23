from django.urls import path

from . import views

urlpatterns = [
    path("iot-data/", views.iot_data_post, name="iot_data_post"),
    path("", views.login_view, name="login"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("hardware/", views.hardware_view, name="hardware"),
    path("energy/", views.energy_view, name="energy"),
    path("network/", views.network_view, name="network"),
    path("scores/", views.scores_view, name="scores"),
    path("quiz/", views.quiz_view, name="quiz"),
    path("latest-data/", views.get_latest_data, name="get_latest_data"),
    path("dashboard-data/", views.get_dashboard_data, name="get_dashboard_data"),
    path("api/hardware/", views.get_hardware_data, name="api_hardware"),
    path("api/energy/", views.get_energy_data, name="api_energy"),
    path("api/network/", views.get_network_data, name="api_network"),
    path("api/scores/", views.get_scores_data, name="api_scores"),
    path("history/", views.get_history_data, name="api_history"),
    # Session management APIs
    path("api/session-info/", views.get_session_info, name="api_session_info"),
    path("api/extend-session/", views.extend_session, name="api_extend_session"),
    # System settings and Chatbot proxy
    path("settings/", views.get_system_settings, name="api_settings"),
    path("chatbot/", views.chatbot_proxy, name="api_chatbot_proxy"),
    # Quiz API endpoints
    path("quiz/questions/", views.get_quiz_questions, name="api_quiz_questions"),
    path("quiz/submit/", views.submit_quiz_result, name="api_quiz_submit"),
]
