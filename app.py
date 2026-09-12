# ============================================================
# ULAR TANGGA SMPN 2 KAMAL — app.py
#
# File ini "jembatan" antara web (HTML/JS di browser) dan
# logika permainan di game_logic.py. Isinya kebanyakan
# boilerplate Flask (route + jsonify) — bagian yang paling
# penting untuk dipelajari & diutak-atik ada di game_logic.py.
#
# Cara jalankan:
#   pip install -r requirements.txt
#   python app.py
#   lalu buka http://localhost:5000 di browser
# ============================================================

import time
from flask import Flask, render_template, request, jsonify, session

import game_logic as gl
import data_store as ds

app = Flask(__name__)
app.secret_key = 'ulartangga-smpn2kamal-kunci-kelas'  # cukup untuk proyek kelas, bukan untuk produksi publik

# Papan dibuat sekali saat server pertama kali jalan (posisi tangga/ular/soal tetap selama server hidup)
PAPAN = gl.buat_papan()


def _bank(tipe):
    if tipe == 'soal':
        return ds.baca_json('soal.json', gl.DEFAULT_SOAL)
    return ds.baca_json('bonus.json', gl.DEFAULT_BONUS)


def _simpan_bank(tipe, data):
    ds.simpan_json('soal.json' if tipe == 'soal' else 'bonus.json', data)


# ---------------- Halaman ----------------
@app.route('/')
def halaman_utama():
    return render_template('index.html')


@app.route('/admin')
def halaman_admin():
    return render_template('admin.html')


# ---------------- API: Papan & Dadu ----------------
@app.route('/api/papan')
def api_papan():
    return jsonify(PAPAN)


@app.route('/api/lempar-dadu', methods=['POST'])
def api_lempar_dadu():
    return jsonify({"hasil": gl.lempar_dadu()})


@app.route('/api/gerak', methods=['POST'])
def api_gerak():
    body = request.get_json()
    posisi_baru = gl.gerak_pion(int(body['posisi']), int(body['langkah']))
    petak = gl.baca_petak(PAPAN, posisi_baru)
    return jsonify({
        "posisi_baru": posisi_baru,
        "petak": petak,
        "menang": gl.cek_menang(posisi_baru)
    })


# ---------------- API: Petak Misteri ----------------
@app.route('/api/misteri', methods=['POST'])
def api_misteri():
    body = request.get_json()
    pilihan = gl.pilih_misteri()
    hasil = gl.terapkan_misteri(pilihan, int(body['posisi_lawan']), bool(body['shield_lawan']))
    hasil['pilihan'] = pilihan
    return jsonify(hasil)


# ---------------- API: Bank Soal & Bonus ----------------
@app.route('/api/<tipe>', methods=['GET'])
def api_get_bank(tipe):
    if tipe not in ('soal', 'bonus'):
        return jsonify({"error": "tipe tidak dikenal"}), 404
    return jsonify(_bank(tipe))


@app.route('/api/<tipe>', methods=['POST'])
def api_tambah_bank(tipe):
    if tipe not in ('soal', 'bonus'):
        return jsonify({"error": "tipe tidak dikenal"}), 404
    if not session.get('admin'):
        return jsonify({"error": "Harus login sebagai admin"}), 401
    item = request.get_json()
    item['id'] = 'q_' + str(int(time.time() * 1000))
    bank = _bank(tipe)
    bank.append(item)
    _simpan_bank(tipe, bank)
    return jsonify(item)


@app.route('/api/<tipe>/<id_soal>', methods=['PUT'])
def api_edit_bank(tipe, id_soal):
    if tipe not in ('soal', 'bonus'):
        return jsonify({"error": "tipe tidak dikenal"}), 404
    if not session.get('admin'):
        return jsonify({"error": "Harus login sebagai admin"}), 401
    body = request.get_json()
    bank = _bank(tipe)
    for i, item in enumerate(bank):
        if item['id'] == id_soal:
            body['id'] = id_soal
            bank[i] = body
            break
    _simpan_bank(tipe, bank)
    return jsonify({"ok": True})


@app.route('/api/<tipe>/<id_soal>', methods=['DELETE'])
def api_hapus_bank(tipe, id_soal):
    if tipe not in ('soal', 'bonus'):
        return jsonify({"error": "tipe tidak dikenal"}), 404
    if not session.get('admin'):
        return jsonify({"error": "Harus login sebagai admin"}), 401
    bank = [item for item in _bank(tipe) if item['id'] != id_soal]
    _simpan_bank(tipe, bank)
    return jsonify({"ok": True})


@app.route('/api/jawab', methods=['POST'])
def api_jawab():
    body = request.get_json()  # { tipe: 'soal'|'bonus', id, pilihan }
    bank = _bank(body['tipe'])
    hasil = gl.cek_jawaban(bank, body['id'], int(body['pilihan']))
    langkah = gl.hitung_hadiah(body['tipe'], hasil['benar'])
    return jsonify({"benar": hasil['benar'], "langkah": langkah, "jawaban_benar": hasil['jawaban_benar']})


# ---------------- API: Login Admin ----------------
@app.route('/api/login', methods=['POST'])
def api_login():
    body = request.get_json()
    akun = ds.baca_json('admin.json', {"username": "admin", "password": "admin123"})
    if body.get('username') == akun['username'] and body.get('password') == akun['password']:
        session['admin'] = True
        return jsonify({"ok": True})
    return jsonify({"ok": False}), 401


@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('admin', None)
    return jsonify({"ok": True})


@app.route('/api/cek-sesi')
def api_cek_sesi():
    return jsonify({"login": bool(session.get('admin'))})


@app.route('/api/akun', methods=['PUT'])
def api_ubah_password():
    if not session.get('admin'):
        return jsonify({"error": "Harus login sebagai admin"}), 401
    body = request.get_json()
    akun = ds.baca_json('admin.json', {"username": "admin", "password": "admin123"})
    if body.get('password_lama') != akun['password']:
        return jsonify({"ok": False, "pesan": "Password lama salah"}), 400
    akun['password'] = body['password_baru']
    ds.simpan_json('admin.json', akun)
    return jsonify({"ok": True})


if __name__ == '__main__':
    app.run(debug=True)
