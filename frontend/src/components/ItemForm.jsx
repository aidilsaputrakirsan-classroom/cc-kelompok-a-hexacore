// ============================================================
// components/ItemForm.jsx
// ============================================================
import { useState, useEffect } from 'react'
import { Modal, Field, Input, Select, Textarea } from './ui/Common'
import { uploadBookCover, API_BASE } from '../services/api'

const EMPTY = {
  isbn: '', title: '', author: '', publisher: '',
  publication_year: '', synopsis: '',
  total_stock: 1, available_stock: 1,
  category_id: '', genre_ids: [],
  cover_image_url: null,
}

const ISBN_ALLOWED = /^[0-9-]+$/

function validateIsbn(value) {
  const isbn = value.trim()
  if (!isbn) return ''
  if (isbn.length < 10) return 'ISBN minimal 10 karakter'
  if (isbn.length > 20) return 'ISBN maksimal 20 karakter'
  if (!ISBN_ALLOWED.test(isbn)) return 'ISBN hanya boleh berisi angka dan strip (-)'
  if (!isbn.includes('-')) return 'ISBN harus menggunakan format angka dan strip (-)'
  return ''
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
  const [errors, setErrors]   = useState({})   // validasi per-field
  const [coverFile, setCoverFile] = useState(null)

  // Bug fix: isEdit harus dideklarasikan di level komponen,
  // bukan di dalam JSX setelah handleSave — supaya handleSave bisa pakai
  const isEdit = Boolean(editingItem)

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
        cover_image_url:  editingItem.cover_image_url  ?? null,
      })
    } else {
      setForm(EMPTY)
    }
    setCoverFile(null)
    setErrors({})
  }, [editingItem, isOpen])

  const f = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })) }
  const handleIsbnChange = e => {
    const nextValue = e.target.value.replace(/[^0-9-]/g, '').slice(0, 20)
    setForm(p => ({ ...p, isbn: nextValue }))
    setErrors(p => ({ ...p, isbn: validateIsbn(nextValue) || '' }))
  }

  const handleSave = async () => {
    // Validasi field wajib
    const e = {}
    if (!form.title.trim())           e.title      = 'Judul wajib diisi'
    if (!form.author.trim())          e.author     = 'Pengarang wajib diisi'
    if (!form.category_id)            e.category_id = 'Kategori wajib dipilih'
    if (!isEdit) {
      const isbnError = validateIsbn(form.isbn)
      if (isbnError) e.isbn = isbnError
    }
    if (Number(form.total_stock) < 1) e.total_stock = 'Minimal 1'
    if (Number(form.available_stock) > Number(form.total_stock))
                                      e.available_stock = 'Tidak boleh melebihi total stok'

    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    try {
      let finalCoverUrl = form.cover_image_url
      if (coverFile) {
        const upRes = await uploadBookCover(coverFile)
        finalCoverUrl = upRes.url
      }

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
        cover_image_url:  finalCoverUrl,
      }
      await onSave(isEdit ? base : { ...base, isbn: form.isbn.trim() || null }, editingItem?.book_id ?? null)
      onClose()
    } catch (err) {
      // Tampilkan error dari backend di atas form
      setErrors({ _submit: err.message || 'Gagal menyimpan buku' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

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
      {/* Error dari backend */}
      {errors._submit && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {errors._submit}
        </div>
      )}

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
        <Field label="ISBN" optional hint="Wajib angka + strip, 10-20 karakter — contoh: 978-602-03-3446-5" error={errors.isbn}>
          <Input value={form.isbn} onChange={handleIsbnChange} maxLength={20} placeholder="978-602-03-3446-5" error={errors.isbn} />
        </Field>
      )}

      <Field label="Cover Buku" optional hint="Opsional: Upload gambar untuk cover buku">
        <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} className="input" style={{ background: 'var(--c-bg)', padding: '6px' }} />
        {form.cover_image_url && !coverFile && (
          <div style={{ marginTop: 8, padding: 8, background: 'var(--c-bg)', borderRadius: 6, display: 'inline-block' }}>
            <span style={{ display: 'block', fontSize: 11, marginBottom: 4, color: 'var(--c-text3)' }}>Cover saat ini:</span>
            <img src={`${API_BASE}${form.cover_image_url}`} style={{ height: 60, borderRadius: 4 }} alt="Current Cover" />
          </div>
        )}
      </Field>

      <div className="form-row">
        <Field label="Judul *" error={errors.title}>
          <Input value={form.title} onChange={f('title')} placeholder="Judul buku" error={errors.title}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }} />
        </Field>
        <Field label="Pengarang *" error={errors.author}>
          <Input value={form.author} onChange={f('author')} placeholder="Nama pengarang" error={errors.author}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }} />
        </Field>
      </div>

      <div className="form-row">
        <Field label="Penerbit" optional>
          <Input value={form.publisher} onChange={f('publisher')} placeholder="Nama penerbit" />
        </Field>
        <Field label="Tahun Terbit" optional>
          <Input value={form.publication_year} onChange={f('publication_year')} type="number" placeholder="2024" />
        </Field>
      </div>

      <div className="form-row">
        <Field label="Kategori *" error={errors.category_id}>
          <Select value={form.category_id} onChange={f('category_id')} error={errors.category_id}>
            <option value="">Pilih kategori…</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </Select>
        </Field>
        <div className="form-row" style={{ gap: 8 }}>
          <Field label="Total Stok" error={errors.total_stock}>
            <Input value={form.total_stock} onChange={f('total_stock')} type="number" min="1" error={errors.total_stock} />
          </Field>
          <Field label="Tersedia" error={errors.available_stock}>
            <Input value={form.available_stock} onChange={f('available_stock')} type="number" min="0" error={errors.available_stock} />
          </Field>
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
