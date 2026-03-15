// ============================================================
// src/utils/formatters.js
// Utility functions: formatter, validator, badge config
// ============================================================

// ── Formatter ─────────────────────────────────────────────────

/**
 * fmt — format angka ke Rupiah
 * @example fmt(15000) → "Rp 15.000"
 */
export const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)

/**
 * fmtDate — format ISO date ke tanggal Indonesia
 * @example fmtDate('2024-01-15') → "15 Jan 2024"
 */
export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'

// ── Password validation ───────────────────────────────────────

/**
 * validatePassword — validasi ketat sesuai backend v0.4.0
 * Rules: min 8 char, huruf besar, huruf kecil, angka, spesial (@$!%*?&)
 *
 * @param {string} pw
 * @returns {string[]} array pesan error (kosong = valid)
 */
export function validatePassword(pw) {
  const errors = []
  if (pw.length < 8)         errors.push('Minimal 8 karakter')
  if (!/[A-Z]/.test(pw))     errors.push('Minimal 1 huruf besar')
  if (!/[a-z]/.test(pw))     errors.push('Minimal 1 huruf kecil')
  if (!/\d/.test(pw))        errors.push('Minimal 1 angka')
  if (!/[@$!%*?&]/.test(pw)) errors.push('Minimal 1 karakter spesial (@$!%*?&)')
  return errors
}

/**
 * pwStrength — hitung kekuatan password (0–5)
 *
 * @param {string} pw
 * @returns {{ score: number, label: string, color: string }}
 */
export function pwStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }

  const score = 5 - validatePassword(pw).length
  const levels = [
    { label: '',             color: '' },
    { label: 'Sangat lemah', color: '#ef4444' },
    { label: 'Lemah',        color: '#f97316' },
    { label: 'Cukup',        color: '#f59e0b' },
    { label: 'Kuat',         color: '#22c55e' },
    { label: 'Sangat kuat',  color: '#16a34a' },
  ]

  return { score, ...levels[score] }
}

// ── Badge config ──────────────────────────────────────────────

/**
 * trxBadge — konfigurasi badge status transaksi
 * Keys: pending | borrowed | returned | overdue | rejected | lost
 */
export const trxBadge = {
  pending:  { cls: 'badge-amber', label: 'Menunggu'      },
  borrowed: { cls: 'badge-blue',  label: 'Dipinjam'      },
  returned: { cls: 'badge-green', label: 'Dikembalikan'  },
  overdue:  { cls: 'badge-red',   label: 'Terlambat'     },
  rejected: { cls: 'badge-slate', label: 'Ditolak'       },
  lost:     { cls: 'badge-slate', label: 'Hilang'        },
}

/**
 * fineBadge — konfigurasi badge status denda
 * Keys: unpaid | pending_verification | paid | rejected
 */
export const fineBadge = {
  unpaid:               { cls: 'badge-red',   label: 'Belum Dibayar'       },
  pending_verification: { cls: 'badge-amber', label: 'Menunggu Verifikasi' },
  paid:                 { cls: 'badge-green', label: 'Lunas'               },
  rejected:             { cls: 'badge-slate', label: 'Bukti Ditolak'       },
}