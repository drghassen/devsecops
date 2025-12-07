from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/dashboard/$', consumers.DashboardConsumer.as_asgi()),
    re_path(r'^ws/hardware/$', consumers.HardwareConsumer.as_asgi()),
    re_path(r'^ws/energy/$', consumers.EnergyConsumer.as_asgi()),
    re_path(r'^ws/network/$', consumers.NetworkConsumer.as_asgi()),
    re_path(r'^ws/scores/$', consumers.ScoresConsumer.as_asgi()),
]
