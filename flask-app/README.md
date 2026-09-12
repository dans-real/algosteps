# Ular Tangga — SMPN 2 Kamal

Web edukasi Informatika berbentuk permainan ular tangga. Frontend-nya HTML/CSS/JS,
tapi **semua logika permainan dijalankan oleh Python (Flask)** — dirancang supaya
siswa kelas 9 bisa ikut membaca dan mengedit kodenya sebagai latihan.

## Cara menjalankan

```bash
pip install -r requirements.txt
python app.py
```

Lalu buka **http://localhost:5000** di browser. Untuk panel admin (mengelola bank soal),
buka **http://localhost:5000/admin** — login default: `admin` / `admin123`
(disarankan langsung diganti lewat tab "Akun Admin" setelah login pertama).

> Server perlu tetap berjalan (terminal jangan ditutup) selama permainan dimainkan.
> Cocok dijalankan di satu laptop guru yang disambungkan ke proyektor kelas.
# algosteps

## Struktur folder

```
ulartangga/
├── app.py            <- Flask: routing halaman & API (boilerplate, jarang perlu diubah)
├── game_logic.py      <- ⭐ FILE UTAMA UNTUK LATIHAN SISWA — semua aturan main di sini
├── data_store.py      <- helper baca/tulis file JSON (jarang perlu diubah)
├── requirements.txt
├── data/               <- otomatis dibuat & berisi soal.json, bonus.json, admin.json
├── templates/
│   ├── index.html      <- halaman permainan
│   └── admin.html       <- halaman admin (CRUD bank soal)
└── static/
    ├── style.css
    ├── game.js          <- tampilan & interaksi (memanggil API Python lewat fetch)
    └── admin.js
```

## Di mana Python "berkontribusi" di web ini

Setiap aksi penting dalam permainan **diputuskan oleh fungsi Python** di `game_logic.py`,
bukan oleh JavaScript. JavaScript di browser cuma menampilkan hasilnya. Alurnya:

```
Klik "LEMPAR DADU" (browser)
        │  fetch POST /api/lempar-dadu
        ▼
   app.py (Flask route)
        │  memanggil
        ▼
   game_logic.lempar_dadu()   <- Python yang benar-benar melempar dadunya
        │  hasil dikirim balik sebagai JSON
        ▼
   game.js menampilkan animasi & angka dadu
```

Begitu juga untuk: menggerakkan pion, membaca jenis petak, mengecek jawaban soal,
menghitung hadiah/penalti langkah, membuat susunan papan, dan efek petak misteri.

## Latihan untuk siswa (di `game_logic.py`)

File itu sudah diberi komentar `LATIHAN:` di beberapa fungsi. Beberapa ide tantangan:

1. **`lempar_dadu()`** — ganti jadi dadu 8 sisi, atau buat dadu "curang" pakai
   `random.choices()` dengan bobot berbeda tiap sisi (masih materi **Peluang**).
2. **`hitung_hadiah()`** — ubah nilai hadiah/penalti supaya permainan lebih mudah/sulit.
3. **`buat_papan()`** — tambah lebih banyak tangga/ular, atau buat persentase
   petak soal jadi 50%.
4. **Tantangan lanjutan**: tambah jenis petak baru, misalnya "Petak Kilat" yang
   langsung memindahkan pemain ke posisi acak — gabungan `random` + dictionary papan.

Setelah mengedit `game_logic.py`, simpan filenya lalu refresh browser (Flask jalan
dengan `debug=True` jadi otomatis memuat ulang kode Python).

## Daftar Asset (untuk tim desain)

Semua elemen visual di bawah ini **sengaja dikosongkan** — tampil sebagai kotak
putus-putus "siap diisi" (atau, untuk elemen kecil seperti pion/avatar/ikon petak,
sebagai bentuk polos warna tim/tanpa ikon) selama filenya belum ada.

**Cara pakai:** simpan file dengan **nama persis** seperti di tabel ke folder
`static/assets/`, lalu refresh browser. Tidak perlu ubah kode apa pun — begitu
nama file cocok, tampilan otomatis berganti dari kotak placeholder ke gambar asli.

| Nama file | Ukuran disarankan | Dipakai di |
|---|---|---|
| `logo-ulartangga.png` | ±780×290 px, PNG transparan | Logo utama (Menu) |
| `btn-mulai.png` | ±600×110 px | Tombol "Mulai" |
| `btn-cara-bermain.png` | ±600×110 px | Tombol "Cara Bermain" |
| `btn-pengaturan.png` | ±600×110 px | Tombol "Pengaturan" |
| `btn-keluar.png` | ±600×110 px | Tombol "Keluar" |
| `btn-lempar-dadu.png` | ±600×110 px | Tombol "Lempar Dadu" |
| `bg-menu.jpg` | ≥1200×1600 px | Background layar Menu Utama |
| `papan-bg.png` | ≥800×800 px | Tekstur latar papan (opsional) |
| `avatar-merah.png` | 88×88 px | Avatar Tim Merah (sidebar papan) |
| `avatar-biru.png` | 88×88 px | Avatar Tim Biru (sidebar papan) |
| `pion-merah.png` | 40×40 px, PNG transparan | Pion Tim Merah di papan |
| `pion-biru.png` | 40×40 px | Pion Tim Biru di papan |
| `icon-soal.png` | 48×48 px | Ikon petak Soal + judul modal |
| `icon-bonus.png` | 48×48 px | Ikon petak Bonus + judul modal |
| `icon-misteri.png` | 48×48 px | Ikon petak Misteri + judul modal |
| `petak-tangga.png` | 48×48 px | Ikon petak Tangga |
| `petak-ular.png` | 48×48 px | Ikon petak Ular |
| `icon-start.png` | 48×48 px | Ikon petak Start (opsional) |
| `icon-finish.png` | 48×48 px | Ikon petak Finish (opsional) |
| `icon-mundurkan.png` | 96×96 px | Ikon kartu "Mundurkan Lawan" (Petak Misteri) |
| `icon-shield.png` | 96×96 px | Ikon kartu "Shield" (Petak Misteri) |
| `icon-kembali.png` | 48×48 px | Ikon tombol kembali (semua layar) |
| `icon-menang.png` | 96×96 px, PNG transparan | Ikon trofi di layar Menang |

Semua path di atas relatif terhadap `static/assets/` (jadi taruh file langsung
di folder itu, contoh: `static/assets/logo-ulartangga.png`).

**Pengecualian — dadu di panel #4 storyboard:** dadu **tidak** pakai gambar
aset. Itu objek 3D asli yang dibangun dari CSS (`transform-style: preserve-3d`)
di `static/style.css` (bagian "Dadu 3D") dan digerakkan oleh `spinDiceTo()` di
`static/game.js`, berputar sungguhan lalu berhenti di sisi sesuai angka yang
dikirim `game_logic.lempar_dadu()`.

## Catatan penyimpanan data

Soal yang ditambahkan lewat panel admin disimpan di `data/soal.json` dan
`data/bonus.json` (folder `data/` dibuat otomatis saat pertama kali dijalankan).
Karena disimpan di server (bukan `localStorage` browser), datanya konsisten dan
sama-sama terlihat oleh siapa pun yang membuka web ini selama server berjalan —
beda dengan versi sebelumnya yang datanya cuma tersimpan di satu browser.

## Keamanan

Login admin di proyek ini level "cukup untuk proyek kelas": password disimpan polos
di `data/admin.json`, bukan dienkripsi, dan `app.secret_key` di `app.py` bersifat
tetap. Ini wajar untuk penggunaan lokal/kelas, tapi **jangan deploy ke internet publik**
tanpa memperkuat bagian ini dulu.
