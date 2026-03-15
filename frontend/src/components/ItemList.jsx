// ============================================================
// components/ItemList.jsx
// ============================================================
import { Spinner, Empty } from './ui/Common'
import ItemCard from './ItemCard'

const SORT_OPTIONS = [
  { value: 'default', label: 'Terbaru'    },
  { value: 'title',   label: 'Nama (A–Z)' },
  { value: 'stock',   label: 'Tersedia'   },
]

function ItemList({ books, total, onEdit, onDelete, loading, searchQuery, sortBy, onSortChange, isAdmin }) {
  if (loading) return <Spinner />

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-sort">
          <span className="toolbar-sort-label">Urutkan:</span>
          <div className="filter-pills">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`filter-pill${sortBy === opt.value ? ' active' : ''}`}
                onClick={() => onSortChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 12.5, color: 'var(--c-text3)', marginLeft: 'auto' }}>
          {books.length} dari {total} buku
          {searchQuery && <em style={{ fontStyle: 'normal' }}> · "{searchQuery}"</em>}
        </span>
      </div>

      {/* Empty */}
      {books.length === 0 && (
        <Empty
          icon={searchQuery ? '🔍' : '📚'}
          title={searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada buku'}
          sub={searchQuery ? 'Coba kata kunci yang berbeda' : ''}
        />
      )}

      {/* Grid */}
      {books.length > 0 && (
        <div className="books-grid">
          {books.map(book => (
            <ItemCard
              key={book.book_id}
              book={book}
              onEdit={onEdit}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ItemList