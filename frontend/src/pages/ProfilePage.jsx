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

function ProfilePage({ user, setUser, toast }) {
  // ── Edit Profil state ──────────────────────────────────────
  const [editModal, setEditModal]   = useState(false)
  const [editForm, setEditForm]     = useState({ full_name: user?.full_name || '' })
  const [editSaving, setEditSaving] = useState(false)

  // ── Ganti Password state ───────────────────────────────────
  const [pwModal, setPwModal]   = useState(false)
  const [pwForm, setPwForm]     = useState({ current_password: '', new_password: '' })
  const [pwErrs, setPwErrs]     = useState([])
  const [pwSaving, setPwSaving] = useState(false)

  const saveProfile = async () => {
    if (!editForm.full_name.trim()) { toast('Nama wajib diisi', 'error'); return }
    setEditSaving(true)
    try {
      const updated = await updateMyProfile({ full_name: editForm.full_name })
      setUser(updated)
      toast('Profil berhasil diperbarui')
      setEditModal(false)
    } catch (err) { toast(err.message, 'error') }
    finally { setEditSaving(false) }
  }

  const changePw = async () => {
    if (!pwForm.current_password) { toast('Password lama wajib diisi', 'error'); return }
    const errs = validatePassword(pwForm.new_password)
    if (errs.length) { setPwErrs(errs); return }
    setPwSaving(true)
    try {
      await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password })
      toast('Password berhasil diubah')
      setPwModal(false)
      setPwForm({ current_password: '', new_password: '' })
      setPwErrs([])
    } catch (err) { toast(err.message, 'error') }
    finally { setPwSaving(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Saya</h1>
          <p className="page-sub">Informasi akun Anda</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost"
            onClick={() => { setPwForm({ current_password: '', new_password: '' }); setPwErrs([]); setPwModal(true) }}>
            🔒 Ganti Password
          </button>
          <button className="btn btn-primary"
            onClick={() => { setEditForm({ full_name: user?.full_name || '' }); setEditModal(true) }}>
            ✏️ Edit Profil
          </button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="profile-header">
          <div className="avatar avatar-lg">{user?.full_name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="profile-name">{user?.full_name}</div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-blue' : 'badge-slate'}`}>
              {user?.role === 'admin' ? 'Administrator' : 'Member'}
            </span>
          </div>
        </div>

        <div className="profile-grid">
          {[
            ['Nama Lengkap', user?.full_name, false],
            ['Email', user?.email, false],
            ['Role', user?.role === 'admin' ? 'Administrator' : 'Member', false],
            ['ID Pengguna', user?.user_id, true],
          ].map(([label, val, mono]) => (
            <div key={label}>
              <div className="profile-lbl">{label}</div>
              <div className="profile-val" style={mono ? { fontFamily: 'monospace', fontSize: 13 } : {}}>{val ?? '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Edit Profil */}
      {editModal && (
        <Modal title="Edit Profil" onClose={() => setEditModal(false)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEditModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveProfile}
                disabled={!editForm.full_name.trim() || editSaving}>
                {editSaving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </>
          }>
          <Field label="Nama Lengkap *">
            <Input
              value={editForm.full_name}
              onChange={e => setEditForm({ full_name: e.target.value })}
              placeholder="Nama lengkap"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && editForm.full_name.trim()) saveProfile() }}
            />
          </Field>
          <div className="alert alert-info" style={{ marginTop: 8, fontSize: 12 }}>
            Email tidak dapat diubah. Hubungi admin jika perlu mengubah email.
          </div>
        </Modal>
      )}

      {/* Modal: Ganti Password */}
      {pwModal && (
        <Modal title="Ganti Password" onClose={() => { setPwModal(false); setPwErrs([]) }} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => { setPwModal(false); setPwErrs([]) }}>Batal</button>
              <button className="btn btn-primary" onClick={changePw}
                disabled={!pwForm.current_password || !pwForm.new_password || pwSaving}>
                {pwSaving ? 'Memproses…' : 'Ubah Password'}
              </button>
            </>
          }>
          <Field label="Password Saat Ini *">
            <Input
              type="password"
              value={pwForm.current_password}
              onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))}
              placeholder="Masukkan password lama"
              autoFocus
            />
          </Field>
          <Field label="Password Baru *" hint="Min. 8 karakter, huruf besar+kecil+angka+spesial">
            <Input
              type="password"
              value={pwForm.new_password}
              onChange={e => { setPwForm(p => ({ ...p, new_password: e.target.value })); setPwErrs([]) }}
              placeholder="Masukkan password baru"
              onKeyDown={e => { if (e.key === 'Enter' && pwForm.current_password && pwForm.new_password) changePw() }}
            />
            {pwForm.new_password && (() => {
              const s = pwStrength(pwForm.new_password)
              return (
                <div style={{ marginTop: 6 }}>
                  <div className="pw-bars">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="pw-bar" style={{ background: i <= s.score ? s.color : undefined }} />
                    ))}
                  </div>
                  <span className="pw-label" style={{ color: s.color }}>{s.label}</span>
                </div>
              )
            })()}
            {pwErrs.map(e => (
              <span key={e} style={{ display: 'block', fontSize: 11, color: 'var(--c-red)', fontWeight: 600 }}>• {e}</span>
            ))}
          </Field>
        </Modal>
      )}
    </div>
  )
}



export default ProfilePage;
