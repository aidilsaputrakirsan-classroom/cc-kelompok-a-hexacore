// ============================================================
// components/Header.jsx
// TopNav  → Guest & Member
// Sidebar → Admin
// badges  → { transactions: N, fines: N } untuk notifikasi pending
// ============================================================

const GUEST_LINKS = [
  { id: 'home', label: 'Beranda' },
]

const MEMBER_LINKS = [
  { id: 'home',         label: 'Beranda'   },
  { id: 'transactions', label: 'Transaksi', badgeKey: 'transactions' },
  { id: 'fines',        label: 'Denda',     badgeKey: 'fines'        },
  { id: 'profile',      label: 'Profil'    },
]

const ADMIN_GROUPS = [
  {
    label: 'Utama',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '▦' },
      { id: 'profile',   label: 'Profil',    icon: '◉' },
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

function TopNav({ page, onNav, user, onLogout, badges = {} }) {
  const links = user ? MEMBER_LINKS : GUEST_LINKS
  return (
    <header className="topnav">
      <button className="topnav-brand" onClick={() => onNav('home')}>
        <div className="topnav-brand-mark">📚</div>
        <span className="topnav-brand-text">
          Lentera<span>Pustaka</span>
        </span>
      </button>

      <nav className="topnav-nav">
        {links.map(l => (
          <button
            key={l.id}
            className={`topnav-link${page === l.id ? ' active' : ''}`}
            onClick={() => onNav(l.id)}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            {l.label}
            {l.badgeKey && <BadgeDot count={badges[l.badgeKey]} />}
          </button>
        ))}
      </nav>

      <div className="topnav-right">
        {user ? (
          <>
            <button className="topnav-user-btn" onClick={() => onNav('profile')}>
              <div className="avatar avatar-sm">{user.full_name?.[0]?.toUpperCase()}</div>
              <span>{user.full_name?.split(' ')[0]}</span>
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}
              style={{ color: 'var(--c-text3)', fontSize: 13 }}>
              Keluar
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('login', { tab: 'login' })}>Masuk</button>
            <button className="btn btn-primary btn-sm" onClick={() => onNav('login', { tab: 'register' })}>Daftar</button>
          </>
        )}
      </div>
    </header>
  )
}

function Sidebar({ page, onNav, user, onLogout, badges = {} }) {
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
              <button
                key={item.id}
                className={`sidebar-link${page === item.id ? ' active' : ''}`}
                onClick={() => onNav(item.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="sidebar-link-icon">{item.icon}</span>
                  {item.label}
                </span>
                {item.badgeKey && <BadgeDot count={badges[item.badgeKey]} />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => onNav('profile')}>
            <div className="avatar avatar-md">{user.full_name?.[0]?.toUpperCase()}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="sidebar-user-name">{user.full_name}</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={onLogout}>
            <span>↩</span> Keluar
          </button>
        </div>
      )}
    </aside>
  )
}

function Header({ page, onNav, user, onLogout, badges }) {
  return user?.role === 'admin'
    ? <Sidebar page={page} onNav={onNav} user={user} onLogout={onLogout} badges={badges} />
    : <TopNav  page={page} onNav={onNav} user={user} onLogout={onLogout} badges={badges} />
}

export default Header