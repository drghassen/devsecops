#!/usr/bin/env python3
"""
================================================================================
ECOTRACK IOT - SIMULATEUR DE DONNÉES TEMPS RÉEL
================================================================================
Envoie des données IoT simulées au dashboard pour tester les mises à jour
temps réel via WebSocket.

Usage:
    python send_test_iot_data.py

    Ou avec paramètres:
    python send_test_iot_data.py --count 20 --interval 1
"""

import requests
import time
import random
import argparse
from datetime import datetime


class IoTDataSimulator:
    """Simulateur de données IoT pour tests temps réel"""

    def __init__(self, base_url="http://127.0.0.1:8000", sensor_id="ESP32_SIMULATOR"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api/iot-data/"
        self.sensor_id = sensor_id
        self.sent_count = 0
        self.success_count = 0
        self.error_count = 0

    def generate_realistic_data(self):
        """Génère des données IoT réalistes avec variations"""
        # Simulation de patterns réalistes
        hour = datetime.now().hour

        # CPU plus élevé pendant les heures de bureau (9h-18h)
        cpu_base = 60 if 9 <= hour <= 18 else 40
        cpu_usage = min(100, max(0, cpu_base + random.randint(-20, 30)))

        # RAM augmente avec le CPU
        ram_base = cpu_usage - random.randint(5, 15)
        ram_usage = min(100, max(20, ram_base))

        # Puissance corrélée au CPU
        power_base = cpu_usage * 2
        power_watts = max(50, min(300, power_base + random.randint(-30, 30)))

        # Score éco inversement proportionnel à la puissance
        eco_score = max(20, min(100, 100 - (power_watts // 3)))

        # CO2 basé sur puissance (fictif)
        co2_equiv_g = power_watts * random.uniform(1.5, 2.5)

        # Température proportionnelle au CPU
        temperature_c = 25 + (cpu_usage * 0.5) + random.uniform(-3, 3)

        return {
            # Hardware
            "hardware_sensor_id": self.sensor_id,
            "hardware_timestamp": int(time.time()),
            "cpu_usage": round(cpu_usage, 1),
            "ram_usage": round(ram_usage, 1),
            "battery_level": round(random.uniform(60, 100), 1),
            "device_age_months": random.randint(6, 36),
            "temperature_c": round(temperature_c, 1),
            # Energy
            "power_watts": round(power_watts, 1),
            "co2_equiv_g": round(co2_equiv_g, 2),
            "overheating_risk": 1 if temperature_c > 75 else 0,
            "active_devices": random.randint(3, 12),
            # Network
            "bandwidth_mbps": round(random.uniform(10, 500), 2),
            "network_requests_per_sec": random.randint(50, 500),
            "cloud_dependency_pct": round(random.uniform(30, 85), 1),
            "data_center_location": random.choice(["EU", "US", "ASIA"]),
            # Scores
            "eco_score": round(eco_score, 1),
            "obsolescence_score": round(random.uniform(40, 90), 1),
            "bigtech_dependency": round(random.uniform(30, 80), 1),
        }

    def send_data(self, data):
        """Envoie les données au serveur"""
        try:
            response = requests.post(self.api_url, json=data, timeout=5, headers={"Content-Type": "application/json"})

            if response.status_code in [200, 201]:
                self.success_count += 1
                return True, response.status_code
            else:
                self.error_count += 1
                return False, response.status_code

        except requests.exceptions.RequestException as e:
            self.error_count += 1
            return False, str(e)

    def run_simulation(self, count=10, interval=2, verbose=True):
        """Lance la simulation"""
        print(f"\n{'=' * 70}")
        print("🚀 ECOTRACK IOT - SIMULATEUR DE DONNÉES TEMPS RÉEL")
        print(f"{'=' * 70}")
        print(f"📡 URL API: {self.api_url}")
        print(f"🔧 Sensor ID: {self.sensor_id}")
        print(f"📊 Nombre d'envois: {count}")
        print(f"⏱️  Intervalle: {interval}s")
        print(f"{'=' * 70}\n")

        start_time = time.time()

        for i in range(count):
            self.sent_count += 1

            # Générer données
            data = self.generate_realistic_data()

            # Envoyer
            success, status = self.send_data(data)

            # Afficher résultat
            if verbose:
                status_icon = "✅" if success else "❌"
                timestamp = datetime.now().strftime("%H:%M:%S")
                print(
                    f"{status_icon} [{timestamp}] Envoi {i + 1}/{count} | "
                    f"Status: {status} | "
                    f"CPU: {data['cpu_usage']}% | "
                    f"Power: {data['power_watts']}W | "
                    f"Eco: {data['eco_score']}"
                )

            # Attendre avant le prochain envoi (sauf dernier)
            if i < count - 1:
                time.sleep(interval)

        # Statistiques finales
        elapsed = time.time() - start_time
        print(f"\n{'=' * 70}")
        print("📊 STATISTIQUES")
        print(f"{'=' * 70}")
        print(f"✉️  Total envoyés: {self.sent_count}")
        print(f"✅ Succès: {self.success_count}")
        print(f"❌ Erreurs: {self.error_count}")
        print(f"⏱️  Durée totale: {elapsed:.1f}s")
        print(f"📈 Débit: {self.sent_count / elapsed:.2f} msg/s")
        print(f"{'=' * 70}\n")


def main():
    """Point d'entrée principal"""
    parser = argparse.ArgumentParser(description="Simulateur de données IoT pour tests temps réel")
    parser.add_argument(
        "--url", default="http://127.0.0.1:8000", help="URL de base du serveur (défaut: http://127.0.0.1:8000)"
    )
    parser.add_argument("--sensor-id", default="ESP32_SIMULATOR", help="ID du capteur simulé (défaut: ESP32_SIMULATOR)")
    parser.add_argument("--count", type=int, default=10, help="Nombre de messages à envoyer (défaut: 10)")
    parser.add_argument("--interval", type=float, default=2, help="Intervalle entre chaque envoi en secondes (défaut: 2)")
    parser.add_argument("--quiet", action="store_true", help="Mode silencieux (pas de sortie détaillée)")

    args = parser.parse_args()

    # Créer et lancer le simulateur
    simulator = IoTDataSimulator(base_url=args.url, sensor_id=args.sensor_id)

    try:
        simulator.run_simulation(count=args.count, interval=args.interval, verbose=not args.quiet)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interruption par l'utilisateur")
        print(f"📊 Envoyés avant interruption: {simulator.sent_count}")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
