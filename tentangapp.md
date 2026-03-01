# Tentang App LenteraPustaka

## Latar Belakang 

Perpustakaan pada umumnya masih mengandalkan pencatatan manual dalam mengelola sirkulasi buku fisik. Pendekatan tradisional ini sering kali memunculkan berbagai kendala operasional, seperti ketidakakuratan data stok buku akibat human error, risiko hilangnya riwayat peminjaman, serta proses pendaftaran keanggotaan yang tidak efisien. Di sisi lain, pengunjung perpustakaan membutuhkan fleksibilitas untuk mengeksplorasi katalog buku dan memastikan ketersediaannya secara real-time sebelum memutuskan untuk datang langsung ke lokasi. Ketiadaan sistem informasi yang terintegrasi membuat proses sirkulasi peminjaman menjadi lambat dan kurang transparan bagi anggota maupun petugas perpustakaan.

Untuk mengatasi permasalahan tersebut, dikembangkanlah LenteraPustaka, sebuah Sistem Informasi Peminjaman Buku Perpustakaan berbasis web. Sistem ini dirancang untuk mendigitalkan dan mengotomatisasi seluruh proses bisnis perpustakaan, mulai dari manajemen inventaris buku, registrasi keanggotaan, hingga pencatatan transaksi peminjaman dan pengembalian yang terintegrasi. LenteraPustaka menerapkan Role-Based Access Control (RBAC) yang terstruktur, membagi pengguna ke dalam tiga peran spesifik yaitu Admin (petugas pengelola data dan validator transaksi), Member (anggota terdaftar yang memiliki hak meminjam buku), dan Guest (pengunjung umum yang hanya dapat mengeksplorasi katalog). Pendekatan ini memastikan keamanan data dan memberikan batasan akses yang jelas sesuai dengan wewenang masing-masing pengguna.

Sejalan dengan prinsip modernisasi infrastruktur teknologi informasi, LenteraPustaka dibangun dengan mengadopsi arsitektur cloud-native. Pengembangan aplikasi dilakukan dengan memisahkan antarmuka pengguna (frontend) yang responsif menggunakan React, dan logika bisnis (backend) berbasis REST API menggunakan FastAPI. Untuk menjaga integritas data transaksional, terutama dalam mencegah anomali ketersediaan stok buku saat terjadi peminjaman bersamaan (race condition), sistem menggunakan basis data relasional PostgreSQL. Selanjutnya, aplikasi ini akan dikemas menggunakan teknologi container (Docker) dan diintegrasikan dengan pipeline CI/CD (GitHub Actions) agar dapat di-deploy secara otomatis ke lingkungan komputasi awan. Arsitektur ini dipilih untuk memastikan LenteraPustaka memiliki skalabilitas yang baik, ketersediaan tinggi (high availability), dan kemudahan pemeliharaan dalam jangka panjang.

## Rumusan Masalah 

## Tujuan

## Sasaran

1. Memudahkan mereka dalam mengelola inventaris buku dan memantau status peminjaman secara real-time.
2. Memberikan akses mudah untuk melihat katalog buku yang tersedia kapan saja dan di mana saja.
3. Meningkatkan profesionalitas dan efisiensi operasional manajemen data pustaka melalui sistem yang terdigitalisasi.
