| Gambar |Deskripsi |
|------|-----|
|<img src="test/categories.png" width="600">|Daftar 6 poin dengan total 22 sub-poin yang akan di testing `endpointnya via Swagger atau Thunder Client`|
| <img src="test/systemget1.png" width="600"> | Hasil respon pada endpoin `system/health` mengatakan `app LenteraPustaka versi 0.3.0 berada dalam status healthy`|
| <img src="test/responsystemget.png" width="600"> | Hasil respon pada endpoin `system/team` mengatakan `team cloud-team-hexacore app LenteraPustaka memiliki 4 member dengan role yang berbeda`|
| <img src="test/post4.png" width="600"> | Input value pada endpoin `categories/post` yang digunakan adalah <pre><code>{"name": "Non-Fiksi", "description": "Karya tulis informatif yang menyajikan fakta, data, dan kejadian nyata untuk memberikan pengetahuan kepada pembaca"}</code></pre>|
|<img src="test/responspost.png" width="600"> | Hasil respons pada endpoin `categories/post` akan menampilkan input value sebelumnya|
|<img src="test/responsget.png" width="600"> |Hasil respons pada endpoin `categories/get` adalah menampilkan list value yang telah di buat pada `categories/post` sebelumnya|
|<img src="test/get2.png" width="600"> |Input value pada endpoin `categories/get/category_id` yang digunakan adalah 1 (disesuaikan dengan `category_id` dalam database)|
|<img src="test/responsget2.png" width="600">|Hasil respons pada endpoin `categories/get/category_id` adalah menampilkan data `categories` berdasarkan `category_id` dalam database|
|<img src="test/put3.png" width="600">|Input value pada endpoin `categories/put` yang digunakan dengan `category_id` 1 dan <pre><code>{"name": "Fiksi", "description": "Karya sastra naratif yang isinya bersumber dari imajinasi, khayalan, atau rekaan penulis, bukan berdasarkan fakta atau kenyataan"}</code></pre>
|<img src="test/responsput.png" width="600">|Hasil respons pada endpoin `categories/put` adalah menampilkan data yang diupdate sebelumnya|
|<img src="test/delete1.png" width="600">|Input value pada endpoin `categories/delete` yang digunakan dengan `category_id` 1|
|<img src="test/responsdelete1.png" width="600">|Hasil respons pada enpoin `catagories/delete` adalah menampilkan `access-control-allow-credentials: true`|
|<img src="test/getdelete.png" width="600">|Hasil respons `categories/get` untuk mengecek data yang telah dihapus|
|<img src="test/bookspost1.png" width="600">|Input value pada endpoin `books/post` yang digunakan adalah <pre><code>{"category_id": 1, "isbn": "978-602-033-294-9", "title": "Bulan", "author": "Tere Liye", "publisher": "KOMPAS GRAMEDIA", "publication_year": 2015, "total_stock": 5,   "available_stock": 5}</code></pre> |
|<img src="test/responspostbook.png" width="600">|Hasil respons `books/post` adalah menampilkan data yang telah di input sebelumnya|
|<img src="test/getbookawalpng" width="600">|Hasil respons `books/get/stats` menampilkan statistik inventaris buku|
|<img src="test/getbook.png" width="600">|Input value pada endpoin `books/get` yang digunakan adalah `ISBN` 978-602-033-294-9|
|<img src="test/responsgetbook.png" width="600">|Hasil respons `books/get` menampilkan total buku yang ada|
|<img src="test/getbook2.png" width="600">|Input value pada endpoin `books/get/book_id` yang digunakan adalah `book_id`|
|<img src="test/responsgetbook2.png" width="600">|Hasil respons pada endpoin `books/get/book_id` adalah menampilkan detail buku berdasarkan `book_id`|
|<img src="test/putbook.png" width="600">|Input value pada endpoin `books/put` yang digunakan adalah `book_id` dan <pre><code>{"category_id": 1, "isbn": "978-602-033-294-9", "title": "Bulan", "author": "Tere Liye", "publisher": "GRAMEDIA", "publication_year": 2015, "total_stock": 5,   "available_stock": 3}</code></pre>|
|<img src="test/responsputbook.png" width="600">|Hasil respons pada endpoin `books/put` yang diupdate sebelumnya|
|<img src="test/getbookput.png" width="600">|Hasil respons pada endpoin `books/get/stats` setelah data di update|
|<img src="test/responsdeletebook.png" width="600">|Hasil respons pada endpoin `books/delete` untuk menghapus buku berdasarkan `book_id`|
|<img src="test/responsgetdeletebook.png" width="600">|Hasil respons pada endpoin `books/get` setelah data buku terhapus|
|<img src="test/getbookdelete.png" width="600">|Hasil respons pada endpoin `book/get/stats` setelah data buku terhapus|
|<img src="test/postuser.png" width="600">|Input value pada endpoin `user/post` yang digunakan adalah <pre><code>{"email": "micka@example.com", "password": "password456", "full_name": "Micka Mayulia", "role": "member"}</code></pre>|
|<img src="test/responsputuser.png" width="600">|Hasil respons pada endpoin `user/post` yang akan menampilkan data yang telah diinputkan|
|<img src="test/responsgetuser.png" width="600">|Hasil respons `get/user` menampilkan detail `user`|
|<img src="test/getuser2.png" width="600">|Input value pada endpoin `user/get` untuk mengecek detail user berdasarkan `user_id`|
|<img src="test/responsgetuser2.png" width="600">|Hasil respons pada endpoin `user/get` yang akan menampilkan detail user berdasarkan `user_id`|
|<img src="test/postransaction.png" width="600">|Input value pada endpoin `transaction/post` menggunakan <pre><code>{"user_id": "96b872f9-3c37-4f7f-a162-720eb96995fb", "book_id": "29efea5f-23a2-4f29-99ad-c88887464a84", "due_date": "2026-03-07T00:00:00+08:00"}</code></pre>|
|<img src="test/responspostransaction.png" width="600">|Hasil respons pada endpoin `transaction/post` yang akan menampilkan detail buku yang dipinjam|
|<img src="test/getransaction.png" width="600">|Input value pada endpoin `transaction/get` untuk menampilkan status buku yang `dipinjam`, `dikembalikan`, `terlambat`, dan `hilang`|
|<img src="test/responsgetransaction.png" width="600">|Hasil respons pada endpoin `transaction/get` yang menampilkan hasil buku yang dipinjam|
|<img src="test/getransaction2.png" width="600">|Input value pada endpoin `transaction/get/transaction_id`|
|<img src="test/responsgetransaction2.png" width="600">|Hasil respons pada endpoin `transaction/get/transaction_id` menampilkan detail buku yang dipinjam berdasarkan `transaction_id`|
|<img src="test/putransaction.png" width="600">|Input value pada enpoin `transaction/put/transactions_id`|
|<img src="test/responsputransaction.png" width="600">|Hasil respon pada endpoin `transaction/put/transactions_id` menampilkan detail transaksi buku yang dipinjam|
|<img src="test/getfines.png" width="600">|Input value pada endpoin `fines/get` yang belum lunas|
|<img src="test/responsgetfines.png" width="600">|Hasil respons pada endpoin `fines/get` yang menampilkan total buku serta detail keterlambatannya|
|<img src="test/putfines.png" width="600">|Input values pada endpoin `fines/put/fines_id`|
|<img src="test/responsputfines.png" width="600">|Hasil respons pada endpoin `fines/get/fines_id` yang menampilkan detail yang telahdibayarkan|
|<img src="test/getfines2.png" width="600">|Input value pada endpoin `fines/get` yang telah lunas|
|<img src="test/responsgetfines2.png" width="600">|Hasil respons pada endpoin `fines/get` yang menampilkan total buku sudah dibayar|