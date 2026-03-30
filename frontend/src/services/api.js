// ============================================================
// services/api.js — LenteraPustaka v0.4.0 FINAL
// Sinkron penuh dengan backend/main.py
// Public endpoints (books, categories, genres, book stats) 
// TIDAK pakai token — bisa diakses guest
// ============================================================
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Token + User cache di localStorage ───────────────────────
export const token = {
  get:    () => localStorage.getItem('lp_token'),
  set:    (t) => localStorage.setItem('lp_token', t),
  remove: () => { localStorage.removeItem('lp_token'); localStorage.removeItem('lp_user') },
}

export const userCache = {
  get:    () => { try { return JSON.parse(localStorage.getItem('lp_user') || 'null') } catch { return null } },
  set:    (u) => localStorage.setItem('lp_user', JSON.stringify(u)),
  remove: () => localStorage.removeItem('lp_user'),
}

// ── Custom event saat 401 ─────────────────────────────────────
function onSessionExpired() {
  token.remove()
  sessionStorage.removeItem('lp_page')
  window.dispatchEvent(new CustomEvent('session-expired'))
}

// ── Core request (dengan token, untuk protected endpoints) ────
async function req(url, opts = {}) {
  const t = token.get()
  const headers = { 'Content-Type': 'application/json', ...opts.headers }
  if (t) headers['Authorization'] = `Bearer ${t}`

  let res
  try {
    res = await fetch(`${API_BASE}${url}`, { ...opts, headers })
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan.')
  }

  if (res.status === 401) { onSessionExpired(); throw new Error('Sesi berakhir. Silakan masuk kembali.') }
  if (res.status === 403) throw new Error('Akses ditolak — bukan admin.')
  if (res.status === 422) {
    const err = await res.json().catch(() => ({}))
    const detail = err.detail
    if (Array.isArray(detail)) throw new Error(detail.map(d => d.msg).join(', '))
    throw new Error(String(detail) || 'Data tidak valid')
  }
  if (res.status === 204) return true
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

// ── Public fetch (tanpa token, untuk guest) ───────────────────
async function pub(url) {
  let res
  try {
    res = await fetch(`${API_BASE}${url}`)
  } catch {
    throw new Error('Tidak dapat terhubung ke server.')
  }
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────
// POST /auth/login — OAuth2PasswordRequestForm (form-encoded)
// username = email, password = password
export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password })
  let res
  try {
    res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
  } catch {
    throw new Error('Tidak dapat terhubung ke server.')
  }
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.detail || 'Email atau password salah')
  }
  const data = await res.json()
  token.set(data.access_token)
  if (data.user) userCache.set(data.user)
  return data   // { access_token, token_type, user: UserResponse }
}

// POST /auth/register — JSON body
// UserCreate: { email, password, full_name, role }
export async function register({ email, password, full_name, role = 'member' }) {
  let res
  try {
    res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name, role }),
    })
  } catch {
    throw new Error('Tidak dapat terhubung ke server.')
  }
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    const detail = e.detail
    if (Array.isArray(detail)) throw new Error(detail.map(d => d.msg).join(', '))
    throw new Error(String(detail) || 'Registrasi gagal')
  }
  return res.json()   // UserResponse
}

export const getMe  = () => req('/auth/me')
export const logout = () => { token.remove(); userCache.remove(); sessionStorage.removeItem('lp_page') }

// PUT /auth/me/change-password — { current_password, new_password }
export const changePassword  = (data) => req('/auth/me/change-password', { method: 'PUT', body: JSON.stringify(data) })
// PUT /auth/me/profile — { full_name }
export const updateMyProfile = (data) => req('/auth/me/profile',          { method: 'PUT', body: JSON.stringify(data) })

// ── Categories — GET public, CUD = admin ──────────────────────
export const fetchCategories = (limit = 200) => pub(`/categories?limit=${limit}`)
export const createCategory  = (d)     => req('/categories',       { method: 'POST',   body: JSON.stringify(d) })
export const updateCategory  = (id, d) => req(`/categories/${id}`, { method: 'PUT',    body: JSON.stringify(d) })
export const deleteCategory  = (id)    => req(`/categories/${id}`, { method: 'DELETE' })

// ── Genres — GET public, CUD = admin ──────────────────────────
export const fetchGenres = (limit = 200) => pub(`/genres?limit=${limit}`)
export const createGenre = (d)     => req('/genres',       { method: 'POST',   body: JSON.stringify(d) })
export const updateGenre = (id, d) => req(`/genres/${id}`, { method: 'PUT',    body: JSON.stringify(d) })
export const deleteGenre = (id)    => req(`/genres/${id}`, { method: 'DELETE' })

// ── Books — GET public, stats public, CUD = admin ─────────────
export const fetchBooks = (search = '', limit = 50, skip = 0) =>
  pub(`/books?skip=${skip}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`)

// GET /books/stats — public (tidak butuh token)
export const fetchBookStats = () =>
  pub('/books/stats').catch(() => null)

export const fetchBook  = (id)    => pub(`/books/${id}`)
export const createBook = (d)     => req('/books',       { method: 'POST',   body: JSON.stringify(d) })
export const updateBook = (id, d) => req(`/books/${id}`, { method: 'PUT',    body: JSON.stringify(d) })
export const deleteBook = (id)    => req(`/books/${id}`, { method: 'DELETE' })

// ── Users — butuh token (semua role), PUT/DELETE = admin ──────
export const fetchUsers = (limit = 100) => req(`/users?limit=${limit}`)
export const fetchUser  = (id)          => req(`/users/${id}`)
export const updateUser = (id, d)       => req(`/users/${id}`, { method: 'PUT',    body: JSON.stringify(d) })
export const deleteUser         = (id)        => req(`/users/${id}`,                { method: 'DELETE' })
// PUT /users/{id}/reset-password — { new_password } — Admin only
export const adminResetPassword = (id, newPw) => req(`/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ new_password: newPw }) })

// Admin buat user baru via /auth/register dengan token di header
export const createUser = async (d) => {
  const t = token.get()
  let res
  try {
    res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
      body: JSON.stringify(d),
    })
  } catch {
    throw new Error('Tidak dapat terhubung ke server.')
  }
  if (res.status === 401) { onSessionExpired(); throw new Error('Sesi berakhir.') }
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    const detail = e.detail
    if (Array.isArray(detail)) throw new Error(detail.map(d => d.msg).join(', '))
    throw new Error(String(detail) || 'Gagal membuat user')
  }
  return res.json()
}

// ── Transactions — butuh token ────────────────────────────────
// TransactionCreate: { user_id: int, book_id: int, due_date: ISO string }
export const fetchTransactions = (status = '', limit = 50, skip = 0) =>
  req(`/transactions?skip=${skip}&limit=${limit}${status ? `&status=${status}` : ''}`)

// TransactionCreate schema hanya butuh user_id + book_id
// due_date TIDAK diterima backend — dihitung otomatis 7 hari oleh sistem
export const borrowBook = (d) => req('/transactions', {
  method: 'POST',
  body: JSON.stringify({
    user_id: Number(d.user_id),
    book_id: Number(d.book_id),
  }),
})
export const approveTransaction = (id) => req(`/transactions/${id}/approve`, { method: 'PUT' })
export const rejectTransaction  = (id) => req(`/transactions/${id}/reject`,  { method: 'PUT' })
export const returnBook         = (id) => req(`/transactions/${id}/return`,  { method: 'PUT' })
// POST /transactions/{id}/lost — laporkan buku hilang (denda Rp 100.000 otomatis)
export const reportBookLost     = (id) => req(`/transactions/${id}/lost`,    { method: 'POST' })

// ── Fines — butuh token ───────────────────────────────────────
// GET /fines?status_filter=... (bukan &status=)
export const fetchFines = (statusFilter = null, limit = 50, skip = 0) =>
  req(`/fines?skip=${skip}&limit=${limit}${statusFilter ? `&status_filter=${statusFilter}` : ''}`)

// POST /fines/{id}/submit-payment — body: { payment_proof_url: string }
// payment_proof_url adalah URL gambar (Google Drive, Imgur, dll)
export const submitFinePayment = (id, payment_proof_url) =>
  req(`/fines/${id}/submit-payment`, {
    method: 'POST',
    body: JSON.stringify({ payment_proof_url }),
  })

// PUT /fines/{id}/approve — admin tandai lunas
export const approveFine = (id) =>
  req(`/fines/${id}/approve`, { method: 'PUT' })

// PUT /fines/{id}/reject — body: { rejection_note: string }
export const rejectFine = (id, rejection_note) =>
  req(`/fines/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ rejection_note }),
  })