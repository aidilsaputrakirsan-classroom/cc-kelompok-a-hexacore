// ============================================================
// App.jsx — Root component
// State management, navigasi, CRUD handlers, halaman
// ============================================================
import { useState, useEffect, useCallback } from "react"

// Komponen struktur modul 3
import Header            from "./components/Header"
import SearchBar         from "./components/SearchBar"
import ItemForm          from "./components/ItemForm"
import ItemList          from "./components/ItemList"
import { Toast, StatCard, Card, Badge, Btn, Spinner, Empty, Modal, Field, Input, Select } from "./components/ui/Common"
import { C, fmt, fmtDate, statusColor, statusLabel } from "./components/ui/tokens"

// API service
import {
  checkHealth, fetchBookStats,
  fetchCategories, createCategory, updateCategory, deleteCategory,
  fetchBooks, createBook, updateBook, deleteBook,
  fetchUsers, createUser,
  fetchTransactions, borrowBook, returnBook,
  fetchFines, payFine,
} from "./services/api"

// ── CSS Inject (sekali saja) ──────────────────────────────────
function injectCSS() {
  if (document.getElementById("lp-global")) return
  const s = document.createElement("style")
  s.id = "lp-global"
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Nunito', sans-serif; background: #FFF8F0; color: #1A1A2E; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #FFF8F0; }
    ::-webkit-scrollbar-thumb { background: #C77DFF; border-radius: 99px; }
    @keyframes pop   { 0%{transform:scale(.9);opacity:0} 100%{transform:scale(1);opacity:1} }
    @keyframes slide { 0%{transform:translateY(16px);opacity:0} 100%{transform:translateY(0);opacity:1} }
    @keyframes spin  { to { transform: rotate(360deg); } }
    .anim-pop   { animation: pop   .3s cubic-bezier(.34,1.56,.64,1) both; }
    .anim-slide { animation: slide .35s ease both; }
    button { cursor: pointer; border: none; font-family: inherit; }
    input, select, textarea { font-family: inherit; }
  `
  document.head.appendChild(s)
}

// ══════════════════════════════════════════════════════════════
//  HALAMAN — Dashboard
// ══════════════════════════════════════════════════════════════
function Dashboard({ showToast }) {
  const [stats, setStats]     = useState(null)
  const [health, setHealth]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchBookStats(),
      checkHealth().then(ok => ok ? { status: "healthy" } : null),
    ]).then(([s, h]) => { setStats(s); setHealth(h); setLoading(false) })
  }, [])

  if (loading) return <Spinner />

  const NAV_ITEMS_PREVIEW = [
    { id:"books",icon:"📚",label:"Buku" },
    { id:"categories",icon:"🏷️",label:"Kategori" },
    { id:"transactions",icon:"🔄",label:"Transaksi" },
    { id:"fines",icon:"💰",label:"Denda" },
    { id:"users",icon:"👥",label:"Pengguna" },
  ]

  return (
    <div className="anim-slide">
      {/* Hero banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.sun} 0%, ${C.peach} 100%)`,
        borderRadius: 24, padding: "32px 32px 28px",
        marginBottom: 28, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", right:-20, top:-20, fontSize:120, opacity:.18, userSelect:"none" }}>📚</div>
        <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:32, color:C.dark, marginBottom:8 }}>
          Selamat Datang di LenteraPustaka! 🌟
        </h1>
        <p style={{ color:`${C.dark}99`, fontWeight:600 }}>Sistem Informasi Perpustakaan — HEXACORE · SI ITK</p>
        {health && <Badge color={C.mint}>● API {health.status} · v0.3.0</Badge>}
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:16, marginBottom:28 }}>
          <StatCard emoji="📖" label="Total Judul"  value={stats.total_titles}    color={C.sky}   />
          <StatCard emoji="📦" label="Total Stok"   value={stats.total_stock}     color={C.grape} />
          <StatCard emoji="🟢" label="Tersedia"     value={stats.available_stock} color={C.mint}  />
          <StatCard emoji="🔄" label="Dipinjam"     value={stats.borrowed_count}  color={C.peach} />
          <StatCard emoji="⚠️" label="Terlambat"    value={stats.overdue_count}   color={C.coral} />
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card accent={C.sky}>
          <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, marginBottom:12, color:C.sky }}>🚀 Menu</h3>
          {NAV_ITEMS_PREVIEW.map(n => (
            <div key={n.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.cream}`, fontWeight:600, fontSize:14 }}>
              <span style={{ fontSize:18 }}>{n.icon}</span>{n.label}
            </div>
          ))}
        </Card>
        <Card accent={C.grape}>
          <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, marginBottom:12, color:C.grape }}>👥 Tim Hexacore</h3>
          {[
            { name:"Maulana Malik Ibrahim", nim:"10231051", role:"Lead Backend",   color:C.sky   },
            { name:"Micka Mayulia Utama",   nim:"10231053", role:"Lead Frontend",  color:C.coral },
            { name:"Khanza Nabila Tsabita", nim:"10231049", role:"Lead DevOps",    color:C.mint  },
            { name:"Muhammad Aqila Ardhi",  nim:"10231057", role:"Lead QA & Docs", color:C.grape },
          ].map(m => (
            <div key={m.nim} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.cream}`, fontSize:13 }}>
              <div>
                <div style={{ fontWeight:700 }}>{m.name}</div>
                <div style={{ color:C.muted, fontSize:11 }}>{m.nim}</div>
              </div>
              <Badge color={m.color}>{m.role}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  HALAMAN — Buku (menggunakan ItemList, ItemForm, SearchBar)
// ══════════════════════════════════════════════════════════════
function BooksPage({ showToast }) {
  const [books, setBooks]       = useState([])
  const [cats, setCats]         = useState([])
  const [total, setTotal]       = useState(0)
  const [search, setSearch]     = useState("")
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    fetchBooks(search).then(d => { setBooks(d.books || []); setTotal(d.total || 0); setLoading(false) })
  }, [search])

  useEffect(() => { fetchCategories().then(setCats) }, [])
  useEffect(() => { load() }, [load])

  const handleSave = async (data, editId) => {
    if (editId) { await updateBook(editId, data); showToast("Buku diperbarui!") }
    else        { await createBook(data);          showToast("Buku ditambahkan!") }
    setEditing(null)
    load()
  }

  const handleEdit = (book) => { setEditing(book); setShowForm(true) }

  const handleDelete = (id) => {
    if (!confirm("Yakin hapus buku ini?")) return
    deleteBook(id).then(() => { showToast("Buku dihapus!"); load() })
      .catch(e => showToast(e.message, "error"))
  }

  return (
    <div className="anim-slide">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:C.sky }}>📚 Manajemen Buku</h2>
        <Btn color={C.sky} onClick={() => { setEditing(null); setShowForm(true) }}>+ Tambah Buku</Btn>
      </div>

      {/* SearchBar — komponen modul 3 */}
      <div style={{ marginBottom: 20 }}>
        <SearchBar onSearch={setSearch} placeholder="Cari judul, pengarang, ISBN…" />
      </div>

      {/* ItemList — komponen modul 3 */}
      <ItemList
        books={books}
        total={total}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        searchQuery={search}
      />

      {/* ItemForm — komponen modul 3 */}
      <ItemForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        editingItem={editing}
        categories={cats}
        onSave={handleSave}
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  HALAMAN — Kategori
// ══════════════════════════════════════════════════════════════
function CategoriesPage({ showToast }) {
  const [cats, setCats]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState({ name:"", description:"" })

  const load = () => { setLoading(true); fetchCategories().then(d => { setCats(d); setLoading(false) }) }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm({ name:"", description:"" }); setShowModal(true) }
  const openEdit = c  => { setEditing(c);    setForm({ name:c.name, description:c.description||"" }); setShowModal(true) }

  const save = () => {
    const fn = editing ? updateCategory(editing.category_id, form) : createCategory(form)
    fn.then(() => { showToast(editing ? "Kategori diperbarui!" : "Kategori ditambahkan!"); setShowModal(false); load() })
      .catch(() => showToast("Gagal menyimpan", "error"))
  }

  const del = id => {
    if (!confirm("Yakin hapus kategori ini?")) return
    deleteCategory(id).then(() => { showToast("Kategori dihapus!"); load() })
      .catch(() => showToast("Gagal menghapus", "error"))
  }

  const EMOJIS = ["📗","📘","📙","📕","📒","📔","📓","📃","📄"]

  return (
    <div className="anim-slide">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:C.grape }}>🏷️ Kategori Buku</h2>
        <Btn color={C.grape} onClick={openAdd}>+ Tambah Kategori</Btn>
      </div>
      {loading ? <Spinner /> : cats.length === 0 ? <Empty emoji="🏷️" text="Belum ada kategori" /> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
          {cats.map((c,i) => (
            <Card key={c.category_id} accent={C.grape}>
              <div style={{ fontSize:36, marginBottom:12 }}>{EMOJIS[i%EMOJIS.length]}</div>
              <h3 style={{ fontWeight:800, fontSize:17, marginBottom:6 }}>{c.name}</h3>
              <p style={{ color:C.muted, fontSize:13, marginBottom:16, minHeight:40 }}>{c.description||"Tidak ada deskripsi"}</p>
              <div style={{ display:"flex", gap:8 }}>
                <Btn small color={C.grape} onClick={() => openEdit(c)}>✏️ Edit</Btn>
                <Btn small danger onClick={() => del(c.category_id)}>🗑️</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
      {showModal && (
        <Modal title={editing ? "Edit Kategori" : "Tambah Kategori"} onClose={() => setShowModal(false)} accent={C.grape}>
          <Field label="Nama Kategori *">
            <Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="misal: Fiksi, Sains…" />
          </Field>
          <Field label="Deskripsi">
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3}
              style={{ width:"100%", padding:"10px 14px", borderRadius:12, border:`2px solid ${C.cream}`, background:C.cream, fontSize:14, resize:"vertical", fontFamily:"inherit" }} />
          </Field>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn outline color={C.muted} onClick={() => setShowModal(false)}>Batal</Btn>
            <Btn color={C.grape} onClick={save}>💾 Simpan</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  HALAMAN — Transaksi
// ══════════════════════════════════════════════════════════════
function TransactionsPage({ showToast }) {
  const [trxs, setTrxs]         = useState([])
  const [total, setTotal]        = useState(0)
  const [statusF, setStatusF]    = useState("")
  const [loading, setLoading]    = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [users, setUsers]        = useState([])
  const [books, setBooks]        = useState([])
  const [form, setForm]          = useState({ user_id:"", book_id:"", due_date:"" })

  const load = useCallback(() => {
    setLoading(true)
    fetchTransactions(statusF).then(d => { setTrxs(d.transactions||[]); setTotal(d.total||0); setLoading(false) })
  }, [statusF])

  useEffect(() => { fetchUsers().then(d=>setUsers(Array.isArray(d)?d:[])); fetchBooks("",200).then(d=>setBooks(d.books||[])) }, [])
  useEffect(() => { load() }, [load])

  const borrow = () => {
    borrowBook(form)
      .then(() => { showToast("Peminjaman berhasil!"); setShowModal(false); load() })
      .catch(e => showToast(e.message, "error"))
  }

  const doReturn = (id) => {
    if (!confirm("Konfirmasi pengembalian buku ini?")) return
    returnBook(id)
      .then(d => { showToast(d.status==="overdue" ? "⚠️ Terlambat! Denda otomatis dibuat." : "Buku dikembalikan!", d.status==="overdue"?"error":"success"); load() })
      .catch(e => showToast(e.message, "error"))
  }

  return (
    <div className="anim-slide">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:C.mint }}>🔄 Transaksi Peminjaman</h2>
        <Btn color={C.mint} onClick={() => { setForm({ user_id:"", book_id:"", due_date:"" }); setShowModal(true) }}>+ Pinjam Buku</Btn>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {["","borrowed","returned","overdue","lost"].map(s => (
          <button key={s} onClick={() => setStatusF(s)} style={{
            padding:"7px 16px", borderRadius:99, fontWeight:700, fontSize:13,
            border:`2px solid ${s===""?C.dark:(statusColor[s]||C.dark)}`,
            background: statusF===s ? (s===""?C.dark:(statusColor[s]||C.dark)) : "transparent",
            color: statusF===s ? "#fff" : (s===""?C.dark:(statusColor[s]||C.dark)),
            cursor:"pointer", fontFamily:"inherit",
          }}>
            {s===""?"Semua":(statusLabel[s]||s)}
          </button>
        ))}
      </div>
      <p style={{ color:C.muted, fontSize:13, marginBottom:16 }}>Total: {total} transaksi</p>
      {loading ? <Spinner /> : trxs.length===0 ? <Empty emoji="📋" text="Belum ada transaksi" /> : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {trxs.map(t => (
            <Card key={t.transaction_id} style={{ borderLeft:`4px solid ${statusColor[t.status]||C.muted}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
                <div>
                  <Badge color={statusColor[t.status]||C.muted}>{statusLabel[t.status]||t.status}</Badge>
                  <div style={{ marginTop:8, fontSize:13, color:C.muted, display:"flex", flexDirection:"column", gap:2 }}>
                    <span>👤 User: <code style={{ fontSize:11 }}>{t.user_id.slice(0,8)}…</code></span>
                    <span>📖 Buku: <code style={{ fontSize:11 }}>{t.book_id.slice(0,8)}…</code></span>
                    <span>📅 Pinjam: {fmtDate(t.borrow_date)}</span>
                    <span>⏰ Jatuh tempo: {fmtDate(t.due_date)}</span>
                    {t.return_date && <span>✅ Dikembalikan: {fmtDate(t.return_date)}</span>}
                  </div>
                </div>
                {t.status==="borrowed" && <Btn small color={C.mint} onClick={() => doReturn(t.transaction_id)}>↩️ Kembalikan</Btn>}
              </div>
            </Card>
          ))}
        </div>
      )}
      {showModal && (
        <Modal title="Pinjam Buku" onClose={() => setShowModal(false)} accent={C.mint}>
          <Field label="Pilih Pengguna *">
            <Select value={form.user_id} onChange={e=>setForm(p=>({...p,user_id:e.target.value}))}>
              <option value="">-- Pilih pengguna --</option>
              {users.map(u => <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.email})</option>)}
            </Select>
          </Field>
          <Field label="Pilih Buku *">
            <Select value={form.book_id} onChange={e=>setForm(p=>({...p,book_id:e.target.value}))}>
              <option value="">-- Pilih buku --</option>
              {books.filter(b=>b.available_stock>0).map(b => <option key={b.book_id} value={b.book_id}>{b.title} (stok: {b.available_stock})</option>)}
            </Select>
          </Field>
          <Field label="Tanggal Jatuh Tempo *">
            <Input type="date" value={form.due_date} onChange={e=>setForm(p=>({...p,due_date:e.target.value}))} />
          </Field>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn outline color={C.muted} onClick={() => setShowModal(false)}>Batal</Btn>
            <Btn color={C.mint} onClick={borrow}>📚 Pinjam</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  HALAMAN — Denda
// ══════════════════════════════════════════════════════════════
function FinesPage({ showToast }) {
  const [fines, setFines]   = useState([])
  const [total, setTotal]   = useState(0)
  const [paidF, setPaidF]   = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetchFines(paidF).then(d => { setFines(d.fines||[]); setTotal(d.total||0); setLoading(false) })
  }, [paidF])

  useEffect(() => { load() }, [load])

  const pay = id => {
    if (!confirm("Tandai denda ini sebagai lunas?")) return
    payFine(id).then(() => { showToast("Denda ditandai lunas! 🎉"); load() }).catch(() => showToast("Gagal", "error"))
  }

  const totalUnpaid = fines.filter(f=>!f.is_paid).reduce((a,f)=>a+f.amount, 0)

  return (
    <div className="anim-slide">
      <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:C.coral, marginBottom:20 }}>💰 Denda Keterlambatan</h2>
      <div style={{ background:`linear-gradient(135deg,${C.coral}22,${C.peach}22)`, border:`2px solid ${C.coral}30`, borderRadius:16, padding:"16px 20px", marginBottom:20, display:"flex", gap:24, flexWrap:"wrap" }}>
        <div><div style={{ fontSize:11, color:C.muted, fontWeight:700 }}>BELUM LUNAS</div><div style={{ fontSize:24, fontWeight:800, color:C.coral }}>{fmt(totalUnpaid)}</div></div>
        <div><div style={{ fontSize:11, color:C.muted, fontWeight:700 }}>TOTAL DENDA</div><div style={{ fontSize:24, fontWeight:800 }}>{total}</div></div>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[{v:null,l:"Semua"},{v:false,l:"⏳ Belum Lunas"},{v:true,l:"✅ Lunas"}].map(opt => (
          <button key={String(opt.v)} onClick={() => setPaidF(opt.v)} style={{
            padding:"7px 16px", borderRadius:99, fontWeight:700, fontSize:13, cursor:"pointer",
            border:`2px solid ${C.coral}`,
            background: paidF===opt.v ? C.coral : "transparent",
            color: paidF===opt.v ? "#fff" : C.coral,
            fontFamily:"inherit",
          }}>{opt.l}</button>
        ))}
      </div>
      {loading ? <Spinner /> : fines.length===0 ? <Empty emoji="🎉" text="Tidak ada denda!" /> : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {fines.map(f => (
            <Card key={f.fine_id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderLeft:`4px solid ${f.is_paid?C.mint:C.coral}`, flexWrap:"wrap", gap:12 }}>
              <div>
                <Badge color={f.is_paid?C.mint:C.coral}>{f.is_paid?"✅ Lunas":"⏳ Belum Lunas"}</Badge>
                <div style={{ marginTop:8, fontSize:13, color:C.muted }}>
                  <div>📋 Transaksi: <code style={{ fontSize:11 }}>{f.transaction_id.slice(0,8)}…</code></div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontWeight:800, fontSize:22, color:f.is_paid?C.mint:C.coral }}>{fmt(f.amount)}</div>
                {!f.is_paid && <Btn small color={C.mint} onClick={() => pay(f.fine_id)} style={{ marginTop:8 }}>💳 Bayar</Btn>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  HALAMAN — Pengguna
// ══════════════════════════════════════════════════════════════
function UsersPage({ showToast }) {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState({ full_name:"", email:"", password:"", role:"member" })

  const load = () => { setLoading(true); fetchUsers().then(d => { setUsers(Array.isArray(d)?d:[]); setLoading(false) }) }
  useEffect(() => { load() }, [])

  const save = () => {
    createUser(form)
      .then(() => { showToast("Pengguna ditambahkan!"); setShowModal(false); load() })
      .catch(e => showToast(e.message, "error"))
  }

  const roleColor = { admin: C.coral, member: C.sky }
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))

  return (
    <div className="anim-slide">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:C.peach }}>👥 Pengguna</h2>
        <Btn color={C.peach} onClick={() => { setForm({ full_name:"", email:"", password:"", role:"member" }); setShowModal(true) }}>+ Tambah Pengguna</Btn>
      </div>
      {loading ? <Spinner /> : users.length===0 ? <Empty emoji="👤" text="Belum ada pengguna" /> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
          {users.map(u => (
            <Card key={u.user_id} accent={roleColor[u.role]||C.peach}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg,${C.peach},${C.coral})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#fff", fontWeight:800 }}>
                  {u.full_name[0]}
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:15 }}>{u.full_name}</div>
                  <div style={{ fontSize:12, color:C.muted }}>{u.email}</div>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <Badge color={roleColor[u.role]||C.peach}>{u.role==="admin"?"👑 Admin":"👤 Member"}</Badge>
                <span style={{ fontSize:11, color:C.muted }}>{fmtDate(u.created_at)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      {showModal && (
        <Modal title="Tambah Pengguna" onClose={() => setShowModal(false)} accent={C.peach}>
          <Field label="Nama Lengkap *"><Input value={form.full_name} onChange={f("full_name")} placeholder="Nama pengguna" /></Field>
          <Field label="Email *"><Input type="email" value={form.email} onChange={f("email")} placeholder="email@example.com" /></Field>
          <Field label="Password *"><Input type="password" value={form.password} onChange={f("password")} placeholder="Min. 8 karakter" /></Field>
          <Field label="Role"><Select value={form.role} onChange={f("role")}><option value="member">👤 Member</option><option value="admin">👑 Admin</option></Select></Field>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn outline color={C.muted} onClick={() => setShowModal(false)}>Batal</Btn>
            <Btn color={C.peach} onClick={save}>💾 Simpan</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  injectCSS()
  const [page, setPage]   = useState("dashboard")
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type })
  }, [])

  const PAGES = {
    dashboard:    <Dashboard        showToast={showToast} />,
    books:        <BooksPage        showToast={showToast} />,
    categories:   <CategoriesPage   showToast={showToast} />,
    transactions: <TransactionsPage showToast={showToast} />,
    fines:        <FinesPage        showToast={showToast} />,
    users:        <UsersPage        showToast={showToast} />,
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>

      {/* Header = Sidebar navigasi (sesuai modul 3: Header.jsx) */}
      <Header currentPage={page} onNavigate={setPage} />

      {/* Main content */}
      <main style={{ flex:1, padding:"32px 32px 48px", overflowY:"auto" }}>
        {PAGES[page] || PAGES.dashboard}
      </main>

      {/* Toast notifikasi */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
