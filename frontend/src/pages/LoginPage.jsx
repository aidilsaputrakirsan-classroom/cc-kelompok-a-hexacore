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

function LoginPage({ onLogin, toast, initialTab = 'login', onBack }) {
  const [tab, setTab]         = useState(initialTab)
  const [form, setForm]       = useState({ email: '', password: '', full_name: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const f = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })) }
  const strength = pwStrength(form.password)
  const onKey = e => { if (e.key === 'Enter') submit() }

  const submit = async () => {
    const e = {}
    if (!form.email)    e.email    = 'Email wajib diisi'
    if (!form.password) e.password = 'Password wajib diisi'
    if (tab === 'register') {
      if (!form.full_name) e.full_name = 'Nama wajib diisi'
      const pe = validatePassword(form.password)
      if (pe.length) e.password = pe[0]
    }
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    try {
      if (tab === 'register') {
        await register({ email: form.email, password: form.password, full_name: form.full_name })
        toast('Akun berhasil dibuat! Sedang masuk…')
        const data = await login(form.email, form.password)
        onLogin(data.user)
      } else {
        const data = await login(form.email, form.password)
        onLogin(data.user)
      }
    } catch (err) { setErrors({ submit: err.message }) }
    finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left-inner">
          <h1 className="login-left-title">
            Temukan Buku<br /><span>Favoritmu</span><br />Di Sini
          </h1>
          <p className="login-left-desc">
            Sistem perpustakaan digital untuk meminjam, mengelola koleksi, dan melacak transaksi secara efisien.
          </p>
          {['Manajemen buku & kategori lengkap', 'Alur peminjaman dengan approval admin', 'Pelacakan denda otomatis', 'Akses sesuai peran pengguna'].map(t => (
            <div key={t} className="login-feature">
              <div className="login-feature-dot" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-brand-title">LenteraPustaka</h2>
          <p className="login-brand-sub">HEXACORE · Institut Teknologi Kalimantan</p>

          {onBack && (
            <button
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: 'var(--c-text3)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              ← Kembali ke Beranda
            </button>
          )}

          <div className="login-tabs">
            {['login', 'register'].map(t => (
              <button
                key={t}
                className={`login-tab${tab === t ? ' active' : ''}`}
                onClick={() => { setTab(t); setErrors({}) }}
              >
                {t === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          {errors.submit && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>{errors.submit}</div>
          )}

          {tab === 'register' && (
            <Field label="Nama Lengkap" error={errors.full_name}>
              <Input value={form.full_name} onChange={f('full_name')} onKeyDown={onKey} placeholder="Nama lengkap" error={errors.full_name} autoFocus />
            </Field>
          )}

          <Field label="Email" error={errors.email}>
            <Input type="email" value={form.email} onChange={f('email')} onKeyDown={onKey} placeholder="nama@student.itk.ac.id" error={errors.email} autoFocus={tab === 'login'} />
          </Field>

          <Field label="Password" error={errors.password}
            hint={tab === 'register' ? 'Min. 8 karakter, huruf besar+kecil+angka+spesial' : undefined}>
            <Input type="password" value={form.password} onChange={f('password')} onKeyDown={onKey} placeholder="Password" error={errors.password} />
            {tab === 'register' && form.password && (
              <div style={{ marginTop: 6 }}>
                <div className="pw-bars">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="pw-bar" style={{ background: i <= strength.score ? strength.color : undefined }} />
                  ))}
                </div>
                <span className="pw-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </Field>

          <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }}
            onClick={submit} disabled={loading}>
            {loading ? 'Memproses…' : tab === 'login' ? 'Masuk' : 'Buat Akun'}
          </button>
        </div>
      </div>
    </div>
  )
}


export default LoginPage;
