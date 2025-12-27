import serial
import json
import csv
import time

SERIAL_PORT = 'COM11' 
BAUD_RATE = 115200
FILENAME = 'data_motor_training.csv'

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Terhubung ke {SERIAL_PORT}. Reset ESP32 sebentar...")
    time.sleep(2) # Beri waktu ESP32 booting
    print("Siap merekam! (Ctrl+C untuk stop)")
except Exception as e:
    print(f"Error koneksi: {e}")
    exit()

# Setup CSV
fieldnames = [
    'voltage', 'current', 'power', 'energy', 'frequency', 'pf', 
    'voltage_alert', 'pf_alert', 'motor_temp', 'ambient_temp', 
    'temp_alert', 'hotspot', 'bearing_temp', 'delta_temp', 
    'dust', 'dust_alert', 'soiling_loss', 'vibration_rms_mm_s', 
    'vibration_alert', 'unbalance', 'bearing_health'
]

# Cek apakah file sudah ada untuk menulis header
try:
    with open(FILENAME, 'r') as f:
        pass
except FileNotFoundError:
    with open(FILENAME, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

buffer_string = ""

try:
    while True:
        if ser.in_waiting > 0:
            # Baca data baru
            try:
                chunk = ser.read(ser.in_waiting).decode('utf-8', errors='ignore')
                buffer_string += chunk
                
                # Debug: Tampilkan dot (.) setiap ada data masuk biar tau script jalan
                print(".", end="", flush=True)

                # Cari paket JSON lengkap
                while '{' in buffer_string and '}' in buffer_string:
                    start_index = buffer_string.find('{')
                    end_index = buffer_string.find('}', start_index) + 1
                    
                    # Jika format kurung lengkap
                    if end_index > start_index:
                        json_str = buffer_string[start_index:end_index]
                        buffer_string = buffer_string[end_index:] # Hapus yg sudah diproses
                        
                        try:
                            data = json.loads(json_str)
                            
                            # Simpan ke CSV
                            with open(FILENAME, 'a', newline='') as f:
                                writer = csv.DictWriter(f, fieldnames=fieldnames)
                                writer.writerow(data)
                            
                            print(f"\n[OK] Data tersimpan! Voltage: {data.get('voltage', 0)} V")
                            
                        except json.JSONDecodeError:
                            print("\n[SKIP] JSON rusak (wajar saat awal koneksi)")
                    else:
                        break # Tunggu data berikutnya
            except Exception as e:
                print(f"Error baca: {e}")

except KeyboardInterrupt:
    print(f"\nLogging selesai. Data ada di {FILENAME}")
    ser.close()