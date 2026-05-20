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

function BooksAdminPage({ toast }) {
  const [search, setSearch]       = useState('')
  const [sortBy, setSortBy]       = useState('default')
  const [cats, setCats]           = useState([])
  const [genres, setGenres]       = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)
  const [confirm, setConfirm]     = useState(null)
  const { books, total, loading, error, reload } = useBooks(search)

  useEffect(() => {
    fetchCategories().then(setCats).catch(() => toast('Gagal memuat kategori', 'error'))
    fetchGenres().then(setGenres).catch(() => toast('Gagal memuat genre', 'error'))
  }, [])

  const sorted = [...books].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title, 'id')
    if (sortBy === 'stock') return b.available_stock - a.available_stock
    return 0
  })

  const handleSave = async (data, editId) => {
    try {
      if (editId) { await updateBook(editId, data); toast('Buku diperbarui') }
      else        { await createBook(data);         toast('Buku ditambahkan') }
      setEditing(null); reload()
    } catch (err) { toast(err.message, 'error') }
  }

  const handleDelete = id => setConfirm({
    title: 'Hapus Buku', message: 'Yakin ingin menghapus buku ini?',
    onConfirm: async () => {
      try { await deleteBook(id); toast('Buku dihapus') }
      catch (err) { toast(err.message, 'error') }
      finally { setConfirm(null); reload() }
    },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Buku</h1>
          <p className="page-sub">{total} judul dalam inventaris</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          + Tambah Buku
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <SearchBar onSearch={setSearch} placeholder="Cari judul, pengarang, ISBN…" />
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          ⚠️ Gagal memuat buku — {error}
        </div>
      )}
      <ItemList
        books={sorted} total={total}
        onEdit={b => { setEditing(b); setShowForm(true) }}
        onDelete={handleDelete}
        loading={loading} searchQuery={search}
        sortBy={sortBy} onSortChange={setSortBy}
        isAdmin={true}
      />

      <ItemForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        editingItem={editing} categories={cats} genres={genres}
        onSave={handleSave}
      />

      {confirm && <Confirm {...confirm} danger onCancel={() => setConfirm(null)} />}
    </div>
  )
}


export default BooksAdminPage;
