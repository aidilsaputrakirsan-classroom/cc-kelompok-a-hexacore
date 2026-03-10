// ============================================================
// components/SearchBar.jsx — Input pencarian (reusable)
// Digunakan di halaman Buku
// ============================================================
import { useState } from "react"
import { C } from "./ui/tokens"

function SearchBar({ onSearch, placeholder = "Cari…" }) {
  const [query, setQuery] = useState("")

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val === "") onSearch("") // langsung reset saat dikosongkan
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{
          position: "absolute", left: 14, fontSize: 16, pointerEvents: "none",
        }}>🔍</span>

        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "12px 44px",
            borderRadius: 14,
            border: `2px solid ${C.cream}`,
            background: "#fff",
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={e  => e.target.style.borderColor = C.sky}
          onBlur={e   => e.target.style.borderColor = C.cream}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: "absolute", right: 14,
              background: "none", border: "none",
              color: C.muted, fontSize: 14, cursor: "pointer",
              padding: "2px 6px", borderRadius: 4,
            }}
          >
            ✕
          </button>
        )}
      </div>

      <button
        type="submit"
        style={{
          padding: "10px 20px",
          background: C.sky,
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: `0 4px 12px ${C.sky}44`,
          fontFamily: "inherit",
        }}
      >
        Cari
      </button>
    </form>
  )
}

export default SearchBar
