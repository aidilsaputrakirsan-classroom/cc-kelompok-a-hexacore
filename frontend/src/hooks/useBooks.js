// ============================================================
// src/hooks/useBooks.js
// Custom hook untuk fetch buku dari API
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { fetchBooks } from '../services/api'

/**
 * useBooks — hook untuk memuat daftar buku dari API
 *
 * - Jika API error atau DB kosong → tampilkan empty state (books = [])
 * - `reload` bisa dipanggil manual setelah operasi CRUD
 *
 * @param {string} search - kata kunci pencarian (reactive)
 * @returns {{ books, total, loading, error, reload }}
 */
export function useBooks(search) {
  const [books, setBooks]     = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchBooks(search)
      .then(d => {
        setBooks(d.books || [])
        setTotal(d.total || 0)
        setLoading(false)
      })
      .catch(err => {
        setBooks([])
        setTotal(0)
        setError(err.message || 'Gagal memuat data buku')
        setLoading(false)
      })
  }, [search])

  useEffect(() => { load() }, [load])

  return { books, total, loading, error, reload: load }
}