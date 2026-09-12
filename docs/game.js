/* ============================================================
   ULAR TANGGA SMPN 2 KAMAL — game.js  (versi GitHub Pages / statis)
   Sama persis tampilan & interaksinya dengan versi Flask di
   /flask-app, cuma sumber "keputusan" game (dadu, gerak, cek
   jawaban, misteri, papan) sekarang dihitung langsung di sini
   lewat fungsi-fungsi di data.js — tidak ada fetch() ke server.
   ============================================================ */

const state = {
  board: null,
  pos: { merah: 1, biru: 1 },
  turn: 'merah',
  shield: { merah: false, biru: false },
  stats: {
    merah: { benar: 0, salah: 0, bonus: 0, ability: 0 },
    biru: { benar: 0, salah: 0, bonus: 0, ability: 0 }
  },
  settings: getSettings(),
  gameOver: false
};

/* ---------------- Pengaturan (localStorage, preferensi tampilan) ---------------- */
function getSettings() {
  try {
    const raw = localStorage.getItem('ut_settings_v1');
    return raw ? JSON.parse(raw) : { namaMerah: 'Tim Merah', namaBiru: 'Tim Biru', suara: true };
  } catch (e) { return { namaMerah: 'Tim Merah', namaBiru: 'Tim Biru', suara: true }; }
}
function saveSettings(s) { localStorage.setItem('ut_settings_v1', JSON.stringify(s)); }

/* ---------------- Audio: efek klik & backsound ----------------
   Browser modern memblokir audio otomatis sebelum ada interaksi klik
   dari pengguna, jadi syncBgm() sengaja baru dipanggil di dalam
   startNewGame() (setelah tombol MULAI ditekan) dan di toggle Pengaturan. */
function playClick() {
  if (!state.settings.suara) return;
  const el = document.getElementById('sfx-klik');
  if (!el) return;
  el.currentTime = 0;
  el.volume = 0.8;
  el.play().catch(() => {});
}
function syncBgm() {
  const bgm = document.getElementById('bgm-crazyfrog');
  if (!bgm) return;
  bgm.volume = 0.35;
  if (state.settings.suara) bgm.play().catch(() => {});
  else bgm.pause();
}

/* ---------------- Navigasi layar ---------------- */
function navTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-menang') spawnConfetti();
}
document.querySelectorAll('[data-nav]').forEach(btn => {
  btn.addEventListener('click', () => navTo(btn.getAttribute('data-nav')));
});

/* ---------------- Toast ---------------- */
let toastTimer = null;
function showToast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); }, 1900);
}

/* ---------------- Konversi nomor petak -> posisi grid (murni tampilan) ---------------- */
function tileToGrid(num) {
  const gameRow = Math.ceil(num / 10);
  const row = 10 - gameRow;
  const posInRow = num - (gameRow - 1) * 10;
  const col = gameRow % 2 === 1 ? posInRow - 1 : 10 - posInRow;
  return { row, col };
}

/* ---------------- Papan ---------------- */
function renderBoard() {
  const grid = document.getElementById('board-grid');
  grid.innerHTML = '';
  for (let n = 1; n <= 100; n++) {
    const { row, col } = tileToGrid(n);
    const info = state.board[String(n)] || { tipe: 'normal' };
    const div = document.createElement('div');
    div.className = 'tile' + (info.tipe !== 'normal' ? ' t-' + info.tipe : '');
    div.style.gridRowStart = row + 1;
    div.id = 'tile-' + n;
    div.style.gridColumnStart = col + 1;
    div.innerHTML = '<span>' + n + '</span>' +
      (info.tipe !== 'normal' ? '<span class="ico"></span>' : '') +
      '<div class="pawns-on-tile" id="pawns-' + n + '"></div>';
    grid.appendChild(div);
  }
}
const SNAKE_IMAGES = ['ular7.png', 'ular6.png', 'ular2.png'];
const LADDER_IMAGE = 'ini_tangga,_cuman_1doank.png';

function renderConnectors() {
  const grid = document.getElementById('board-grid');
  let overlay = document.getElementById('board-connectors');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'board-connectors';
    grid.appendChild(overlay);
  }
  overlay.innerHTML = '';
  const gridRect = grid.getBoundingClientRect();

  function placeConnector(tileA, tileB, imgSrc) {
    const elA = document.getElementById('tile-' + tileA);
    const elB = document.getElementById('tile-' + tileB);
    if (!elA || !elB) return;
    const a = elA.getBoundingClientRect();
    const b = elB.getBoundingClientRect();
    const ax = a.left + a.width / 2 - gridRect.left;
    const ay = a.top + a.height / 2 - gridRect.top;
    const bx = b.left + b.width / 2 - gridRect.left;
    const by = b.top + b.height / 2 - gridRect.top;
    const dx = bx - ax, dy = by - ay;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI + 270;
    const thickness = Math.max(12, a.width * 0.34);
    const midX = (ax + bx) / 2, midY = (ay + by) / 2;

    const img = document.createElement('img');
    img.src = 'assets/' + imgSrc;
    img.className = 'connector-img';
    img.style.width = thickness + 'px';
    img.style.height = length + 'px';
    img.style.left = midX + 'px';
    img.style.top = midY + 'px';
    img.style.transform = 'translate(-50%,-50%) rotate(' + angle + 'deg)';
    img.onerror = function () { this.remove(); };
    overlay.appendChild(img);
  }

  let snakeIdx = 0;
  for (let n = 1; n <= 100; n++) {
    const info = state.board[String(n)];
    if (!info) continue;
    if (info.tipe === 'tangga') placeConnector(n, info.tujuan, LADDER_IMAGE);
    if (info.tipe === 'ular') {
      placeConnector(n, info.tujuan, SNAKE_IMAGES[snakeIdx % SNAKE_IMAGES.length]);
      snakeIdx++;
    }
  }
}

let connectorResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(connectorResizeTimer);
  connectorResizeTimer = setTimeout(() => {
    if (document.getElementById('screen-board').classList.contains('active')) renderConnectors();
  }, 150);
});

let pawnMerahEl, pawnBiruEl;
function initPawns() {
  pawnMerahEl = document.createElement('div');
  pawnMerahEl.className = 'pawn merah';
  pawnBiruEl = document.createElement('div');
  pawnBiruEl.className = 'pawn biru';
}
function updatePawns() {
  const holderMerah = document.getElementById('pawns-' + state.pos.merah);
  const holderBiru = document.getElementById('pawns-' + state.pos.biru);
  if (holderMerah) holderMerah.appendChild(pawnMerahEl);
  if (holderBiru) holderBiru.appendChild(pawnBiruEl);
}

/* ---------------- Sidebar ---------------- */
function updateSidebarUI() {
  document.getElementById('nama-merah-lbl').textContent = state.settings.namaMerah;
  document.getElementById('nama-biru-lbl').textContent = state.settings.namaBiru;
  document.getElementById('pos-merah').textContent = state.pos.merah;
  document.getElementById('pos-biru').textContent = state.pos.biru;
  const teamName = state.turn === 'merah' ? state.settings.namaMerah : state.settings.namaBiru;
  document.getElementById('turn-team-name').textContent = teamName;
  document.getElementById('card-merah').classList.toggle('turn', state.turn === 'merah');
  document.getElementById('card-biru').classList.toggle('turn', state.turn === 'biru');
}

/* ---------------- Dadu 3D ---------------- */
const DICE_TARGET = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: 90, y: 0 },
  4: { x: -90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 }
};
let diceAccX = 0, diceAccY = 0;
function spinDiceTo(n) {
  const t = DICE_TARGET[n];
  const dice3d = document.getElementById('dice3d');
  const baseX = diceAccX - (diceAccX % 360);
  const baseY = diceAccY - (diceAccY % 360);
  diceAccX = baseX + 720 + t.x;
  diceAccY = baseY + 1080 + t.y;
  dice3d.style.transform = 'rotateX(' + diceAccX + 'deg) rotateY(' + diceAccY + 'deg)';
}

let rolling = false;
function rollDice() {
  if (rolling || state.gameOver) return;
  rolling = true;
  document.getElementById('btn-lempar').setAttribute('disabled', 'true');
  // dadu benar-benar dilempar oleh lemparDadu() di data.js (Math.random, materi Peluang)
  const hasil = { hasil: lemparDadu() };
  spinDiceTo(hasil.hasil);
  setTimeout(() => movePawn(state.turn, hasil.hasil), 1100);
}
document.getElementById('btn-lempar').addEventListener('click', rollDice);

/* ---------------- Pergerakan & resolusi petak ---------------- */
async function movePawn(team, steps) {
  const posisiBaru = gerakPion(state.pos[team], steps);
  const petak = bacaPetak(state.board, posisiBaru);
  const hasil = { posisi_baru: posisiBaru, petak: petak, menang: cekMenang(posisiBaru) };
  await walkStepByStep(team, hasil.posisi_baru);
  updateSidebarUI();
  setTimeout(() => resolveTile(team, hasil.petak), 300);
}

/* Pion berjalan 1 petak per langkah dengan jeda + bunyi klik kayu. */
function walkStepByStep(team, tujuan) {
  return new Promise(resolve => {
    function langkahBerikutnya() {
      if (state.pos[team] >= tujuan) { resolve(); return; }
      state.pos[team]++;
      updatePawns();
      playClick();
      setTimeout(langkahBerikutnya, 260);
    }
    langkahBerikutnya();
  });
}

function checkWinOrContinue(team) {
  if (state.pos[team] >= 100) {
    state.pos[team] = 100;
    updatePawns();
    updateSidebarUI();
    endGame(team);
  } else {
    endTurn();
  }
}

function resolveTile(team, petak) {
  switch (petak.tipe) {
    case 'tangga':
      showToast('Naik tangga! Menuju petak ' + petak.tujuan, 'mint');
      state.pos[team] = petak.tujuan;
      updatePawns(); updateSidebarUI();
      setTimeout(() => checkWinOrContinue(team), 500);
      break;
    case 'ular':
      showToast('Kena ular! Turun ke petak ' + petak.tujuan, 'merah');
      state.pos[team] = petak.tujuan;
      updatePawns(); updateSidebarUI();
      setTimeout(endTurn, 500);
      break;
    case 'soal':
      openSoalModal(team);
      break;
    case 'bonus':
      openBonusModal(team);
      break;
    case 'misteri':
      openMisteriModal(team);
      break;
    default:
      checkWinOrContinue(team);
  }
}

function endTurn() {
  if (state.gameOver) return;
  state.turn = state.turn === 'merah' ? 'biru' : 'merah';
  updateSidebarUI();
  document.getElementById('btn-lempar').removeAttribute('disabled');
  rolling = false;
}

/* ---------------- Modal: Petak Soal ---------------- */
function openSoalModal(team) {
  const bank = getSoalBank();
  const q = bank[Math.floor(Math.random() * bank.length)];
  document.getElementById('soal-pertanyaan').textContent = q.pertanyaan;
  const optWrap = document.getElementById('soal-opsi');
  const hasil = document.getElementById('soal-hasil');
  hasil.classList.remove('show');
  optWrap.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.opsi.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'opt-btn';
    b.innerHTML = '<span class="letter">' + letters[i] + '</span><span>' + opt + '</span>';
    b.onclick = () => answerSoal(team, q, i, optWrap);
    optWrap.appendChild(b);
  });
  document.getElementById('modal-soal').classList.add('show');
}
function answerSoal(team, q, chosenIdx, optWrap) {
  const cek = cekJawaban(getSoalBank(), q.id, chosenIdx);
  const hasilJawab = { benar: cek.benar, langkah: hitungHadiah('soal', cek.benar), jawaban_benar: cek.jawaban_benar };

  const buttons = optWrap.querySelectorAll('.opt-btn');
  buttons.forEach((b, i) => {
    b.setAttribute('disabled', 'true');
    if (i === hasilJawab.jawaban_benar) b.classList.add('correct');
    else if (i === chosenIdx) b.classList.add('wrong');
  });

  const hasil = document.getElementById('soal-hasil');
  const title = document.getElementById('soal-hasil-title');
  const desc = document.getElementById('soal-hasil-desc');
  hasil.classList.remove('ok', 'bad');
  if (hasilJawab.benar) {
    state.stats[team].benar++;
    hasil.classList.add('ok');
    title.textContent = 'Jawaban Benar!';
    desc.textContent = 'Kamu mendapatkan +' + hasilJawab.langkah + ' langkah';
  } else {
    state.stats[team].salah++;
    hasil.classList.add('bad');
    title.textContent = 'Jawaban Salah!';
    desc.textContent = 'Kamu kehilangan ' + Math.abs(hasilJawab.langkah) + ' langkah';
  }
  state.pos[team] = Math.max(1, Math.min(100, state.pos[team] + hasilJawab.langkah));
  hasil.classList.add('show');
  document.getElementById('soal-lanjut').onclick = () => {
    document.getElementById('modal-soal').classList.remove('show');
    updatePawns(); updateSidebarUI();
    checkWinOrContinue(team);
  };
}

/* ---------------- Modal: Petak Bonus ---------------- */
function openBonusModal(team) {
  const bank = getBonusBank();
  const q = bank[Math.floor(Math.random() * bank.length)];
  document.getElementById('bonus-pertanyaan').textContent = q.pertanyaan;
  const optWrap = document.getElementById('bonus-opsi');
  const hasil = document.getElementById('bonus-hasil');
  hasil.classList.remove('show');
  optWrap.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.opsi.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'opt-btn';
    b.innerHTML = '<span class="letter">' + letters[i] + '</span><span>' + opt + '</span>';
    b.onclick = () => answerBonus(team, q, i, optWrap);
    optWrap.appendChild(b);
  });
  document.getElementById('modal-bonus').classList.add('show');
}
function answerBonus(team, q, chosenIdx, optWrap) {
  const cek = cekJawaban(getBonusBank(), q.id, chosenIdx);
  const hasilJawab = { benar: cek.benar, langkah: hitungHadiah('bonus', cek.benar), jawaban_benar: cek.jawaban_benar };

  const buttons = optWrap.querySelectorAll('.opt-btn');
  buttons.forEach((b, i) => {
    b.setAttribute('disabled', 'true');
    if (i === hasilJawab.jawaban_benar) b.classList.add('correct');
    else if (i === chosenIdx) b.classList.add('wrong');
  });

  const hasil = document.getElementById('bonus-hasil');
  const title = document.getElementById('bonus-hasil-title');
  const desc = document.getElementById('bonus-hasil-desc');
  hasil.classList.remove('ok', 'bad');
  if (hasilJawab.benar) {
    state.stats[team].bonus++;
    hasil.classList.add('ok');
    title.textContent = 'Jawaban Benar!';
    desc.textContent = 'Kamu mendapatkan +' + hasilJawab.langkah + ' langkah';
  } else {
    hasil.classList.add('bad');
    title.textContent = 'Belum Tepat';
    desc.textContent = 'Tidak ada langkah tambahan kali ini';
  }
  state.pos[team] = Math.max(1, Math.min(100, state.pos[team] + hasilJawab.langkah));
  hasil.classList.add('show');
  updatePawns(); updateSidebarUI();
  setTimeout(() => {
    document.getElementById('modal-bonus').classList.remove('show');
    checkWinOrContinue(team);
  }, 1600);
}

/* ---------------- Modal: Petak Misteri (diacak sistem) ---------------- */
function openMisteriModal(team) {
  document.getElementById('modal-misteri').classList.add('show');
  document.getElementById('misteri-status').textContent = 'Sistem sedang mengacak hadiah...';
  document.getElementById('misteri-hasil').classList.remove('show', 'ok', 'bad');
  const cardSerang = document.getElementById('misteri-serang');
  const cardShield = document.getElementById('misteri-shield');
  cardSerang.classList.remove('chosen', 'not-chosen');
  cardShield.classList.remove('chosen', 'not-chosen');
  cardSerang.classList.add('shuffling');
  cardShield.classList.add('shuffling');
  runMisteri(team);
}
function runMisteri(team) {
  const opponent = team === 'merah' ? 'biru' : 'merah';
  const pilihan = pilihMisteri();
  const hasil = terapkanMisteri(pilihan, state.pos[opponent], state.shield[opponent]);
  hasil.pilihan = pilihan;

  setTimeout(() => {
    const cardSerang = document.getElementById('misteri-serang');
    const cardShield = document.getElementById('misteri-shield');
    cardSerang.classList.remove('shuffling');
    cardShield.classList.remove('shuffling');
    const chosen = hasil.pilihan === 'serang' ? cardSerang : cardShield;
    const other = hasil.pilihan === 'serang' ? cardShield : cardSerang;
    chosen.classList.add('chosen');
    other.classList.add('not-chosen');
    document.getElementById('misteri-status').textContent = 'Sistem memilih:';

    state.stats[team].ability++;
    if (hasil.pilihan === 'serang' && hasil.shield_terpakai) state.shield[opponent] = false;
    if (hasil.pilihan === 'shield') state.shield[team] = true;
    state.pos[opponent] = hasil.posisi_lawan;
    updatePawns(); updateSidebarUI();

    const banner = document.getElementById('misteri-hasil');
    const menyerangBerhasil = hasil.pilihan === 'serang' && !hasil.shield_terpakai;
    banner.classList.add(menyerangBerhasil ? 'bad' : 'ok');
    document.getElementById('misteri-hasil-title').textContent =
      hasil.pilihan === 'serang' ? 'Mundurkan Lawan!' : 'Shield Aktif!';
    document.getElementById('misteri-hasil-desc').textContent = hasil.pesan;
    banner.classList.add('show');

    document.getElementById('misteri-lanjut').onclick = () => {
      document.getElementById('modal-misteri').classList.remove('show');
      checkWinOrContinue(team);
    };
  }, 900);
}

/* ---------------- Menang & Rekap ---------------- */
function endGame(winner) {
  state.gameOver = true;
  const winnerName = winner === 'merah' ? state.settings.namaMerah : state.settings.namaBiru;
  document.getElementById('win-title').textContent = winnerName + ' Menang!';
  document.getElementById('win-sub').textContent = winnerName + ' berhasil mencapai angka 100 lebih dulu.';
  setTimeout(() => navTo('screen-menang'), 400);
}
function populateRekap() {
  document.getElementById('th-merah').textContent = state.settings.namaMerah;
  document.getElementById('th-biru').textContent = state.settings.namaBiru;
  const rows = [
    ['Posisi Akhir', state.pos.merah, state.pos.biru],
    ['Soal Benar', state.stats.merah.benar, state.stats.biru.benar],
    ['Soal Salah', state.stats.merah.salah, state.stats.biru.salah],
    ['Bonus Didapat', state.stats.merah.bonus, state.stats.biru.bonus],
    ['Ability Digunakan', state.stats.merah.ability, state.stats.biru.ability]
  ];
  const body = document.getElementById('recap-body');
  body.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td class="label">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td>';
    body.appendChild(tr);
  });
}
document.getElementById('btn-lihat-rekap').addEventListener('click', () => {
  populateRekap();
  navTo('screen-rekap');
});
document.getElementById('btn-kembali-menu').addEventListener('click', () => navTo('screen-menu'));

/* ---------------- Confetti ---------------- */
function spawnConfetti() {
  const colors = ['#FFB84C', '#E5484D', '#3D8BFD', '#34C795', '#9B6CF0'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 3600);
  }
}

/* ---------------- Mulai permainan baru ---------------- */
function startNewGame() {
  state.board = buatPapan();
  state.pos = { merah: 1, biru: 1 };
  state.turn = 'merah';
  state.shield = { merah: false, biru: false };
  state.stats = {
    merah: { benar: 0, salah: 0, bonus: 0, ability: 0 },
    biru: { benar: 0, salah: 0, bonus: 0, ability: 0 }
  };
  state.gameOver = false;
  state.settings = getSettings();
  renderBoard();
  renderConnectors();
  initPawns();
  updatePawns();
  updateSidebarUI();
  document.getElementById('btn-lempar').removeAttribute('disabled');
  diceAccX = 0; diceAccY = 0;
  document.getElementById('dice3d').style.transform = 'rotateX(-18deg) rotateY(28deg)';
  syncBgm();
  navTo('screen-board');
}
document.getElementById('btn-mulai').addEventListener('click', startNewGame);
document.getElementById('btn-board-back').addEventListener('click', () => {
  if (confirm('Keluar dari papan? Progres permainan saat ini akan hilang.')) navTo('screen-menu');
});

/* ---------------- Keluar ---------------- */
document.getElementById('btn-keluar').addEventListener('click', () => {
  if (confirm('Yakin ingin keluar dari permainan?')) {
    showToast('Terima kasih telah bermain!', 'mint');
  }
});

/* ---------------- Pengaturan ---------------- */
function loadSettingsForm() {
  const s = getSettings();
  document.getElementById('set-nama-merah').value = s.namaMerah;
  document.getElementById('set-nama-biru').value = s.namaBiru;
  document.getElementById('set-suara').classList.toggle('on', !!s.suara);
}
document.getElementById('set-suara').addEventListener('click', function () {
  this.classList.toggle('on');
  state.settings.suara = this.classList.contains('on');
  syncBgm();
});
document.getElementById('btn-save-settings').addEventListener('click', () => {
  const s = {
    namaMerah: document.getElementById('set-nama-merah').value.trim() || 'Tim Merah',
    namaBiru: document.getElementById('set-nama-biru').value.trim() || 'Tim Biru',
    suara: document.getElementById('set-suara').classList.contains('on')
  };
  saveSettings(s);
  state.settings = s;
  updateSidebarUI();
  syncBgm();
  showToast('Pengaturan disimpan', 'mint');
  navTo('screen-menu');
});
document.getElementById('btn-reset-game').addEventListener('click', () => {
  if (confirm('Reset seluruh progres permainan saat ini?')) {
    startNewGame();
    showToast('Permainan direset', 'mint');
  }
});

/* ---------------- Init ---------------- */
window.addEventListener('DOMContentLoaded', () => {
  loadSettingsForm();
  navTo('screen-menu');
});
document.querySelectorAll('[data-nav="screen-settings"]').forEach(b => {
  b.addEventListener('click', loadSettingsForm);
});
