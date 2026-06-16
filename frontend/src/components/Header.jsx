import { Link } from 'react-router-dom'

// ============================================================
// components/Header.jsx
// TopNav  → Guest & Member
// Sidebar → Admin
// badges  → { transactions: N, fines: N } untuk notifikasi pending
// ============================================================

const GUEST_LINKS = [
  { id: 'home', label: 'Beranda' },
  { id: 'status', label: 'Status Sistem' },
  { id: 'about', label: 'Tentang' },
]

const MEMBER_LINKS = [
  { id: 'home',         label: 'Beranda'   },
  { id: 'transactions', label: 'Transaksi', badgeKey: 'transactions' },
  { id: 'fines',        label: 'Denda',     badgeKey: 'fines'        },
  { id: 'status',       label: 'Status Sistem' },
  { id: 'profile',      label: 'Profil'    },
  { id: 'about',        label: 'Tentang'   },
]

const ADMIN_GROUPS = [
  {
    label: 'Utama',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '▦' },
      { id: 'status',    label: 'Status Sistem', icon: '📊' },
      { id: 'profile',   label: 'Profil',    icon: '◉' },
      { id: 'about',     label: 'Tentang',   icon: 'ℹ️' },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { id: 'books',      label: 'Buku',     icon: '◫' },
      { id: 'categories', label: 'Kategori', icon: '⊟' },
      { id: 'genres',     label: 'Genre',    icon: '◈' },
      { id: 'users',      label: 'Pengguna', icon: '◎' },
    ],
  },
  {
    label: 'Review',
    items: [
      { id: 'transactions', label: 'Transaksi', icon: '⇄', badgeKey: 'transactions' },
      { id: 'fines',        label: 'Denda',     icon: '◈', badgeKey: 'fines'        },
    ],
  },
]

function BadgeDot({ count }) {
  if (!count) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 18, height: 18, padding: '0 5px',
      background: '#ef4444', color: '#fff',
      borderRadius: 99, fontSize: 10, fontWeight: 700, lineHeight: 1,
      marginLeft: 6, flexShrink: 0,
    }}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

function TopNav({ page, onNav, user, onLogout, badges = {}, theme, toggleTheme }) {
  const links = user ? MEMBER_LINKS : GUEST_LINKS
  return (
    <header className="topnav">
      <Link to="/" className="topnav-brand" style={{ textDecoration: 'none' }}>
        <div className="topnav-brand-mark">📚</div>
        <span className="topnav-brand-text">
          Lentera<span>Pustaka</span>
        </span>
      </Link>

      <nav className="topnav-nav">
        {links.map(l => (
          <Link
            key={l.id}
            to={l.id === 'home' ? '/' : `/${l.id}`}
            className={`topnav-link${page === l.id ? ' active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
          >
            {l.label}
            {l.badgeKey && <BadgeDot count={badges[l.badgeKey]} />}
          </Link>
        ))}
      </nav>

      <div className="topnav-right">
        <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title="Toggle Dark Mode" style={{ fontSize: 16, padding: '4px 8px' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {user ? (
          <>
            <Link to="/profile" className="topnav-user-btn" style={{ textDecoration: 'none' }}>
              <div className="avatar avatar-sm">{user.full_name?.[0]?.toUpperCase()}</div>
              <span>{user.full_name?.split(' ')[0]}</span>
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}
              style={{ color: 'var(--c-text3)', fontSize: 13 }}>
              Keluar
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Masuk</Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Daftar</Link>
          </>
        )}
      </div>
    </header>
  )
}

function Sidebar({ page, onNav, user, onLogout, badges = {}, theme, toggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">📚</div>
        <div>
          <div className="sidebar-brand-title">LenteraPustaka</div>
          <div className="sidebar-brand-sub">HEXACORE · SI ITK</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {ADMIN_GROUPS.map(g => (
          <div key={g.label}>
            <div className="sidebar-section-label">{g.label}</div>
            {g.items.map(item => (
              <Link
                key={item.id}
                to={item.id === 'home' ? '/' : `/${item.id}`}
                className={`sidebar-link${page === item.id ? ' active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="sidebar-link-icon">{item.icon}</span>
                  {item.label}
                </span>
                {item.badgeKey && <BadgeDot count={badges[item.badgeKey]} />}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={toggleTheme} style={{ marginBottom: 12, justifyContent: 'center' }}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <Link to="/profile" className="sidebar-user" style={{ textDecoration: 'none' }}>
            <div className="avatar avatar-md">{user.full_name?.[0]?.toUpperCase()}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="sidebar-user-name">{user.full_name}</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </Link>
          <button className="sidebar-logout" onClick={onLogout}>
            <span>↩</span> Keluar
          </button>
        </div>
      )}
    </aside>
  )
}

function Header({ page, onNav, user, onLogout, badges, theme, toggleTheme }) {
  return user?.role === 'admin'
    ? <Sidebar page={page} onNav={onNav} user={user} onLogout={onLogout} badges={badges} theme={theme} toggleTheme={toggleTheme} />
    : <TopNav  page={page} onNav={onNav} user={user} onLogout={onLogout} badges={badges} theme={theme} toggleTheme={toggleTheme} />
}

export default Header