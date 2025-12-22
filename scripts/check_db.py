import sqlite3

conn = sqlite3.connect("db.sqlite3")
cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM iot_iotdata")
count = cursor.fetchone()[0]
print("Nombre d'entrées IoTData:", count)

cursor.execute("SELECT id, hardware_sensor_id, created_at FROM iot_iotdata")
rows = cursor.fetchall()
for row in rows:
    print("Entrée:", row)

conn.close()
