# Ular Tangga — SMPN 2 Kamal

Repo ini sekarang berisi **dua versi** dari game yang sama, supaya bisa jalan
di GitHub Pages TANPA kehilangan bagian belajar Python-nya.

```
ulartangga/
├── docs/          <- Versi STATIS (HTML/CSS/JS murni) — INI yang di-deploy ke GitHub Pages
└── flask-app/     <- Versi Python/Flask ASLI — untuk latihan siswa, dijalankan lokal
```

## Kenapa dua versi?

GitHub Pages **cuma bisa menyajikan file statis** (HTML/CSS/JS/gambar) — dia
tidak bisa menjalankan Python sama sekali. Supaya web tetap bisa online gratis
di GitHub Pages, semua logika yang tadinya ada di `game_logic.py` (dadu, gerak
pion, cek jawaban, papan, petak misteri) di-port ulang jadi JavaScript murni di
`docs/data.js` — fungsinya dibuat semirip mungkin (nama fungsi, alur, bahkan
komentar) supaya siswa yang sudah belajar dari versi Python tetap bisa
mengenali polanya.

**`flask-app/` tetap dipertahankan apa adanya** — ini yang dipakai untuk
kegiatan belajar Python di kelas (edit `game_logic.py`, jalankan `python
app.py`). Dua versi ini berjalan independen; mengubah salah satu tidak
otomatis mengubah yang lain.

## Cara deploy `docs/` ke GitHub Pages

1. Push folder ini ke GitHub (repo yang sudah kamu punya).
2. Buka repo di GitHub → **Settings → Pages**.
3. Di **Build and deployment**, pilih **Deploy from a branch**.
4. Branch: `main` (atau branch utama kamu), folder: **`/docs`** → **Save**.
5. Tunggu 1–2 menit, GitHub akan kasih link seperti
   `https://<username>.github.io/<nama-repo>/`.

Setelah itu, setiap kali kamu push perubahan ke folder `docs/`, situsnya
otomatis update.

## Perbedaan penting versi statis vs versi Flask

| | `docs/` (GitHub Pages) | `flask-app/` (lokal) |
|---|---|---|
| Butuh Python berjalan? | Tidak | Ya (`python app.py`) |
| Logika game dihitung di | JavaScript (`data.js`) | Python (`game_logic.py`) |
| Data soal/bonus admin disimpan di | `localStorage` browser (per perangkat) | file `data/*.json` di server |
| Cocok untuk | Dibagikan online / dilihat siapa saja | Latihan Python siswa di kelas |

Karena admin panel versi statis pakai `localStorage`, soal yang ditambahkan
lewat `docs/admin.html` **hanya tersimpan di browser itu saja** — tidak
otomatis muncul di perangkat lain yang membuka link GitHub Pages yang sama.
Kalau butuh bank soal yang sama untuk semua orang, edit langsung
`DEFAULT_SOAL`/`DEFAULT_BONUS` di `docs/data.js` lalu push ke GitHub.

## Menjalankan `flask-app/` secara lokal

```bash
cd flask-app
pip install -r requirements.txt
python app.py
```
Lalu buka `http://localhost:5000`. Detail lengkap (daftar aset, latihan
`game_logic.py`, dll) ada di `flask-app/README.md`.
