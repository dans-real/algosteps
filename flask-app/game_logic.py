# ============================================================
# ULAR TANGGA SMPN 2 KAMAL — game_logic.py
#
# INI FILE UTAMA UNTUK LATIHAN SISWA KELAS 9.
# Semua "otak" permainan ada di sini: fungsi Python murni,
# tidak ada urusan Flask/web di file ini, jadi kalian bisa
# tes tiap fungsi langsung dengan menjalankan:
#     python
#     >>> import game_logic as gl
#     >>> gl.lempar_dadu()
#
# Tiap fungsi ditandai konsep yang dipakai supaya nyambung
# dengan materi Informatika yang sudah dipelajari.
# ============================================================

import random

# ---------- Posisi tangga & ular (tetap, tidak berubah tiap game) ----------
TANGGA = {3: 22, 11: 30, 28: 52, 40: 59, 63: 81, 71: 91}
ULAR = {98: 90, 85: 76, 62: 48, 87: 74, 34: 14}

# ---------- Bank soal contoh (dipakai kalau data/soal.json belum ada) ----------
DEFAULT_SOAL = [
    {"id": "s1", "pertanyaan": "Urutan langkah langkah yang sistematis untuk menyelesaikan suatu masalah disebut ...",
     "opsi": ["Variabel", "Algoritma", "Program", "Data"], "jawaban": 1},
    {"id": "s2", "pertanyaan": "Dalam Python, perintah if digunakan untuk ...",
     "opsi": ["Mengulangh perintah", "Menyimpan data", "Membuat percabangan berdasarkan kondisi", "Menghapus data"], "jawaban": 2},
    {"id": "s3", "pertanyaan": "Apa arti dari operator == dalam Python ...",
     "opsi": ["Memberikan nilai", "Tidak sama dengan", "Sama dengan", "Lebih besar dari"], "jawaban": 2},
    {"id": "s4", "pertanyaan": "Perintah for biasanya digunakan untuk ...",
     "opsi": ["Melakukan perulangan", "Membuat variabel", "Menghentikan program", "Membandingkan dua langkah"], "jawaban": 0},
    {"id": "s5", "pertanyaan": "Fungsi input() dalam python digunakan untuk ...",
     "opsi": ["Menampilkan hasil", "Menerima masukan dari pengguna", "Mengulang program", "Membuat kondisi"], "jawaban": 1},
    {"id": "s6", "pertanyaan": "Kemampuan memecah masalah besar menjadi beberapa bagian kecil disebut ...",
     "opsi": ["Dekomposisi", "Enkripsi", "Kompilasi", "Algoritma"], "jawaban": 0},
    {"id": "s7", "pertanyaan": "Contoh algoritma dalam kehidupan sehari-hari adalah ...",
     "opsi": ["Menonton video tanpa urutan", "Mengikuti langkah-langkah membuat mi instan", "Membuka hp secara acak", "Menggambar tanpa rencana"], "jawaban": 1},
    {"id": "s8", "pertanyaan": "Tujuan utama membuat algoritma adalah ...",
     "opsi": ["membuat masalah semakin rumit", "Menyelesaikan masalah secara tersturktur", "Menghapus semua data", "Memperbanyak kode"], "jawaban": 1},
    {"id": "s9", "pertanyaan": "Apa yang terjadi jiika kondisi pada if bernilai False dan terdapat else ...",
     "opsi": ["Program berhenti", "Perintah pada if tetap dijalankan", "Perintah pada else dijalankan", "Program mengulang dari awal"], "jawaban": 2},
    {"id": "s10", "pertanyaan": "Manakah yang bukan bagian utama dari berpikir komputasional ...",
     "opsi": ["Dekomposisi", "Pengenalan pola", "Abstaksi", "Menebak secara acak"], "jawaban": 3},
    {"id": "s11", "pertanyaan": "Jika kamu ingin mencari rute tercepat menuju sekolah, informasi yang penting adalah ...",
     "opsi": ["Warna rumah disepanjang jalan", "Jarak dan kondisi jalan", "Nama semua orang yang lewat", "Bentuk awan dilangit"], "jawaban": 1},
    {"id": "s12", "pertanyaan": "Mengemlompokkan benda menjadi makanan, minuman, dan alat tulis berdasarkan jenisnya merupakan contoh ...",
     "opsi": ["Klasifikasi", "Debugging", "Perulangan", "Abstraksi"], "jawaban": 0},
]

DEFAULT_BONUS = [
    {"id": "b1", "pertanyaan": "Jika kamu memiliki 3 tugas, lalu setiap tugas dibagi menjadi 2 bagian, berapa bagian yang harus diseelesaikan  ...",
     "opsi": ["5", "6", "7", "8"], "jawaban": 1},
    {"id": "b2", "pertanyaan": "Jika posisi = 96 dan pemain mendapat langkah = 4, maka ...",
     "opsi": ["Menang karena tepat di 100", "Menang karena melewati 100", "Tetap di posisi 96", "Kembali ke posisi 1"], "jawaban": 0},
    {"id": "b3", "pertanyaan": "Jika sebuah program harus memilih Lulus atau Tidak Lulus berdasarkan nilai siswa, konsep yang paling tepat adalah ...",
     "opsi": ["Perulangan", "Percabangan", "Variabel", "Input"], "jawaban": 1},
    {"id": "b4", "pertanyaan": "Manakah langkah yang paling tidak diperlukan saat membuat algoritma menghitung luas persegi ...",
     "opsi": ["Memasukkan panjang sisi", "Mengalikan sisi x sisi", "Menampilkan hasil", "Mengubah warna layar"], "jawaban": 3},
    {"id": "b5", "pertanyaan": "Seorang pemain mendapatkan soal. Jika jawabannya benar, posisinya maju 2 petak, jika salah tetap ditempat. Struktur algoritma yang digunakan adalah ...",
     "opsi": ["Percabangan", "Perulangan", "Dekomposisi", "Abstraksi"], "jawaban": 0},
    {"id": "b6", "pertanyaan": "Dalam KKA, informasi yang tidak diperlukan dalam penyelasian masalah sebaiknya ...",
     "opsi": ["Ditambahkan", "Diperbayak", "Diabaikan", "Diulang"], "jawaban": 2},
]


def buat_papan(acak=False):
    """
    Membuat susunan 100 petak: menentukan petak mana yang jadi
    Soal (40%), Bonus (10%), Misteri (10%), Ular, Tangga, atau petak biasa.

    KONSEP: perulangan (loop), list, dictionary, dan modul random.

    LATIHAN: ganti `acak=True` supaya papan beda tiap kali server
    dinyalakan ulang (hapus baris `random.seed(42)` di bawah).
    """
    papan = {n: {"tipe": "normal"} for n in range(1, 101)}
    papan[1] = {"tipe": "start"}
    papan[100] = {"tipe": "finish"}

    for posisi, tujuan in TANGGA.items():
        papan[posisi] = {"tipe": "tangga", "tujuan": tujuan}
    for posisi, tujuan in ULAR.items():
        papan[posisi] = {"tipe": "ular", "tujuan": tujuan}

    # kumpulkan petak yang masih "normal" untuk diisi soal/bonus/misteri
    sisa = [n for n in range(2, 100) if papan[n]["tipe"] == "normal"]

    if not acak:
        random.seed(42)  # supaya papan sama setiap kali dijalankan
    random.shuffle(sisa)

    jumlah_soal = round(100 * 0.40)
    jumlah_bonus = round(100 * 0.10)
    jumlah_misteri = round(100 * 0.10)

    idx = 0
    for _ in range(jumlah_soal):
        if idx >= len(sisa):
            break
        papan[sisa[idx]] = {"tipe": "soal"}
        idx += 1
    for _ in range(jumlah_bonus):
        if idx >= len(sisa):
            break
        papan[sisa[idx]] = {"tipe": "bonus"}
        idx += 1
    for _ in range(jumlah_misteri):
        if idx >= len(sisa):
            break
        papan[sisa[idx]] = {"tipe": "misteri"}
        idx += 1
    # sisanya otomatis tetap "normal"

    # kunci diubah ke string supaya rapi saat dikirim sebagai JSON
    return {str(k): v for k, v in papan.items()}


def lempar_dadu(sisi=6):
    """
    Melempar dadu bersisi `sisi` (default 6).

    KONSEP: modul random, materi PELUANG — tiap sisi dadu
    punya peluang muncul yang sama besar, yaitu 1/sisi.

    LATIHAN: coba ubah `sisi` jadi 8 atau 10 untuk dadu custom,
    atau buat dadu yang peluangnya tidak sama rata (dadu curang)
    dengan random.choices() dan bobot (weights).
    """
    return random.randint(1, sisi)





def gerak_pion(posisi_sekarang, langkah):
    """
    Menghitung posisi baru pion setelah bergerak sejumlah `langkah`.
    Tidak boleh melebihi petak 100.

    KONSEP: operasi aritmatika + percabangan (pembatasan nilai).
    """
    if posisi_sekarang + langkah > 100:
        return 100
    if posisi_sekarang + langkah < 100:
        return posisi_sekarang + langkah
    if posisi_sekarang + langkah == 100:
        return 100
    if posisi_sekarang - langkah < 1:
        return 1



def baca_petak(papan, posisi):
    """
    Mengambil informasi petak pada posisi tertentu.

    KONSEP: pencarian data pada dictionary.
    """
    return papan.get(str(posisi), {"tipe": "normal"})





def cek_menang(posisi):
    """Tim menang jika sudah mencapai petak 100. KONSEP: percabangan sederhana."""
    return posisi >= 100





def cek_jawaban(bank_soal, id_soal, pilihan_index):
    """
    Mengecek apakah jawaban yang dipilih pemain benar.

    KONSEP: pencarian data pada list of dictionary, percabangan.
    """
    for soal in bank_soal:
        if soal["id"] == id_soal:
            return {
                "ditemukan": True,
                "benar": pilihan_index == soal["jawaban"],
                "jawaban_benar": soal["jawaban"],
            }
    return {"ditemukan": False, "benar": False, "jawaban_benar": None}


def hitung_hadiah(tipe_petak, benar):
    """
    Menentukan berapa langkah yang didapat/dikurangi berdasarkan
    jenis petak dan apakah jawabannya benar.

    KONSEP: percabangan if/elif/else.

    LATIHAN: ubah nilai hadiah/penalti di sini untuk mengatur
    tingkat kesulitan permainan.
    """
    if tipe_petak == "soal":
        return 2 if benar else -2
    if tipe_petak == "bonus":
        return 5 if benar else 0
    return 0


def pilih_misteri():
    """
    Sistem yang memilih hadiah petak misteri secara acak — BUKAN pemain
    yang memilih. Peluang 50/50 antara menyerang lawan atau memasang shield.

    KONSEP: modul random, materi PELUANG (mirip lempar_dadu()).
    """
    return random.choice(["serang", "shield"])


def terapkan_misteri(pilihan, posisi_lawan, shield_lawan):
    """
    Menerapkan efek petak misteri: menyerang lawan atau memasang shield.

    KONSEP: percabangan logika bertingkat (nested if).
    """
    if pilihan == "serang":
        if shield_lawan:
            return {"posisi_lawan": posisi_lawan, "shield_terpakai": True,
                    "pesan": "Serangan diblokir Shield!"}
        posisi_baru = max(1, posisi_lawan - 3)
        return {"posisi_lawan": posisi_baru, "shield_terpakai": False,
                "pesan": "Lawan dimundurkan 3 langkah!"}
    if pilihan == "shield":
        return {"posisi_lawan": posisi_lawan, "shield_terpakai": False,
                "pesan": "Shield aktif untuk melindungi giliran berikutnya!"}
    return {"posisi_lawan": posisi_lawan, "shield_terpakai": False, "pesan": ""}
