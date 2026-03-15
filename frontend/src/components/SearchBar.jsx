// ============================================================
// components/SearchBar.jsx
// ============================================================
import { useState } from 'react'

function SearchBar({ onSearch, placeholder = 'Cari…' }) {
  const [q, setQ] = useState('')

  const handleChange = (e) => {
    setQ(e.target.value)
    if (!e.target.value) onSearch('')
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{
        position: 'absolute', left: 10,
        color: 'var(--c-text3)', fontSize: 15, pointerEvents: 'none',
      }}>
        ⌕
      </span>
      <input
        className="input"
        style={{ paddingLeft: 34, paddingRight: q ? 34 : 12 }}
        placeholder={placeholder}
        value={q}
        onChange={handleChange}
        onKeyDown={e => e.key === 'Enter' && onSearch(q)}
      />
      {q && (
        <button
          onClick={() => { setQ(''); onSearch('') }}
          style={{
            position: 'absolute', right: 8,
            width: 20, height: 20,
            borderRadius: '50%',
            background: 'var(--c-border)',
            border: 'none', cursor: 'pointer',
            fontSize: 11, color: 'var(--c-text2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar