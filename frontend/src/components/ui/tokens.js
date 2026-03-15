export const trxBadge = {
  pending:  { cls: 'badge-amber', label: 'Menunggu'     },
  borrowed: { cls: 'badge-blue',  label: 'Dipinjam'     },
  returned: { cls: 'badge-green', label: 'Dikembalikan' },
  overdue:  { cls: 'badge-red',   label: 'Terlambat'    },
  rejected: { cls: 'badge-slate', label: 'Ditolak'      },
  lost:     { cls: 'badge-slate', label: 'Hilang'       },
}

export const fineBadge = {
  unpaid:               { cls: 'badge-red',   label: 'Belum Dibayar'       },
  pending_verification: { cls: 'badge-amber', label: 'Menunggu Verifikasi' },
  paid:                 { cls: 'badge-green', label: 'Lunas'               },
  rejected:             { cls: 'badge-slate', label: 'Bukti Ditolak'       },
}

export const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export function validatePassword(pw) {
  const e = []
  if (pw.length < 8)         e.push('Minimal 8 karakter')
  if (!/[A-Z]/.test(pw))     e.push('Minimal 1 huruf besar')
  if (!/[a-z]/.test(pw))     e.push('Minimal 1 huruf kecil')
  if (!/\d/.test(pw))        e.push('Minimal 1 angka')
  if (!/[@$!%*?&]/.test(pw)) e.push('Minimal 1 karakter spesial (@$!%*?&)')
  return e
}

export function pwStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  const score = 5 - validatePassword(pw).length
  const map = [
    { label: '',             color: '' },
    { label: 'Sangat lemah', color: '#ef4444' },
    { label: 'Lemah',        color: '#f97316' },
    { label: 'Cukup',        color: '#f59e0b' },
    { label: 'Kuat',         color: '#22c55e' },
    { label: 'Sangat kuat',  color: '#16a34a' },
  ]
  return { score, ...map[score] }
}