from django.urls import path
from . import views

urlpatterns = [
    path('iot-data/', views.iot_data_post, name='iot_data_post'),
    path('', views.login_view, name='login'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('hardware/', views.hardware_view, name='hardware'),
    path('energy/', views.energy_view, name='energy'),
    path('network/', views.network_view, name='network'),
    path('scores/', views.scores_view, name='scores'),
    path('quiz/', views.quiz_view, name='quiz'),
    path('latest-data/', views.get_latest_data, name='get_latest_data'),
    path('dashboard-data/', views.get_dashboard_data, name='get_dashboard_data'),
    path('hardware-data/', views.get_hardware_data, name='get_hardware_data'),
    path('energy-data/', views.get_energy_data, name='get_energy_data'),
    path('network-data/', views.get_network_data, name='get_network_data'),
    path('scores-data/', views.get_scores_data, name='get_scores_data'),
]
