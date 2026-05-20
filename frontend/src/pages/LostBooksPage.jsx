import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import Header    from '../components/Header';
import ItemForm  from '../components/ItemForm';
import ItemCard, { BookDetailModal } from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import ItemList  from '../components/ItemList';
import {
  Spinner, Empty, Modal, Field, Input, Select, Textarea,
  StatCard, ToastContainer, Confirm,
} from '../components/ui/Common';

import { useToast } from '../hooks/useToast';
import { useBooks } from '../hooks/useBooks';
import {
  fmt, fmtDate, validatePassword, pwStrength,
  trxBadge, fineBadge,
} from '../utils/formatters';

import {
  login, register, logout, getMe, token, userCache,
  changePassword, updateMyProfile,
  fetchCategories, createCategory, updateCategory, deleteCategory,
  fetchGenres,     createGenre,    updateGenre,    deleteGenre,
  fetchBooks, fetchBookStats, createBook, updateBook, deleteBook,
  fetchUsers,      createUser,     deleteUser,     adminResetPassword,
  fetchTransactions, borrowBook, approveTransaction, rejectTransaction, returnBook, reportBookLost,
  fetchFines, submitFinePayment, approveFine, rejectFine,
  API_BASE,
} from '../services/api';

function LostBooksPage({ user, toast }) {
  const isAdmin = user?.role === 'admin'
  const [fines, setFines]             = useState([])
  const [total, setTotal]             = useState(0)
  const [statusF, setStatusF]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [loadErr, setLoadErr]         = useState(null)
  const [proofModal, setProofModal]   = useState(null)
  const [proofUrl, setProofUrl]       = useState('')
  const [proofFile, setProofFile]     = useState(null)
  const [uploadMode, setUploadMode]   = useState('file') // 'file' | 'url'
  const [uploading, setUploading]     = useState(false)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectNote, setRejectNote]   = useState('')
  const [submitting, setSubmitting]   = useState(false)

  const load = useCallback(() => {
    setLoading(true); setLoadErr(null)
    fetchFines(statusF)
      .then(d => { setFines(d.fines || []); setTotal(d.total || 0); setLoading(false) })
      .catch(err => { setLoadErr(err.message); setLoading(false) })
  }, [statusF])
  useEffect(() => { load() }, [load])

  // Filter KHUSUS denda hilangnya buku (lost)
  const displayFines = fines.filter(f => f.transaction?.status === 'lost')
  const totalUnpaid = displayFines.filter(f => f.status === 'unpaid').reduce((a, f) => a + f.amount, 0)

  const TABS = [
    { v: null,                  l: 'Semua'      },
    { v: 'unpaid',              l: 'Belum Bayar' },
    { v: 'pending_verification', l: 'Verifikasi'  },
    { v: 'paid',                l: 'Lunas'       },
    { v: 'rejected',            l: 'Ditolak'     },
  ]

  const uploadFileToServer = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const t = token.get()
    const res = await fetch(`${API_BASE}/upload/fines`, {
      method: 'POST',
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Gagal mengupload file')
    }
    const data = await res.json()
    return data.url
  }

  const doSubmitProof = async () => {
    setSubmitting(true)
    try {
      let finalUrl = ''
      if (uploadMode === 'file') {
        if (!proofFile) { toast('Pilih file terlebih dahulu', 'error'); setSubmitting(false); return }
        setUploading(true)
        const uploadedPath = await uploadFileToServer(proofFile)
        setUploading(false)
        finalUrl = uploadedPath.startsWith('http') ? uploadedPath : `${API_BASE}${uploadedPath}`
      } else {
        finalUrl = proofUrl.trim()
        if (!finalUrl) { toast('URL bukti wajib diisi', 'error'); setSubmitting(false); return }
      }
      await submitFinePayment(proofModal.fine_id, finalUrl)
      toast('Bukti pembayaran terkirim! Menunggu verifikasi admin.')
      setProofModal(null); setProofUrl(''); setProofFile(null); load()
    } catch (err) { toast(err.message, 'error'); setUploading(false) }
    finally { setSubmitting(false) }
  }

  const doReject = async () => {
    if (!rejectNote.trim()) { toast('Alasan penolakan wajib diisi', 'error'); return }
    setSubmitting(true)
    try {
      await rejectFine(rejectModal.fine_id, rejectNote.trim())
      toast('Bukti ditolak'); setRejectModal(null); setRejectNote(''); load()
    } catch (err) { toast(err.message, 'error') }
    finally { setSubmitting(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Denda Kehilangan Buku</h1>
          <p className="page-sub">{displayFines.length} laporan kehilangan</p>
        </div>
      </div>

      <div className="fine-banner">
        <div>
          <div className="fine-banner-val" style={{ color: 'var(--c-red)' }}>{fmt(totalUnpaid)}</div>
          <div className="fine-banner-lbl">Belum Bayar</div>
        </div>
        <div>
          <div className="fine-banner-val">{displayFines.filter(f => f.status === 'pending_verification').length}</div>
          <div className="fine-banner-lbl">Menunggu Verifikasi</div>
        </div>
        <div>
          <div className="fine-banner-val">{displayFines.filter(f => f.status === 'paid').length}</div>
          <div className="fine-banner-lbl">Lunas</div>
        </div>
        <div>
          <div className="fine-banner-val">{displayFines.length}</div>
          <div className="fine-banner-lbl">Total</div>
        </div>
      </div>

      <div className="filter-pills" style={{ marginBottom: 20 }}>
        {TABS.map(s => (
          <button key={String(s.v)} className={`filter-pill${statusF === s.v ? ' active' : ''}`}
            onClick={() => setStatusF(s.v)}>{s.l}</button>
        ))}
      </div>

      {loadErr && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {loadErr}</div>}

      {/* Notifikasi/Banner LostBooksPage */}
      {isAdmin && displayFines.filter(f => f.status === 'pending_verification').length > 0 && statusF === null && (
        <div className="alert alert-warning" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>💳</span>
          <div>
            <strong>{displayFines.filter(f => f.status === 'pending_verification').length} pengajuan pembayaran</strong> kehilangan menunggu!
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 10 }} onClick={() => setStatusF('pending_verification')}>
              Cek Sekarang →
            </button>
          </div>
        </div>
      )}
      {!isAdmin && displayFines.filter(f => f.status === 'unpaid').length > 0 && statusF === null && (
        <div className="alert alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div>
            <strong>Anda dilaporkan menghilangkan {displayFines.filter(f => f.status === 'unpaid').length} buku!</strong> Segera lunasi tagihan ganti rugi Rp 100.000 (per buku) agar dapat meminjam kembali.
          </div>
        </div>
      )}

      {loading ? <Spinner /> : displayFines.length === 0 ? (
        <Empty icon="📚" title="Aman" sub={statusF ? 'Coba filter lain' : 'Tidak ada catatan kehilangan buku'} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Transaksi</th><th>Biaya Ganti Rugi</th>
                <th>Status</th><th>Bukti Bayar</th><th>Catatan Admin</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayFines.map(f => {
                const fb = fineBadge[f.status] || { cls: 'badge-slate', label: f.status }
                return (
                  <tr key={f.fine_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--c-text3)' }}>#{f.fine_id}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>#{f.transaction_id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--c-red)' }}>{fmt(f.amount)}</td>
                    <td><span className={`badge ${fb.cls}`}>{fb.label}</span></td>
                    <td>
                      {f.payment_proof_url
                        ? <a href={f.payment_proof_url} target="_blank" rel="noreferrer"
                            style={{ color: 'var(--c-accent)', fontSize: 12, fontWeight: 600 }}>
                            📎 Lihat Bukti
                          </a>
                        : <span style={{ color: 'var(--c-text3)', fontSize: 12 }}>—</span>
                      }
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--c-red)', maxWidth: 180 }}>
                      {f.rejection_note || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {!isAdmin && (f.status === 'unpaid' || f.status === 'rejected') && (
                          <button className="btn btn-primary btn-sm"
                            onClick={() => { setProofModal(f); setProofUrl(''); setProofFile(null); setUploadMode('file') }}>
                            💳 Bayar
                          </button>
                        )}
                        {isAdmin && f.status === 'pending_verification' && (
                          <>
                            <button className="btn btn-primary btn-sm"
                              onClick={async () => {
                                try { await approveFine(f.fine_id); toast('Denda ditandai lunas') }
                                catch (err) { toast(err.message, 'error') }
                                finally { load() }
                              }}>✓ Lunas</button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => { setRejectModal(f); setRejectNote('') }}>
                              ✕ Tolak
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Kirim Bukti Pembayaran */}
      {proofModal && (
        <Modal title="Kirim Bukti Pembayaran Kehilangan" onClose={() => { setProofModal(null); setProofFile(null); setProofUrl('') }} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => { setProofModal(null); setProofFile(null); setProofUrl('') }}>Batal</button>
              <button className="btn btn-primary"
                disabled={submitting || uploading || (uploadMode === 'file' ? !proofFile : !proofUrl.trim())}
                onClick={doSubmitProof}>
                {uploading ? 'Mengupload…' : submitting ? 'Mengirim…' : 'Kirim Bukti'}
              </button>
            </>
          }>

          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <strong>Total Ganti Rugi: {fmt(proofModal.amount)}</strong>
            {proofModal.status === 'rejected' && proofModal.rejection_note && (
              <p style={{ marginTop: 6, fontSize: 12 }}>
                ⚠️ Ditolak sebelumnya: <em>{proofModal.rejection_note}</em>
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            <button
              onClick={() => setUploadMode('file')}
              style={{
                flex: 1, padding: '8px 12px', border: '1.5px solid',
                borderColor: uploadMode === 'file' ? 'var(--c-accent)' : 'var(--c-border)',
                borderRadius: 'var(--r-md)',
                background: uploadMode === 'file' ? 'var(--c-accentbg)' : 'var(--c-surface)',
                color: uploadMode === 'file' ? 'var(--c-accent2)' : 'var(--c-text2)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              }}>
              📁 Upload File
            </button>
            <button
              onClick={() => setUploadMode('url')}
              style={{
                flex: 1, padding: '8px 12px', border: '1.5px solid',
                borderColor: uploadMode === 'url' ? 'var(--c-accent)' : 'var(--c-border)',
                borderRadius: 'var(--r-md)',
                background: uploadMode === 'url' ? 'var(--c-accentbg)' : 'var(--c-surface)',
                color: uploadMode === 'url' ? 'var(--c-accent2)' : 'var(--c-text2)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              }}>
              🔗 Tempel URL
            </button>
          </div>

          {uploadMode === 'file' ? (
            <Field label="Upload Bukti Transfer *" hint="Format: JPG, PNG, JPEG (maks. 5MB)">
              <div style={{
                border: '2px dashed var(--c-border)',
                borderRadius: 'var(--r-md)',
                padding: '20px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color var(--t), background var(--t)',
                background: proofFile ? 'var(--c-green-bg)' : 'var(--c-bg)',
                borderColor: proofFile ? 'var(--c-green)' : 'var(--c-border)',
              }}
                onClick={() => document.getElementById('proof-file-input').click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--c-accent)' }}
                onDragLeave={e => { e.currentTarget.style.borderColor = proofFile ? 'var(--c-green)' : 'var(--c-border)' }}
                onDrop={e => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) {
                    if (!file.type.startsWith('image/')) {
                      toast('Hanya file gambar yang diizinkan', 'error')
                    } else if (file.size > 5 * 1024 * 1024) {
                      toast('Ukuran file maksimal 5MB', 'error')
                    } else {
                      setProofFile(file)
                      e.currentTarget.style.borderColor = 'var(--c-green)'
                    }
                  }
                }}>
                <input
                  id="proof-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast('Ukuran file maksimal 5MB', 'error')
                      } else {
                        setProofFile(file)
                      }
                    }
                  }}
                />
                {proofFile ? (
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>{proofFile.name}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8, opacity: .5 }}>📸</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)' }}>Klik atau seret file ke sini</div>
                  </div>
                )}
              </div>
            </Field>
          ) : (
            <Field label="URL Bukti Transfer *">
              <Input
                value={proofUrl}
                onChange={e => setProofUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter' && proofUrl.trim()) doSubmitProof() }}
              />
            </Field>
          )}
        </Modal>
      )}

      {/* Modal: Tolak Bukti (Admin) */}
      {rejectModal && (
        <Modal title="Tolak Bukti Pembayaran" onClose={() => setRejectModal(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Batal</button>
              <button className="btn btn-danger" disabled={!rejectNote.trim() || submitting} onClick={doReject}>
                {submitting ? 'Memproses…' : 'Tolak Bukti'}
              </button>
            </>
          }>
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            Denda #{rejectModal.fine_id} — <strong>{fmt(rejectModal.amount)}</strong>
          </div>
          <Field label="Alasan Penolakan *">
            <Textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3} autoFocus />
          </Field>
        </Modal>
      )}
    </div>
  )
}


export default LostBooksPage;
