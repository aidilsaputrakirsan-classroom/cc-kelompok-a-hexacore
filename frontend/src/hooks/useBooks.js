// ============================================================
// src/hooks/useBooks.js
// Custom hook untuk fetch buku dengan seed fallback
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { fetchBooks } from '../services/api'
import { SEED_BOOKS } from '../data/seedBooks'

/**
 * useBooks — hook untuk memuat daftar buku dari API
 *
 * - Jika API mengembalikan data kosong dan tidak ada query → tampilkan SEED_BOOKS
 * - Jika API error → fallback ke SEED_BOOKS
 * - `reload` bisa dipanggil manual setelah operasi CRUD
 *
 * @param {string} search - kata kunci pencarian (reactive)
 * @returns {{ books: Array, total: number, loading: boolean, reload: Function }}
 *
 * Cara pakai:
 *   const { books, total, loading, reload } = useBooks(search)
 */
export function useBooks(search) {
  const [books, setBooks]     = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetchBooks(search)
      .then(d => {
        const r = d.books || []
        if (r.length === 0 && !search) {
          // DB kosong & tidak ada pencarian → tampilkan contoh data
          setBooks(SEED_BOOKS)
          setTotal(SEED_BOOKS.length)
        } else {
          setBooks(r)
          setTotal(d.total || 0)
        }
        setLoading(false)
      })
      .catch(() => {
        // API tidak tersedia → fallback seed
        setBooks(SEED_BOOKS)
        setTotal(SEED_BOOKS.length)
        setLoading(false)
      })
  }, [search])

  useEffect(() => { load() }, [load])

  return { books, total, loading, reload: load }
}