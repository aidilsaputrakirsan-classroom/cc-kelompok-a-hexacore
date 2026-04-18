-- Tambahkan kolom cover_image_url ke tabel books untuk menyimpan URL cover buku.
-- Aman dijalankan berulang karena memakai IF NOT EXISTS.

ALTER TABLE books
ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500);
