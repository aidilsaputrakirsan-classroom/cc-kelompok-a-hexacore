// ============================================================
// components/ItemList.jsx — Container daftar buku
// Sesuai peran modul 3: grid + empty state + loading
// ============================================================
import ItemCard from "./ItemCard"
import { Spinner, Empty } from "./ui/Common"
import { C } from "./ui/tokens"

function ItemList({ books, total, onEdit, onDelete, loading, searchQuery }) {
  if (loading) return <Spinner />

  if (books.length === 0) {
    return (
      <Empty
        emoji={searchQuery ? "🔍" : "📭"}
        text={
          searchQuery
            ? `Tidak ada buku dengan kata kunci "${searchQuery}"`
            : "Belum ada buku. Klik + Tambah Buku untuk memulai!"
        }
      />
    )
  }

  return (
    <section>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>
        Menampilkan <strong>{books.length}</strong> dari <strong>{total}</strong> buku
        {searchQuery && <> untuk pencarian "<em>{searchQuery}</em>"</>}
      </p>

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
    </section>
  )
}

export default ItemList
