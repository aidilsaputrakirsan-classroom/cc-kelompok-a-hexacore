// ============================================================
// App.jsx — LenteraPustaka v0.4.1
// Pure CSS · No Tailwind · No injectCSS · Vite + React
// Disinkronkan dengan backend/main.py
// ============================================================
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Header from './components/Header';
import AboutPage from './components/AboutPage';
import { Spinner, ToastContainer } from './components/ui/Common';
import { useToast } from './hooks/useToast';
import { logout, getMe, token, userCache, fetchTransactions, fetchFines } from './services/api';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const BooksAdminPage = React.lazy(() => import('./pages/BooksAdminPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const GenresPage = React.lazy(() => import('./pages/GenresPage'));
const TransactionsPage = React.lazy(() => import('./pages/TransactionsPage'));
const FinesPage = React.lazy(() => import('./pages/FinesPage'));
const LostBooksPage = React.lazy(() => import('./pages/LostBooksPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

const GlobalLoadingState = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-slate9)' }}>
    <Spinner text="Memuat halaman..." />
  </div>
);

export default function App() {
  // Restore halaman terakhir dari sessionStorage saat refresh
  const [page, setPage]               = useState(() => sessionStorage.getItem('lp_page') || 'home')
  const [loginTab, setLoginTab]       = useState('login')
  const [user, setUser]               = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [badges, setBadges]           = useState({ transactions: 0, fines: 0 })
  const { toasts, toast }             = useToast()

  // Fetch notification counts (polling setiap 60 detik)
  const refreshBadges = useCallback(async (currentUser) => {
    if (!currentUser) { setBadges({ transactions: 0, fines: 0 }); return }
    try {
      if (currentUser.role === 'admin') {
        // Admin: pending transactions + pending_verification fines
        const [trx, fin] = await Promise.all([
          fetchTransactions('pending', 100),
          fetchFines('pending_verification', 100),
        ])
        setBadges({ transactions: trx?.total || 0, fines: fin?.total || 0 })
      } else {
        // Member: transaksi pending miliknya + denda unpaid
        const [trx, fin] = await Promise.all([
          fetchTransactions('pending', 50),
          fetchFines('unpaid', 50),
        ])
        setBadges({ transactions: trx?.total || 0, fines: fin?.total || 0 })
      }
    } catch { /* fail silently */ }
  }, [])

  // Listen show-toast event dari session-expired handler
  useEffect(() => {
    const onShowToast = (e) => toast(e.detail.msg, e.detail.type)
    window.addEventListener('show-toast', onShowToast)
    return () => window.removeEventListener('show-toast', onShowToast)
  }, [toast])

  // Simpan page ke sessionStorage setiap kali berubah
  const nav = useCallback((p, opts = {}) => {
    if (p === 'login' && opts.tab) setLoginTab(opts.tab)
    sessionStorage.setItem('lp_page', p)
    setPage(p)
  }, [])

  // Cek token saat mount + listen event session-expired dari api.js
  useEffect(() => {
    const t = token.get()
    if (t) {
      // 1. Tampilkan user dari cache LANGSUNG (tidak tunggu network)
      const cached = userCache.get()
      if (cached) {
        setUser(cached)
        const savedPage = sessionStorage.getItem('lp_page') || 'home'
        if (['dashboard', 'users'].includes(savedPage) && cached.role !== 'admin') {
          sessionStorage.setItem('lp_page', 'home')
          setPage('home')
        }
        setAuthChecked(true)
        // 2. Verifikasi background — refresh data user dari server
        getMe()
          .then(u => { setUser(u); userCache.set(u) })
          .catch(() => {
            // Token invalid/expired — paksa logout
            token.remove()
            userCache.remove()
            setUser(null)
            sessionStorage.removeItem('lp_page')
            setPage('home')
          })
      } else {
        // Tidak ada cache, harus hit network
        getMe()
          .then(u => {
            setUser(u)
            userCache.set(u)
            const savedPage = sessionStorage.getItem('lp_page') || 'home'
            if (['dashboard', 'users'].includes(savedPage) && u.role !== 'admin') {
              sessionStorage.setItem('lp_page', 'home')
              setPage('home')
            }
            setAuthChecked(true)
          })
          .catch(() => {
            token.remove()
            userCache.remove()
            setAuthChecked(true)
          })
      }
    } else {
      setAuthChecked(true)
    }

    // Tangkap event 401 dari api.js — redirect ke home tanpa reload
    const onExpired = () => {
      setUser(null)
      sessionStorage.setItem('lp_page', 'home')
      setPage('home')
      setAuthChecked(true)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { msg: 'Sesi berakhir. Silakan masuk kembali.', type: 'error' }
        }))
      }, 100)
    }
    window.addEventListener('session-expired', onExpired)
    return () => window.removeEventListener('session-expired', onExpired)
  }, [])

  const handleLogin = useCallback(u => {
    setUser(u)
    userCache.set(u)
    setLoginTab('login')
    const dest = u.role === 'admin' ? 'dashboard' : 'home'
    sessionStorage.setItem('lp_page', dest)
    setPage(dest)
    refreshBadges(u)
  }, [refreshBadges])

  // Refresh badges saat user berubah + polling tiap 60 detik
  useEffect(() => {
    refreshBadges(user)
    if (!user) return
    const id = setInterval(() => refreshBadges(user), 60000)
    return () => clearInterval(id)
  }, [user, refreshBadges])

  const handleLogout = useCallback(() => {
    logout()
    setUser(null)
    sessionStorage.setItem('lp_page', 'home')
    setPage('home')
    toast('Berhasil keluar', 'info')
  }, [toast])

  // Loading awal
  if (!authChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-slate9)' }}>
      <Spinner text="Memeriksa sesi…" />
    </div>
  )

  // Halaman login — pass onBack + loginTab state
  if (page === 'login' && !user) return (
    <><Suspense fallback={<GlobalLoadingState />}><LoginPage onLogin={handleLogin} toast={toast} initialTab={loginTab} onBack={() => { setPage('home'); setLoginTab('login') }} /></Suspense><ToastContainer toasts={toasts} /></>
  )

  const isAdmin = user?.role === 'admin'

  // Route guard
  const safePage = (() => {
    if (['dashboard', 'users'].includes(page) && !isAdmin) return 'home'
    if (['transactions', 'fines', 'profile'].includes(page) && !user) return 'login'
    return page
  })()

  if (safePage === 'login') return (
    <><Suspense fallback={<GlobalLoadingState />}><LoginPage onLogin={handleLogin} toast={toast} initialTab={loginTab} onBack={() => { setPage('home'); setLoginTab('login') }} /></Suspense><ToastContainer toasts={toasts} /></>
  )

  const renderPage = (p) => {
    switch (p) {
      case 'dashboard':    return <DashboardPage    toast={toast} />
      case 'books':        return isAdmin ? <BooksAdminPage toast={toast} /> : <HomePage user={user} onNav={nav} toast={toast} />
      case 'categories':   return <CategoriesPage   isAdmin={isAdmin} toast={toast} />
      case 'genres':       return <GenresPage       isAdmin={isAdmin} toast={toast} />
      case 'transactions': return <TransactionsPage user={user}   toast={toast} onNav={nav} />
      case 'fines':        return <FinesPage        user={user}   toast={toast} />
      case 'lost':         return <LostBooksPage    user={user}   toast={toast} />
      case 'users':        return <UsersPage        toast={toast} />
      case 'profile':      return <ProfilePage      user={user} setUser={setUser} toast={toast} />
      case 'about':        return <AboutPage        onBack={() => nav('home')} />
      case 'home':
      default:             return <HomePage         user={user} onNav={nav} toast={toast} />
    }
  }

  // ── Admin layout (sidebar kiri) ──────────────────────────────
  if (isAdmin) return (
    <>
      <div className="layout-side">
        <Header page={safePage} onNav={nav} user={user} onLogout={handleLogout} badges={badges} />
        <main className="layout-side-main">
          <div className="layout-side-inner">
            <Suspense fallback={<GlobalLoadingState />}>
              {renderPage(safePage)}
            </Suspense>
          </div>
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  )

  // ── Guest / Member layout (topnav atas) ──────────────────────
  return (
    <>
      <div className="layout-top">
        <Header page={safePage} onNav={nav} user={user} onLogout={handleLogout} badges={badges} />
        {safePage === 'home' || safePage === 'books'
          ? renderPage(safePage)
          : (
            <div className="layout-top-content">
              <Suspense fallback={<GlobalLoadingState />}>
              {renderPage(safePage)}
            </Suspense>
            </div>
          )
        }
      </div>
      <ToastContainer toasts={toasts} />
    </>
  )
}