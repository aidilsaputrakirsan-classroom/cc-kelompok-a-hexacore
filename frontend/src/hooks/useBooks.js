// ============================================================
// src/hooks/useBooks.js
// Fetch buku dari API — public endpoint, tidak butuh token
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { fetchBooks } from '../services/api'

export function useBooks(search = '') {
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
        setError(err.message)
        setBooks([])
        setTotal(0)
        setLoading(false)
      })
  }, [search])

  useEffect(() => { load() }, [load])

  return { books, total, loading, error, reload: load }
}