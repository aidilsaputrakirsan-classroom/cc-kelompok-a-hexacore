import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Header from '../Header'

// Mock CSS imports
vi.mock('../../App.css', () => ({}))

const mockNav = vi.fn()
const mockLogout = vi.fn()
const mockToggleTheme = vi.fn()

describe('Header Component', () => {
  it('menampilkan nama aplikasi LenteraPustaka untuk guest', () => {
    render(
      <BrowserRouter>
        <Header
          page="home"
          onNav={mockNav}
          user={null}
          onLogout={mockLogout}
          badges={{}}
          theme="light"
          toggleTheme={mockToggleTheme}
        />
      </BrowserRouter>
    )
    // Brand "Lentera" dan "Pustaka" dirender dalam span terpisah
    expect(screen.getByText('Lentera')).toBeInTheDocument()
    expect(screen.getByText('Pustaka')).toBeInTheDocument()
  })

  it('menampilkan tombol Masuk dan Daftar saat belum login (guest)', () => {
    render(
      <BrowserRouter>
        <Header
          page="home"
          onNav={mockNav}
          user={null}
          onLogout={mockLogout}
          badges={{}}
          theme="light"
          toggleTheme={mockToggleTheme}
        />
      </BrowserRouter>
    )
    expect(screen.getByText('Masuk')).toBeInTheDocument()
    expect(screen.getByText('Daftar')).toBeInTheDocument()
  })

  it('menampilkan nama user dan tombol Keluar saat sudah login', () => {
    render(
      <BrowserRouter>
        <Header
          page="home"
          onNav={mockNav}
          user={{ full_name: 'Budi Santoso', role: 'member' }}
          onLogout={mockLogout}
          badges={{}}
          theme="light"
          toggleTheme={mockToggleTheme}
        />
      </BrowserRouter>
    )
    expect(screen.getByText('Budi')).toBeInTheDocument()
    expect(screen.getByText('Keluar')).toBeInTheDocument()
  })

  it('mengarahkan ke /about saat link Tentang diklik', () => {
    render(
      <BrowserRouter>
        <Header
          page="home"
          onNav={mockNav}
          user={null}
          onLogout={mockLogout}
          badges={{}}
          theme="light"
          toggleTheme={mockToggleTheme}
        />
      </BrowserRouter>
    )
    const aboutLink = screen.getByText('Tentang')
    expect(aboutLink).toHaveAttribute('href', '/about')
  })

  it('menampilkan icon 🌙 saat tema light dan ☀️ saat tema dark', () => {
    const { rerender } = render(
      <BrowserRouter>
        <Header
          page="home"
          onNav={mockNav}
          user={null}
          onLogout={mockLogout}
          badges={{}}
          theme="light"
          toggleTheme={mockToggleTheme}
        />
      </BrowserRouter>
    )
    expect(screen.getByText('🌙')).toBeInTheDocument()

    rerender(
      <BrowserRouter>
        <Header
          page="home"
          onNav={mockNav}
          user={null}
          onLogout={mockLogout}
          badges={{}}
          theme="dark"
          toggleTheme={mockToggleTheme}
        />
      </BrowserRouter>
    )
    expect(screen.getByText('☀️')).toBeInTheDocument()
  })
})
