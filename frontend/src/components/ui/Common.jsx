// ============================================================
// components/ui/Common.jsx — Komponen UI reusable
// Spinner, Badge, Btn, Card, StatCard, Modal, Field, Input,
// Select, Empty, Toast
// ============================================================
import { useEffect } from "react"
import { C } from "./tokens"

// ── Spinner ───────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `4px solid ${C.grape}30`,
        borderTop: `4px solid ${C.grape}`,
        animation: "spin .8s linear infinite",
      }} />
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────
export function Badge({ color, children }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 99,
      background: `${color}22`, color, fontWeight: 700, fontSize: 12,
    }}>
      {children}
    </span>
  )
}

// ── Button ────────────────────────────────────────────────────
export function Btn({ children, color = C.sky, onClick, small, outline, danger, style: xStyle, disabled }) {
  const bg = danger ? C.coral : outline ? "transparent" : color
  const fg = outline ? (danger ? C.coral : color) : "#fff"
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? "6px 14px" : "10px 22px",
        borderRadius: 12,
        background: bg,
        color: fg,
        fontWeight: 700,
        fontSize: small ? 13 : 14,
        border: outline || danger ? `2px solid ${danger ? C.coral : color}` : "none",
        boxShadow: outline ? "none" : `0 4px 12px ${bg}55`,
        transition: "transform .15s",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? .6 : 1,
        fontFamily: "inherit",
        ...xStyle,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "scale(1.04)" }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)" }}
    >
      {children}
    </button>
  )
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, accent, style: xStyle }) {
  return (
    <div style={{
      background: C.card,
      borderRadius: 20,
      padding: 24,
      boxShadow: "0 4px 24px rgba(0,0,0,.07)",
      borderTop: accent ? `4px solid ${accent}` : "none",
      ...xStyle,
    }}>
      {children}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────
export function StatCard({ emoji, label, value, color }) {
  return (
    <div className="anim-pop" style={{
      background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
      border: `2px solid ${color}30`,
      borderRadius: 20,
      padding: 24,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <span style={{ fontSize: 32 }}>{emoji}</span>
      <span style={{ fontWeight: 800, fontSize: 28, color }}>{value}</span>
      <span style={{ color: C.muted, fontWeight: 600, fontSize: 14 }}>{label}</span>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ title, onClose, children, accent = C.sky }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(26,26,46,.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
    >
      <div className="anim-pop" style={{
        background: C.card, borderRadius: 24,
        width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 60px rgba(0,0,0,.18)",
        borderTop: `5px solid ${accent}`,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${C.cream}`,
        }}>
          <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: accent }}>
            {title}
          </h3>
          <button onClick={onClose} style={{
            background: "none", fontSize: 20, color: C.muted,
            border: "none", cursor: "pointer",
          }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Field & Input ─────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6, color: C.dark }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function Input({ value, onChange, placeholder, type = "text", required }) {
  return (
    <input
      value={value} onChange={onChange}
      placeholder={placeholder} type={type} required={required}
      style={{
        width: "100%", padding: "10px 14px", borderRadius: 12,
        border: `2px solid ${C.cream}`, background: C.cream,
        fontSize: 14, outline: "none", transition: "border .2s",
        fontFamily: "inherit",
      }}
      onFocus={e => e.target.style.border = `2px solid ${C.sky}`}
      onBlur={e  => e.target.style.border = `2px solid ${C.cream}`}
    />
  )
}

export function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} style={{
      width: "100%", padding: "10px 14px", borderRadius: 12,
      border: `2px solid ${C.cream}`, background: C.cream,
      fontSize: 14, outline: "none", fontFamily: "inherit",
    }}>
      {children}
    </select>
  )
}

// ── Empty State ───────────────────────────────────────────────
export function Empty({ emoji, text }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 0", color: C.muted }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</div>
      <p style={{ fontWeight: 700 }}>{text}</p>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────
export function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const bg = type === "success" ? C.mint : type === "error" ? C.coral : C.sky
  return (
    <div className="anim-slide" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: "#fff", borderRadius: 14,
      padding: "12px 20px", fontWeight: 700, fontSize: 14,
      boxShadow: `0 8px 24px ${bg}55`,
    }}>
      {type === "success" ? "✅ " : type === "error" ? "❌ " : "ℹ️ "}{msg}
    </div>
  )
}
