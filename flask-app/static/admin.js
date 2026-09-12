/* ============================================================
   ULAR TANGGA SMPN 2 KAMAL — admin.js
   Semua data (soal, bonus, akun) disimpan server-side lewat
   Flask + file JSON (lihat app.py & data_store.py). File ini
   hanya urusan tampilan & memanggil API.
   ============================================================ */

let currentTab = 'soal';
let editingId = null;

/* ---------------- Helper API ---------------- */
async function apiGet(path) {
  const res = await fetch(path);
  return res.json();
}
async function apiSend(path, method, body) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, data: await res.json() };
}

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
async function checkSession() {
  try {
    const s = await apiGet('/api/cek-sesi');
    if (s.login) showShell(); else showLogin();
  } catch (e) {
    showToast('Gagal terhubung ke server Python. Pastikan "python app.py" berjalan.', 'merah');
  }
}

document.getElementById('btn-login').addEventListener('click', async () => {
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  const { status } = await apiSend('/api/login', 'POST', { username: u, password: p });
  if (status === 200) {
    err.style.display = 'none';
    showShell();
  } else {
    err.style.display = 'block';
  }
});
document.getElementById('login-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-login').click();
});
document.getElementById('btn-logout').addEventListener('click', async () => {
  await apiSend('/api/logout', 'POST');
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
async function renderList() {
  const body = document.getElementById('list-body');
  body.innerHTML = '<div class="empty-state">Memuat...</div>';
  const bank = await apiGet('/api/' + currentTab);
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

document.getElementById('btn-simpan-soal').addEventListener('click', async () => {
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
  const body = { pertanyaan, opsi, jawaban };

  if (editingId) {
    await apiSend('/api/' + currentTab + '/' + editingId, 'PUT', body);
  } else {
    await apiSend('/api/' + currentTab, 'POST', body);
  }
  showToast(editingId ? 'Pertanyaan diperbarui' : 'Pertanyaan ditambahkan', 'mint');
  document.getElementById('view-form').classList.add('hidden');
  document.getElementById('view-list').classList.remove('hidden');
  renderList();
});

async function deleteItem(id) {
  if (!confirm('Hapus pertanyaan ini?')) return;
  await apiSend('/api/' + currentTab + '/' + id, 'DELETE');
  showToast('Pertanyaan dihapus', 'merah');
  renderList();
}

/* ---------------- Akun Admin ---------------- */
document.getElementById('btn-ubah-password').addEventListener('click', async () => {
  const lama = document.getElementById('ak-lama').value;
  const baru = document.getElementById('ak-baru').value.trim();
  const err = document.getElementById('akun-error');
  const ok = document.getElementById('akun-sukses');
  err.style.display = 'none'; ok.style.display = 'none';
  if (!baru) return;
  const { status } = await apiSend('/api/akun', 'PUT', { password_lama: lama, password_baru: baru });
  if (status !== 200) { err.style.display = 'block'; return; }
  document.getElementById('ak-lama').value = '';
  document.getElementById('ak-baru').value = '';
  ok.style.display = 'block';
  showToast('Password admin diperbarui', 'mint');
});

/* ---------------- Init ---------------- */
window.addEventListener('DOMContentLoaded', checkSession);
