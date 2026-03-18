-- ============================================================
-- LenteraPustaka — Database Seed
-- Komputasi Awan · SI ITK · HEXACORE (Kelompok A)
-- 
-- Cara pakai:
--   1. Pastikan tabel sudah dibuat (jalankan backend sekali: uvicorn main:app)
--   2. Jalankan file ini di psql atau pgAdmin:
--      psql -U postgres -d lenterapustaka -f database_seed.sql
--   3. Atau copy-paste ke Query Tool pgAdmin
--
-- Catatan: password di-hash dengan bcrypt
--   "Admin@123"  → hash bcrypt
--   "Member@123" → hash bcrypt
-- ============================================================

-- Bersihkan data lama (urutan penting karena ada FK)
TRUNCATE TABLE fines         RESTART IDENTITY CASCADE;
TRUNCATE TABLE transactions  RESTART IDENTITY CASCADE;
TRUNCATE TABLE book_genres   RESTART IDENTITY CASCADE;
TRUNCATE TABLE books         RESTART IDENTITY CASCADE;
TRUNCATE TABLE genres        RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories    RESTART IDENTITY CASCADE;
TRUNCATE TABLE users         RESTART IDENTITY CASCADE;

-- ============================================================
-- USERS
-- Password: Admin@123  (untuk admin)
-- Password: Member@123 (untuk semua member)
-- ============================================================
INSERT INTO users (email, password_hash, full_name, role, created_at) VALUES
(
  'admin@itk.ac.id',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2BI3wFqUhS',
  'Administrator LenteraPustaka',
  'admin',
  NOW()
),
(
  'maulana@student.itk.ac.id',
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Maulana Malik Ibrahim',
  'member',
  NOW()
),
(
  'micka@student.itk.ac.id',
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Micka Mayulia Utama',
  'member',
  NOW()
),
(
  'khanza@student.itk.ac.id',
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Khanza Nabila Tsabita',
  'member',
  NOW()
),
(
  'aqila@student.itk.ac.id',
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Muhammad Aqila Ardhi',
  'member',
  NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, description) VALUES
('Fiksi',        'Novel, cerpen, dan karya fiksi imajinatif'),
('Non-Fiksi',    'Buku faktual: biografi, sejarah, sains populer'),
('Teknologi',    'Pemrograman, jaringan, sistem informasi, AI'),
('Pendidikan',   'Buku teks, referensi akademik, panduan belajar'),
('Pengembangan Diri', 'Motivasi, kepemimpinan, produktivitas'),
('Sains',        'Fisika, kimia, biologi, matematika');

-- ============================================================
-- GENRES
-- ============================================================
INSERT INTO genres (name, description) VALUES
('Horor',        'Cerita yang menakutkan dan menegangkan'),
('Romance',      'Kisah cinta dan hubungan romantis'),
('Thriller',     'Penuh suspense dan ketegangan'),
('Sejarah',      'Berlatarkan peristiwa sejarah nyata'),
('Petualangan',  'Eksplorasi, aksi, dan petualangan seru'),
('Humor',        'Komedi dan cerita ringan menghibur'),
('Biografi',     'Kisah hidup tokoh nyata'),
('Sains Populer','Sains yang disajikan untuk umum'),
('Tutorial',     'Panduan langkah demi langkah'),
('Algoritma',    'Struktur data dan algoritma pemrograman');

-- ============================================================
-- BOOKS
-- ============================================================
INSERT INTO books (category_id, isbn, title, author, publisher, publication_year, synopsis, total_stock, available_stock) VALUES
(1, '978-602-03-3446-5', 'Laskar Pelangi',
 'Andrea Hirata', 'Bentang Pustaka', 2005,
 'Novel tentang semangat anak-anak Belitung mengejar mimpi di tengah keterbatasan fasilitas pendidikan.',
 5, 5),

(1, '978-979-22-9544-0', 'Bumi Manusia',
 'Pramoedya Ananta Toer', 'Lentera Dipantara', 1980,
 'Kisah perjuangan Minke, seorang pribumi terdidik di masa kolonial Belanda. Buku pertama Tetralogi Buru.',
 4, 4),

(1, '978-602-9144-20-3', 'Negeri 5 Menara',
 'Ahmad Fuadi', 'Gramedia Pustaka Utama', 2009,
 'Novel semi-autobiografi tentang kehidupan di pesantren dan tekad meraih impian ke luar negeri.',
 3, 3),

(3, '978-623-00-1234-5', 'Pemrograman Web dengan FastAPI',
 'Tim Pengajar ITK', 'Institut Teknologi Kalimantan', 2024,
 'Panduan komprehensif membangun REST API modern menggunakan FastAPI, SQLAlchemy, dan PostgreSQL.',
 10, 10),

(3, '978-0-13-468599-1', 'Clean Code',
 'Robert C. Martin', 'Prentice Hall', 2008,
 'Panduan menulis kode yang bersih, mudah dibaca, dan dapat dipelihara. Wajib dibaca setiap developer.',
 6, 6),

(3, '978-0-201-63361-0', 'Design Patterns',
 'Gang of Four', 'Addison-Wesley', 1994,
 'Buku klasik tentang 23 pola desain perangkat lunak yang menjadi fondasi arsitektur modern.',
 3, 3),

(4, '978-979-030-073-7', 'Matematika Diskrit untuk Ilmu Komputer',
 'Kenneth H. Rosen', 'Erlangga', 2012,
 'Buku teks matematika diskrit yang mencakup logika, himpunan, relasi, graf, dan kombinatorika.',
 8, 8),

(2, '978-602-06-4126-0', 'Sapiens: Riwayat Singkat Umat Manusia',
 'Yuval Noah Harari', 'KPG', 2017,
 'Telaah mendalam tentang perjalanan Homo sapiens dari batu api hingga rekayasa genetika.',
 4, 4),

(5, '978-602-8784-44-5', 'The 7 Habits of Highly Effective People',
 'Stephen R. Covey', 'Binarupa Aksara', 2013,
 'Tujuh kebiasaan yang dipelajari dari ratusan pemimpin sukses dunia untuk efektivitas pribadi dan profesional.',
 5, 5),

(3, '978-0-13-110362-7', 'The C Programming Language',
 'Brian W. Kernighan & Dennis Ritchie', 'Prentice Hall', 1988,
 'Buku referensi resmi bahasa C oleh penciptanya. Fondasi untuk memahami pemrograman tingkat rendah.',
 2, 2),

(6, '978-0-06-112009-3', 'Brief History of Time',
 'Stephen Hawking', 'Bantam Books', 1988,
 'Penjelasan menakjubkan tentang asal usul dan nasib alam semesta untuk pembaca awam.',
 3, 3),

(1, '978-979-22-1234-6', 'Perahu Kertas',
 'Dewi Lestari (Dee)', 'Bentang Pustaka', 2009,
 'Kisah cinta dua anak muda yang bertemu secara tidak sengaja dan terhubung melalui karya seni.',
 4, 4);

-- ============================================================
-- BOOK_GENRES (relasi many-to-many)
-- ============================================================
-- Laskar Pelangi: Petualangan, Humor
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'Laskar Pelangi' AND g.name IN ('Petualangan', 'Humor');

-- Bumi Manusia: Sejarah, Romance
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'Bumi Manusia' AND g.name IN ('Sejarah', 'Romance');

-- Negeri 5 Menara: Petualangan
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'Negeri 5 Menara' AND g.name IN ('Petualangan');

-- Pemrograman Web dengan FastAPI: Tutorial
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'Pemrograman Web dengan FastAPI' AND g.name IN ('Tutorial');

-- Clean Code: Tutorial, Algoritma
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'Clean Code' AND g.name IN ('Tutorial', 'Algoritma');

-- Design Patterns: Algoritma, Tutorial
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'Design Patterns' AND g.name IN ('Algoritma', 'Tutorial');

-- Matematika Diskrit: Algoritma
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'Matematika Diskrit untuk Ilmu Komputer' AND g.name IN ('Algoritma');

-- Sapiens: Sejarah, Sains Populer
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'Sapiens: Riwayat Singkat Umat Manusia' AND g.name IN ('Sejarah', 'Sains Populer');

-- 7 Habits: Biografi
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'The 7 Habits of Highly Effective People' AND g.name IN ('Biografi');

-- The C Programming Language: Tutorial, Algoritma
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'The C Programming Language' AND g.name IN ('Tutorial', 'Algoritma');

-- Brief History of Time: Sains Populer
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'Brief History of Time' AND g.name IN ('Sains Populer');

-- Perahu Kertas: Romance
INSERT INTO book_genres (book_id, genre_id)
SELECT b.book_id, g.genre_id FROM books b, genres g
WHERE b.title = 'Perahu Kertas' AND g.name IN ('Romance');

-- ============================================================
-- VERIFIKASI
-- ============================================================
SELECT 'users'      AS tabel, COUNT(*) AS jumlah FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'genres',     COUNT(*) FROM genres
UNION ALL
SELECT 'books',      COUNT(*) FROM books
UNION ALL
SELECT 'book_genres', COUNT(*) FROM book_genres;

-- ============================================================
-- CATATAN PENTING
-- ============================================================
-- Hash password di atas adalah bcrypt untuk:
--   admin@itk.ac.id          → "Admin@123"
--   *@student.itk.ac.id      → "Member@123"
--
-- Jika hash tidak sesuai dengan SECRET_KEY di .env kamu,
-- generate ulang lewat Python:
--
--   from passlib.context import CryptContext
--   ctx = CryptContext(schemes=["bcrypt"])
--   print(ctx.hash("Admin@123"))
--
-- Atau gunakan endpoint POST /auth/register di Swagger UI
-- (localhost:8000/docs) untuk membuat akun admin baru.
--
-- ============================================================
-- AKUN SIAP PAKAI:
-- Admin : admin@itk.ac.id       / Admin@123
-- Member: maulana@student.itk.ac.id / Member@123
-- Member: micka@student.itk.ac.id   / Member@123
-- Member: khanza@student.itk.ac.id  / Member@123
-- Member: aqila@student.itk.ac.id   / Member@123
-- ============================================================