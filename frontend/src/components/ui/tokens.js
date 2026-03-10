// ============================================================
// components/ui/tokens.js — Design tokens bersama
// Warna, formatter, dan konstanta visual
// ============================================================

export const C = {
  sun:   "#FFD93D",
  coral: "#FF6B6B",
  mint:  "#6BCB77",
  sky:   "#4D96FF",
  grape: "#C77DFF",
  peach: "#FFB347",
  cream: "#FFF8F0",
  dark:  "#1A1A2E",
  card:  "#FFFFFF",
  muted: "#6B7280",
}

export const statusColor = {
  borrowed: C.sky,
  returned: C.mint,
  overdue:  C.coral,
  lost:     C.muted,
}

export const statusLabel = {
  borrowed: "📚 Dipinjam",
  returned: "✅ Dikembalikan",
  overdue:  "⚠️ Terlambat",
  lost:     "❌ Hilang",
}

export const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n)

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "-"
