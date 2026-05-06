import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch global
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('fetch berhasil mengembalikan data buku', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 2, items: [{ book_id: 1, title: 'Buku A' }] }),
    })

    const response = await fetch('http://localhost:8000/books')
    const data = await response.json()

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/books')
    expect(data.total).toBe(2)
    expect(data.items).toHaveLength(1)
  })

  it('menangani error jaringan dengan benar', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(
      fetch('http://localhost:8000/books')
    ).rejects.toThrow('Network error')
  })

  it('fetch dengan response ok: false mereturn data error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Not authenticated' }),
    })

    const response = await fetch('http://localhost:8000/books')
    expect(response.ok).toBe(false)
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.detail).toBe('Not authenticated')
  })
})
