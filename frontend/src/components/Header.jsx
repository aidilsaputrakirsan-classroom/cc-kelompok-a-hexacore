// ============================================================
// components/Header.jsx — Sidebar navigasi & branding
// Peran di modul 3: menampilkan judul & statistik
// ============================================================

export const NAV_ITEMS = [
  { id: "dashboard",    icon: "🏠", label: "Dashboard"  },
  { id: "books",        icon: "📚", label: "Buku"       },
  { id: "categories",   icon: "🏷️", label: "Kategori"   },
  { id: "transactions", icon: "🔄", label: "Transaksi"  },
  { id: "fines",        icon: "💰", label: "Denda"      },
  { id: "users",        icon: "👥", label: "Pengguna"   },
]

export const PAGE_ACCENT = {
  dashboard:    "#FFD93D",
  books:        "#4D96FF",
  categories:   "#C77DFF",
  transactions: "#6BCB77",
  fines:        "#FF6B6B",
  users:        "#FFB347",
}

// ── Sidebar Header ────────────────────────────────────────────
function Header({ currentPage, onNavigate }) {
  return (
    <aside style={{
      width: 220,
      background: "#1A1A2E",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      height: "100vh",
      boxShadow: "4px 0 24px rgba(0,0,0,.18)",
      flexShrink: 0,
    }}>
      {/* Branding / Logo */}
      <div style={{ padding: "28px 20px 20px" }}>
        <div style={{
          fontFamily: "'Fredoka One',cursive",
          fontSize: 22,
          background: "linear-gradient(135deg,#FFD93D,#FF6B6B)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 4,
        }}>
          📚 LenteraPustaka
        </div>
        <div style={{ fontSize: 11, color: "#ffffff55", fontWeight: 600 }}>
          HEXACORE · SI ITK
        </div>
      </div>

      <div style={{ height: 1, background: "#ffffff15", margin: "0 20px 16px" }} />

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(n => {
          const active = currentPage === n.id
          const accent = PAGE_ACCENT[n.id]
          return (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "13px 20px",
                background: active ? `${accent}22` : "transparent",
                color: active ? accent : "#ffffff88",
                fontWeight: active ? 800 : 600,
                fontSize: 14,
                border: "none",
                borderLeft: active ? `3px solid ${accent}` : "3px solid transparent",
                cursor: "pointer",
                transition: "all .2s",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              {n.label}
            </button>
          )
        })}
      </nav>

      {/* Footer versi */}
      <div style={{ padding: "16px 20px", fontSize: 11, color: "#ffffff33" }}>
        v0.3.0
      </div>
    </aside>
  )
}

export default Header
