// ============================================================
// components/ItemCard.jsx
// ============================================================
import { Badge } from './ui/Common'

const COVERS = ['cover-0','cover-1','cover-2','cover-3','cover-4','cover-5','cover-6','cover-7']

function getCover(title = '') {
  let h = 0
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) & 0xffffffff
  return COVERS[Math.abs(h) % COVERS.length]
}

function ItemCard({ book, onEdit, onDelete, isAdmin }) {
  const cover    = getCover(book.title)
  const stockOk  = book.available_stock > 5
  const stockLow = book.available_stock > 0 && book.available_stock <= 5
  const stockOut = book.available_stock === 0

  return (
    <div className="book-card">
      {/* Cover */}
      <div className="book-cover">
        <div className={`book-cover-bg ${cover}`}>
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
            <button
              onClick={() => onEdit(book)}
              style={{
                padding: '6px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,.15)', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                backdropFilter: 'blur(4px)',
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(book.book_id)}
              style={{
                padding: '6px 14px', borderRadius: 8,
                background: 'rgba(239,68,68,.35)', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                backdropFilter: 'blur(4px)',
              }}
            >
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
            {book.genres.length > 2 && (
              <Badge cls="badge-slate">+{book.genres.length - 2}</Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemCard