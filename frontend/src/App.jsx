import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
const StatusPage = React.lazy(() => import('./pages/StatusPage'));

const GlobalLoadingState = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-slate9)' }}>
    <Spinner text="Memuat halaman..." />
  </div>
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = location.pathname === '/' ? 'home' : location.pathname.substring(1).split('/')[0];

  const [loginTab, setLoginTab]       = useState('login');
  const [user, setUser]               = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authDown, setAuthDown]       = useState(false);
  const [badges, setBadges]           = useState({ transactions: 0, fines: 0 });
  const { toasts, toast }             = useToast();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const refreshBadges = useCallback(async (currentUser) => {
    if (!currentUser) { setBadges({ transactions: 0, fines: 0 }); return; }
    try {
      if (currentUser.role === 'admin') {
        const [trx, fin] = await Promise.all([
          fetchTransactions('pending', 100),
          fetchFines('pending_verification', 100),
        ]);
        setBadges({ transactions: trx?.total || 0, fines: fin?.total || 0 });
      } else {
        const [trx, fin] = await Promise.all([
          fetchTransactions('pending', 50),
          fetchFines('unpaid', 50),
        ]);
        setBadges({ transactions: trx?.total || 0, fines: fin?.total || 0 });
      }
    } catch { /* fail silently */ }
  }, []);

  useEffect(() => {
    const onShowToast = (e) => toast(e.detail.msg, e.detail.type);
    window.addEventListener('show-toast', onShowToast);
    return () => window.removeEventListener('show-toast', onShowToast);
  }, [toast]);

  const nav = useCallback((p, opts = {}) => {
    if (p === 'login' && opts.tab) setLoginTab(opts.tab);
    navigate(p === 'home' ? '/' : `/${p}`);
  }, [navigate]);

  useEffect(() => {
    const t = token.get();
    if (t) {
      const cached = userCache.get();
      if (cached) {
        setUser(cached);
        setAuthChecked(true);
        getMe()
          .then(u => { setUser(u); userCache.set(u); setAuthDown(false); })
          .catch((err) => {
            if (err.message.includes('Layanan tidak tersedia') || err.message.includes('Tidak dapat terhubung')) {
              setAuthDown(true);
            } else {
              token.remove();
              userCache.remove();
              setUser(null);
              navigate('/');
            }
          });
      } else {
        getMe()
          .then(u => {
            setUser(u);
            userCache.set(u);
            setAuthChecked(true);
          })
          .catch((err) => {
            if (err.message.includes('Layanan tidak tersedia') || err.message.includes('Tidak dapat terhubung')) {
              setAuthDown(true);
            } else {
              token.remove();
              userCache.remove();
            }
            setAuthChecked(true);
          });
      }
    } else {
      setAuthChecked(true);
    }

    const onExpired = () => {
      setUser(null);
      navigate('/');
      setAuthChecked(true);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { msg: 'Sesi berakhir. Silakan masuk kembali.', type: 'error' }
        }));
      }, 100);
    };
    window.addEventListener('session-expired', onExpired);
    return () => window.removeEventListener('session-expired', onExpired);
  }, [navigate]);

  const handleLogin = useCallback(u => {
    setUser(u);
    userCache.set(u);
    setLoginTab('login');
    const dest = u.role === 'admin' ? '/dashboard' : '/';
    navigate(dest);
    refreshBadges(u);
  }, [refreshBadges, navigate]);

  useEffect(() => {
    refreshBadges(user);
    if (!user) return;
    const id = setInterval(() => refreshBadges(user), 60000);
    return () => clearInterval(id);
  }, [user, refreshBadges]);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    navigate('/');
    toast('Berhasil keluar', 'info');
  }, [toast, navigate]);

  if (!authChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-slate9)' }}>
      <Spinner text="Memeriksa sesi…" />
    </div>
  );

  const isAdmin = user?.role === 'admin';

  // Protect routes helper
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
    return children;
  };

  const renderRoutes = () => (
    <Suspense fallback={<GlobalLoadingState />}>
      <Routes>
        <Route path="/" element={<HomePage user={user} onNav={nav} toast={toast} />} />
        <Route path="/dashboard" element={<ProtectedRoute adminOnly><DashboardPage toast={toast} /></ProtectedRoute>} />
        <Route path="/books" element={isAdmin ? <ProtectedRoute adminOnly><BooksAdminPage toast={toast} /></ProtectedRoute> : <HomePage user={user} onNav={nav} toast={toast} />} />
        <Route path="/categories" element={<ProtectedRoute adminOnly><CategoriesPage isAdmin={isAdmin} toast={toast} /></ProtectedRoute>} />
        <Route path="/genres" element={<ProtectedRoute adminOnly><GenresPage isAdmin={isAdmin} toast={toast} /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionsPage user={user} toast={toast} onNav={nav} /></ProtectedRoute>} />
        <Route path="/fines" element={<ProtectedRoute><FinesPage user={user} toast={toast} /></ProtectedRoute>} />
        <Route path="/lost" element={<ProtectedRoute><LostBooksPage user={user} toast={toast} /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage toast={toast} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage user={user} setUser={setUser} toast={toast} /></ProtectedRoute>} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/about" element={<AboutPage onBack={() => nav('home')} />} />
        <Route path="/login" element={user ? <Navigate to={isAdmin ? "/dashboard" : "/"} replace /> : <LoginPage onLogin={handleLogin} toast={toast} initialTab={loginTab} onBack={() => { nav('home'); setLoginTab('login'); }} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );

  if (page === 'login' && !user) return (
    <>
      {renderRoutes()}
      <ToastContainer toasts={toasts} />
    </>
  );

  if (isAdmin) return (
    <>
      <div className="layout-side">
        <Header page={page} onNav={nav} user={user} onLogout={handleLogout} badges={badges} theme={theme} toggleTheme={toggleTheme} />
        <main className="layout-side-main">
          {authDown && (
            <div style={{ background: '#f59e0b', color: '#fff', padding: '8px 16px', textAlign: 'center', fontSize: 14, fontWeight: 500 }}>
              ⚠️ Some features temporarily unavailable (Auth Service is down)
            </div>
          )}
          <div className="layout-side-inner">
            {renderRoutes()}
          </div>
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  );

  return (
    <>
      <div className="layout-top">
        <Header page={page} onNav={nav} user={user} onLogout={handleLogout} badges={badges} theme={theme} toggleTheme={toggleTheme} />
        {authDown && (
          <div style={{ background: '#f59e0b', color: '#fff', padding: '8px 16px', textAlign: 'center', fontSize: 14, fontWeight: 500 }}>
            ⚠️ Some features temporarily unavailable (Auth Service is down)
          </div>
        )}
        {page === 'home' || page === 'books'
          ? renderRoutes()
          : (
            <div className="layout-top-content">
              {renderRoutes()}
            </div>
          )
        }
      </div>
      <ToastContainer toasts={toasts} />
    </>
  );
}