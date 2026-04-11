## 📡 Dokumentasi & Hasil Testing Endpoint API

Berikut adalah daftar *endpoint* beserta bukti pengujian menggunakan Swagger/Thunder Client. 

*(Daftar pengujian mencakup 6 poin utama dengan total 22 sub-poin)*:
<br><img src="docs/test/categories.png" width="500">

| No | method | URL | request body | response example |
|:--:|--------|--------|--------|--------|
| **1** | `GET` | `/system/health` | *-* | Status `healthy` v0.3.0<br><img src="docs/test/systemget1.png" width="300"> |
| **2** | `GET` | `/system/team` | *-* | Data tim beranggotakan 4 orang<br><img src="docs/test/responsystemget.png" width="300"> |
| **3** | `POST` | `/categories` | <pre><code>{"name": "Non-Fiksi", "description": "Karya tulis informatif..."}</code></pre><img src="docs/test/post4.png" width="300"> | Berhasil membuat data kategori<br><img src="docs/test/responspost.png" width="300"> |
| **4** | `GET` | `/categories` | *-* | Menampilkan *list* kategori<br><img src="docs/test/responsget.png" width="300"> |
| **5** | `GET` | `/categories/{category_id}` | Parameter: `category_id = 1`<br><img src="docs/test/get2.png" width="300"> | Menampilkan detail kategori ID 1<br><img src="docs/test/responsget2.png" width="300"> |
| **6** | `PUT` | `/categories/{category_id}` | `category_id = 1`<br><pre><code>{"name": "Fiksi", "description": "Karya sastra naratif..."}</code></pre><img src="docs/test/put3.png" width="300"> | Data kategori berhasil di-update<br><img src="docs/test/responsput.png" width="300"> |
| **7** | `DELETE` | `/categories/{category_id}` | Parameter: `category_id = 1`<br><img src="docs/test/delete1.png" width="300"> | `access-control-allow-credentials: true`<br><img src="docs/test/responsdelete1.png" width="300"> |
| **8** | `GET` | `/categories` | *(Pengecekan setelah hapus)*<br>*-* | Kategori ID 1 sudah terhapus<br><img src="docs/test/getdelete.png" width="300"> |
| **9** | `POST` | `/books` | <pre><code>{"category_id": 1, "isbn": "978-602-033-294-9", "title": "Bulan", "author": "Tere Liye", "total_stock": 5...}</code></pre><img src="docs/test/bookspost1.png" width="300"> | Berhasil membuat data buku<br><img src="docs/test/responspostbook.png" width="300"> |
| **10** | `GET` | `/books/stats` | *(Statistik inventaris awal)*<br>*-* | Menampilkan statistik total buku<br><img src="docs/test/getbookawalpng" width="300"> |
| **11** | `GET` | `/books` | Parameter: `ISBN = 978-602-033-294-9`<br><img src="docs/test/getbook.png" width="300"> | Menampilkan hasil pencarian buku<br><img src="docs/test/responsgetbook.png" width="300"> |
| **12** | `GET` | `/books/{book_id}` | Parameter: `book_id`<br><img src="docs/test/getbook2.png" width="300"> | Menampilkan detail spesifik buku<br><img src="docs/test/responsgetbook2.png" width="300"> |
| **13** | `PUT` | `/books/{book_id}` | `book_id`<br><pre><code>{"available_stock": 3...}</code></pre><img src="docs/test/putbook.png" width="300"> | Stok buku berhasil di-update<br><img src="docs/test/responsputbook.png" width="300"> |
| **14** | `GET` | `/books/stats` | *(Cek statistik pasca update)*<br>*-* | Perubahan statistik inventaris<br><img src="docs/test/getbookput.png" width="300"> |
| **15** | `DELETE` | `/books/{book_id}` | Parameter: `book_id`<br>*-* | Data buku berhasil dihapus<br><img src="docs/test/responsdeletebook.png" width="300"> |
| **16** | `GET` | `/books` | *(Pengecekan setelah hapus)*<br>*-* | Menampilkan *list* buku terbaru<br><img src="docs/test/responsgetdeletebook.png" width="300"> |
| **17** | `GET` | `/books/stats` | *(Cek statistik pasca hapus)*<br>*-* | Statistik inventaris berkurang<br><img src="docs/test/getbookdelete.png" width="300"> |
| **18** | `POST` | `/user` | <pre><code>{"email": "micka@example.com", "password": "password456", "full_name": "Micka Mayulia", "role": "member"}</code></pre><img src="docs/test/postuser.png" width="300"> | Berhasil membuat *user* baru<br><img src="docs/test/responsputuser.png" width="300"> |
| **19** | `GET` | `/user` | *-* | Menampilkan *list* *user*<br><img src="docs/test/responsgetuser.png" width="300"> |
| **20** | `GET` | `/user/{user_id}` | Parameter: `user_id`<br><img src="docs/test/getuser2.png" width="300"> | Menampilkan detail *user*<br><img src="docs/test/responsgetuser2.png" width="300"> |
| **21** | `POST` | `/transaction` | <pre><code>{"user_id": "96b872f9...", "book_id": "29efea5f...", "due_date": "2026-03-07..."}</code></pre><img src="docs/test/postransaction.png" width="300"> | Peminjaman buku berhasil dicatat<br><img src="docs/test/responspostransaction.png" width="300"> |
| **22** | `GET` | `/transaction` | Menampilkan status (dipinjam, dikembalikan, dll)<br><img src="docs/test/getransaction.png" width="300"> | Menampilkan *list* transaksi<br><img src="docs/test/responsgetransaction.png" width="300"> |
| **23** | `GET` | `/transaction/{id}` | Parameter: `transaction_id`<br><img src="docs/test/getransaction2.png" width="300"> | Menampilkan detail transaksi spesifik<br><img src="docs/test/responsgetransaction2.png" width="300"> |
| **24** | `PUT` | `/transaction/{id}` | Parameter: `transaction_id`<br><img src="docs/test/putransaction.png" width="300"> | Pembaruan status transaksi berhasil<br><img src="docs/test/responsputransaction.png" width="300"> |
| **25** | `GET` | `/fines` | Parameter: `belum lunas`<br><img src="docs/test/getfines.png" width="300"> | Menampilkan detail denda berjalan<br><img src="docs/test/responsgetfines.png" width="300"> |
| **26** | `PUT` | `/fines/{fines_id}` | Parameter: `fines_id`<br><img src="docs/test/putfines.png" width="300"> | Status pelunasan berhasil di-update<br><img src="docs/test/responsputfines.png" width="300"> |
| **27** | `GET` | `/fines` | Parameter: `lunas`<br><img src="docs/test/getfines2.png" width="300"> | Menampilkan riwayat denda lunas<br><img src="docs/test/responsgetfines2.png" width="300"> |