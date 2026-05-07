import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Header from '../Header'

// Mock CSS imports
vi.mock('../../App.css', () => ({}))

const mockNav = vi.fn()
const mockLogout = vi.fn()
const mockToggleTheme = vi.fn()

describe('Header Component', () => {
  it('menampilkan nama aplikasi LenteraPustaka untuk guest', () => {
    render(
      <Header
        page="home"
        onNav={mockNav}
        user={null}
        onLogout={mockLogout}
        badges={{}}
        theme="light"
        toggleTheme={mockToggleTheme}
      />
    )
    // Brand "Lentera" dan "Pustaka" dirender dalam span terpisah
    expect(screen.getByText('Lentera')).toBeInTheDocument()
    expect(screen.getByText('Pustaka')).toBeInTheDocument()
  })

  it('menampilkan tombol Masuk dan Daftar saat belum login (guest)', () => {
    render(
      <Header
        page="home"
        onNav={mockNav}
        user={null}
        onLogout={mockLogout}
        badges={{}}
        theme="light"
        toggleTheme={mockToggleTheme}
      />
    )
    expect(screen.getByText('Masuk')).toBeInTheDocument()
    expect(screen.getByText('Daftar')).toBeInTheDocument()
  })

  it('menampilkan nama user dan tombol Keluar saat sudah login', () => {
    render(
      <Header
        page="home"
        onNav={mockNav}
        user={{ full_name: 'Budi Santoso', role: 'member' }}
        onLogout={mockLogout}
        badges={{}}
        theme="light"
        toggleTheme={mockToggleTheme}
      />
    )
    expect(screen.getByText('Budi')).toBeInTheDocument()
    expect(screen.getByText('Keluar')).toBeInTheDocument()
  })

  it('memanggil onNav saat link navigasi diklik', () => {
    render(
      <Header
        page="home"
        onNav={mockNav}
        user={null}
        onLogout={mockLogout}
        badges={{}}
        theme="light"
        toggleTheme={mockToggleTheme}
      />
    )
    fireEvent.click(screen.getByText('Tentang'))
    expect(mockNav).toHaveBeenCalledWith('about')
  })

  it('menampilkan icon 🌙 saat tema light dan ☀️ saat tema dark', () => {
    const { rerender } = render(
      <Header
        page="home"
        onNav={mockNav}
        user={null}
        onLogout={mockLogout}
        badges={{}}
        theme="light"
        toggleTheme={mockToggleTheme}
      />
    )
    expect(screen.getByText('🌙')).toBeInTheDocument()

    rerender(
      <Header
        page="home"
        onNav={mockNav}
        user={null}
        onLogout={mockLogout}
        badges={{}}
        theme="dark"
        toggleTheme={mockToggleTheme}
      />
    )
    expect(screen.getByText('☀️')).toBeInTheDocument()
  })
})
