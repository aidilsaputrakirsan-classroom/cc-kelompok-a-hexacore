// ============================================================
// src/data/seedBooks.js
// Data contoh buku — ditampilkan jika DB kosong atau API tidak tersedia
// ============================================================

/**
 * SEED_BOOKS — 3 contoh buku untuk fallback tampilan
 * Dipakai oleh useBooks hook ketika:
 *   1. API mengembalikan array kosong dan tidak ada query pencarian
 *   2. API error / tidak bisa diakses
 */
export const SEED_BOOKS = [
  {
    book_id: 1,
    isbn: '978-602-03-3446-5',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    publisher: 'Bentang Pustaka',
    publication_year: 2005,
    synopsis: 'Novel tentang semangat anak-anak Belitung mengejar mimpi di tengah keterbatasan.',
    total_stock: 5,
    available_stock: 3,
    category_id: 1,
    genres: [{ genre_id: 1, name: 'Fiksi' }],
  },
  {
    book_id: 2,
    isbn: '978-979-22-9544-0',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    publisher: 'Lentera Dipantara',
    publication_year: 1980,
    synopsis: 'Kisah perjuangan Minke, seorang pribumi terdidik pada masa kolonial Belanda.',
    total_stock: 4,
    available_stock: 4,
    category_id: 1,
    genres: [
      { genre_id: 1, name: 'Fiksi' },
      { genre_id: 2, name: 'Sejarah' },
    ],
  },
  {
    book_id: 3,
    isbn: '978-623-00-1234-5',
    title: 'Pemrograman Web dengan FastAPI',
    author: 'Tim Pengajar ITK',
    publisher: 'Institut Teknologi Kalimantan',
    publication_year: 2024,
    synopsis: 'Panduan membangun REST API modern untuk mata kuliah Komputasi Awan SI ITK.',
    total_stock: 10,
    available_stock: 0,
    category_id: 2,
    genres: [{ genre_id: 3, name: 'Teknologi' }],
  },
]