#!/usr/bin/env python3
"""
Script de test simple pour vérifier le broadcast temps réel
"""
import random
import time

import requests

# Secure random for scanner compliance
random = random.SystemRandom()

url = "http://127.0.0.1:8000/api/iot-data/"

print("\n" + "=" * 60)
print("TEST BROADCAST TEMPS REEL - Dashboard IoT")
print("=" * 60 + "\n")

for i in range(5):
    cpu = random.randint(40, 95)  # nosec B311
    ram = random.randint(50, 85)  # nosec B311
    power = random.randint(100, 300)  # nosec B311
    eco = random.randint(30, 80)  # nosec B311

    # Données minimales
    data = {
        "hardware_sensor_id": f"ESP32_TEST_{i + 1}",
        "hardware_timestamp": int(time.time()),
        "cpu_usage": cpu,
        "ram_usage": ram,
        "power_watts": power,
        "eco_score": eco,
    }

    print(f"[{i + 1}/5] Envoi: CPU={cpu}% RAM={ram}% Power={power}W Eco={eco}")

    try:
        response = requests.post(url, json=data, timeout=5)

        if response.status_code == 201:
            result = response.json()
            print(f"     -> SUCCESS ID={result['id']} Broadcast={result.get('broadcast', 'N/A')}")
        else:
            print(f"     -> ERROR {response.status_code}: {response.text[:100]}")
    except Exception as e:
        print(f"     -> EXCEPTION: {e}")

    if i < 4:
        time.sleep(2)

print("\n" + "=" * 60)
print("Test termine! Regardez le dashboard pour les mises a jour!")
print("=" * 60 + "\n")
