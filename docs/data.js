/* ============================================================
   ULAR TANGGA SMPN 2 KAMAL — data.js  (versi GitHub Pages / statis)

   Ini port JavaScript dari game_logic.py di folder /flask-app.
   Fungsi & nama variabelnya sengaja dibuat semirip mungkin supaya
   kalau kalian sudah paham versi Python-nya, versi JS ini gampang
   dibaca juga — cuma sintaksnya yang beda.

   Versi ini TIDAK butuh server: semua "keputusan" yang di versi
   Flask dilakukan Python (dadu, gerak, cek jawaban, misteri, papan)
   sekarang dihitung langsung di browser. Ini yang bikin project
   bisa jalan di GitHub Pages (hosting statis, tidak bisa jalankan
   Python).
   ============================================================ */

const UT_KEYS = {
  SOAL: 'ut_soal_v1',
  BONUS: 'ut_bonus_v1',
  ADMIN: 'ut_admin_v1'
};

/* ---------- Posisi tangga & ular (sama persis dengan game_logic.py) ---------- */
const TANGGA = { 3: 22, 11: 30, 28: 52, 40: 59, 63: 81, 71: 91 };
const ULAR = { 98: 90, 85: 76, 62: 48, 87: 74, 34: 14 };

/* ---------- Bank soal & bonus (disalin dari data/soal.json & data/bonus.json) ---------- */
const DEFAULT_SOAL = [
  { id: 's1', pertanyaan: 'Urutan langkah-langkah yang sistematis untuk menyelesaikan suatu masalah disebut ...', opsi: ['Variabel', 'Algoritma', 'Program', 'Data'], jawaban: 1 },
  { id: 's2', pertanyaan: 'Dalam Python, perintah if digunakan untuk ...', opsi: ['Mengulang perintah', 'Menyimpan data', 'Membuat percabangan berdasarkan kondisi', 'Menghapus data'], jawaban: 2 },
  { id: 's3', pertanyaan: 'Apa arti dari operator == dalam Python ...', opsi: ['Memberikan nilai', 'Tidak sama dengan', 'Sama dengan', 'Lebih besar dari'], jawaban: 2 },
  { id: 's4', pertanyaan: 'Perintah for biasanya digunakan untuk ...', opsi: ['Melakukan perulangan', 'Membuat variabel', 'Menghentikan program', 'Membandingkan dua langkah'], jawaban: 0 },
  { id: 's5', pertanyaan: 'Fungsi input() dalam Python digunakan untuk ...', opsi: ['Menampilkan hasil', 'Menerima masukan dari pengguna', 'Mengulang program', 'Membuat kondisi'], jawaban: 1 },
  { id: 's6', pertanyaan: 'Kemampuan memecah masalah besar menjadi beberapa bagian kecil disebut ...', opsi: ['Dekomposisi', 'Enkripsi', 'Kompilasi', 'Algoritma'], jawaban: 0 },
  { id: 's7', pertanyaan: 'Contoh algoritma dalam kehidupan sehari-hari adalah ...', opsi: ['Menonton video tanpa urutan', 'Mengikuti langkah-langkah membuat mi instan', 'Membuka hp secara acak', 'Menggambar tanpa rencana'], jawaban: 1 },
  { id: 's8', pertanyaan: 'Tujuan utama membuat algoritma adalah ...', opsi: ['Membuat masalah semakin rumit', 'Menyelesaikan masalah secara terstruktur', 'Menghapus semua data', 'Memperbanyak kode'], jawaban: 1 },
  { id: 's9', pertanyaan: 'Apa yang terjadi jika kondisi pada if bernilai False dan terdapat else ...', opsi: ['Program berhenti', 'Perintah pada if tetap dijalankan', 'Perintah pada else dijalankan', 'Program mengulang dari awal'], jawaban: 2 },
  { id: 's10', pertanyaan: 'Manakah yang bukan bagian utama dari berpikir komputasional ...', opsi: ['Dekomposisi', 'Pengenalan pola', 'Abstraksi', 'Menebak secara acak'], jawaban: 3 },
  { id: 's11', pertanyaan: 'Jika kamu ingin mencari rute tercepat menuju sekolah, informasi yang penting adalah ...', opsi: ['Warna rumah di sepanjang jalan', 'Jarak dan kondisi jalan', 'Nama semua orang yang lewat', 'Bentuk awan di langit'], jawaban: 1 },
  { id: 's12', pertanyaan: 'Mengelompokkan benda menjadi makanan, minuman, dan alat tulis berdasarkan jenisnya merupakan contoh ...', opsi: ['Klasifikasi', 'Debugging', 'Perulangan', 'Abstraksi'], jawaban: 0 }
];

const DEFAULT_BONUS = [
  { id: 'b1', pertanyaan: 'Jika kamu memiliki 3 tugas, lalu setiap tugas dibagi menjadi 2 bagian, berapa bagian yang harus diselesaikan ...', opsi: ['5', '6', '7', '8'], jawaban: 1 },
  { id: 'b2', pertanyaan: 'Jika posisi = 96 dan pemain mendapat langkah = 4, maka ...', opsi: ['Menang karena tepat di 100', 'Menang karena melewati 100', 'Tetap di posisi 96', 'Kembali ke posisi 1'], jawaban: 0 },
  { id: 'b3', pertanyaan: 'Jika sebuah program harus memilih Lulus atau Tidak Lulus berdasarkan nilai siswa, konsep yang paling tepat adalah ...', opsi: ['Perulangan', 'Percabangan', 'Variabel', 'Input'], jawaban: 1 },
  { id: 'b4', pertanyaan: 'Manakah langkah yang paling tidak diperlukan saat membuat algoritma menghitung luas persegi ...', opsi: ['Memasukkan panjang sisi', 'Mengalikan sisi x sisi', 'Menampilkan hasil', 'Mengubah warna layar'], jawaban: 3 },
  { id: 'b5', pertanyaan: 'Seorang pemain mendapatkan soal. Jika jawabannya benar, posisinya maju 2 petak, jika salah tetap di tempat. Struktur algoritma yang digunakan adalah ...', opsi: ['Percabangan', 'Perulangan', 'Dekomposisi', 'Abstraksi'], jawaban: 0 },
  { id: 'b6', pertanyaan: 'Dalam KKA, informasi yang tidak diperlukan dalam penyelesaian masalah sebaiknya ...', opsi: ['Ditambahkan', 'Diperbanyak', 'Diabaikan', 'Diulang'], jawaban: 2 }
];

/* ---------- Storage helpers (dipakai game.js & admin.js) ---------- */
function utLoad(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch (e) { return fallback; }
}
function utSave(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}
function getSoalBank() { return utLoad(UT_KEYS.SOAL, DEFAULT_SOAL); }
function getBonusBank() { return utLoad(UT_KEYS.BONUS, DEFAULT_BONUS); }
function saveSoalBank(arr) { return utSave(UT_KEYS.SOAL, arr); }
function saveBonusBank(arr) { return utSave(UT_KEYS.BONUS, arr); }
function getAdminAccount() { return utLoad(UT_KEYS.ADMIN, { username: 'admin', password: 'admin123' }); }
function saveAdminAccount(acc) { return utSave(UT_KEYS.ADMIN, acc); }

/* ============================================================
   FUNGSI LOGIKA PERMAINAN — port 1:1 dari game_logic.py
   ============================================================ */

/* mulberry32: PRNG sederhana & deterministik (padanan random.seed()
   di Python), supaya papan sama setiap kali web dibuka. */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Padanan buat_papan() di game_logic.py */
function buatPapan() {
  const papan = {};
  for (let n = 1; n <= 100; n++) papan[n] = { tipe: 'normal' };
  papan[1] = { tipe: 'start' };
  papan[100] = { tipe: 'finish' };

  Object.entries(TANGGA).forEach(([pos, tujuan]) => { papan[pos] = { tipe: 'tangga', tujuan: Number(tujuan) }; });
  Object.entries(ULAR).forEach(([pos, tujuan]) => { papan[pos] = { tipe: 'ular', tujuan: Number(tujuan) }; });

  const sisa = [];
  for (let n = 2; n <= 99; n++) if (papan[n].tipe === 'normal') sisa.push(n);

  const rand = mulberry32(42);
  for (let i = sisa.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [sisa[i], sisa[j]] = [sisa[j], sisa[i]];
  }

  const jumlahSoal = Math.round(100 * 0.40);
  const jumlahBonus = Math.round(100 * 0.10);
  const jumlahMisteri = Math.round(100 * 0.10);
  let idx = 0;
  for (let i = 0; i < jumlahSoal && idx < sisa.length; i++, idx++) papan[sisa[idx]] = { tipe: 'soal' };
  for (let i = 0; i < jumlahBonus && idx < sisa.length; i++, idx++) papan[sisa[idx]] = { tipe: 'bonus' };
  for (let i = 0; i < jumlahMisteri && idx < sisa.length; i++, idx++) papan[sisa[idx]] = { tipe: 'misteri' };

  const hasil = {};
  for (let n = 1; n <= 100; n++) hasil[String(n)] = papan[n];
  return hasil;
}

/* Padanan lempar_dadu() — KONSEP: Peluang, tiap sisi 1/sisi */
function lemparDadu(sisi = 6) {
  return 1 + Math.floor(Math.random() * sisi);
}

/* Padanan gerak_pion() */
function gerakPion(posisiSekarang, langkah) {
  let posisiBaru = posisiSekarang + langkah;
  if (posisiBaru > 100) posisiBaru = 100;
  if (posisiBaru < 1) posisiBaru = 1;
  return posisiBaru;
}

/* Padanan baca_petak() */
function bacaPetak(papan, posisi) {
  return papan[String(posisi)] || { tipe: 'normal' };
}

/* Padanan cek_menang() */
function cekMenang(posisi) { return posisi >= 100; }

/* Padanan cek_jawaban() */
function cekJawaban(bankSoal, idSoal, pilihanIndex) {
  for (const soal of bankSoal) {
    if (soal.id === idSoal) {
      return { ditemukan: true, benar: pilihanIndex === soal.jawaban, jawaban_benar: soal.jawaban };
    }
  }
  return { ditemukan: false, benar: false, jawaban_benar: null };
}

/* Padanan hitung_hadiah() */
function hitungHadiah(tipePetak, benar) {
  if (tipePetak === 'soal') return benar ? 2 : -2;
  if (tipePetak === 'bonus') return benar ? 5 : 0;
  return 0;
}

/* Padanan pilih_misteri() — KONSEP: Peluang, 50/50 */
function pilihMisteri() {
  return Math.random() < 0.5 ? 'serang' : 'shield';
}

/* Padanan terapkan_misteri() */
function terapkanMisteri(pilihan, posisiLawan, shieldLawan) {
  if (pilihan === 'serang') {
    if (shieldLawan) return { posisi_lawan: posisiLawan, shield_terpakai: true, pesan: 'Serangan diblokir Shield!' };
    const posisiBaru = Math.max(1, posisiLawan - 3);
    return { posisi_lawan: posisiBaru, shield_terpakai: false, pesan: 'Lawan dimundurkan 3 langkah!' };
  }
  if (pilihan === 'shield') {
    return { posisi_lawan: posisiLawan, shield_terpakai: false, pesan: 'Shield aktif untuk melindungi giliran berikutnya!' };
  }
  return { posisi_lawan: posisiLawan, shield_terpakai: false, pesan: '' };
}
