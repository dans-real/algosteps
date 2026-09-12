/* ============================================================
   ULAR TANGGA SMPN 2 KAMAL — admin.js  (versi GitHub Pages / statis)
   Data (soal, bonus, akun) disimpan di localStorage browser lewat
   helper di data.js — tidak ada server, jadi cocok untuk satu
   perangkat (misalnya laptop guru yang dipakai di kelas).
   ============================================================ */

const SESSION_KEY = 'ut_admin_session';
let currentTab = 'soal';
let editingId = null;

/* ---------------- Toast ---------------- */
let toastTimer = null;
function showToast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); }, 1900);
}

/* ---------------- Login ---------------- */
function showLogin() {
  document.getElementById('admin-login-view').classList.remove('hidden');
  document.getElementById('admin-shell-view').classList.add('hidden');
}
function showShell() {
  document.getElementById('admin-login-view').classList.add('hidden');
  document.getElementById('admin-shell-view').classList.remove('hidden');
  switchTab('soal');
}
function checkSession() {
  if (sessionStorage.getItem(SESSION_KEY) === '1') showShell();
  else showLogin();
}

document.getElementById('btn-login').addEventListener('click', () => {
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  const acc = getAdminAccount();
  const err = document.getElementById('login-error');
  if (u === acc.username && p === acc.password) {
    sessionStorage.setItem(SESSION_KEY, '1');
    err.style.display = 'none';
    showShell();
  } else {
    err.style.display = 'block';
  }
});
document.getElementById('login-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-login').click();
});
document.getElementById('btn-logout').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

/* ---------------- Tabs ---------------- */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
});
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tab));
  document.getElementById('view-form').classList.add('hidden');
  if (tab === 'akun') {
    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-akun').classList.remove('hidden');
  } else {
    document.getElementById('view-akun').classList.add('hidden');
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('list-title').textContent = tab === 'soal' ? 'Bank Petak Soal (±2 langkah)' : 'Bank Petak Bonus (+5 langkah)';
    renderList();
  }
}

/* ---------------- List ---------------- */
function currentBank() { return currentTab === 'soal' ? getSoalBank() : getBonusBank(); }
function saveBank(arr) { return currentTab === 'soal' ? saveSoalBank(arr) : saveBonusBank(arr); }

function renderList() {
  const bank = currentBank();
  const body = document.getElementById('list-body');
  body.innerHTML = '';
  if (bank.length === 0) {
    body.innerHTML = '<div class="empty-state">Belum ada pertanyaan. Klik "+ TAMBAH" untuk menambahkan.</div>';
    return;
  }
  bank.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'q-row';
    const letters = ['A', 'B', 'C', 'D'];
    row.innerHTML =
      '<div class="q-num">' + (idx + 1) + '</div>' +
      '<div class="q-body"><div class="q-p">' + escapeHtml(item.pertanyaan) + '</div>' +
      '<div class="q-a">Jawaban benar: ' + letters[item.jawaban] + '. ' + escapeHtml(item.opsi[item.jawaban]) + '</div></div>' +
      '<div class="q-actions">' +
      '<button class="icon-btn" data-act="edit" title="Edit">✎</button>' +
      '<button class="icon-btn" data-act="hapus" title="Hapus">🗑</button></div>';
    row.querySelector('[data-act="edit"]').addEventListener('click', () => openForm(item));
    row.querySelector('[data-act="hapus"]').addEventListener('click', () => deleteItem(item.id));
    body.appendChild(row);
  });
}
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ---------------- Form Tambah/Edit ---------------- */
document.getElementById('btn-tambah').addEventListener('click', () => openForm(null));
document.getElementById('btn-batal').addEventListener('click', () => {
  document.getElementById('view-form').classList.add('hidden');
  document.getElementById('view-list').classList.remove('hidden');
});

function openForm(item) {
  editingId = item ? item.id : null;
  document.getElementById('form-title').textContent = item ? 'Edit Pertanyaan' : 'Tambah Pertanyaan';
  document.getElementById('f-pertanyaan').value = item ? item.pertanyaan : '';
  for (let i = 0; i < 4; i++) {
    document.getElementById('f-opsi-' + i).value = item ? item.opsi[i] : '';
    document.getElementById('r' + i).checked = item ? item.jawaban === i : false;
  }
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('view-list').classList.add('hidden');
  document.getElementById('view-form').classList.remove('hidden');
}

document.getElementById('btn-simpan-soal').addEventListener('click', () => {
  const pertanyaan = document.getElementById('f-pertanyaan').value.trim();
  const opsi = [0, 1, 2, 3].map(i => document.getElementById('f-opsi-' + i).value.trim());
  const radio = document.querySelector('input[name="f-jawaban"]:checked');
  const err = document.getElementById('form-error');

  if (!pertanyaan || opsi.some(o => !o) || !radio) {
    err.style.display = 'block';
    return;
  }
  err.style.display = 'none';
  const jawaban = parseInt(radio.value, 10);
  const bank = currentBank();

  if (editingId) {
    const idx = bank.findIndex(x => x.id === editingId);
    if (idx > -1) bank[idx] = { id: editingId, pertanyaan, opsi, jawaban };
  } else {
    bank.push({ id: 'q_' + Date.now(), pertanyaan, opsi, jawaban });
  }
  saveBank(bank);
  showToast(editingId ? 'Pertanyaan diperbarui' : 'Pertanyaan ditambahkan', 'mint');
  document.getElementById('view-form').classList.add('hidden');
  document.getElementById('view-list').classList.remove('hidden');
  renderList();
});

function deleteItem(id) {
  if (!confirm('Hapus pertanyaan ini?')) return;
  const bank = currentBank().filter(x => x.id !== id);
  saveBank(bank);
  showToast('Pertanyaan dihapus', 'merah');
  renderList();
}

/* ---------------- Akun Admin ---------------- */
document.getElementById('btn-ubah-password').addEventListener('click', () => {
  const lama = document.getElementById('ak-lama').value;
  const baru = document.getElementById('ak-baru').value.trim();
  const acc = getAdminAccount();
  const err = document.getElementById('akun-error');
  const ok = document.getElementById('akun-sukses');
  err.style.display = 'none'; ok.style.display = 'none';
  if (lama !== acc.password) { err.style.display = 'block'; return; }
  if (!baru) return;
  saveAdminAccount({ username: acc.username, password: baru });
  document.getElementById('ak-lama').value = '';
  document.getElementById('ak-baru').value = '';
  ok.style.display = 'block';
  showToast('Password admin diperbarui', 'mint');
});

/* ---------------- Init ---------------- */
window.addEventListener('DOMContentLoaded', checkSession);
