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

function DashboardPage({ toast }) {
  const [stats, setStats]     = useState(null)
  const [trxs, setTrxs]       = useState([])
  const [fines, setFines]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchBookStats(), fetchTransactions('', 100), fetchFines(null, 100)])
      .then(([s, t, f]) => {
        setStats(s); setTrxs(t?.transactions || []); setFines(f?.fines || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const stockData = stats ? [
    { name: 'Tersedia',  value: stats.available_stock, fill: '#22c55e' },
    { name: 'Dipinjam',  value: stats.borrowed_count,  fill: '#3b82f6' },
    { name: 'Terlambat', value: stats.overdue_count,   fill: '#ef4444' },
  ].filter(d => d.value > 0) : []

  const trxCount = {}
  trxs.forEach(t => { trxCount[t.status] = (trxCount[t.status] || 0) + 1 })
  const trxData = Object.entries(trxCount).map(([k, v]) => ({ status: trxBadge[k]?.label || k, count: v }))

  const fineCount = {}
  fines.forEach(f => { fineCount[f.status] = (fineCount[f.status] || 0) + 1 })
  const fineData = Object.entries(fineCount).map(([k, v]) => ({ status: fineBadge[k]?.label || k, count: v }))

  const C = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#94a3b8']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Ringkasan statistik sistem perpustakaan</p>
        </div>
      </div>

      {stats && (
        <div className="grid-stats">
          <StatCard label="Total Judul"   value={stats.total_titles}    accentColor="#3b82f6" />
          <StatCard label="Total Stok"    value={stats.total_stock}     accentColor="#8b5cf6" />
          <StatCard label="Tersedia"      value={stats.available_stock} accentColor="#22c55e" />
          <StatCard label="Dipinjam"      value={stats.borrowed_count}  accentColor="#f59e0b" />
          <StatCard label="Terlambat"     value={stats.overdue_count}   accentColor="#ef4444" />
          <StatCard label="Total Denda"   value={fines.length}          accentColor="#94a3b8" />
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">Distribusi Stok Buku</div>
          {stockData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stockData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {stockData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip formatter={v => [v, 'Buku']} />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty icon="📊" title="Belum ada data" />}
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Status Transaksi</div>
          {trxData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trxData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Jumlah" radius={[4, 4, 0, 0]}>
                  {trxData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty icon="📊" title="Belum ada transaksi" />}
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card-title">Status Denda</div>
        {fineData.length ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={fineData} layout="vertical" margin={{ left: 100, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" name="Jumlah" radius={[0, 4, 4, 0]}>
                {fineData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty icon="💰" title="Belum ada denda" />}
      </div>
    </div>
  )
}


export default DashboardPage;
