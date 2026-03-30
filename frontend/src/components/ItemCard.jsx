// ============================================================
// components/ItemCard.jsx
// Klik buku → buka modal detail buku
// onBorrow(book) → dipanggil kalau member mau pinjam dari beranda
// ============================================================
import { Badge } from './ui/Common'

const COVERS = ['cover-0','cover-1','cover-2','cover-3','cover-4','cover-5','cover-6','cover-7']

function getCover(title = '') {
  let h = 0
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) & 0xffffffff
  return COVERS[Math.abs(h) % COVERS.length]
}

// Palet warna per cover untuk dipakai di modal juga
const COVER_COLORS = {
  'cover-0': ['#1e3a5f','#2563eb'],
  'cover-1': ['#1a3330','#059669'],
  'cover-2': ['#3b1f4a','#7c3aed'],
  'cover-3': ['#4a1f1f','#dc2626'],
  'cover-4': ['#3d2b1a','#d97706'],
  'cover-5': ['#1a2f4a','#0891b2'],
  'cover-6': ['#2d1f3a','#9333ea'],
  'cover-7': ['#1f3a1f','#16a34a'],
}

// ── Modal Detail Buku ─────────────────────────────────────────
export function BookDetailModal({ book, cats = [], onClose, onBorrow, isLoggedIn }) {
  if (!book) return null
  const cover = getCover(book.title)
  const [c1, c2] = COVER_COLORS[cover] || ['#1e3a5f','#2563eb']
  const stockOut = book.available_stock === 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header bergambar */}
        <div style={{
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          padding: '28px 28px 20px',
          borderRadius: '16px 16px 0 0',
          position: 'relative',
          flexShrink: 0,
        }}>
          {/* Tutup */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(255,255,255,.15)', border: 'none',
            color: '#fff', width: 32, height: 32, borderRadius: '50%',
            cursor: 'pointer', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>✕</button>

          {/* Cover mini + info utama berdampingan */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            {/* Cover mini */}
            <div style={{
              width: 80, minWidth: 80, height: 112,
              background: 'rgba(255,255,255,.12)',
              borderRadius: 8,
              border: '2px solid rgba(255,255,255,.2)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: 6, textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>📚</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.7)', lineHeight: 1.3,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                {book.title}
              </div>
            </div>

            {/* Info utama */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 4,
                fontFamily: '"DM Serif Display", Georgia, serif' }}>
                {book.title}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', marginBottom: 10 }}>
                {book.author}{book.publisher ? ` · ${book.publisher}` : ''}{book.publication_year ? ` · ${book.publication_year}` : ''}
              </div>

              {/* Badges genre */}
              {book.genres?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {book.genres.map(g => (
                    <span key={g.genre_id} style={{
                      background: 'rgba(255,255,255,.18)', color: '#fff',
                      borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                    }}>{g.name}</span>
                  ))}
                </div>
              )}

              {/* Stok */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: stockOut ? 'rgba(239,68,68,.4)' : 'rgba(34,197,94,.3)',
                  color: '#fff', borderRadius: 99, padding: '3px 12px',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {stockOut ? '✕ Stok Habis' : `✓ ${book.available_stock} tersedia`}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>
                  dari {book.total_stock} eksemplar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body scrollable */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 28px' }}>
          {/* ISBN */}
          {book.isbn && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text3)',
                textTransform: 'uppercase', letterSpacing: '.5px', minWidth: 70 }}>ISBN</span>
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--c-text2)' }}>{book.isbn}</span>
            </div>
          )}

          {/* Synopsis */}
          {book.synopsis && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text3)',
                textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Sinopsis</div>
              <p style={{ fontSize: 13.5, color: 'var(--c-text2)', lineHeight: 1.7, margin: 0 }}>
                {book.synopsis}
              </p>
            </div>
          )}

          {/* Info detail grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px',
            background: 'var(--c-bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
            {[
              ['Kategori', cats.find(c => c.category_id === book.category_id)?.name || `#${book.category_id}`],
              ['Penerbit', book.publisher || '—'],
              ['Tahun', book.publication_year || '—'],
              ['Total Stok', `${book.total_stock} eksemplar`],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--c-text3)',
                  textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 500 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Info peminjaman */}
          {!stockOut && isLoggedIn && (
            <div className="alert alert-info" style={{ marginBottom: 0, fontSize: 12.5 }}>
              📅 Masa peminjaman <strong>7 hari</strong> dari tanggal pinjam. Maks.
            </div>
          )}
          {stockOut && (
            <div className="alert alert-error" style={{ marginBottom: 0 }}>
              Buku ini sedang tidak tersedia. Cek kembali nanti.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px 20px', borderTop: '1px solid var(--c-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Tutup</button>
            {isLoggedIn && !stockOut && onBorrow && (
              <button className="btn btn-primary" onClick={() => onBorrow(book)}>
                + Pinjam Buku Ini
              </button>
            )}
            {!isLoggedIn && !stockOut && (
              <span style={{ fontSize: 12, color: 'var(--c-text3)', alignSelf: 'center' }}>
                Login untuk meminjam
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ItemCard ──────────────────────────────────────────────────
function ItemCard({ book, onEdit, onDelete, isAdmin, onClick }) {
  const cover   = getCover(book.title)
  const stockOk  = book.available_stock > 5
  const stockLow = book.available_stock > 0 && book.available_stock <= 5
  const stockOut = book.available_stock === 0

  return (
    <div className="book-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Cover */}
      <div className="book-cover">
        <div className={`book-cover-bg ${cover}`}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: .7 }}>📚</div>
          <span className="book-cover-title">{book.title}</span>
          <span className="book-cover-author">{book.author}</span>
        </div>

        {/* Stock badge */}
        <div className="book-cover-badge">
          {stockOk  && <span className="badge badge-white">✓ {book.available_stock}</span>}
          {stockLow && <span className="badge badge-white" style={{ background: 'rgba(245,158,11,.4)' }}>⚠ {book.available_stock}</span>}
          {stockOut && <span className="badge badge-white" style={{ background: 'rgba(239,68,68,.45)' }}>Habis</span>}
        </div>

        {/* Admin hover overlay */}
        {isAdmin && (
          <div className="book-cover-overlay">
            <button onClick={e => { e.stopPropagation(); onEdit(book) }}
              style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,.15)',
                color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              Edit
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(book.book_id) }}
              style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,.35)',
                color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              Hapus
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div className="book-info-title">{book.title}</div>
        <div className="book-info-author">{book.author}</div>
        {book.genres?.length > 0 && (
          <div className="book-info-genres">
            {book.genres.slice(0, 2).map(g => (
              <Badge key={g.genre_id} cls="badge-blue">{g.name}</Badge>
            ))}
            {book.genres.length > 2 && <Badge cls="badge-slate">+{book.genres.length - 2}</Badge>}
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemCard