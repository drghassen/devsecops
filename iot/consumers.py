import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.serializers.json import DjangoJSONEncoder

from . import data_utils


class BaseDataConsumer(AsyncWebsocketConsumer):

    group_name = None

    async def connect(self):
        if self.group_name:
            await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        # Envoyer les données initiales
        await self.send_initial_data()

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_initial_data(self):
        """Envoie les données initiales au client"""
        data = await sync_to_async(self.get_data)()
        await self.send(text_data=json.dumps(data, cls=DjangoJSONEncoder))

    def get_data(self):
        """Méthode à surcharger dans les classes filles"""
        return {}

    async def data_update(self, event):
        """Reçoit les mises à jour depuis le groupe"""
        await self.send(text_data=json.dumps(event["data"], cls=DjangoJSONEncoder))


class DashboardConsumer(BaseDataConsumer):
    group_name = "dashboard_updates"

    def get_data(self):
        return data_utils.get_dashboard_data_dict()


class HardwareConsumer(BaseDataConsumer):
    group_name = "hardware_updates"

    def get_data(self):
        return data_utils.get_hardware_data_dict()


class EnergyConsumer(BaseDataConsumer):
    group_name = "energy_updates"

    def get_data(self):
        return data_utils.get_energy_data_dict()


class NetworkConsumer(BaseDataConsumer):
    group_name = "network_updates"

    def get_data(self):
        return data_utils.get_network_data_dict()


class ScoresConsumer(BaseDataConsumer):
    group_name = "scores_updates"

    def get_data(self):
        return data_utils.get_scores_data_dict()
