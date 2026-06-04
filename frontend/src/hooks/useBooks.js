// ============================================================
// src/hooks/useBooks.js
// Fetch buku dari API — public endpoint, tidak butuh token
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { fetchBooks } from '../services/api'

export function useBooks(search = '') {
  const [books, setBooks]     = useState(() => {
    try {
      if (!search) return JSON.parse(localStorage.getItem('lp_cached_books')) || []
      return []
    } catch {
      return []
    }
  })
  const [total, setTotal]     = useState(books.length)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [isDegraded, setIsDegraded] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    setIsDegraded(false)
    fetchBooks(search)
      .then(d => {
        setBooks(d.books || [])
        setTotal(d.total || 0)
        if (!search) localStorage.setItem('lp_cached_books', JSON.stringify(d.books || []))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setIsDegraded(true)
        // UX: Graceful Degradation - Do not clear books if error, use cache/existing state
        setLoading(false)
      })
  }, [search])

  useEffect(() => { load() }, [load])

  return { books, total, loading, error, isDegraded, reload: load }
}