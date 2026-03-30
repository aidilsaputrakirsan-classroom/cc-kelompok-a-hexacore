// ============================================================
// App.jsx — LenteraPustaka v0.4.1
// Pure CSS · No Tailwind · No injectCSS · Vite + React
// Disinkronkan dengan backend/main.py
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

import Header    from './components/Header'
import ItemForm  from './components/ItemForm'
import ItemCard, { BookDetailModal } from './components/ItemCard'
import SearchBar from './components/SearchBar'
import ItemList  from './components/ItemList'
import {
  Spinner, Empty, Modal, Field, Input, Select, Textarea,
  StatCard, ToastContainer, Confirm,
} from './components/ui/Common'

import { useToast } from './hooks/useToast'
import { useBooks } from './hooks/useBooks'
import {
  fmt, fmtDate, validatePassword, pwStrength,
  trxBadge, fineBadge,
} from './utils/formatters'

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
} from './services/api'

// ══════════════════════════════════════════════════════════════
//  LOGIN PAGE
// ══════════════════════════════════════════════════════════════
function LoginPage({ onLogin, toast, initialTab = 'login', onBack }) {
  const [tab, setTab]         = useState(initialTab)
  const [form, setForm]       = useState({ email: '', password: '', full_name: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const f = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })) }
  const strength = pwStrength(form.password)
  const onKey = e => { if (e.key === 'Enter') submit() }

  const submit = async () => {
    const e = {}
    if (!form.email)    e.email    = 'Email wajib diisi'
    if (!form.password) e.password = 'Password wajib diisi'
    if (tab === 'register') {
      if (!form.full_name) e.full_name = 'Nama wajib diisi'
      const pe = validatePassword(form.password)
      if (pe.length) e.password = pe[0]
    }
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    try {
      if (tab === 'register') {
        await register({ email: form.email, password: form.password, full_name: form.full_name })
        toast('Akun berhasil dibuat! Sedang masuk…')
        const data = await login(form.email, form.password)
        onLogin(data.user)
      } else {
        const data = await login(form.email, form.password)
        onLogin(data.user)
      }
    } catch (err) { setErrors({ submit: err.message }) }
    finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left-inner">
          <h1 className="login-left-title">
            Temukan Buku<br /><span>Favoritmu</span><br />Di Sini
          </h1>
          <p className="login-left-desc">
            Sistem perpustakaan digital untuk meminjam, mengelola koleksi, dan melacak transaksi secara efisien.
          </p>
          {['Manajemen buku & kategori lengkap', 'Alur peminjaman dengan approval admin', 'Pelacakan denda otomatis', 'Akses sesuai peran pengguna'].map(t => (
            <div key={t} className="login-feature">
              <div className="login-feature-dot" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-brand-title">LenteraPustaka</h2>
          <p className="login-brand-sub">HEXACORE · Institut Teknologi Kalimantan</p>

          {onBack && (
            <button
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: 'var(--c-text3)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              ← Kembali ke Beranda
            </button>
          )}

          <div className="login-tabs">
            {['login', 'register'].map(t => (
              <button
                key={t}
                className={`login-tab${tab === t ? ' active' : ''}`}
                onClick={() => { setTab(t); setErrors({}) }}
              >
                {t === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          {errors.submit && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>{errors.submit}</div>
          )}

          {tab === 'register' && (
            <Field label="Nama Lengkap" error={errors.full_name}>
              <Input value={form.full_name} onChange={f('full_name')} onKeyDown={onKey} placeholder="Nama lengkap" error={errors.full_name} autoFocus />
            </Field>
          )}

          <Field label="Email" error={errors.email}>
            <Input type="email" value={form.email} onChange={f('email')} onKeyDown={onKey} placeholder="nama@student.itk.ac.id" error={errors.email} autoFocus={tab === 'login'} />
          </Field>

          <Field label="Password" error={errors.password}
            hint={tab === 'register' ? 'Min. 8 karakter, huruf besar+kecil+angka+spesial' : undefined}>
            <Input type="password" value={form.password} onChange={f('password')} onKeyDown={onKey} placeholder="Password" error={errors.password} />
            {tab === 'register' && form.password && (
              <div style={{ marginTop: 6 }}>
                <div className="pw-bars">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="pw-bar" style={{ background: i <= strength.score ? strength.color : undefined }} />
                  ))}
                </div>
                <span className="pw-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </Field>

          <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }}
            onClick={submit} disabled={loading}>
            {loading ? 'Memproses…' : tab === 'login' ? 'Masuk' : 'Buat Akun'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  HOME PAGE
// ══════════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════════
//  DASHBOARD (Admin)
// ══════════════════════════════════════════════════════════════
function DashboardPage({ toast }) {
  const [stats, setStats]     = useState(null)
  const [trxs, setTrxs]       = useState([])
  const [fines, setFines]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchBookStats(), fetchTransactions('', 100), fetchFines(null, 100)])
      .then(([s, t, f]) => {
        setStats(s); setTrxs(t?.transactions || []); setFines(f?.fines || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const stockData = stats ? [
    { name: 'Tersedia',  value: stats.available_stock, fill: '#22c55e' },
    { name: 'Dipinjam',  value: stats.borrowed_count,  fill: '#3b82f6' },
    { name: 'Terlambat', value: stats.overdue_count,   fill: '#ef4444' },
  ].filter(d => d.value > 0) : []

  const trxCount = {}
  trxs.forEach(t => { trxCount[t.status] = (trxCount[t.status] || 0) + 1 })
  const trxData = Object.entries(trxCount).map(([k, v]) => ({ status: trxBadge[k]?.label || k, count: v }))

  const fineCount = {}
  fines.forEach(f => { fineCount[f.status] = (fineCount[f.status] || 0) + 1 })
  const fineData = Object.entries(fineCount).map(([k, v]) => ({ status: fineBadge[k]?.label || k, count: v }))

  const C = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#94a3b8']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Ringkasan statistik sistem perpustakaan</p>
        </div>
      </div>

      {stats && (
        <div className="grid-stats">
          <StatCard label="Total Judul"   value={stats.total_titles}    accentColor="#3b82f6" />
          <StatCard label="Total Stok"    value={stats.total_stock}     accentColor="#8b5cf6" />
          <StatCard label="Tersedia"      value={stats.available_stock} accentColor="#22c55e" />
          <StatCard label="Dipinjam"      value={stats.borrowed_count}  accentColor="#f59e0b" />
          <StatCard label="Terlambat"     value={stats.overdue_count}   accentColor="#ef4444" />
          <StatCard label="Total Denda"   value={fines.length}          accentColor="#94a3b8" />
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">Distribusi Stok Buku</div>
          {stockData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stockData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {stockData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip formatter={v => [v, 'Buku']} />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty icon="📊" title="Belum ada data" />}
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Status Transaksi</div>
          {trxData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trxData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Jumlah" radius={[4, 4, 0, 0]}>
                  {trxData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty icon="📊" title="Belum ada transaksi" />}
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-title">Status Denda</div>
        {fineData.length ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={fineData} layout="vertical" margin={{ left: 100, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" name="Jumlah" radius={[0, 4, 4, 0]}>
                {fineData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty icon="💰" title="Belum ada denda" />}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  BOOKS ADMIN
// ══════════════════════════════════════════════════════════════
function BooksAdminPage({ toast }) {
  const [search, setSearch]       = useState('')
  const [sortBy, setSortBy]       = useState('default')
  const [cats, setCats]           = useState([])
  const [genres, setGenres]       = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)
  const [confirm, setConfirm]     = useState(null)
  const { books, total, loading, error, reload } = useBooks(search)

  useEffect(() => {
    fetchCategories().then(setCats).catch(() => toast('Gagal memuat kategori', 'error'))
    fetchGenres().then(setGenres).catch(() => toast('Gagal memuat genre', 'error'))
  }, [])

  const sorted = [...books].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title, 'id')
    if (sortBy === 'stock') return b.available_stock - a.available_stock
    return 0
  })

  const handleSave = async (data, editId) => {
    try {
      if (editId) { await updateBook(editId, data); toast('Buku diperbarui') }
      else        { await createBook(data);         toast('Buku ditambahkan') }
      setEditing(null); reload()
    } catch (err) { toast(err.message, 'error') }
  }

  const handleDelete = id => setConfirm({
    title: 'Hapus Buku', message: 'Yakin ingin menghapus buku ini?',
    onConfirm: async () => {
      try { await deleteBook(id); toast('Buku dihapus') }
      catch (err) { toast(err.message, 'error') }
      finally { setConfirm(null); reload() }
    },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Buku</h1>
          <p className="page-sub">{total} judul dalam inventaris</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          + Tambah Buku
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <SearchBar onSearch={setSearch} placeholder="Cari judul, pengarang, ISBN…" />
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          ⚠️ Gagal memuat buku — {error}
        </div>
      )}
      <ItemList
        books={sorted} total={total}
        onEdit={b => { setEditing(b); setShowForm(true) }}
        onDelete={handleDelete}
        loading={loading} searchQuery={search}
        sortBy={sortBy} onSortChange={setSortBy}
        isAdmin={true}
      />

      <ItemForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        editingItem={editing} categories={cats} genres={genres}
        onSave={handleSave}
      />

      {confirm && <Confirm {...confirm} danger onCancel={() => setConfirm(null)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  CATEGORIES
// ══════════════════════════════════════════════════════════════
function CategoriesPage({ isAdmin, toast }) {
  const [cats, setCats]       = useState([])
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState(null)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({ name: '', description: '' })
  const [confirm, setConfirm] = useState(null)

  const load = () => {
    setLoading(true); setLoadErr(null)
    fetchCategories()
      .then(d => { setCats(d || []); setLoading(false) })
      .catch(err => { setLoadErr(err.message); setLoading(false) })
  }
  useEffect(() => { load() }, [])
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    if (!form.name.trim()) { toast('Nama kategori wajib diisi', 'error'); return }
    try {
      if (modal === 'add') { await createCategory(form); toast('Kategori ditambahkan') }
      else { await updateCategory(modal.category_id, form); toast('Kategori diperbarui') }
      setModal(null); setForm({ name: '', description: '' }); load()
    } catch (err) { toast(err.message, 'error') }
  }

  const del = c => setConfirm({
    title: 'Hapus Kategori', message: `Yakin hapus "${c.name}"?`,
    onConfirm: async () => {
      try { await deleteCategory(c.category_id); toast('Dihapus'); setConfirm(null); load() }
      catch (err) { toast(err.message, 'error'); setConfirm(null) }
    },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kategori Buku</h1>
          <p className="page-sub">{cats.length} kategori terdaftar</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setModal('add'); setForm({ name: '', description: '' }) }}>
            + Tambah Kategori
          </button>
        )}
      </div>

      {loadErr && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {loadErr}</div>}

      {loading ? <Spinner /> : cats.length === 0 ? <Empty icon="🏷️" title="Belum ada kategori" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Nama</th><th>Deskripsi</th>{isAdmin && <th style={{ width: 120 }}>Aksi</th>}</tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.category_id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: 'var(--c-text2)' }}>{c.description || '—'}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setModal(c); setForm({ name: c.name, description: c.description || '' }) }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(c)}>Hapus</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'Tambah Kategori' : 'Edit Kategori'} onClose={() => setModal(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-primary" onClick={save} disabled={!form.name.trim()}>Simpan</button>
            </>
          }>
          <Field label="Nama *">
            <Input value={form.name} onChange={f('name')} placeholder="misal: Fiksi, Sains…" autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && form.name.trim()) save() }} />
          </Field>
          <Field label="Deskripsi" optional>
            <Textarea value={form.description} onChange={f('description')} rows={3} placeholder="Deskripsi singkat…" />
          </Field>
        </Modal>
      )}
      {confirm && <Confirm {...confirm} danger onCancel={() => setConfirm(null)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  GENRES
// ══════════════════════════════════════════════════════════════
function GenresPage({ isAdmin, toast }) {
  const [genres, setGenres]   = useState([])
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState(null)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({ name: '', description: '' })
  const [confirm, setConfirm] = useState(null)

  const load = () => {
    setLoading(true); setLoadErr(null)
    fetchGenres()
      .then(d => { setGenres(d || []); setLoading(false) })
      .catch(err => { setLoadErr(err.message); setLoading(false) })
  }
  useEffect(() => { load() }, [])
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    if (!form.name.trim()) { toast('Nama genre wajib diisi', 'error'); return }
    try {
      if (modal === 'add') { await createGenre(form); toast('Genre ditambahkan') }
      else { await updateGenre(modal.genre_id, form); toast('Genre diperbarui') }
      setModal(null); setForm({ name: '', description: '' }); load()
    } catch (err) { toast(err.message, 'error') }
  }

  const del = g => setConfirm({
    title: 'Hapus Genre', message: `Yakin hapus "${g.name}"?`,
    onConfirm: async () => {
      try { await deleteGenre(g.genre_id); toast('Dihapus'); setConfirm(null); load() }
      catch (err) { toast(err.message, 'error'); setConfirm(null) }
    },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Genre Buku</h1>
          <p className="page-sub">{genres.length} genre terdaftar</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setModal('add'); setForm({ name: '', description: '' }) }}>
            + Tambah Genre
          </button>
        )}
      </div>

      {loadErr && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {loadErr}</div>}

      {loading ? <Spinner /> : genres.length === 0 ? <Empty icon="🎭" title="Belum ada genre" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Deskripsi</th>{isAdmin && <th style={{ width: 120 }}>Aksi</th>}</tr></thead>
            <tbody>
              {genres.map(g => (
                <tr key={g.genre_id}>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td style={{ color: 'var(--c-text2)' }}>{g.description || '—'}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setModal(g); setForm({ name: g.name, description: g.description || '' }) }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(g)}>Hapus</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'Tambah Genre' : 'Edit Genre'} onClose={() => setModal(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-primary" onClick={save} disabled={!form.name.trim()}>Simpan</button>
            </>
          }>
          <Field label="Nama *">
            <Input value={form.name} onChange={f('name')} placeholder="misal: Horor, Romance…" autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && form.name.trim()) save() }} />
          </Field>
          <Field label="Deskripsi" optional>
            <Textarea value={form.description} onChange={f('description')} rows={3} placeholder="Deskripsi singkat…" />
          </Field>
        </Modal>
      )}
      {confirm && <Confirm {...confirm} danger onCancel={() => setConfirm(null)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  TRANSACTIONS
// ══════════════════════════════════════════════════════════════
function TransactionsPage({ user, toast }) {
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

  const bookName = (id) => {
    const found = bookList.find(b => b.book_id === Number(id))
    return found ? found.title : `Buku #${id}`
  }
  const userName = (id) => {
    const found = adminUsers.find(u => u.user_id === Number(id))
    return found ? found.full_name : `User #${id}`
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
      try { await action(id); toast(`${label} berhasil`) }
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
      {/* Banner info: admin melihat buku terlambat */}
      {isAdmin && trxs.filter(t => t.status === 'overdue').length > 0 && statusF === '' && (
        <div className="alert alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <strong>{trxs.filter(t => t.status === 'overdue').length} buku terlambat</strong> dikembalikan.
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 10 }}
              onClick={() => setStatusF('overdue')}>
              Lihat sekarang →
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
      {!isAdmin && trxs.filter(t => t.status === 'overdue').length > 0 && statusF === '' && (
        <div className="alert alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div>
            <strong>{trxs.filter(t => t.status === 'overdue').length} buku</strong> kamu melewati jatuh tempo! Segera kembalikan untuk menghindari denda tambahan.
          </div>
        </div>
      )}

      {loading ? <Spinner /> : trxs.length === 0 ? (
        <Empty icon="📋" title="Tidak ada transaksi"
          sub={statusF ? 'Coba filter lain' : 'Belum ada peminjaman'} />
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
              {trxs.map(t => {
                const badge = trxBadge[t.status] || { cls: 'badge-slate', label: t.status }
                const cd    = (t.status === 'borrowed' || t.status === 'overdue') ? countdown(t.due_date) : null
                return (
                  <tr key={t.transaction_id}>
                    {isAdmin && (
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{userName(t.user_id)}</div>
                        <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>#{t.user_id}</div>
                      </td>
                    )}

                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 200 }}>{bookName(t.book_id)}</div>
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
                        {/* ADMIN: borrowed → hanya Kembalikan */}
                        {isAdmin && t.status === 'borrowed' && (
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => doAction(returnBook, t.transaction_id, 'Kembalikan')}>
                            ↩ Kembalikan
                          </button>
                        )}
                        {/* ADMIN: overdue → Kembalikan + Laporkan Hilang */}
                        {isAdmin && t.status === 'overdue' && (
                          <>
                            <button className="btn btn-ghost btn-sm"
                              onClick={() => doAction(returnBook, t.transaction_id, 'Kembalikan')}>
                              ↩ Kembalikan
                            </button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => setConfirm({
                                title: 'Laporkan Buku Hilang',
                                message: `Laporkan "${bookName(t.book_id)}" sebagai hilang? Stok berkurang 1 dan denda Rp 100.000 dibuat otomatis.`,
                                onConfirm: async () => {
                                  try { await reportBookLost(t.transaction_id); toast('Buku dilaporkan hilang') }
                                  catch (err) { toast(err.message, 'error') }
                                  finally { setConfirm(null); load() }
                                },
                              })}>
                              📦 Hilang
                            </button>
                          </>
                        )}
                        {/* MEMBER: borrowed → hanya Kembalikan */}
                        {!isAdmin && t.status === 'borrowed' && (
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => setConfirm({
                              title: 'Kembalikan Buku',
                              message: `Konfirmasi pengembalian "${bookName(t.book_id)}"?`,
                              onConfirm: async () => {
                                try { await returnBook(t.transaction_id); toast('Buku berhasil dikembalikan') }
                                catch (err) { toast(err.message, 'error') }
                                finally { setConfirm(null); load() }
                              }
                            })}>
                            ↩ Kembalikan
                          </button>
                        )}
                        {/* MEMBER: overdue → Kembalikan + Laporkan Hilang */}
                        {!isAdmin && t.status === 'overdue' && (
                          <>
                            <button className="btn btn-ghost btn-sm"
                              onClick={() => setConfirm({
                                title: 'Kembalikan Buku',
                                message: `Konfirmasi pengembalian "${bookName(t.book_id)}"? Denda keterlambatan akan dihitung otomatis.`,
                                onConfirm: async () => {
                                  try { await returnBook(t.transaction_id); toast('Buku dikembalikan, cek denda') }
                                  catch (err) { toast(err.message, 'error') }
                                  finally { setConfirm(null); load() }
                                }
                              })}>
                              ↩ Kembalikan
                            </button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => setConfirm({
                                title: 'Laporkan Buku Hilang',
                                message: `Laporkan "${bookName(t.book_id)}" sebagai hilang? Denda Rp 100.000 akan dikenakan.`,
                                onConfirm: async () => {
                                  try { await reportBookLost(t.transaction_id); toast('Buku dilaporkan hilang') }
                                  catch (err) { toast(err.message, 'error') }
                                  finally { setConfirm(null); load() }
                                },
                              })}>
                              📦 Hilang
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

// ══════════════════════════════════════════════════════════════
//  FINES
//  Upload file dari device ke /upload/fines
// ══════════════════════════════════════════════════════════════
function FinesPage({ user, toast }) {
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

  const totalUnpaid = fines.filter(f => f.status === 'unpaid').reduce((a, f) => a + f.amount, 0)

  const TABS = [
    { v: null,                  l: 'Semua'      },
    { v: 'unpaid',              l: 'Belum Bayar' },
    { v: 'pending_verification', l: 'Verifikasi'  },
    { v: 'paid',                l: 'Lunas'       },
    { v: 'rejected',            l: 'Ditolak'     },
  ]

  // Upload file ke backend /upload/fines
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
    return data.url  // returns /static/fines/uuid.ext
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
        // Buat full URL dari path relatif
        finalUrl = uploadedPath.startsWith('http') ? uploadedPath : `${API_BASE}${uploadedPath}`
      } else {
        finalUrl = proofUrl.trim()
        if (!finalUrl) { toast('URL bukti wajib diisi', 'error'); setSubmitting(false); return }
        if (!finalUrl.startsWith('http')) { toast('URL harus diawali https://...', 'error'); setSubmitting(false); return }
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
          <h1 className="page-title">Denda Keterlambatan</h1>
          <p className="page-sub">{total} denda tercatat</p>
        </div>
      </div>

      <div className="fine-banner">
        <div>
          <div className="fine-banner-val" style={{ color: 'var(--c-red)' }}>{fmt(totalUnpaid)}</div>
          <div className="fine-banner-lbl">Belum Bayar</div>
        </div>
        <div>
          <div className="fine-banner-val">{fines.filter(f => f.status === 'pending_verification').length}</div>
          <div className="fine-banner-lbl">Menunggu Verifikasi</div>
        </div>
        <div>
          <div className="fine-banner-val">{fines.filter(f => f.status === 'paid').length}</div>
          <div className="fine-banner-lbl">Lunas</div>
        </div>
        <div>
          <div className="fine-banner-val">{total}</div>
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

      {loading ? <Spinner /> : fines.length === 0 ? (
        <Empty icon="🎉" title="Tidak ada denda!" sub={statusF ? 'Coba filter lain' : 'Semua buku dikembalikan tepat waktu'} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Transaksi</th><th>Jumlah Denda</th>
                <th>Status</th><th>Bukti Bayar</th><th>Catatan Admin</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fines.map(f => {
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

      {/* Modal: Kirim Bukti Pembayaran — dengan upload file */}
      {proofModal && (
        <Modal title="Kirim Bukti Pembayaran" onClose={() => { setProofModal(null); setProofFile(null); setProofUrl('') }} size="sm"
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
            <strong>Total Denda: {fmt(proofModal.amount)}</strong>
            {proofModal.status === 'rejected' && proofModal.rejection_note && (
              <p style={{ marginTop: 6, fontSize: 12 }}>
                ⚠️ Ditolak sebelumnya: <em>{proofModal.rejection_note}</em>
              </p>
            )}
          </div>

          {/* Toggle mode upload */}
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
                  if (file && file.type.startsWith('image/')) {
                    setProofFile(file)
                    e.currentTarget.style.borderColor = 'var(--c-green)'
                  } else {
                    toast('Hanya file gambar yang diizinkan', 'error')
                  }
                }}>
                <input
                  id="proof-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) setProofFile(file)
                  }}
                />
                {proofFile ? (
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>{proofFile.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>
                      {(proofFile.size / 1024).toFixed(1)} KB
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setProofFile(null) }}
                      style={{ marginTop: 8, fontSize: 11, color: 'var(--c-red)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Ganti file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8, opacity: .5 }}>📸</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)' }}>Klik atau seret file ke sini</div>
                    <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 4 }}>JPG, PNG, JPEG</div>
                  </div>
                )}
              </div>
            </Field>
          ) : (
            <Field label="URL Bukti Transfer *"
              hint="Contoh: https://drive.google.com/file/d/... atau https://imgur.com/...">
              <Input
                value={proofUrl}
                onChange={e => setProofUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
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
              <button className="btn btn-danger" disabled={!rejectNote.trim() || submitting}
                onClick={doReject}>
                {submitting ? 'Memproses…' : 'Tolak Bukti'}
              </button>
            </>
          }>
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            Denda #{rejectModal.fine_id} — <strong>{fmt(rejectModal.amount)}</strong>
          </div>
          <Field label="Alasan Penolakan *" hint="Member akan melihat alasan ini">
            <Textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              rows={3}
              placeholder="misal: foto buram, nominal kurang, rekening berbeda…"
              autoFocus
            />
          </Field>
        </Modal>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  USERS
// ══════════════════════════════════════════════════════════════
function UsersPage({ toast }) {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadErr, setLoadErr]     = useState(null)
  const [addModal, setAddModal]   = useState(false)
  const [form, setForm]           = useState({ full_name: '', email: '', password: '', role: 'member' })
  const [pwErrs, setPwErrs]       = useState([])
  const [confirm, setConfirm]     = useState(null)
  // Poin 1: state untuk detail modal dan edit modal
  const [detailUser, setDetailUser]     = useState(null)
  const [editUser, setEditUser]         = useState(null)
  const [editForm, setEditForm]         = useState({ full_name: '', role: 'member' })
  // Gap 4: state untuk admin reset password
  const [resetPwModal, setResetPwModal] = useState(null)   // object user { user_id, full_name }
  const [resetPwForm, setResetPwForm]   = useState('')
  const [resetPwErrs, setResetPwErrs]   = useState([])

  const load = () => {
    setLoading(true); setLoadErr(null)
    fetchUsers()
      .then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(err => { setLoadErr(err.message); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const f = k => e => {
    const v = e.target.value
    setForm(p => ({ ...p, [k]: v }))
    if (k === 'password') setPwErrs(v ? validatePassword(v) : [])
  }
  const strength = pwStrength(form.password)

  const canSave = form.full_name.trim() && form.email.trim() && form.password && pwErrs.length === 0

  const save = async () => {
    if (!form.full_name.trim()) { toast('Nama wajib diisi', 'error'); return }
    if (!form.email.trim())     { toast('Email wajib diisi', 'error'); return }
    const errs = validatePassword(form.password)
    if (errs.length) { setPwErrs(errs); return }
    try {
      await createUser(form)
      toast('Pengguna ditambahkan')
      setAddModal(false)
      setForm({ full_name: '', email: '', password: '', role: 'member' })
      setPwErrs([])
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  // Poin 1: Simpan edit nama + role
  const saveEdit = async () => {
    if (!editForm.full_name.trim()) { toast('Nama wajib diisi', 'error'); return }
    try {
      // Import updateUser dari api.js
      const { updateUser } = await import('./services/api')
      await updateUser(editUser.user_id, { full_name: editForm.full_name, role: editForm.role })
      toast('Data pengguna diperbarui')
      setEditUser(null)
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  const del = u => setConfirm({
    title: 'Hapus Pengguna', message: `Yakin hapus "${u.full_name}"?`,
    onConfirm: async () => {
      try { await deleteUser(u.user_id); toast('Dihapus'); setConfirm(null); load() }
      catch (err) { toast(err.message, 'error'); setConfirm(null) }
    },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="page-sub">{users.length} pengguna terdaftar</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setAddModal(true)
          setForm({ full_name: '', email: '', password: '', role: 'member' })
          setPwErrs([])
        }}>
          + Tambah Pengguna
        </button>
      </div>

      {loadErr && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {loadErr}</div>}

      {loading ? <Spinner /> : users.length === 0 ? <Empty icon="👤" title="Belum ada pengguna" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Bergabung</th>
                <th style={{ width: 140, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-md">{u.full_name?.[0]}</div>
                      <span style={{ fontWeight: 600 }}>{u.full_name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--c-text2)' }}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-slate'}`}>{u.role === 'admin' ? 'Admin' : 'Member'}</span></td>
                  <td style={{ color: 'var(--c-text3)', fontSize: 12 }}>{fmtDate(u.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                      {/* Tombol detail */}
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Detail pengguna"
                        onClick={() => setDetailUser(u)}
                        style={{
                          width: 30, height: 30, padding: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '50%', fontSize: 13, fontWeight: 700,
                        }}>
                        i
                      </button>
                      {/* Tombol edit */}
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Edit pengguna"
                        onClick={() => { setEditUser(u); setEditForm({ full_name: u.full_name, role: u.role }) }}>
                        ✏️ Edit
                      </button>
                      {/* Tombol reset password */}
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Reset password"
                        onClick={() => { setResetPwModal(u); setResetPwForm(''); setResetPwErrs([]) }}
                        style={{ color: '#9A3412' }}>
                        🔑 Reset PW
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(u)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail Pengguna */}
      {detailUser && (
        <Modal title="Detail Pengguna" onClose={() => setDetailUser(null)} size="sm"
          footer={
            <button className="btn btn-ghost" onClick={() => setDetailUser(null)}>Tutup</button>
          }>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div className="avatar avatar-lg">{detailUser.full_name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: 'var(--c-text)' }}>
                {detailUser.full_name}
              </div>
              <span className={`badge ${detailUser.role === 'admin' ? 'badge-blue' : 'badge-slate'}`}>
                {detailUser.role === 'admin' ? 'Administrator' : 'Member'}
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px',
            background: 'var(--c-bg)', borderRadius: 10, padding: '14px 16px' }}>
            {[
              ['ID Pengguna', `#${detailUser.user_id}`, true],
              ['Nama Lengkap', detailUser.full_name, false],
              ['Email', detailUser.email, false],
              ['Role', detailUser.role === 'admin' ? 'Administrator' : 'Member', false],
              ['Bergabung', fmtDate(detailUser.created_at), false],
            ].map(([label, val, mono]) => (
              <div key={label} style={{ gridColumn: label === 'Email' ? '1 / -1' : undefined }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--c-text3)',
                  textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 500,
                  fontFamily: mono ? 'monospace' : undefined }}>{val}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Modal Edit Pengguna (nama + role) */}
      {editUser && (
        <Modal title={`Edit: ${editUser.full_name}`} onClose={() => setEditUser(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Batal</button>
              <button className="btn btn-primary" onClick={saveEdit}
                disabled={!editForm.full_name.trim()}>
                Simpan
              </button>
            </>
          }>
          <Field label="Nama Lengkap *">
            <Input
              value={editForm.full_name}
              onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Nama lengkap"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && editForm.full_name.trim()) saveEdit() }}
            />
          </Field>
          <Field label="Role">
            <Select
              value={editForm.role}
              onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <div className="alert alert-info" style={{ marginTop: 8, fontSize: 12 }}>
            Email tidak dapat diubah melalui form ini.
          </div>
        </Modal>
      )}

      {/* Modal: Tambah Pengguna */}
      {addModal && (
        <Modal title="Tambah Pengguna" onClose={() => setAddModal(false)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={save} disabled={!canSave}>Simpan</button>
            </>
          }>
          <Field label="Nama Lengkap *">
            <Input value={form.full_name} onChange={f('full_name')} placeholder="Nama lengkap" autoFocus
              onKeyDown={e => { if (e.key === 'Enter') document.activeElement.blur() }} />
          </Field>
          <Field label="Email *">
            <Input type="email" value={form.email} onChange={f('email')} placeholder="email@student.itk.ac.id"
              onKeyDown={e => { if (e.key === 'Enter') document.activeElement.blur() }} />
          </Field>
          <Field label="Password *" hint="Min. 8 karakter, huruf besar+kecil+angka+spesial (@$!%*?&)">
            <Input type="password" value={form.password} onChange={f('password')}
              onKeyDown={e => { if (e.key === 'Enter' && canSave) save() }} />
            {form.password && (
              <div style={{ marginTop: 6 }}>
                <div className="pw-bars">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="pw-bar" style={{ background: i <= strength.score ? strength.color : undefined }} />
                  ))}
                </div>
                <span className="pw-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
            {pwErrs.map(e => <span key={e} style={{ display: 'block', fontSize: 11, color: 'var(--c-red)', fontWeight: 600 }}>• {e}</span>)}
          </Field>
          <Field label="Role">
            <Select value={form.role} onChange={f('role')}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
        </Modal>
      )}

      {/* Modal: Reset Password (Admin) — Gap 4 */}
      {resetPwModal && (
        <Modal title={`Reset Password: ${resetPwModal.full_name}`} onClose={() => setResetPwModal(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setResetPwModal(null)}>Batal</button>
              <button className="btn btn-danger"
                disabled={!resetPwForm}
                onClick={async () => {
                  const errs = validatePassword(resetPwForm)
                  if (errs.length) { setResetPwErrs(errs); return }
                  try {
                    await adminResetPassword(resetPwModal.user_id, resetPwForm)
                    toast(`Password ${resetPwModal.full_name} berhasil direset`)
                    setResetPwModal(null)
                  } catch (err) { toast(err.message, 'error') }
                }}>
                Reset Password
              </button>
            </>
          }>
          <div className="alert alert-warning" style={{ marginBottom: 16, fontSize: 12 }}>
            ⚠️ Password baru langsung aktif. Informasikan kepada pengguna yang bersangkutan.
          </div>
          <Field label="Password Baru *" hint="Min. 8 karakter, huruf besar+kecil+angka+spesial">
            <Input
              type="password"
              value={resetPwForm}
              onChange={e => { setResetPwForm(e.target.value); setResetPwErrs([]) }}
              placeholder="Password baru untuk user ini"
              autoFocus
            />
            {resetPwForm && (() => {
              const s = pwStrength(resetPwForm)
              return (
                <div style={{ marginTop: 6 }}>
                  <div className="pw-bars">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="pw-bar" style={{ background: i <= s.score ? s.color : undefined }} />
                    ))}
                  </div>
                  <span className="pw-label" style={{ color: s.color }}>{s.label}</span>
                </div>
              )
            })()}
            {resetPwErrs.map(e => (
              <span key={e} style={{ display: 'block', fontSize: 11, color: 'var(--c-red)', fontWeight: 600 }}>• {e}</span>
            ))}
          </Field>
        </Modal>
      )}

      {confirm && <Confirm {...confirm} danger onCancel={() => setConfirm(null)} />}
    </div>
  )
}


// ══════════════════════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════════════════════
function ProfilePage({ user, setUser, toast }) {
  // ── Edit Profil state ──────────────────────────────────────
  const [editModal, setEditModal]   = useState(false)
  const [editForm, setEditForm]     = useState({ full_name: user?.full_name || '' })
  const [editSaving, setEditSaving] = useState(false)

  // ── Ganti Password state ───────────────────────────────────
  const [pwModal, setPwModal]   = useState(false)
  const [pwForm, setPwForm]     = useState({ current_password: '', new_password: '' })
  const [pwErrs, setPwErrs]     = useState([])
  const [pwSaving, setPwSaving] = useState(false)

  const saveProfile = async () => {
    if (!editForm.full_name.trim()) { toast('Nama wajib diisi', 'error'); return }
    setEditSaving(true)
    try {
      const updated = await updateMyProfile({ full_name: editForm.full_name })
      setUser(updated)
      toast('Profil berhasil diperbarui')
      setEditModal(false)
    } catch (err) { toast(err.message, 'error') }
    finally { setEditSaving(false) }
  }

  const changePw = async () => {
    if (!pwForm.current_password) { toast('Password lama wajib diisi', 'error'); return }
    const errs = validatePassword(pwForm.new_password)
    if (errs.length) { setPwErrs(errs); return }
    setPwSaving(true)
    try {
      await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password })
      toast('Password berhasil diubah')
      setPwModal(false)
      setPwForm({ current_password: '', new_password: '' })
      setPwErrs([])
    } catch (err) { toast(err.message, 'error') }
    finally { setPwSaving(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Saya</h1>
          <p className="page-sub">Informasi akun Anda</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost"
            onClick={() => { setPwForm({ current_password: '', new_password: '' }); setPwErrs([]); setPwModal(true) }}>
            🔒 Ganti Password
          </button>
          <button className="btn btn-primary"
            onClick={() => { setEditForm({ full_name: user?.full_name || '' }); setEditModal(true) }}>
            ✏️ Edit Profil
          </button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="profile-header">
          <div className="avatar avatar-lg">{user?.full_name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="profile-name">{user?.full_name}</div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-blue' : 'badge-slate'}`}>
              {user?.role === 'admin' ? 'Administrator' : 'Member'}
            </span>
          </div>
        </div>

        <div className="profile-grid">
          {[
            ['Nama Lengkap', user?.full_name, false],
            ['Email', user?.email, false],
            ['Role', user?.role === 'admin' ? 'Administrator' : 'Member', false],
            ['ID Pengguna', user?.user_id, true],
          ].map(([label, val, mono]) => (
            <div key={label}>
              <div className="profile-lbl">{label}</div>
              <div className="profile-val" style={mono ? { fontFamily: 'monospace', fontSize: 13 } : {}}>{val ?? '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Edit Profil */}
      {editModal && (
        <Modal title="Edit Profil" onClose={() => setEditModal(false)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEditModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveProfile}
                disabled={!editForm.full_name.trim() || editSaving}>
                {editSaving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </>
          }>
          <Field label="Nama Lengkap *">
            <Input
              value={editForm.full_name}
              onChange={e => setEditForm({ full_name: e.target.value })}
              placeholder="Nama lengkap"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && editForm.full_name.trim()) saveProfile() }}
            />
          </Field>
          <div className="alert alert-info" style={{ marginTop: 8, fontSize: 12 }}>
            Email tidak dapat diubah. Hubungi admin jika perlu mengubah email.
          </div>
        </Modal>
      )}

      {/* Modal: Ganti Password */}
      {pwModal && (
        <Modal title="Ganti Password" onClose={() => { setPwModal(false); setPwErrs([]) }} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => { setPwModal(false); setPwErrs([]) }}>Batal</button>
              <button className="btn btn-primary" onClick={changePw}
                disabled={!pwForm.current_password || !pwForm.new_password || pwSaving}>
                {pwSaving ? 'Memproses…' : 'Ubah Password'}
              </button>
            </>
          }>
          <Field label="Password Saat Ini *">
            <Input
              type="password"
              value={pwForm.current_password}
              onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))}
              placeholder="Masukkan password lama"
              autoFocus
            />
          </Field>
          <Field label="Password Baru *" hint="Min. 8 karakter, huruf besar+kecil+angka+spesial">
            <Input
              type="password"
              value={pwForm.new_password}
              onChange={e => { setPwForm(p => ({ ...p, new_password: e.target.value })); setPwErrs([]) }}
              placeholder="Masukkan password baru"
              onKeyDown={e => { if (e.key === 'Enter' && pwForm.current_password && pwForm.new_password) changePw() }}
            />
            {pwForm.new_password && (() => {
              const s = pwStrength(pwForm.new_password)
              return (
                <div style={{ marginTop: 6 }}>
                  <div className="pw-bars">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="pw-bar" style={{ background: i <= s.score ? s.color : undefined }} />
                    ))}
                  </div>
                  <span className="pw-label" style={{ color: s.color }}>{s.label}</span>
                </div>
              )
            })()}
            {pwErrs.map(e => (
              <span key={e} style={{ display: 'block', fontSize: 11, color: 'var(--c-red)', fontWeight: 600 }}>• {e}</span>
            ))}
          </Field>
        </Modal>
      )}
    </div>
  )
}


// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  // Restore halaman terakhir dari sessionStorage saat refresh
  const [page, setPage]               = useState(() => sessionStorage.getItem('lp_page') || 'home')
  const [loginTab, setLoginTab]       = useState('login')
  const [user, setUser]               = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [badges, setBadges]           = useState({ transactions: 0, fines: 0 })
  const { toasts, toast }             = useToast()

  // Fetch notification counts (polling setiap 60 detik)
  const refreshBadges = useCallback(async (currentUser) => {
    if (!currentUser) { setBadges({ transactions: 0, fines: 0 }); return }
    try {
      if (currentUser.role === 'admin') {
        // Admin: pending transactions + pending_verification fines
        const [trx, fin] = await Promise.all([
          fetchTransactions('pending', 100),
          fetchFines('pending_verification', 100),
        ])
        setBadges({ transactions: trx?.total || 0, fines: fin?.total || 0 })
      } else {
        // Member: transaksi pending miliknya + denda unpaid
        const [trx, fin] = await Promise.all([
          fetchTransactions('pending', 50),
          fetchFines('unpaid', 50),
        ])
        setBadges({ transactions: trx?.total || 0, fines: fin?.total || 0 })
      }
    } catch { /* fail silently */ }
  }, [])

  // Listen show-toast event dari session-expired handler
  useEffect(() => {
    const onShowToast = (e) => toast(e.detail.msg, e.detail.type)
    window.addEventListener('show-toast', onShowToast)
    return () => window.removeEventListener('show-toast', onShowToast)
  }, [toast])

  // Simpan page ke sessionStorage setiap kali berubah
  const nav = useCallback((p, opts = {}) => {
    if (p === 'login' && opts.tab) setLoginTab(opts.tab)
    sessionStorage.setItem('lp_page', p)
    setPage(p)
  }, [])

  // Cek token saat mount + listen event session-expired dari api.js
  useEffect(() => {
    const t = token.get()
    if (t) {
      // 1. Tampilkan user dari cache LANGSUNG (tidak tunggu network)
      const cached = userCache.get()
      if (cached) {
        setUser(cached)
        const savedPage = sessionStorage.getItem('lp_page') || 'home'
        if (['dashboard', 'users'].includes(savedPage) && cached.role !== 'admin') {
          sessionStorage.setItem('lp_page', 'home')
          setPage('home')
        }
        setAuthChecked(true)
        // 2. Verifikasi background — refresh data user dari server
        getMe()
          .then(u => { setUser(u); userCache.set(u) })
          .catch(() => {
            // Token invalid/expired — paksa logout
            token.remove()
            userCache.remove()
            setUser(null)
            sessionStorage.removeItem('lp_page')
            setPage('home')
          })
      } else {
        // Tidak ada cache, harus hit network
        getMe()
          .then(u => {
            setUser(u)
            userCache.set(u)
            const savedPage = sessionStorage.getItem('lp_page') || 'home'
            if (['dashboard', 'users'].includes(savedPage) && u.role !== 'admin') {
              sessionStorage.setItem('lp_page', 'home')
              setPage('home')
            }
            setAuthChecked(true)
          })
          .catch(() => {
            token.remove()
            userCache.remove()
            setAuthChecked(true)
          })
      }
    } else {
      setAuthChecked(true)
    }

    // Tangkap event 401 dari api.js — redirect ke home tanpa reload
    const onExpired = () => {
      setUser(null)
      sessionStorage.setItem('lp_page', 'home')
      setPage('home')
      setAuthChecked(true)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { msg: 'Sesi berakhir. Silakan masuk kembali.', type: 'error' }
        }))
      }, 100)
    }
    window.addEventListener('session-expired', onExpired)
    return () => window.removeEventListener('session-expired', onExpired)
  }, [])

  const handleLogin = useCallback(u => {
    setUser(u)
    userCache.set(u)
    setLoginTab('login')
    const dest = u.role === 'admin' ? 'dashboard' : 'home'
    sessionStorage.setItem('lp_page', dest)
    setPage(dest)
    refreshBadges(u)
  }, [refreshBadges])

  // Refresh badges saat user berubah + polling tiap 60 detik
  useEffect(() => {
    refreshBadges(user)
    if (!user) return
    const id = setInterval(() => refreshBadges(user), 60000)
    return () => clearInterval(id)
  }, [user, refreshBadges])

  const handleLogout = useCallback(() => {
    logout()
    setUser(null)
    sessionStorage.setItem('lp_page', 'home')
    setPage('home')
    toast('Berhasil keluar', 'info')
  }, [toast])

  // Loading awal
  if (!authChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-slate9)' }}>
      <Spinner text="Memeriksa sesi…" />
    </div>
  )

  // Halaman login — pass onBack + loginTab state
  if (page === 'login' && !user) return (
    <><LoginPage onLogin={handleLogin} toast={toast} initialTab={loginTab} onBack={() => { setPage('home'); setLoginTab('login') }} /><ToastContainer toasts={toasts} /></>
  )

  const isAdmin = user?.role === 'admin'

  // Route guard
  const safePage = (() => {
    if (['dashboard', 'users'].includes(page) && !isAdmin) return 'home'
    if (['transactions', 'fines', 'profile'].includes(page) && !user) return 'login'
    return page
  })()

  if (safePage === 'login') return (
    <><LoginPage onLogin={handleLogin} toast={toast} initialTab={loginTab} onBack={() => { setPage('home'); setLoginTab('login') }} /><ToastContainer toasts={toasts} /></>
  )

  const renderPage = (p) => {
    switch (p) {
      case 'dashboard':    return <DashboardPage    toast={toast} />
      case 'books':        return isAdmin ? <BooksAdminPage toast={toast} /> : <HomePage user={user} onNav={nav} toast={toast} />
      case 'categories':   return <CategoriesPage   isAdmin={isAdmin} toast={toast} />
      case 'genres':       return <GenresPage       isAdmin={isAdmin} toast={toast} />
      case 'transactions': return <TransactionsPage user={user}   toast={toast} />
      case 'fines':        return <FinesPage        user={user}   toast={toast} />
      case 'users':        return <UsersPage        toast={toast} />
      case 'profile':      return <ProfilePage      user={user} setUser={setUser} toast={toast} />
      case 'home':
      default:             return <HomePage         user={user} onNav={nav} toast={toast} />
    }
  }

  // ── Admin layout (sidebar kiri) ──────────────────────────────
  if (isAdmin) return (
    <>
      <div className="layout-side">
        <Header page={safePage} onNav={nav} user={user} onLogout={handleLogout} badges={badges} />
        <main className="layout-side-main">
          <div className="layout-side-inner">
            {renderPage(safePage)}
          </div>
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  )

  // ── Guest / Member layout (topnav atas) ──────────────────────
  return (
    <>
      <div className="layout-top">
        <Header page={safePage} onNav={nav} user={user} onLogout={handleLogout} badges={badges} />
        {safePage === 'home' || safePage === 'books'
          ? renderPage(safePage)
          : (
            <div className="layout-top-content">
              {renderPage(safePage)}
            </div>
          )
        }
      </div>
      <ToastContainer toasts={toasts} />
    </>
  )
}