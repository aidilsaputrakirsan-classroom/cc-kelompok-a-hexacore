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

function UsersPage({ toast }) {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadErr, setLoadErr]     = useState(null)
  const [addModal, setAddModal]   = useState(false)
  const [form, setForm]           = useState({ full_name: '', email: '', password: '', role: 'member' })
  const [pwErrs, setPwErrs]       = useState([])
  const [confirm, setConfirm]     = useState(null)
  // Poin 1: state untuk detail modal dan edit modal
  const [detailUser, setDetailUser]     = useState(null)
  const [editUser, setEditUser]         = useState(null)
  const [editForm, setEditForm]         = useState({ full_name: '', role: 'member' })
  // Gap 4: state untuk admin reset password
  const [resetPwModal, setResetPwModal] = useState(null)   // object user { user_id, full_name }
  const [resetPwForm, setResetPwForm]   = useState('')
  const [resetPwErrs, setResetPwErrs]   = useState([])

  const load = () => {
    setLoading(true); setLoadErr(null)
    fetchUsers()
      .then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(err => { setLoadErr(err.message); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const f = k => e => {
    const v = e.target.value
    setForm(p => ({ ...p, [k]: v }))
    if (k === 'password') setPwErrs(v ? validatePassword(v) : [])
  }
  const strength = pwStrength(form.password)

  const canSave = form.full_name.trim() && form.email.trim() && form.password && pwErrs.length === 0

  const save = async () => {
    if (!form.full_name.trim()) { toast('Nama wajib diisi', 'error'); return }
    if (!form.email.trim())     { toast('Email wajib diisi', 'error'); return }
    const errs = validatePassword(form.password)
    if (errs.length) { setPwErrs(errs); return }
    try {
      await createUser(form)
      toast('Pengguna ditambahkan')
      setAddModal(false)
      setForm({ full_name: '', email: '', password: '', role: 'member' })
      setPwErrs([])
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  // Poin 1: Simpan edit nama + role
  const saveEdit = async () => {
    if (!editForm.full_name.trim()) { toast('Nama wajib diisi', 'error'); return }
    try {
      // Import updateUser dari api.js
      const { updateUser } = await import('../services/api')
      await updateUser(editUser.user_id, { full_name: editForm.full_name, role: editForm.role })
      toast('Data pengguna diperbarui')
      setEditUser(null)
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  const del = u => setConfirm({
    title: 'Hapus Pengguna', message: `Yakin hapus "${u.full_name}"?`,
    onConfirm: async () => {
      try { await deleteUser(u.user_id); toast('Dihapus'); setConfirm(null); load() }
      catch (err) { toast(err.message, 'error'); setConfirm(null) }
    },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="page-sub">{users.length} pengguna terdaftar</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setAddModal(true)
          setForm({ full_name: '', email: '', password: '', role: 'member' })
          setPwErrs([])
        }}>
          + Tambah Pengguna
        </button>
      </div>

      {loadErr && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {loadErr}</div>}

      {loading ? <Spinner /> : users.length === 0 ? <Empty icon="👤" title="Belum ada pengguna" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Bergabung</th>
                <th style={{ width: 140, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-md">{u.full_name?.[0]}</div>
                      <span style={{ fontWeight: 600 }}>{u.full_name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--c-text2)' }}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-slate'}`}>{u.role === 'admin' ? 'Admin' : 'Member'}</span></td>
                  <td style={{ color: 'var(--c-text3)', fontSize: 12 }}>{fmtDate(u.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                      {/* Tombol detail */}
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Detail pengguna"
                        onClick={() => setDetailUser(u)}
                        style={{
                          width: 30, height: 30, padding: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '50%', fontSize: 13, fontWeight: 700,
                        }}>
                        i
                      </button>
                      {/* Tombol edit */}
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Edit pengguna"
                        onClick={() => { setEditUser(u); setEditForm({ full_name: u.full_name, role: u.role }) }}>
                        ✏️ Edit
                      </button>
                      {/* Tombol reset password */}
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Reset password"
                        onClick={() => { setResetPwModal(u); setResetPwForm(''); setResetPwErrs([]) }}
                        style={{ color: '#9A3412' }}>
                        🔑 Reset PW
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(u)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail Pengguna */}
      {detailUser && (
        <Modal title="Detail Pengguna" onClose={() => setDetailUser(null)} size="sm"
          footer={
            <button className="btn btn-ghost" onClick={() => setDetailUser(null)}>Tutup</button>
          }>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div className="avatar avatar-lg">{detailUser.full_name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: 'var(--c-text)' }}>
                {detailUser.full_name}
              </div>
              <span className={`badge ${detailUser.role === 'admin' ? 'badge-blue' : 'badge-slate'}`}>
                {detailUser.role === 'admin' ? 'Administrator' : 'Member'}
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px',
            background: 'var(--c-bg)', borderRadius: 10, padding: '14px 16px' }}>
            {[
              ['ID Pengguna', `#${detailUser.user_id}`, true],
              ['Nama Lengkap', detailUser.full_name, false],
              ['Email', detailUser.email, false],
              ['Role', detailUser.role === 'admin' ? 'Administrator' : 'Member', false],
              ['Bergabung', fmtDate(detailUser.created_at), false],
            ].map(([label, val, mono]) => (
              <div key={label} style={{ gridColumn: label === 'Email' ? '1 / -1' : undefined }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--c-text3)',
                  textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 500,
                  fontFamily: mono ? 'monospace' : undefined }}>{val}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Modal Edit Pengguna (nama + role) */}
      {editUser && (
        <Modal title={`Edit: ${editUser.full_name}`} onClose={() => setEditUser(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Batal</button>
              <button className="btn btn-primary" onClick={saveEdit}
                disabled={!editForm.full_name.trim()}>
                Simpan
              </button>
            </>
          }>
          <Field label="Nama Lengkap *">
            <Input
              value={editForm.full_name}
              onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Nama lengkap"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && editForm.full_name.trim()) saveEdit() }}
            />
          </Field>
          <Field label="Role">
            <Select
              value={editForm.role}
              onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <div className="alert alert-info" style={{ marginTop: 8, fontSize: 12 }}>
            Email tidak dapat diubah melalui form ini.
          </div>
        </Modal>
      )}

      {/* Modal: Tambah Pengguna */}
      {addModal && (
        <Modal title="Tambah Pengguna" onClose={() => setAddModal(false)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={save} disabled={!canSave}>Simpan</button>
            </>
          }>
          <Field label="Nama Lengkap *">
            <Input value={form.full_name} onChange={f('full_name')} placeholder="Nama lengkap" autoFocus
              onKeyDown={e => { if (e.key === 'Enter') document.activeElement.blur() }} />
          </Field>
          <Field label="Email *">
            <Input type="email" value={form.email} onChange={f('email')} placeholder="email@student.itk.ac.id"
              onKeyDown={e => { if (e.key === 'Enter') document.activeElement.blur() }} />
          </Field>
          <Field label="Password *" hint="Min. 8 karakter, huruf besar+kecil+angka+spesial (@$!%*?&)">
            <Input type="password" value={form.password} onChange={f('password')}
              onKeyDown={e => { if (e.key === 'Enter' && canSave) save() }} />
            {form.password && (
              <div style={{ marginTop: 6 }}>
                <div className="pw-bars">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="pw-bar" style={{ background: i <= strength.score ? strength.color : undefined }} />
                  ))}
                </div>
                <span className="pw-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
            {pwErrs.map(e => <span key={e} style={{ display: 'block', fontSize: 11, color: 'var(--c-red)', fontWeight: 600 }}>• {e}</span>)}
          </Field>
          <Field label="Role">
            <Select value={form.role} onChange={f('role')}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
        </Modal>
      )}

      {/* Modal: Reset Password (Admin) — Gap 4 */}
      {resetPwModal && (
        <Modal title={`Reset Password: ${resetPwModal.full_name}`} onClose={() => setResetPwModal(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setResetPwModal(null)}>Batal</button>
              <button className="btn btn-danger"
                disabled={!resetPwForm}
                onClick={async () => {
                  const errs = validatePassword(resetPwForm)
                  if (errs.length) { setResetPwErrs(errs); return }
                  try {
                    await adminResetPassword(resetPwModal.user_id, resetPwForm)
                    toast(`Password ${resetPwModal.full_name} berhasil direset`)
                    setResetPwModal(null)
                  } catch (err) { toast(err.message, 'error') }
                }}>
                Reset Password
              </button>
            </>
          }>
          <div className="alert alert-warning" style={{ marginBottom: 16, fontSize: 12 }}>
            ⚠️ Password baru langsung aktif. Informasikan kepada pengguna yang bersangkutan.
          </div>
          <Field label="Password Baru *" hint="Min. 8 karakter, huruf besar+kecil+angka+spesial">
            <Input
              type="password"
              value={resetPwForm}
              onChange={e => { setResetPwForm(e.target.value); setResetPwErrs([]) }}
              placeholder="Password baru untuk user ini"
              autoFocus
            />
            {resetPwForm && (() => {
              const s = pwStrength(resetPwForm)
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
            {resetPwErrs.map(e => (
              <span key={e} style={{ display: 'block', fontSize: 11, color: 'var(--c-red)', fontWeight: 600 }}>• {e}</span>
            ))}
          </Field>
        </Modal>
      )}

      {confirm && <Confirm {...confirm} danger onCancel={() => setConfirm(null)} />}
    </div>
  )
}



export default UsersPage;
