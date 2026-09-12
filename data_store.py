# ============================================================
# data_store.py — helper baca/tulis file JSON di folder data/
# Sengaja dipisah dari game_logic.py supaya file logika
# permainan tetap bersih dan fokus untuk latihan siswa.
# ============================================================

import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')


def _path(nama_file):
    return os.path.join(DATA_DIR, nama_file)


def baca_json(nama_file, default):
    """Baca file JSON di folder data/. Kalau belum ada, buat dulu dengan isi `default`."""
    path = _path(nama_file)
    if not os.path.exists(path):
        simpan_json(nama_file, default)
        return default
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def simpan_json(nama_file, data):
    """Simpan `data` ke file JSON di folder data/."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(_path(nama_file), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
