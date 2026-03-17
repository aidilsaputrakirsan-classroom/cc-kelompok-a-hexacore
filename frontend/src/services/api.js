// ============================================================
// services/api.js — LenteraPustaka v0.4.0
// ============================================================

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const token = {
  get:    () => localStorage.getItem('lp_token'),
  set:    (t) => localStorage.setItem('lp_token', t),
  remove: () => localStorage.removeItem('lp_token'),
}

// Custom event supaya App.jsx bisa dengar saat sesi berakhir
// tanpa window.location.reload
function dispatchSessionExpired() {
  window.dispatchEvent(new CustomEvent('session-expired'))
}

async function req(url, opts = {}) {
  const t = token.get()
  const headers = { 'Content-Type': 'application/json', ...opts.headers }
  if (t) headers['Authorization'] = `Bearer ${t}`

  let res
  try {
    res = await fetch(`${API_BASE}${url}`, { ...opts, headers })
  } catch (networkErr) {
    throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan.')
  }

  if (res.status === 401) {
    token.remove()
    sessionStorage.removeItem('lp_page')
    dispatchSessionExpired()
    throw new Error('Sesi berakhir. Silakan masuk kembali.')
  }
  if (res.status === 403) {
    throw new Error('Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.')
  }
  if (res.status === 204) return true
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────
export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password })
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.detail || 'Email atau password salah')
  }
  const data = await res.json()
  token.set(data.access_token)
  return data
}

export async function register({ email, password, full_name, role = 'member' }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name, role }),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.detail || 'Registrasi gagal')
  }
  return res.json()
}

export const getMe  = () => req('/auth/me')
export const logout = () => { token.remove(); sessionStorage.removeItem('lp_page') }

// ── Categories (GET public, CUD = admin) ──────────────────────
export const fetchCategories = (limit = 200) => req(`/categories?limit=${limit}`)
export const createCategory  = (d)     => req('/categories',       { method: 'POST',   body: JSON.stringify(d) })
export const updateCategory  = (id, d) => req(`/categories/${id}`, { method: 'PUT',    body: JSON.stringify(d) })
export const deleteCategory  = (id)    => req(`/categories/${id}`, { method: 'DELETE' })

// ── Genres (GET public, CUD = admin) ──────────────────────────
export const fetchGenres = (limit = 200) => req(`/genres?limit=${limit}`)
export const createGenre = (d)     => req('/genres',       { method: 'POST',   body: JSON.stringify(d) })
export const updateGenre = (id, d) => req(`/genres/${id}`, { method: 'PUT',    body: JSON.stringify(d) })
export const deleteGenre = (id)    => req(`/genres/${id}`, { method: 'DELETE' })

// ── Books (GET public, CUD = admin) ───────────────────────────
export const fetchBooks     = (search = '', limit = 50, skip = 0) =>
  req(`/books?skip=${skip}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`)
export const fetchBookStats = () =>
  fetch(`${API_BASE}/books/stats`).then(r => r.ok ? r.json() : null).catch(() => null)
export const fetchBook  = (id)    => req(`/books/${id}`)
export const createBook = (d)     => req('/books',       { method: 'POST',   body: JSON.stringify(d) })
export const updateBook = (id, d) => req(`/books/${id}`, { method: 'PUT',    body: JSON.stringify(d) })
export const deleteBook = (id)    => req(`/books/${id}`, { method: 'DELETE' })

// ── Users ─────────────────────────────────────────────────────
export const fetchUsers = (limit = 100) => req(`/users?limit=${limit}`)
export const fetchUser  = (id)          => req(`/users/${id}`)
export const updateUser = (id, d)       => req(`/users/${id}`, { method: 'PUT',  body: JSON.stringify(d) })
export const deleteUser = (id)          => req(`/users/${id}`, { method: 'DELETE' })
export const createUser = (d) => {
  const t = token.get()
  return fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: JSON.stringify(d),
  }).then(async r => {
    if (r.status === 401) { token.remove(); sessionStorage.removeItem('lp_page'); dispatchSessionExpired(); throw new Error('Sesi berakhir.') }
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || 'Gagal buat user') }
    return r.json()
  })
}

// ── Transactions ──────────────────────────────────────────────
export const fetchTransactions  = (status = '', limit = 50, skip = 0) =>
  req(`/transactions?skip=${skip}&limit=${limit}${status ? `&status=${status}` : ''}`)
export const borrowBook = (d) => req('/transactions', {
  method: 'POST',
  body: JSON.stringify({
    user_id:  Number(d.user_id),
    book_id:  Number(d.book_id),
    due_date: new Date(d.due_date).toISOString(),
  }),
})
export const approveTransaction = (id) => req(`/transactions/${id}/approve`, { method: 'PUT' })
export const rejectTransaction  = (id) => req(`/transactions/${id}/reject`,  { method: 'PUT' })
export const returnBook         = (id) => req(`/transactions/${id}/return`,  { method: 'PUT' })

// ── Fines ─────────────────────────────────────────────────────
export const fetchFines = (statusFilter = null, limit = 50, skip = 0) =>
  req(`/fines?skip=${skip}&limit=${limit}${statusFilter ? `&status_filter=${statusFilter}` : ''}`)
export const submitFinePayment = (id, payment_proof_url) =>
  req(`/fines/${id}/submit-payment`, { method: 'POST', body: JSON.stringify({ payment_proof_url }) })
export const approveFine = (id) =>
  req(`/fines/${id}/approve`, { method: 'PUT' })
export const rejectFine  = (id, rejection_note) =>
  req(`/fines/${id}/reject`, { method: 'PUT', body: JSON.stringify({ rejection_note }) })