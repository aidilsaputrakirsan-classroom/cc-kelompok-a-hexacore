// ============================================================
// components/ItemForm.jsx — Form tambah & edit buku
// Sesuai peran modul 3: form create/edit item
// ============================================================
import { useState, useEffect } from "react"
import { Btn, Field, Input, Select, Modal } from "./ui/Common"
import { C } from "./ui/tokens"

const EMPTY = {
  isbn: "", title: "", author: "", publisher: "",
  publication_year: "", total_stock: 1, available_stock: 1, category_id: "",
}

function ItemForm({ editingItem, categories, onSave, onCancel, isOpen, onClose }) {
  const [form, setForm]   = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  // Isi form saat edit
  useEffect(() => {
    if (editingItem) {
      setForm({
        isbn:             editingItem.isbn             ?? "",
        title:            editingItem.title            ?? "",
        author:           editingItem.author           ?? "",
        publisher:        editingItem.publisher        ?? "",
        publication_year: editingItem.publication_year ?? "",
        total_stock:      editingItem.total_stock      ?? 1,
        available_stock:  editingItem.available_stock  ?? 1,
        category_id:      editingItem.category_id      ?? "",
      })
    } else {
      setForm(EMPTY)
    }
  }, [editingItem, isOpen])

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave({
        ...form,
        publication_year: Number(form.publication_year) || null,
        total_stock:      Number(form.total_stock),
        available_stock:  Number(form.available_stock),
        category_id:      Number(form.category_id),
      }, editingItem?.book_id ?? null)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const isEdit  = Boolean(editingItem)
  const accent  = isEdit ? C.sun : C.sky
  const title   = isEdit ? "✏️ Edit Buku" : "➕ Tambah Buku Baru"

  return (
    <Modal title={title} onClose={onClose} accent={accent}>
      <Field label="Judul *">
        <Input value={form.title} onChange={f("title")} placeholder="Judul buku" />
      </Field>
      <Field label="ISBN">
        <Input value={form.isbn} onChange={f("isbn")} placeholder="978-xxx-xxx" />
      </Field>
      <Field label="Pengarang *">
        <Input value={form.author} onChange={f("author")} placeholder="Nama pengarang" />
      </Field>
      <Field label="Penerbit">
        <Input value={form.publisher} onChange={f("publisher")} placeholder="Nama penerbit" />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Tahun Terbit">
          <Input value={form.publication_year} onChange={f("publication_year")} type="number" placeholder="2024" />
        </Field>
        <Field label="Kategori *">
          <Select value={form.category_id} onChange={f("category_id")}>
            <option value="">Pilih kategori</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Total Stok">
          <Input value={form.total_stock} onChange={f("total_stock")} type="number" />
        </Field>
        <Field label="Stok Tersedia">
          <Input value={form.available_stock} onChange={f("available_stock")} type="number" />
        </Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn outline color={C.muted} onClick={onClose}>Batal</Btn>
        <Btn color={accent} onClick={handleSave} disabled={loading}>
          {loading ? "⏳ Menyimpan…" : "💾 Simpan"}
        </Btn>
      </div>
    </Modal>
  )
}

export default ItemForm
