# 🧪 UI Test Results - LenteraPustaka API

Berikut ini adalah dokumentasi 10 Test Case dari LenteraPustaka

### TC-01: Initial State (Dashboard)
Akses halaman utama (Root URL). Frontend terhubung ke Backend. Gambar menunjukkan indikator "API Connected" aktif di pojok kirr atas di header.

![TC-01](<test/TC-01.png>)


### TC-02: Add Book
Masuk ke form tambah buku, isi detail (judul, author, isbn, kategori), dan klik Simpan.

![TC-02](<test/TC-02.png>)


### TC-03: GET /books
Setelah melakukan penambahan atau perubahan data UI akan menampilkan list buku terbaru yang sudah di tambahkan atau di edit. 

![TC-03](test/TC-03.png)


### TC-04: Search Feature
Ketik judul buku tertentu pada kolom Search Bar. Maka UI melakukan filter secara real-time dan hanya menampilkan buku yang relevan.

![TC-04](test/TC-04.png)

### TC-05: Sorting Feature
Klik filter yang tersedia, misalnya 'Stock Tersedia' maka UI akan buku apa yang tersedia dan tidak sesuai dengan parameter yang dipilih.

![TC-05](test/TC-05.png)

### TC-06: Edit Book
Klik tombol Edit pada buku, ubah nilai "Penerbit" atau "Stok", lalu Simpan, maka UI akan terupdate sesuai dengan perubahan yang dilakukan.

![TC-06](test/TC-06.png)

### TC-07: Delete Validation (Konfirmasi)
Klik ikon/tombol hapus pada salah satu buku. Maka muncul dialog konfirmasi (Pop-up/Modal) untuk mencegah penghapusan yang tidak disengaja.

![TC-07](test/TC-07.png)

### TC-08: Delete Action
Konfirmasi penghapusan pada dialog konfirmasi. Maka data buku hilang dari daftar UI dan terhapus secara permanen di database.

![TC-08](test/TC-08.png)

### TC-09: Notification System (Toast)
Melakukan aksi (Simpan/Hapus/Update). Muncul komponen Toast (Notifikasi) di pojok kanan bawah sebagai feedback dan hilang otomatis setelah 3 detik.

![TC-09](test/TC-09.png)

### TC-10: -

