import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ItemCard from '../ItemCard'

// Mock dependency API_BASE
vi.mock('../../services/api', () => ({
  API_BASE: 'http://localhost:8000',
}))

const mockBook = {
  book_id: 1,
  title: 'Laskar Pelangi',
  author: 'Andrea Hirata',
  publisher: 'Bentang Pustaka',
  publication_year: 2005,
  available_stock: 5,
  total_stock: 10,
  genres: [{ genre_id: 1, name: 'Fiksi' }],
  cover_image_url: null,
}

const mockBookHabis = {
  ...mockBook,
  book_id: 2,
  title: 'Buku Habis Stok',
  available_stock: 0,
}

describe('ItemCard Component', () => {
  it('menampilkan judul dan pengarang buku', () => {
    render(<ItemCard book={mockBook} isAdmin={false} />)
    // Judul muncul 2x (di cover dan di info card) — pakai getAllByText
    const titles = screen.getAllByText('Laskar Pelangi')
    expect(titles.length).toBeGreaterThanOrEqual(1)
    const authors = screen.getAllByText('Andrea Hirata')
    expect(authors.length).toBeGreaterThanOrEqual(1)
  })

  it('menampilkan badge stok tersedia jika stok > 0', () => {
    render(<ItemCard book={mockBook} isAdmin={false} />)
    // Badge stok: "⚠ 5" atau "✓ 5" — cukup cek angka ada di dokumen
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('menampilkan badge "Habis" jika stok = 0', () => {
    render(<ItemCard book={mockBookHabis} isAdmin={false} />)
    expect(screen.getByText('Habis')).toBeInTheDocument()
  })

  it('TIDAK menampilkan tombol Edit dan Hapus jika bukan Admin', () => {
    render(<ItemCard book={mockBook} isAdmin={false} />)
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(screen.queryByText('Hapus')).not.toBeInTheDocument()
  })

  it('memanggil onEdit ketika tombol Edit diklik (Admin)', () => {
    const handleEdit = vi.fn()
    const handleDelete = vi.fn()
    render(
      <ItemCard
        book={mockBook}
        isAdmin={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
    // Hover overlay tampil di DOM meskipun hidden — cari tombol Edit
    const editBtn = screen.getByText('Edit')
    fireEvent.click(editBtn)
    expect(handleEdit).toHaveBeenCalledWith(mockBook)
  })

  it('memanggil onDelete dengan book_id ketika tombol Hapus diklik (Admin)', () => {
    const handleEdit = vi.fn()
    const handleDelete = vi.fn()
    render(
      <ItemCard
        book={mockBook}
        isAdmin={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
    const deleteBtn = screen.getByText('Hapus')
    fireEvent.click(deleteBtn)
    expect(handleDelete).toHaveBeenCalledWith(mockBook.book_id)
  })

  it('menampilkan genre sebagai badge', () => {
    render(<ItemCard book={mockBook} isAdmin={false} />)
    expect(screen.getByText('Fiksi')).toBeInTheDocument()
  })
})
