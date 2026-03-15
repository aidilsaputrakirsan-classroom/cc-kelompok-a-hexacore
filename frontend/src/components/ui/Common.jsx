// ============================================================
// components/ui/Common.jsx
// ============================================================
import { useEffect } from 'react'

export function Spinner({ text = 'Memuat data…' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  )
}

export function Empty({ icon = '📭', title = 'Belum ada data', sub = '' }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {sub && <div className="empty-state-sub">{sub}</div>}
    </div>
  )
}

export function Badge({ cls = 'badge-slate', children }) {
  return <span className={`badge ${cls}`}>{children}</span>
}

export function Modal({ title, onClose, children, footer, size = '' }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function Confirm({ title, message, onConfirm, onCancel, danger = false }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Batal</button>
          <button className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            Konfirmasi
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: 'var(--c-text2)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  )
}

export function Field({ label, optional, hint, error, children }) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {optional && <span className="form-label-opt">(opsional)</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export function Input({ error, ...props }) {
  return <input className={`input${error ? ' error' : ''}`} {...props} />
}

export function Select({ children, ...props }) {
  return <select className="input" {...props}>{children}</select>
}

export function Textarea({ error, ...props }) {
  return <textarea className={`input${error ? ' error' : ''}`} {...props} />
}

export function StatCard({ label, value, sub, accentColor }) {
  return (
    <div className="stat-card">
      {accentColor && <div className="stat-card-bar" style={{ background: accentColor }} />}
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className={`toast-icon-${t.type}`}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'i'}
          </span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  )
}