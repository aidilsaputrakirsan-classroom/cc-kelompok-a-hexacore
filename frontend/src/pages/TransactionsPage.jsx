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

function TransactionsPage({ user, toast, onNav }) {
  const isAdmin = user?.role === 'admin'
  const [trxs, setTrxs]              = useState([])
  const [total, setTotal]             = useState(0)
  const [statusF, setStatusF]         = useState('')
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(false)
  const [adminUsers, setAdminUsers]   = useState([])
  const [bookList, setBookList]       = useState([])
  const [bookSearch, setBookSearch]   = useState('')
  const [form, setForm]               = useState({ user_id: '', book_id: '' })
  const [confirm, setConfirm]         = useState(null)
  
  const load = useCallback(() => {
    setLoading(true)
    fetchTransactions(statusF)
      .then(d => { setTrxs(d.transactions || []); setTotal(d.total || 0); setLoading(false) })
      .catch(err => { toast(err.message, 'error'); setLoading(false) })
  }, [statusF])

  useEffect(() => {
    if (isAdmin) fetchUsers().then(d => setAdminUsers(Array.isArray(d) ? d : []))
    // FIX: Fetch buku dengan limit yang cukup besar dan simpan ke state
    fetchBooks('', 500).then(d => setBookList(d.books || [])).catch(() => {})
  }, [isAdmin])
  useEffect(() => { load() }, [load])

  const bookName = (t) => {
    if (t.book && t.book.title) return t.book.title
    const found = bookList.find(b => b.book_id === Number(t.book_id))
    return found ? found.title : `Buku #${t.book_id}`
  }
  const userName = (t) => {
    if (t.user && t.user.full_name) return t.user.full_name
    const found = adminUsers.find(u => u.user_id === Number(t.user_id))
    return found ? found.full_name : `User #${t.user_id}`
  }

  const countdown = (dueDate) => {
    const now  = new Date()
    const due  = new Date(dueDate)
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    if (diff > 0)  return { text: `${diff} hari lagi`, color: diff <= 2 ? '#f59e0b' : '#16a34a', warning: diff <= 2 }
    if (diff === 0) return { text: 'Hari ini!', color: '#ef4444', warning: true }
    return { text: `${Math.abs(diff)} hari terlambat`, color: '#ef4444', warning: true }
  }

  // Tampilkan semua buku (termasuk stock 0 agar admin tahu stok habis)
  // Dulu filter available_stock > 0 menyebabkan tidak ada buku tampil jika semua stok habis
  const filteredBooks = bookList
    .filter(b => {
      if (!bookSearch.trim()) return true
      const q = bookSearch.toLowerCase()
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    })

  const visibleTrxs = trxs.filter(t => t.status !== 'overdue' && t.status !== 'lost')

  const openBorrowModal = () => {
    setForm({ user_id: '', book_id: '' })
    setBookSearch('')
    setModal(true)
    // Refresh daftar buku setiap kali modal dibuka (pastikan data terkini)
    fetchBooks('', 500).then(d => setBookList(d.books || [])).catch(() => {})
  }

  const doSubmitBorrow = async () => {
    if (!form.user_id) { toast('Pilih pengguna dulu', 'error'); return }
    if (!form.book_id) { toast('Pilih buku dulu', 'error'); return }
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)
    try {
      await borrowBook({ user_id: form.user_id, book_id: form.book_id, due_date: dueDate.toISOString() })
      toast(`Pengajuan dikirim! Jatuh tempo: ${dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`)
      setModal(false); load()
    } catch (err) { toast(err.message, 'error') }
  }

  const doAction = (action, id, label) => setConfirm({
    title: label, message: `Konfirmasi ${label.toLowerCase()} transaksi #${id}?`,
    onConfirm: async () => {
      try { 
        const res = await action(id); 
        if (label === 'Kembalikan' && res?.status === 'overdue') {
          toast('Catatan: Terlambat dikembalikan. Denda ditambahkan.', 'error')
          setTimeout(() => onNav?.('fines'), 1500)
        } else {
          toast(`${label} berhasil`) 
        }
      }
      catch (err) { toast(err.message, 'error') }
      finally { setConfirm(null); load() }
    },
  })

  const STATUS_TABS = [
    { v: '', l: 'Semua' }, { v: 'pending', l: 'Menunggu' }, { v: 'borrowed', l: 'Dipinjam' },
    { v: 'returned', l: 'Dikembalikan' }, { v: 'overdue', l: 'Terlambat' },
    { v: 'rejected', l: 'Ditolak' }, { v: 'lost', l: 'Hilang' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaksi Peminjaman</h1>
          <p className="page-sub">{total} transaksi total</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openBorrowModal}>+ Ajukan Pinjam</button>
        )}
      </div>

      <div className="filter-pills" style={{ marginBottom: 20 }}>
        {STATUS_TABS.map(s => (
          <button key={s.v} className={`filter-pill${statusF === s.v ? ' active' : ''}`}
            onClick={() => setStatusF(s.v)}>{s.l}</button>
        ))}
      </div>

      {/* Banner info: admin melihat jumlah pengajuan pending */}
      {isAdmin && trxs.filter(t => t.status === 'pending').length > 0 && statusF === '' && (
        <div className="alert alert-warning" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📋</span>
          <div>
            <strong>{trxs.filter(t => t.status === 'pending').length} pengajuan peminjaman</strong> menunggu persetujuan.
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 10 }}
              onClick={() => setStatusF('pending')}>
              Lihat sekarang →
            </button>
          </div>
        </div>
      )}
      {/* Banner info: admin melihat buku terlambat (masih dipinjam tapi lewat waktu) */}
      {isAdmin && trxs.filter(t => t.status === 'borrowed' && new Date() > new Date(t.due_date)).length > 0 && statusF === '' && (
        <div className="alert alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <strong>{trxs.filter(t => t.status === 'borrowed' && new Date() > new Date(t.due_date)).length} buku lewat batas waktu!</strong> Harap hubungi peminjam.
          </div>
        </div>
      )}
      {/* Banner info: admin mendapat denda belum lunas */}
      {isAdmin && statusF === '' && (
        <div className="alert alert-info" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>💳</span>
          <div>
            Transaksi yang dilaporkan Hilang atau Dikembalikan Terlambat otomatis pindah ke 
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 10 }}
              onClick={() => onNav?.('fines')}>
              Halaman Denda →
            </button>
          </div>
        </div>
      )}
      {/* Banner info: member melihat status pengajuannya */}
      {!isAdmin && trxs.filter(t => t.status === 'pending').length > 0 && statusF === '' && (
        <div className="alert alert-warning" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⏳</span>
          <div>
            <strong>{trxs.filter(t => t.status === 'pending').length} pengajuan peminjaman</strong> kamu sedang menunggu persetujuan admin.
          </div>
        </div>
      )}
      {!isAdmin && trxs.filter(t => t.status === 'borrowed' && new Date() > new Date(t.due_date)).length > 0 && statusF === '' && (
        <div className="alert alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div>
            <strong>{trxs.filter(t => t.status === 'borrowed' && new Date() > new Date(t.due_date)).length} buku</strong> kamu melewati jatuh tempo! Segera kembalikan di bawah ini, atau denda akan diberikan.
          </div>
        </div>
      )}

      {loading ? <Spinner /> : visibleTrxs.length === 0 ? (
        <Empty icon="📋" title="Tidak ada transaksi"
          sub={statusF ? 'Coba filter lain' : 'Belum ada peminjaman aktif'} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {isAdmin && <th>Peminjam</th>}
                <th>Buku Dipinjam</th>
                <th>Tgl Pinjam</th>
                <th>Jatuh Tempo</th>
                <th>Sisa Waktu</th>
                <th>Tgl Kembali</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visibleTrxs.map(t => {
                const badge = trxBadge[t.status] || { cls: 'badge-slate', label: t.status }
                const cd    = (t.status === 'borrowed' || t.status === 'overdue') ? countdown(t.due_date) : null
                return (
                  <tr key={t.transaction_id}>
                    {isAdmin && (
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{userName(t)}</div>
                        <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>#{t.user_id}</div>
                      </td>
                    )}

                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 200 }}>{bookName(t)}</div>
                      <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>Trx #{t.transaction_id}</div>
                    </td>

                    <td style={{ fontSize: 12, color: 'var(--c-text2)', whiteSpace: 'nowrap' }}>
                      {fmtDate(t.borrow_date)}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--c-text2)', whiteSpace: 'nowrap' }}>
                      {fmtDate(t.due_date)}
                    </td>

                    <td>
                      {cd ? (
                        <span style={{ fontSize: 12, fontWeight: 700, color: cd.color,
                          background: cd.warning ? `${cd.color}18` : 'transparent',
                          padding: cd.warning ? '2px 8px' : '0',
                          borderRadius: cd.warning ? 99 : 0 }}>
                          {cd.text}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--c-text3)' }}>—</span>
                      )}
                    </td>

                    <td style={{ fontSize: 12, color: 'var(--c-text2)', whiteSpace: 'nowrap' }}>
                      {t.return_date ? fmtDate(t.return_date) : '—'}
                    </td>

                    <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>

                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {/* ADMIN: pending → Setujui + Tolak */}
                        {isAdmin && t.status === 'pending' && (
                          <>
                            <button className="btn btn-primary btn-sm"
                              onClick={() => doAction(approveTransaction, t.transaction_id, 'Setujui')}>
                              ✔ Setujui
                            </button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => doAction(rejectTransaction, t.transaction_id, 'Tolak')}>
                              ✕ Tolak
                            </button>
                          </>
                        )}
                        {/* ADMIN: borrowed → Kembalikan + Hilang */}
                        {isAdmin && t.status === 'borrowed' && (
                          <>
                            <button className="btn btn-ghost btn-sm"
                              onClick={() => doAction(returnBook, t.transaction_id, 'Kembalikan')}>
                              ↩ Kembalikan
                            </button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => setConfirm({
                                title: 'Lapor Buku Hilang',
                                message: `Laporkan "${bookName(t)}" hilang? Stok akan dikurangkan secara permanen dan otomatis dibuatkan denda Rp 100.000 ke menu Denda.`,
                                onConfirm: async () => {
                                  try { 
                                    await reportBookLost(t.transaction_id); 
                                    toast('Buku dilaporkan hilang. Masuk ke halaman denda.', 'error')
                                    setTimeout(() => onNav?.('fines'), 1500)
                                  } catch (err) { toast(err.message, 'error') }
                                  finally { setConfirm(null); load() }
                                },
                              })}>
                              📦 Hilang
                            </button>
                          </>
                        )}
                        {/* MEMBER: borrowed → Kembalikan + Hilang */}
                        {!isAdmin && t.status === 'borrowed' && (
                          <>
                            <button className="btn btn-ghost btn-sm"
                              onClick={() => setConfirm({
                                title: 'Kembalikan Buku',
                                message: `Konfirmasi pengembalian "${bookName(t)}"? Jika lewat jatuh tempo, Anda akan diarahkan ke layar Denda.`,
                                onConfirm: async () => {
                                  try { 
                                    const res = await returnBook(t.transaction_id); 
                                    if (res?.status === 'overdue') {
                                      toast('Dikembalikan terlambat! Segera lunasi denda.', 'error')
                                      setTimeout(() => onNav?.('fines'), 1500)
                                    } else {
                                      toast('Buku berhasil dikembalikan') 
                                    }
                                  } catch (err) { toast(err.message, 'error') }
                                  finally { setConfirm(null); load() }
                                }
                              })}>
                              ↩ Kembalikan
                            </button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => setConfirm({
                                title: 'Lapor Buku Hilang',
                                message: `Laporkan "${bookName(t)}" sebagai hilang? Anda otomatis akan dikenakan Denda sebesar Rp 100.000 di halaman Denda. Lanjutkan?`,
                                onConfirm: async () => {
                                  try { 
                                    await reportBookLost(t.transaction_id); 
                                    toast('Berhasil dilaporkan. Silakan bayar di layar Denda.', 'error')
                                    setTimeout(() => onNav?.('fines'), 1500)
                                  } catch (err) { toast(err.message, 'error') }
                                  finally { setConfirm(null); load() }
                                },
                              })}>
                              📦 Hilang
                            </button>
                          </>
                        )}
                        {/* MEMBER: overdue blocks removed since it's filtered visually */}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Ajukan Pinjam — Admin only */}
      {modal && (
        <Modal title="Ajukan Peminjaman" onClose={() => setModal(false)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={doSubmitBorrow}
                disabled={!form.book_id || !form.user_id}>
                Ajukan (7 hari)
              </button>
            </>
          }>
          

          {/* Pilih pengguna */}
          <Field label="Pengguna *">
            <Select value={form.user_id} onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))}>
              <option value="">— Pilih pengguna —</option>
              {adminUsers.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </Select>
            {adminUsers.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 4 }}>Memuat daftar pengguna…</div>
            )}
          </Field>

          {/* FIX: Cari buku — dropdown selalu tampil, tidak perlu klik dulu */}
          <Field label="Buku *" hint="Ketik nama/pengarang untuk menyaring, atau pilih langsung dari daftar">
            <Input
              value={bookSearch}
              onChange={e => {
                setBookSearch(e.target.value)
                // Reset pilihan buku jika user mengetik ulang
                if (form.book_id) {
                  const selectedBook = bookList.find(b => b.book_id === form.book_id)
                  setForm(p => ({ ...p, book_id: '' }))
                  }
                }
              }
              placeholder="Ketik nama buku atau pengarang…"
              autoFocus={false}
            />

            {/* Buku terpilih */}
            {form.book_id && (() => {
              const sel = bookList.find(b => b.book_id === form.book_id)
              return sel ? (
                <div style={{ marginTop: 6, padding: '8px 12px', background: 'var(--c-accentbg)',
                  border: '1.5px solid var(--c-accent)', borderRadius: 'var(--r-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-accent2)' }}>✓ {sel.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>
                      {sel.author} · stok: {sel.available_stock}
                      {sel.available_stock === 0 && <span style={{ color: '#dc2626', fontWeight: 700 }}> ⚠ Habis</span>}
                    </div>
                  </div>
                  <button onClick={() => { setForm(p => ({ ...p, book_id: '' })); setBookSearch('') }}
                    style={{ background: 'none', border: 'none', color: 'var(--c-text3)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>✕</button>
                </div>
              ) : null
            })()}

            {/* Dropdown buku — selalu tampil saat belum ada buku terpilih */}
            {!form.book_id && (
              <div style={{
                marginTop: 4,
                border: '1.5px solid var(--c-border)',
                borderRadius: 'var(--r-md)',
                background: 'var(--c-surface)',
                maxHeight: 220, overflowY: 'auto',
                boxShadow: 'var(--sh-sm)',
              }}>
                {bookList.length === 0 ? (
                  <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--c-text3)', textAlign: 'center' }}>
                    Memuat daftar buku…
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--c-text3)', textAlign: 'center' }}>
                    Tidak ada buku tersedia dengan kata kunci ini
                  </div>
                ) : filteredBooks.slice(0, 10).map(b => (
                  <button key={b.book_id}
                    onClick={() => { setForm(p => ({ ...p, book_id: b.book_id })); setBookSearch(b.title) }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 14px',
                      border: 'none', borderBottom: '1px solid var(--c-border)',
                      background: 'transparent', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: 'var(--c-text)', fontFamily: 'inherit',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--c-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{b.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 1 }}>{b.author}</div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 8,
                      color: b.available_stock > 0 ? '#16a34a' : '#dc2626',
                    }}>
                      {b.available_stock > 0 ? `✓ ${b.available_stock} stok` : 'Habis'}
                    </span>
                  </button>
                ))}
                {filteredBooks.length > 10 && (
                  <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--c-text3)', textAlign: 'center' }}>
                    +{filteredBooks.length - 10} buku lainnya. Ketik lebih spesifik.
                  </div>
                )}
              </div>
            )}
          </Field>
        </Modal>
      )}
      {confirm && <Confirm {...confirm} onCancel={() => setConfirm(null)} />}
    </div>
  )
}


export default TransactionsPage;
