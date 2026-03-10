// ============================================================
// components/ItemCard.jsx — Card satu buku
// Sesuai peran modul 3: menampilkan 1 item dengan aksi edit/hapus
// ============================================================
import { Badge, Btn } from "./ui/Common"
import { C } from "./ui/tokens"

function ItemCard({ book, onEdit, onDelete }) {
  return (
    <div className="anim-pop" style={{
      background: C.card,
      borderRadius: 20,
      padding: 20,
      boxShadow: "0 4px 24px rgba(0,0,0,.07)",
      borderLeft: `4px solid ${book.available_stock > 0 ? C.mint : C.coral}`,
      display: "flex", flexDirection: "column", gap: 10,
      transition: "transform .2s, box-shadow .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      {/* Baris atas: badge stok + ISBN */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Badge color={book.available_stock > 0 ? C.mint : C.coral}>
          {book.available_stock > 0 ? `✅ ${book.available_stock} tersedia` : "❌ Habis"}
        </Badge>
        <span style={{ fontSize: 11, color: C.muted }}>{book.isbn}</span>
      </div>

      {/* Judul & pengarang */}
      <div>
        <h3 style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3, marginBottom: 4 }}>
          {book.title}
        </h3>
        <p style={{ color: C.muted, fontSize: 13 }}>✍️ {book.author}</p>
      </div>

      {/* Meta info */}
      <div style={{ display: "flex", gap: 8, fontSize: 12, color: C.muted, flexWrap: "wrap" }}>
        {book.publisher      && <span>🏢 {book.publisher}</span>}
        {book.publication_year && <span>📅 {book.publication_year}</span>}
        <span>📦 {book.available_stock}/{book.total_stock} stok</span>
      </div>

      {/* Aksi */}
      <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: `1px solid ${C.cream}` }}>
        <Btn small color={C.sky}  onClick={() => onEdit(book)}>✏️ Edit</Btn>
        <Btn small danger          onClick={() => onDelete(book.book_id)}>🗑️ Hapus</Btn>
      </div>
    </div>
  )
}

export default ItemCard
