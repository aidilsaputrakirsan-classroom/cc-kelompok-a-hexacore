// ============================================================
// services/api.js — Semua fungsi komunikasi ke backend
// LenteraPustaka · HEXACORE · SI ITK
// ============================================================

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

// ── Helper internal ───────────────────────────────────────────
async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request gagal (${res.status})`)
  }
  if (res.status === 204) return true
  return res.json()
}

// ── Health & Stats ────────────────────────────────────────────
export async function checkHealth() {
  try {
    const data = await request("/health")
    return data.status === "healthy"
  } catch { return false }
}

export async function fetchBookStats() {
  try { return await request("/books/stats") }
  catch { return null }
}

// ── Categories ────────────────────────────────────────────────
export const fetchCategories = (limit = 200) =>
  request(`/categories?limit=${limit}`)

export const createCategory = (data) =>
  request("/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

export const updateCategory = (id, data) =>
  request(`/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

export const deleteCategory = (id) =>
  request(`/categories/${id}`, { method: "DELETE" })

// ── Books ─────────────────────────────────────────────────────
export const fetchBooks = (search = "", limit = 50) => {
  const q = search ? `&search=${encodeURIComponent(search)}` : ""
  return request(`/books?limit=${limit}${q}`)
}

export const createBook = (data) =>
  request("/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

export const updateBook = (id, data) =>
  request(`/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

export const deleteBook = (id) =>
  request(`/books/${id}`, { method: "DELETE" })

// ── Users ─────────────────────────────────────────────────────
export const fetchUsers = (limit = 100) =>
  request(`/users?limit=${limit}`)

export const createUser = (data) =>
  request("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

// ── Transactions ──────────────────────────────────────────────
export const fetchTransactions = (status = "", limit = 50) => {
  const q = status ? `&status=${status}` : ""
  return request(`/transactions?limit=${limit}${q}`)
}

export const borrowBook = (data) =>
  request("/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, due_date: new Date(data.due_date).toISOString() }),
  })

export const returnBook = (transactionId) =>
  request(`/transactions/${transactionId}/return`, { method: "PUT" })

// ── Fines ─────────────────────────────────────────────────────
export const fetchFines = (isPaid = null, limit = 50) => {
  const q = isPaid !== null ? `&is_paid=${isPaid}` : ""
  return request(`/fines?limit=${limit}${q}`)
}

export const payFine = (id) =>
  request(`/fines/${id}/pay`, { method: "PUT" })
