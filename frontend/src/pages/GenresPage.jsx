import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import Header    from '../components/Header';
import ItemForm  from '../components/ItemForm';
import ItemCard, { BookDetailModal } from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import ItemList  from '../components/ItemList';
import {
  Spinner, Empty, Modal, Field, Input, Select, Textarea,
  StatCard, ToastContainer, Confirm,
} from '../components/ui/Common';

import { useToast } from '../hooks/useToast';
import { useBooks } from '../hooks/useBooks';
import {
  fmt, fmtDate, validatePassword, pwStrength,
  trxBadge, fineBadge,
} from '../utils/formatters';

import {
  login, register, logout, getMe, token, userCache,
  changePassword, updateMyProfile,
  fetchCategories, createCategory, updateCategory, deleteCategory,
  fetchGenres,     createGenre,    updateGenre,    deleteGenre,
  fetchBooks, fetchBookStats, createBook, updateBook, deleteBook,
  fetchUsers,      createUser,     deleteUser,     adminResetPassword,
  fetchTransactions, borrowBook, approveTransaction, rejectTransaction, returnBook, reportBookLost,
  fetchFines, submitFinePayment, approveFine, rejectFine,
  API_BASE,
} from '../services/api';

function GenresPage({ isAdmin, toast }) {
  const [genres, setGenres]   = useState([])
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState(null)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({ name: '', description: '' })
  const [confirm, setConfirm] = useState(null)

  const load = () => {
    setLoading(true); setLoadErr(null)
    fetchGenres()
      .then(d => { setGenres(d || []); setLoading(false) })
      .catch(err => { setLoadErr(err.message); setLoading(false) })
  }
  useEffect(() => { load() }, [])
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    if (!form.name.trim()) { toast('Nama genre wajib diisi', 'error'); return }
    try {
      if (modal === 'add') { await createGenre(form); toast('Genre ditambahkan') }
      else { await updateGenre(modal.genre_id, form); toast('Genre diperbarui') }
      setModal(null); setForm({ name: '', description: '' }); load()
    } catch (err) { toast(err.message, 'error') }
  }

  const del = g => setConfirm({
    title: 'Hapus Genre', message: `Yakin hapus "${g.name}"?`,
    onConfirm: async () => {
      try { await deleteGenre(g.genre_id); toast('Dihapus'); setConfirm(null); load() }
      catch (err) { toast(err.message, 'error'); setConfirm(null) }
    },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Genre Buku</h1>
          <p className="page-sub">{genres.length} genre terdaftar</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setModal('add'); setForm({ name: '', description: '' }) }}>
            + Tambah Genre
          </button>
        )}
      </div>

      {loadErr && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {loadErr}</div>}

      {loading ? <Spinner /> : genres.length === 0 ? <Empty icon="🎭" title="Belum ada genre" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Deskripsi</th>{isAdmin && <th style={{ width: 120 }}>Aksi</th>}</tr></thead>
            <tbody>
              {genres.map(g => (
                <tr key={g.genre_id}>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td style={{ color: 'var(--c-text2)' }}>{g.description || '—'}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setModal(g); setForm({ name: g.name, description: g.description || '' }) }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(g)}>Hapus</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'Tambah Genre' : 'Edit Genre'} onClose={() => setModal(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-primary" onClick={save} disabled={!form.name.trim()}>Simpan</button>
            </>
          }>
          <Field label="Nama *">
            <Input value={form.name} onChange={f('name')} placeholder="misal: Horor, Romance…" autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && form.name.trim()) save() }} />
          </Field>
          <Field label="Deskripsi" optional>
            <Textarea value={form.description} onChange={f('description')} rows={3} placeholder="Deskripsi singkat…" />
          </Field>
        </Modal>
      )}
      {confirm && <Confirm {...confirm} danger onCancel={() => setConfirm(null)} />}
    </div>
  )
}


export default GenresPage;
