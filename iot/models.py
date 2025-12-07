from django.db import models


class IoTData(models.Model):

    # ---------- HARDWARE ----------
    hardware_sensor_id = models.CharField(max_length=50)
    hardware_timestamp = models.BigIntegerField()

    age_years = models.IntegerField()
    cpu_usage = models.IntegerField()
    ram_usage = models.IntegerField()
    battery_health = models.FloatField()
    os = models.CharField(max_length=20)
    win11_compat = models.BooleanField()

    # ---------- ENERGY ----------
    energy_sensor_id = models.CharField(max_length=50)
    energy_timestamp = models.BigIntegerField()

    power_watts = models.IntegerField()
    active_devices = models.IntegerField()
    overheating = models.IntegerField()
    co2_equiv_g = models.IntegerField()

    # ---------- NETWORK ----------
    network_sensor_id = models.CharField(max_length=50)
    network_timestamp = models.BigIntegerField()

    network_load_mbps = models.IntegerField()
    requests_per_min = models.IntegerField()
    cloud_dependency_score = models.IntegerField()

    # ---------- SCORES ----------
    eco_score = models.IntegerField()
    obsolescence_score = models.IntegerField()
    bigtech_dependency = models.IntegerField()
    co2_savings_kg_year = models.IntegerField()
    recommendations = models.JSONField(default=dict, blank=True)

    # ---------- TIMESTAMP ENREGISTREMENT ----------
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"IoT Data {self.id} - {self.created_at}"
