// ============================================================
// components/ItemForm.jsx
// ============================================================
import { useState, useEffect } from 'react'
import { Modal, Field, Input, Select, Textarea } from './ui/Common'

const EMPTY = {
  isbn: '', title: '', author: '', publisher: '',
  publication_year: '', synopsis: '',
  total_stock: 1, available_stock: 1,
  category_id: '', genre_ids: [],
}

function GenreChips({ genres, selected, onChange }) {
  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter(g => g !== id) : [...selected, id])

  if (!genres.length)
    return <p style={{ fontSize: 12, color: 'var(--c-text3)', padding: 8 }}>Belum ada genre.</p>

  return (
    <div className="genre-grid">
      {genres.map(g => (
        <span
          key={g.genre_id}
          className={`genre-chip${selected.includes(g.genre_id) ? ' selected' : ''}`}
          onClick={() => toggle(g.genre_id)}
        >
          {selected.includes(g.genre_id) ? '✓ ' : ''}{g.name}
        </span>
      ))}
    </div>
  )
}

function ItemForm({ editingItem, categories, genres, onSave, isOpen, onClose }) {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [isbnErr, setIsbnErr] = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (editingItem) {
      setForm({
        title:            editingItem.title            ?? '',
        author:           editingItem.author           ?? '',
        publisher:        editingItem.publisher        ?? '',
        publication_year: editingItem.publication_year ?? '',
        synopsis:         editingItem.synopsis         ?? '',
        total_stock:      editingItem.total_stock      ?? 1,
        available_stock:  editingItem.available_stock  ?? 1,
        category_id:      editingItem.category_id      ?? '',
        genre_ids:        editingItem.genres?.map(g => g.genre_id) ?? [],
      })
    } else {
      setForm(EMPTY)
    }
    setIsbnErr('')
  }, [editingItem, isOpen])

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!isEdit && form.isbn.trim() && form.isbn.trim().length < 10) {
      setIsbnErr('ISBN minimal 10 karakter'); return
    }
    setLoading(true)
    try {
      const base = {
        title:            form.title.trim(),
        author:           form.author.trim(),
        publisher:        form.publisher.trim() || null,
        publication_year: Number(form.publication_year) || null,
        synopsis:         form.synopsis.trim() || null,
        total_stock:      Number(form.total_stock),
        available_stock:  Number(form.available_stock),
        category_id:      Number(form.category_id),
        genre_ids:        form.genre_ids,
      }
      await onSave(isEdit ? base : { ...base, isbn: form.isbn.trim() || null }, editingItem?.book_id ?? null)
      onClose()
    } finally { setLoading(false) }
  }

  if (!isOpen) return null
  const isEdit = Boolean(editingItem)

  return (
    <Modal
      title={isEdit ? 'Edit Buku' : 'Tambah Buku Baru'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Menyimpan…' : 'Simpan'}
          </button>
        </>
      }
    >
      {isEdit ? (
        <div className="isbn-info">
          <span style={{ color: 'var(--c-text3)' }}>🔒</span>
          <div>
            <span style={{ fontWeight: 600 }}>ISBN: </span>
            <span style={{ fontFamily: 'monospace' }}>{editingItem.isbn ?? '—'}</span>
            <span style={{ display: 'block', fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>
              ISBN tidak dapat diubah setelah buku dibuat
            </span>
          </div>
        </div>
      ) : (
        <Field label="ISBN" optional hint="Min. 10 karakter — contoh: 978-602-03-3446-5" error={isbnErr}>
          <Input value={form.isbn} onChange={e => { f('isbn')(e); setIsbnErr('') }} placeholder="978-xxx-xxx-xxx-x" error={isbnErr} />
        </Field>
      )}

      <div className="form-row">
        <Field label="Judul *"><Input value={form.title} onChange={f('title')} placeholder="Judul buku" /></Field>
        <Field label="Pengarang *"><Input value={form.author} onChange={f('author')} placeholder="Nama pengarang" /></Field>
      </div>

      <div className="form-row">
        <Field label="Penerbit" optional><Input value={form.publisher} onChange={f('publisher')} placeholder="Nama penerbit" /></Field>
        <Field label="Tahun Terbit" optional><Input value={form.publication_year} onChange={f('publication_year')} type="number" placeholder="2024" /></Field>
      </div>

      <div className="form-row">
        <Field label="Kategori *">
          <Select value={form.category_id} onChange={f('category_id')}>
            <option value="">Pilih kategori…</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </Select>
        </Field>
        <div className="form-row" style={{ gap: 8 }}>
          <Field label="Total Stok"><Input value={form.total_stock} onChange={f('total_stock')} type="number" min="1" /></Field>
          <Field label="Tersedia"><Input value={form.available_stock} onChange={f('available_stock')} type="number" min="0" /></Field>
        </div>
      </div>

      <Field label="Genre" optional hint={`${form.genre_ids.length} dipilih`}>
        <GenreChips genres={genres} selected={form.genre_ids}
          onChange={ids => setForm(p => ({ ...p, genre_ids: ids }))} />
      </Field>

      <Field label="Sinopsis" optional>
        <Textarea value={form.synopsis} onChange={f('synopsis')} rows={3} placeholder="Ringkasan singkat…" />
      </Field>
    </Modal>
  )
}

export default ItemForm