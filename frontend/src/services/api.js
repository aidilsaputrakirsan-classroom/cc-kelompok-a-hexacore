// ============================================================
// services/api.js — LenteraPustaka API v0.4.0
// ============================================================

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

// ── Token storage ─────────────────────────────────────────────
export const token = {
  get:    ()  => localStorage.getItem("lp_token"),
  set:    (t) => localStorage.setItem("lp_token", t),
  remove: ()  => localStorage.removeItem("lp_token"),
}

// ── Core request ─────────────────────────────────────────────
async function req(url, opts = {}) {
  const t = token.get()
  const headers = { "Content-Type": "application/json", ...opts.headers }
  if (t) headers["Authorization"] = `Bearer ${t}`

  const res = await fetch(`${API_BASE}${url}`, { ...opts, headers })

  if (res.status === 401) { token.remove(); window.location.reload(); return }
  if (res.status === 204) return true
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

// ── Health ────────────────────────────────────────────────────
export const checkHealth = async () => {
  try { const d = await fetch(`${API_BASE}/health`).then(r=>r.json()); return d.status === "healthy" }
  catch { return false }
}

// ── Auth ──────────────────────────────────────────────────────
// Login pakai OAuth2PasswordRequestForm (form-encoded)
export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password })
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.detail || "Login gagal") }
  const data = await res.json()
  token.set(data.access_token)
  return data // { access_token, token_type, user }
}

// Register hanya bisa buat member (role dikunci di frontend)
export async function register(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, role: "member" }), // force member
  })
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.detail || "Registrasi gagal") }
  return res.json()
}

export const getMe   = () => req("/auth/me")
export const logout  = () => token.remove()

// ── Categories ────────────────────────────────────────────────
export const fetchCategories = (limit=200) => req(`/categories?limit=${limit}`)
export const createCategory  = (d) => req("/categories", { method:"POST", body:JSON.stringify(d) })
export const updateCategory  = (id,d) => req(`/categories/${id}`, { method:"PUT", body:JSON.stringify(d) })
export const deleteCategory  = (id) => req(`/categories/${id}`, { method:"DELETE" })

// ── Genres ────────────────────────────────────────────────────
export const fetchGenres = (limit=200) => req(`/genres?limit=${limit}`)
export const createGenre = (d) => req("/genres", { method:"POST", body:JSON.stringify(d) })
export const updateGenre = (id,d) => req(`/genres/${id}`, { method:"PUT", body:JSON.stringify(d) })
export const deleteGenre = (id) => req(`/genres/${id}`, { method:"DELETE" })

// ── Books ─────────────────────────────────────────────────────
export const fetchBooks     = (search="",limit=50) => req(`/books?limit=${limit}${search?`&search=${encodeURIComponent(search)}`:""}`)
export const fetchBookStats = () => req("/books/stats").catch(()=>null)
export const createBook     = (d) => req("/books", { method:"POST", body:JSON.stringify(d) })
export const updateBook     = (id,d) => req(`/books/${id}`, { method:"PUT", body:JSON.stringify(d) })
export const deleteBook     = (id) => req(`/books/${id}`, { method:"DELETE" })

// ── Users ─────────────────────────────────────────────────────
export const fetchUsers = (limit=100) => req(`/users?limit=${limit}`)
export const createUser = (d) => req("/auth/register", { method:"POST", body:JSON.stringify(d) })
export const updateUser = (id,d) => req(`/users/${id}`, { method:"PUT", body:JSON.stringify(d) })
export const deleteUser = (id) => req(`/users/${id}`, { method:"DELETE" })

// ── Transactions ──────────────────────────────────────────────
export const fetchTransactions  = (status="",limit=50) => req(`/transactions?limit=${limit}${status?`&status=${status}`:""}`)
export const borrowBook         = (d) => req("/transactions", { method:"POST", body:JSON.stringify({...d, due_date:new Date(d.due_date).toISOString()}) })
export const approveTransaction = (id) => req(`/transactions/${id}/approve`, { method:"PUT" })
export const rejectTransaction  = (id) => req(`/transactions/${id}/reject`, { method:"PUT" })
export const returnBook         = (id) => req(`/transactions/${id}/return`, { method:"PUT" })

// ── Fines ─────────────────────────────────────────────────────
export const fetchFines        = (sf=null,limit=50) => req(`/fines?limit=${limit}${sf?`&status_filter=${sf}`:""}`)
export const submitFinePayment = (id,url) => req(`/fines/${id}/submit-payment`, { method:"POST", body:JSON.stringify({ payment_proof_url:url }) })
export const approveFine       = (id) => req(`/fines/${id}/approve`, { method:"PUT" })
export const rejectFine        = (id,note) => req(`/fines/${id}/reject`, { method:"PUT", body:JSON.stringify({ rejection_note:note }) })