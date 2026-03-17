// ============================================================
// App.jsx — LenteraPustaka v0.4.0
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
  login, register, logout, getMe, token,
  fetchCategories, createCategory, updateCategory, deleteCategory,
  fetchGenres,     createGenre,    updateGenre,    deleteGenre,
  fetchBooks, fetchBookStats, createBook, updateBook, deleteBook,
  fetchUsers,      createUser,     deleteUser,
  fetchTransactions, borrowBook, approveTransaction, rejectTransaction, returnBook,
  fetchFines, submitFinePayment, approveFine, rejectFine,
} from './services/api'

// ══════════════════════════════════════════════════════════════
//  LOGIN PAGE
//  Poin 7: tombol ← kembali ke beranda
//  Poin 8: prop initialTab agar bisa langsung buka tab 'register'
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
        // Poin 6: toast di kanan atas setelah daftar berhasil
        toast('Akun berhasil dibuat! Sedang masuk…')
        // Langsung login otomatis setelah daftar
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

          {/* Poin 7: tombol kembali ke beranda */}
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

          {/* Poin 9: info cara login admin */}
          {tab === 'login' && (
            <p style={{ fontSize: 11.5, color: 'var(--c-text3)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
              Akun admin dibuat oleh pengembang sistem.<br />
              Hubungi <strong style={{ color: 'var(--c-text2)' }}>Maulana (Lead Backend)</strong> untuk akses admin.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  HOME PAGE — Search, Filter Kategori+Genre, Sorting lengkap
// ══════════════════════════════════════════════════════════════
function HomePage({ user, onNav, toast }) {
  const [inputVal, setInput]         = useState('')
  const [search, setSearch]          = useState('')
  const [searchField, setSearchField] = useState('all')   // all | title | author | isbn
  const [sortBy, setSortBy]          = useState('default')
  const [cats, setCats]              = useState([])
  const [genres, setGenres]          = useState([])
  const [activeCats, setActiveCats]  = useState([])   // bisa multi-pilih
  const [activeGenres, setActiveGenres] = useState([]) // bisa multi-pilih
  const [showFilters, setShowFilters] = useState(false)
  const { books, total, loading, error } = useBooks(search)

  useEffect(() => {
    fetchCategories().then(d => setCats(d || []))
    fetchGenres().then(d => setGenres(d || []))
  }, [])

  // Filter + Sort semua di frontend setelah data dari API
  const filtered = books.filter(b => {
    // Filter by searchField (client-side refinement)
    if (search && searchField !== 'all') {
      const q = search.toLowerCase()
      if (searchField === 'title'  && !b.title?.toLowerCase().includes(q))  return false
      if (searchField === 'author' && !b.author?.toLowerCase().includes(q)) return false
      if (searchField === 'isbn'   && !b.isbn?.toLowerCase().includes(q))   return false
    }
    // Filter kategori (multi)
    if (activeCats.length > 0 && !activeCats.includes(b.category_id)) return false
    // Filter genre (multi)
    if (activeGenres.length > 0) {
      const bookGenreIds = b.genres?.map(g => g.genre_id) || []
      if (!activeGenres.some(id => bookGenreIds.includes(id))) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'title-az') return a.title.localeCompare(b.title, 'id')
    if (sortBy === 'title-za') return b.title.localeCompare(a.title, 'id')
    if (sortBy === 'author')   return a.author.localeCompare(b.author, 'id')
    if (sortBy === 'stock-hi') return b.available_stock - a.available_stock
    if (sortBy === 'stock-lo') return a.available_stock - b.available_stock
    if (sortBy === 'year-new') return (b.publication_year || 0) - (a.publication_year || 0)
    if (sortBy === 'year-old') return (a.publication_year || 0) - (b.publication_year || 0)
    return 0
  })

  const toggleCat   = id => setActiveCats(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleGenre = id => setActiveGenres(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const clearAll    = () => { setActiveCats([]); setActiveGenres([]); setSearch(''); setInput(''); setSortBy('default') }
  const hasFilter   = activeCats.length > 0 || activeGenres.length > 0 || search

  // Label judul section
  const sectionLabel = () => {
    const parts = []
    if (activeCats.length === 1)   parts.push(cats.find(c => c.category_id === activeCats[0])?.name)
    else if (activeCats.length > 1) parts.push(`${activeCats.length} kategori`)
    if (activeGenres.length === 1)   parts.push(genres.find(g => g.genre_id === activeGenres[0])?.name)
    else if (activeGenres.length > 1) parts.push(`${activeGenres.length} genre`)
    if (search) parts.push(`"${search}"`)
    return parts.length ? parts.join(' · ') : 'Semua Koleksi'
  }

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-label"><span>📚</span> LenteraPustaka — HEXACORE · SI ITK</div>
          <h1 className="hero-title">Temukan Buku<br /><span>Favoritmu</span></h1>
          <p className="hero-sub">Koleksi lengkap buku perpustakaan digital. Cari, pinjam, dan nikmati bacaanmu.</p>

          {/* Search bar dengan dropdown field */}
          <div className="hero-search">
            {/* Dropdown: cari berdasarkan apa */}
            <select
              className="hero-search-field"
              value={searchField}
              onChange={e => setSearchField(e.target.value)}
            >
              <option value="all">Semua</option>
              <option value="title">Judul</option>
              <option value="author">Pengarang</option>
              <option value="isbn">ISBN</option>
            </select>
            <div className="hero-search-divider" />
            <span className="hero-search-icon">⌕</span>
            <input
              className="hero-search-input"
              placeholder={
                searchField === 'title'  ? 'Cari berdasarkan judul…' :
                searchField === 'author' ? 'Cari berdasarkan pengarang…' :
                searchField === 'isbn'   ? 'Cari berdasarkan ISBN…' :
                'Cari judul, pengarang, atau ISBN…'
              }
              value={inputVal}
              onChange={e => { setInput(e.target.value); if (!e.target.value) setSearch('') }}
              onKeyDown={e => e.key === 'Enter' && setSearch(inputVal)}
            />
            {inputVal && (
              <button className="hero-search-clear" onClick={() => { setInput(''); setSearch('') }}>✕</button>
            )}
            <button className="hero-search-btn" onClick={() => setSearch(inputVal)}>Cari</button>
          </div>

          {/* Quick chips kategori di hero */}
          {cats.length > 0 && (
            <div className="cat-chips">
              <button className={`cat-chip${activeCats.length === 0 && activeGenres.length === 0 ? ' active' : ''}`}
                onClick={clearAll}>Semua</button>
              {cats.map(c => (
                <button key={c.category_id}
                  className={`cat-chip${activeCats.includes(c.category_id) ? ' active' : ''}`}
                  onClick={() => toggleCat(c.category_id)}>
                  {c.name}
                </button>
              ))}
              {genres.length > 0 && (
                <>
                  <span className="cat-section-label" style={{ color: '#5EEAD4' }}>Genre</span>
                  {genres.map(g => (
                    <button key={g.genre_id}
                      className={`cat-chip genre${activeGenres.includes(g.genre_id) ? ' active' : ''}`}
                      onClick={() => toggleGenre(g.genre_id)}>
                      {g.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Filter & Sort bar ────────────────────────────────── */}
      <div className="filter-bar">
        <div className="filter-bar-inner">

          {/* Kiri: label hasil + badge filter aktif */}
          <div className="filter-bar-left">
            <h2 className="section-title" style={{ fontSize: 18, margin: 0 }}>{sectionLabel()}</h2>
            <span style={{ fontSize: 12, color: 'var(--c-text3)', marginLeft: 8 }}>
              {sorted.length} buku
            </span>
            {hasFilter && (
              <button className="filter-clear-btn" onClick={clearAll}>✕ Reset filter</button>
            )}
          </div>

          {/* Kanan: sorting dropdown + toggle filter panel */}
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
            <button
              className={`btn btn-secondary btn-sm${showFilters ? ' active-filter-btn' : ''}`}
              onClick={() => setShowFilters(p => !p)}
              style={{ gap: 5 }}
            >
              ⚙ Filter {(activeCats.length + activeGenres.length) > 0 && (
                <span style={{ background: 'var(--c-accent)', color: '#fff', borderRadius: '99px', padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                  {activeCats.length + activeGenres.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel — expand/collapse */}
        {showFilters && (
          <div className="filter-panel">
            {/* Kategori */}
            {cats.length > 0 && (
              <div className="filter-group">
                <div className="filter-group-label">
                  Kategori
                  {activeCats.length > 0 && (
                    <button className="filter-group-clear" onClick={() => setActiveCats([])}>Hapus</button>
                  )}
                </div>
                <div className="filter-chips">
                  {cats.map(c => (
                    <button key={c.category_id}
                      className={`filter-chip-item${activeCats.includes(c.category_id) ? ' selected' : ''}`}
                      onClick={() => toggleCat(c.category_id)}>
                      {activeCats.includes(c.category_id) && <span>✓ </span>}{c.name}
                      {c.description && <span className="filter-chip-sub"> — {c.description}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Genre */}
            {genres.length > 0 && (
              <div className="filter-group">
                <div className="filter-group-label" style={{ color: '#0D9488' }}>
                  Genre
                  {activeGenres.length > 0 && (
                    <button className="filter-group-clear" onClick={() => setActiveGenres([])}>Hapus</button>
                  )}
                </div>
                <div className="filter-chips">
                  {genres.map(g => (
                    <button key={g.genre_id}
                      className={`filter-chip-item genre${activeGenres.includes(g.genre_id) ? ' selected' : ''}`}
                      onClick={() => toggleGenre(g.genre_id)}>
                      {activeGenres.includes(g.genre_id) && <span>✓ </span>}{g.name}
                      {g.description && <span className="filter-chip-sub"> — {g.description}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tombol terapkan */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowFilters(false)}>
                Tampilkan {sorted.length} buku
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Book list ────────────────────────────────────────── */}
      <div className="section" style={{ paddingBottom: 64 }}>
        {user && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={() => onNav('transactions')}>
              + Pinjam Buku
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            ⚠️ Tidak dapat memuat buku — {error}
          </div>
        )}

        {loading ? <Spinner /> : sorted.length === 0 ? (
          <Empty
            icon={hasFilter ? '🔍' : '📚'}
            title={hasFilter ? 'Tidak ada buku yang cocok' : 'Belum ada buku'}
            sub={hasFilter ? 'Coba ubah filter atau kata kunci pencarian' : ''}
          />
        ) : (
          <div className="books-grid">
            {sorted.map(book => (
              <ItemCard key={book.book_id} book={book} onEdit={() => {}} onDelete={() => {}} isAdmin={false} />
            ))}
          </div>
        )}
      </div>
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
//  Poin 3: member → user_id otomatis dari current user
//          admin  → tetap bisa pilih user
// ══════════════════════════════════════════════════════════════
function TransactionsPage({ user, toast }) {
  const isAdmin = user?.role === 'admin'
  const [trxs, setTrxs]        = useState([])
  const [total, setTotal]       = useState(0)
  const [statusF, setStatusF]   = useState('')
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [adminUsers, setAdminUsers] = useState([])   // hanya diload kalau admin
  const [bookList, setBookList] = useState([])
  const [form, setForm]         = useState({ user_id: '', book_id: '', due_date: '' })
  const [confirm, setConfirm]   = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    fetchTransactions(statusF)
      .then(d => { setTrxs(d.transactions || []); setTotal(d.total || 0); setLoading(false) })
      .catch(err => { toast(err.message, 'error'); setLoading(false) })
  }, [statusF])

  useEffect(() => {
    // Admin: load daftar user untuk dropdown
    if (isAdmin) fetchUsers().then(d => setAdminUsers(Array.isArray(d) ? d : []))
    fetchBooks('', 200).then(d => setBookList(d.books || []))
  }, [isAdmin])
  useEffect(() => { load() }, [load])

  const openBorrowModal = () => {
    setForm({
      // Poin 3: member → pakai user_id sendiri, admin → kosong (pilih manual)
      user_id: isAdmin ? '' : String(user.user_id),
      book_id: '',
      due_date: '',
    })
    setModal(true)
  }

  const doSubmitBorrow = async () => {
    try {
      await borrowBook(form)
      toast('Pengajuan peminjaman dikirim!')
      setModal(false)
      load()
    } catch (err) {
      toast(err.message, 'error')
    }
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
    { v: 'returned', l: 'Dikembalikan' }, { v: 'overdue', l: 'Terlambat' }, { v: 'rejected', l: 'Ditolak' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaksi Peminjaman</h1>
          <p className="page-sub">{total} transaksi total</p>
        </div>
        <button className="btn btn-primary" onClick={openBorrowModal}>+ Ajukan Pinjam</button>
      </div>

      <div className="filter-pills" style={{ marginBottom: 20 }}>
        {STATUS_TABS.map(s => (
          <button key={s.v} className={`filter-pill${statusF === s.v ? ' active' : ''}`}
            onClick={() => setStatusF(s.v)}>{s.l}</button>
        ))}
      </div>

      {loading ? <Spinner /> : trxs.length === 0 ? <Empty icon="📋" title="Tidak ada transaksi" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>User</th><th>Buku</th>
                <th>Pinjam</th><th>Jatuh Tempo</th><th>Kembali</th>
                <th>Status</th>{isAdmin && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {trxs.map(t => {
                const b = trxBadge[t.status] || { cls: 'badge-slate', label: t.status }
                return (
                  <tr key={t.transaction_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--c-text3)' }}>{t.transaction_id}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.user_id}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.book_id}</td>
                    <td style={{ fontSize: 12, color: 'var(--c-text2)' }}>{fmtDate(t.borrow_date)}</td>
                    <td style={{ fontSize: 12, color: 'var(--c-text2)' }}>{fmtDate(t.due_date)}</td>
                    <td style={{ fontSize: 12, color: 'var(--c-text2)' }}>{t.return_date ? fmtDate(t.return_date) : '—'}</td>
                    <td><span className={`badge ${b.cls}`}>{b.label}</span></td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {t.status === 'pending' && (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={() => doAction(approveTransaction, t.transaction_id, 'Setujui')}>Setujui</button>
                              <button className="btn btn-danger btn-sm"  onClick={() => doAction(rejectTransaction,  t.transaction_id, 'Tolak')}>Tolak</button>
                            </>
                          )}
                          {t.status === 'borrowed' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => doAction(returnBook, t.transaction_id, 'Kembalikan')}>Kembalikan</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Ajukan Peminjaman" onClose={() => setModal(false)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={doSubmitBorrow}
                disabled={!form.book_id || !form.due_date || !form.user_id}>
                Ajukan
              </button>
            </>
          }>
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            Pengajuan akan berstatus <strong>Menunggu</strong> hingga admin menyetujui.
          </div>

          {isAdmin ? (
            <Field label="Pengguna *">
              <Select value={form.user_id} onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))}>
                <option value="">Pilih pengguna…</option>
                {adminUsers.map(u => <option key={u.user_id} value={u.user_id}>{u.full_name} — {u.email}</option>)}
              </Select>
            </Field>
          ) : (
            <Field label="Peminjam">
              <div style={{ padding: '9px 12px', borderRadius: 'var(--r-md)', background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', fontSize: 13.5, color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="avatar avatar-sm">{user?.full_name?.[0]?.toUpperCase()}</div>
                <span>{user?.full_name}</span>
                <span style={{ color: 'var(--c-text3)', marginLeft: 'auto', fontSize: 12 }}>{user?.email}</span>
              </div>
            </Field>
          )}

          <Field label="Buku *">
            <Select value={form.book_id} onChange={e => setForm(p => ({ ...p, book_id: e.target.value }))}>
              <option value="">Pilih buku…</option>
              {bookList.filter(b => b.available_stock > 0).map(b =>
                <option key={b.book_id} value={b.book_id}>
                  {b.title} — {b.author} (stok: {b.available_stock})
                </option>
              )}
            </Select>
            {bookList.filter(b => b.available_stock > 0).length === 0 && (
              <div className="alert alert-warning" style={{ marginTop: 8 }}>Tidak ada buku tersedia saat ini.</div>
            )}
          </Field>
          <Field label="Tanggal Jatuh Tempo *" hint="Minimal hari ini">
            <Input type="date" value={form.due_date}
              min={new Date().toISOString().split('T')[0]}
              onKeyDown={e => { if (e.key === 'Enter' && form.book_id && form.due_date && form.user_id) doSubmitBorrow() }}
              onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
          </Field>
        </Modal>
      )}
      {confirm && <Confirm {...confirm} onCancel={() => setConfirm(null)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  FINES
// ══════════════════════════════════════════════════════════════
function FinesPage({ user, toast }) {
  const isAdmin = user?.role === 'admin'
  const [fines, setFines]         = useState([])
  const [total, setTotal]         = useState(0)
  const [statusF, setStatusF]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [proofModal, setProofModal] = useState(null)
  const [proofUrl, setProofUrl]   = useState('')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectNote, setRejectNote] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    fetchFines(statusF)
      .then(d => { setFines(d.fines || []); setTotal(d.total || 0); setLoading(false) })
      .catch(err => { toast(err.message, 'error'); setLoading(false) })
  }, [statusF])
  useEffect(() => { load() }, [load])

  const totalUnpaid = fines.filter(f => f.status === 'unpaid').reduce((a, f) => a + f.amount, 0)

  const TABS = [
    { v: null, l: 'Semua' }, { v: 'unpaid', l: 'Belum Bayar' },
    { v: 'pending_verification', l: 'Verifikasi' }, { v: 'paid', l: 'Lunas' }, { v: 'rejected', l: 'Ditolak' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Denda Keterlambatan</h1>
          <p className="page-sub">{total} denda tercatat</p>
        </div>
      </div>

      <div className="fine-banner">
        <div><div className="fine-banner-val" style={{ color: 'var(--c-red)' }}>{fmt(totalUnpaid)}</div><div className="fine-banner-lbl">Belum Bayar</div></div>
        <div><div className="fine-banner-val">{fines.filter(f => f.status === 'paid').length}</div><div className="fine-banner-lbl">Lunas</div></div>
        <div><div className="fine-banner-val">{fines.filter(f => f.status === 'pending_verification').length}</div><div className="fine-banner-lbl">Verifikasi</div></div>
        <div><div className="fine-banner-val">{total}</div><div className="fine-banner-lbl">Total</div></div>
      </div>

      <div className="filter-pills" style={{ marginBottom: 20 }}>
        {TABS.map(s => (
          <button key={String(s.v)} className={`filter-pill${statusF === s.v ? ' active' : ''}`}
            onClick={() => setStatusF(s.v)}>{s.l}</button>
        ))}
      </div>

      {loading ? <Spinner /> : fines.length === 0 ? <Empty icon="🎉" title="Tidak ada denda!" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Transaksi</th><th>Jumlah</th><th>Status</th><th>Bukti</th><th>Catatan</th><th>Aksi</th></tr></thead>
            <tbody>
              {fines.map(f => {
                const fb = fineBadge[f.status] || { cls: 'badge-slate', label: f.status }
                return (
                  <tr key={f.fine_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--c-text3)' }}>{f.fine_id}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{f.transaction_id}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(f.amount)}</td>
                    <td><span className={`badge ${fb.cls}`}>{fb.label}</span></td>
                    <td>{f.payment_proof_url ? <a href={f.payment_proof_url} target="_blank" rel="noreferrer" style={{ color: 'var(--c-accent)', fontSize: 12 }}>Lihat</a> : <span style={{ color: 'var(--c-text3)', fontSize: 12 }}>—</span>}</td>
                    <td style={{ fontSize: 12, color: 'var(--c-red)', maxWidth: 160 }}>{f.rejection_note || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {!isAdmin && (f.status === 'unpaid' || f.status === 'rejected') && (
                          <button className="btn btn-primary btn-sm" onClick={() => { setProofModal(f); setProofUrl('') }}>Bayar</button>
                        )}
                        {isAdmin && f.status === 'pending_verification' && (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={async () => {
                              try { await approveFine(f.fine_id); toast('Denda lunas') }
                              catch (err) { toast(err.message, 'error') }
                              finally { load() }
                            }}>Lunas</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setRejectModal(f); setRejectNote('') }}>Tolak</button>
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

      {proofModal && (
        <Modal title="Kirim Bukti Pembayaran" onClose={() => setProofModal(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setProofModal(null)}>Batal</button>
              <button className="btn btn-primary" disabled={!proofUrl.trim()}
                onClick={async () => {
                  try { await submitFinePayment(proofModal.fine_id, proofUrl.trim()); toast('Bukti dikirim'); setProofModal(null); load() }
                  catch (err) { toast(err.message, 'error') }
                }}>Kirim</button>
            </>
          }>
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            Denda: <strong>{fmt(proofModal.amount)}</strong>
          </div>
          <Field label="URL Bukti Transfer *" hint="Upload ke Google Drive / Imgur, paste link di sini">
            <Input value={proofUrl} onChange={e => setProofUrl(e.target.value)}
              placeholder="https://drive.google.com/…" autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && proofUrl.trim()) {
                submitFinePayment(proofModal.fine_id, proofUrl.trim())
                  .then(() => { toast('Bukti dikirim'); setProofModal(null); load() })
                  .catch(err => toast(err.message, 'error'))
              }}} />
          </Field>
        </Modal>
      )}

      {rejectModal && (
        <Modal title="Tolak Bukti Pembayaran" onClose={() => setRejectModal(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Batal</button>
              <button className="btn btn-danger" disabled={!rejectNote.trim()}
                onClick={async () => {
                  try { await rejectFine(rejectModal.fine_id, rejectNote.trim()); toast('Ditolak'); setRejectModal(null); load() }
                  catch (err) { toast(err.message, 'error') }
                }}>Tolak</button>
            </>
          }>
          <Field label="Alasan Penolakan *">
            <Textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
              rows={3} placeholder="misal: foto buram, nominal kurang…" autoFocus />
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
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState(null)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ full_name: '', email: '', password: '', role: 'member' })
  const [pwErrs, setPwErrs]   = useState([])
  const [confirm, setConfirm] = useState(null)

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
      setModal(false)
      setForm({ full_name: '', email: '', password: '', role: 'member' })
      setPwErrs([])
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
          setModal(true)
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
            <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Bergabung</th><th style={{ width: 80 }}>Aksi</th></tr></thead>
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
                  <td><button className="btn btn-danger btn-sm" onClick={() => del(u)}>Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Tambah Pengguna" onClose={() => setModal(false)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Batal</button>
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
      {confirm && <Confirm {...confirm} danger onCancel={() => setConfirm(null)} />}
    </div>
  )
}


// ══════════════════════════════════════════════════════════════
//  PROFILE
//  Catatan: endpoint PUT /auth/change-password belum ada di
//  backend v0.4.0. Tombol ganti password ditampilkan sebagai
//  info saja — hubungi admin untuk reset password.
// ══════════════════════════════════════════════════════════════
function ProfilePage({ user, toast }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Saya</h1>
          <p className="page-sub">Informasi akun Anda</p>
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

        <div className="profile-actions">
          <div className="alert alert-info" style={{ width: '100%', margin: 0 }}>
            🔑 Untuk mengubah password, hubungi <strong>Administrator sistem</strong> atau gunakan endpoint
            <code style={{ margin: '0 4px', fontSize: 11, background: '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>PUT /users/{'{id}'}</code>
            via Swagger UI (<code style={{ fontSize: 11 }}>localhost:8000/docs</code>).
          </div>
        </div>
      </div>
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
  const { toasts, toast }             = useToast()

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
      getMe()
        .then(u => { setUser(u); setAuthChecked(true) })
        .catch(() => { token.remove(); setAuthChecked(true) })
    } else {
      setAuthChecked(true)
    }

    // Tangkap event 401 dari api.js — redirect ke login tanpa reload
    const onExpired = () => {
      setUser(null)
      sessionStorage.setItem('lp_page', 'home')
      setPage('home')
      setAuthChecked(true)
    }
    window.addEventListener('session-expired', onExpired)
    return () => window.removeEventListener('session-expired', onExpired)
  }, [])

  const handleLogin = useCallback(u => {
    setUser(u)
    setLoginTab('login')
    const dest = u.role === 'admin' ? 'dashboard' : 'home'
    sessionStorage.setItem('lp_page', dest)
    setPage(dest)
  }, [])

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

  // Halaman login — poin 7 & 8: pass onBack + loginTab state
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
      case 'profile':      return <ProfilePage      user={user}   toast={toast} />
      case 'home':
      default:             return <HomePage         user={user} onNav={nav} toast={toast} />
    }
  }

  // ── Admin layout (sidebar kiri) ──────────────────────────────
  if (isAdmin) return (
    <>
      <div className="layout-side">
        <Header page={safePage} onNav={nav} user={user} onLogout={handleLogout} />
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
        <Header page={safePage} onNav={nav} user={user} onLogout={handleLogout} />
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