// ============================================================
// src/hooks/useToast.js
// Custom hook untuk toast notifikasi
// ============================================================
import { useState, useCallback } from 'react'

/**
 * useToast — hook untuk menampilkan notifikasi sementara
 *
 * @returns {{ toasts: Array, toast: Function }}
 *
 * Cara pakai:
 *   const { toasts, toast } = useToast()
 *   toast('Berhasil disimpan!')           // success (default)
 *   toast('Gagal memuat data', 'error')   // error
 *   toast('Sesi dimulai', 'info')         // info
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return { toasts, toast }
}