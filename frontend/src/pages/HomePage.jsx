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

function HomePage({ user, onNav, toast }) {
  const [inputVal, setInput]          = useState('')
  const [search, setSearch]           = useState('')
  const [filterCat, setFilterCat]     = useState('')
  const [filterGenre, setFilterGenre] = useState('')
  const [sortBy, setSortBy]           = useState('default')
  const [cats, setCats]               = useState([])
  const [genres, setGenres]           = useState([])
  const [detailBook, setDetailBook]   = useState(null)
  const [borrowModal, setBorrowModal] = useState(null)
  const [borrowing, setBorrowing]     = useState(false)
  const { books, loading, error }     = useBooks(search)

  useEffect(() => {
    fetchCategories().then(d => setCats(d || []))
    fetchGenres().then(d => setGenres(d || []))
  }, [])

  const filtered = books.filter(b => {
    if (filterCat   && b.category_id !== Number(filterCat))                              return false
    if (filterGenre && !b.genres?.some(g => g.genre_id === Number(filterGenre)))         return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'title-az') return a.title.localeCompare(b.title, 'id')
    if (sortBy === 'title-za') return b.title.localeCompare(a.title, 'id')
    if (sortBy === 'author')   return a.author.localeCompare(b.author, 'id')
    if (sortBy === 'year-new') return (b.publication_year || 0) - (a.publication_year || 0)
    if (sortBy === 'stock-hi') return b.available_stock - a.available_stock
    if (sortBy === 'stock-lo') return a.available_stock - b.available_stock
    return 0
  })

  const clearFilter = () => { setFilterCat(''); setFilterGenre(''); setSearch(''); setInput('') }
  const hasFilter   = filterCat || filterGenre || search

  const doSubmitBorrow = async () => {
    if (!borrowModal) return
    setBorrowing(true)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)
    try {
      await borrowBook({ user_id: user.user_id, book_id: borrowModal.book_id, due_date: dueDate.toISOString() })
      toast(`"${borrowModal.title}" berhasil diajukan! Jatuh tempo: ${dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`)
      setBorrowModal(null)
    } catch (err) { toast(err.message, 'error') }
    finally { setBorrowing(false) }
  }

  const sectionLabel = () => {
    if (filterCat)   return cats.find(c => c.category_id === Number(filterCat))?.name || 'Koleksi'
    if (filterGenre) return genres.find(g => g.genre_id === Number(filterGenre))?.name || 'Genre'
    if (search)      return `Hasil: "${search}"`
    return 'Semua Koleksi'
  }

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-label"><span>📚</span> LenteraPustaka — HEXACORE · SI ITK</div>
          <h1 className="hero-title">Temukan Buku<br /><span>Favoritmu</span></h1>
          <p className="hero-sub">Koleksi lengkap buku perpustakaan digital. Cari, pinjam, dan nikmati bacaanmu.</p>

          <div className="hero-search">
            <span className="hero-search-icon">⌕</span>
            <input
              className="hero-search-input"
              placeholder="Cari judul, pengarang, atau ISBN…"
              value={inputVal}
              onChange={e => { setInput(e.target.value); if (!e.target.value) setSearch('') }}
              onKeyDown={e => e.key === 'Enter' && setSearch(inputVal)}
            />
            {inputVal && (
              <button className="hero-search-clear" onClick={() => { setInput(''); setSearch('') }}>✕</button>
            )}
            <button className="hero-search-btn" onClick={() => setSearch(inputVal)}>Cari</button>
          </div>

          {(genres.length > 0) && (
            <div className="cat-chips">
              <button className={`cat-chip${!filterGenre ? ' active' : ''}`} onClick={clearFilter}>
                Semua
              </button>
              {genres.length > 0 && <>
                {genres.map(g => (
                  <button key={g.genre_id}
                    className={`cat-chip genre${filterGenre === String(g.genre_id) ? ' active' : ''}`}
                    onClick={() => { setFilterGenre(filterGenre === String(g.genre_id) ? '' : String(g.genre_id)); setFilterCat('') }}>
                    {g.name}
                  </button>
                ))}
              </>}
            </div>
          )}
        </div>
      </div>

      {/* ── Filter & Sort bar ─────────────────────────────────── */}
      <div className="filter-bar">
        <div className="filter-bar-inner">
          <div className="filter-bar-left">
            <h2 className="section-title" style={{ fontSize: 18, margin: 0 }}>{sectionLabel()}</h2>
            <span style={{ fontSize: 12, color: 'var(--c-text3)', marginLeft: 8 }}>{sorted.length} buku</span>
            {hasFilter && <button className="filter-clear-btn" onClick={clearFilter}>✕ Reset</button>}
          </div>
          <div className="filter-bar-right">
            <label style={{ fontSize: 12.5, color: 'var(--c-text3)', fontWeight: 600, whiteSpace: 'nowrap' }}>Urutkan:</label>
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="default">Terbaru</option>
              <option value="title-az">Judul A–Z</option>
              <option value="title-za">Judul Z–A</option>
              <option value="author">Pengarang A–Z</option>
              <option value="year-new">Tahun Terbaru</option>
              <option value="year-old">Tahun Terlama</option>
              <option value="stock-hi">Stok Terbanyak</option>
              <option value="stock-lo">Stok Tersedikit</option>
            </select>
          </div>
        </div>

        {/* ── Keterangan ikon stok buku ── */}
        <div className="stock-legend">
          <span className="stock-legend-item">
            <span className="stock-legend-badge ok">✓ 6+</span>
            <span>Stok tersedia</span>
          </span>
          <span className="stock-legend-item">
            <span className="stock-legend-badge low">⚠ 1–5</span>
            <span>Stok menipis</span>
          </span>
          <span className="stock-legend-item">
            <span className="stock-legend-badge out">Habis</span>
            <span>Tidak tersedia</span>
          </span>
        </div>
      </div>

      {/* ── Book grid ─────────────────────────────────────────── */}
      <div className="section" style={{ paddingBottom: 64 }}>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

        {loading ? <Spinner /> : sorted.length === 0 ? (
          <Empty icon={hasFilter ? '🔍' : '📚'}
            title={hasFilter ? 'Tidak ada buku yang cocok' : 'Belum ada buku'}
            sub={hasFilter ? 'Coba ubah filter atau kata kunci' : ''} />
        ) : (
          <div className="books-grid">
            {sorted.map(book => (
              <div key={book.book_id} style={{ position: 'relative' }}>
                <ItemCard book={book} onEdit={() => {}} onDelete={() => {}} isAdmin={false}
                  onClick={() => setDetailBook(book)} />
                {user && book.available_stock > 0 && (
                  <button className="book-select-btn"
                    onClick={e => { e.stopPropagation(); setBorrowModal(book) }}
                    title="Pinjam buku ini">+</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal: Detail Buku ───────────────────────────────── */}
      {detailBook && (
        <BookDetailModal
          book={detailBook}
          cats={cats}
          onClose={() => setDetailBook(null)}
          isLoggedIn={!!user}
          onBorrow={user ? (b) => { setDetailBook(null); setBorrowModal(b) } : null}
        />
      )}

      {/* ── Modal: Konfirmasi Pinjam 1 Buku ──────────────────── */}
      {borrowModal && (
        <div className="modal-overlay" onClick={() => !borrowing && setBorrowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Konfirmasi Peminjaman</h3>
              <button className="modal-close" onClick={() => setBorrowModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '12px 14px', background: 'var(--c-bg)', borderRadius: 10,
                border: '1px solid var(--c-border)', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text3)',
                  textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Buku yang dipinjam</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-text)' }}>{borrowModal.title}</div>
                <div style={{ fontSize: 12, color: 'var(--c-text3)', marginTop: 2 }}>{borrowModal.author}</div>
                <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4, fontWeight: 600 }}>
                  ✓ Stok tersedia: {borrowModal.available_stock}
                </div>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--c-bg)', borderRadius: 10,
                border: '1px solid var(--c-border)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="avatar avatar-sm">{user?.full_name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.full_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-text3)' }}>{user?.email}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setBorrowModal(null)} disabled={borrowing}>Batal</button>
              <button className="btn btn-primary" onClick={doSubmitBorrow} disabled={borrowing}>
                {borrowing ? 'Mengajukan…' : 'Ajukan Pinjam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default HomePage;
