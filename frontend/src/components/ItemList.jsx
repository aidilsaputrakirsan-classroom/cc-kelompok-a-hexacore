// ============================================================
// components/ItemList.jsx — Container daftar buku
// Sesuai peran modul 3: grid + sorting dropdown + empty state + loading
// ============================================================
import ItemCard from "./ItemCard"
import { Spinner, Empty } from "./ui/Common"
import { C } from "./ui/tokens"

// Opsi sorting sesuai tugas modul 3
const SORT_OPTIONS = [
  { value: "terbaru", label: "🕐 Terbaru"       },
  { value: "nama",    label: "🔤 Nama (A–Z)"    },
  { value: "harga",   label: "📦 Stok Tersedia" },
]

function SortDropdown({ sortBy, onSortChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.muted, whiteSpace: "nowrap" }}>
        Urutkan berdasarkan:
      </span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {SORT_OPTIONS.map(opt => {
          const active = sortBy === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                border: `2px solid ${active ? C.sky : C.cream}`,
                background: active ? C.sky : "#fff",
                color: active ? "#fff" : C.muted,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .2s",
                boxShadow: active ? `0 3px 10px ${C.sky}44` : "none",
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ItemList({ books, total, onEdit, onDelete, loading, searchQuery, sortBy, onSortChange }) {
  if (loading) return <Spinner />

  return (
    <section>
      {/* ── Toolbar: sort dropdown + info jumlah ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 16,
        padding: "12px 16px",
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,.05)",
      }}>
        <SortDropdown sortBy={sortBy} onSortChange={onSortChange} />
        <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
          <strong>{books.length}</strong> dari <strong>{total}</strong> buku
          {searchQuery && <> · cari "<em>{searchQuery}</em>"</>}
        </p>
      </div>

      {/* ── Empty state ── */}
      {books.length === 0 && (
        <Empty
          emoji={searchQuery ? "🔍" : "📭"}
          text={
            searchQuery
              ? `Tidak ada buku dengan kata kunci "${searchQuery}"`
              : "Belum ada buku. Klik + Tambah Buku untuk memulai!"
          }
        />
      )}

      {/* ── Grid buku ── */}
      {books.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {books.map(book => (
            <ItemCard
              key={book.book_id}
              book={book}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default ItemList
