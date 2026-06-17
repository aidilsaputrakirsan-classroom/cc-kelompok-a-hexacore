# Reflection Paper: LenteraPustaka Cloud Architecture

**Nama:** Khanza Nabila Tsabita
**NIM:** 10231049  
**Peran:** Lead DevOps  

---

## 1. Lingkup Kontribusi & Fokus Utama
Sebagai Lead DevOps dalam pengembangan platform LenteraPustaka, fokus utama saya adalah merancang, mengotomatisasi, dan mengamankan siklus hidup implementasi arsitektur microservices dari lingkungan lokal hingga produksi cloud. Tanggung jawab saya ada pada penciptaan efisiensi proses kerja tim melalui teknik containerization menggunakan Docker, menjaga keandalan sistem lewat otomatisasi pipa pengujian Continuous Integration (CI) di GitHub Actions, serta melakukan pengawasan kesehatan layanan (service health monitoring) pasca-rilis. Saya memastikan bahwa transisi dari sistem lama (monolith) menuju ekosistem baru terdistribusi (microservices) berjalan selaras tanpa mengorbankan ketersediaan layanan (high availability).

## 2. Analisis Keputusan Teknis (*Technical Decisions*)
* **Keputusan Teknis 1:** Mempertahankan Strategi Komunikasi Direct Client-to-Service (Tanpa API Gateway Eksplisit) pada Produksi Railway.
  * **Alasan & Pertimbangan:** Mengingat batasan alokasi resource limits pada platform Free-Tier Cloud Railway kelompok yang tidak memungkinkan penambahan kontainer reverse-proxy (Nginx) baru, saya memutuskan untuk menerapkan topologi Direct Client-to-Service. Frontend berkomunikasi langsung dengan rute publik milik auth-service dan library-service. Keputusan ini diambil demi efisiensi konsumsi memori (RAM) kontainer yang sangat terbatas, sehingga alokasi komputasi cloud dapat dialihkan sepenuhnya untuk memperkuat ketahanan performa database engine PostgreSQL.
  * **Dampak terhadap Sistem:** Keputusan ini memangkas beban overhead jaringan pada gerbang utama, namun memiliki trade-off di mana konfigurasi Cross-Origin Resource Sharing (CORS) harus dikelola secara granular pada level kode aplikasi di masing-masing service backend untuk menjamin keamanan pertukaran data dari domain luar.

* **Keputusan Teknis 2:** Menjalankan Sistem Monolith dan Microservices Secara Bersamaan (Simultaneous Environment Deployment).
  * **Alasan & Pertimbangan:** Untuk memberikan pembuktian empiris yang valid saat demonstrasi dan pengujian fungsional di depan dosen penguji, kami memutuskan tidak menghapus sistem monolith yang lama. Kedua arsitektur ini dijalankan secara bersamaan pada klaster cloud terpisah.
  * **Dampak terhadap Sistem:** Kebijakan ini memudahkan tim untuk melakukan perbandingan metrik performa (latency distribution), pemisahan basis data, dan isolasi kegagalan (fault isolation) secara langsung (head-to-head). Sisi ruginya (trade-off), ini meningkatkan kompleksitas pengawasan lingkungan kerja dan membutuhkan kedisiplinan tinggi dalam pemisahan manajemen variabel lingkungan (environment variables) agar tidak terjadi tabrakan data (data collision).

## 3. Resolusi Masalah & Kendala Kritis
* **Kendala yang Dihadapi 1:** Lonjakan angka tingkat kegagalan (Error Rate) yang sangat tinggi hingga menyentuh 44.56% pada panel System Status & Observability milik Lentera Library Service pasca-deployment di cloud Railway.
* **Akar Masalah (*Root Cause*):** Melalui penelusuran granular log analysis pada tabel Top Traffic Endpoint, ditemukan bahwa lonjakan eror tersebut bukan berasal dari kerusakan logika bisnis, melainkan eror HTTP 404 (Not Found) massal akibat ketidaktersediaan aset statis gambar sampul buku pada folder /static/covers/ di dalam kontainer. File-file fisik tersebut ter-filter oleh regulasi .gitignore saat proses push repositori, sementara database dummy lama tetap mencatat nama filenya. Setiap kali komponen frontend melakukan looping rendering katalog di beranda, browser secara agresif mengirimkan ratusan network request berulang ke file gambar yang hilang tersebut.
* **Solusi yang Diterapkan:** Saya bersama tim melakukan dua langkah mitigasi taktis: (1) Melakukan pembersihan data (purging) terhadap entitas buku dummy lama yang tidak valid melalui Swagger UI backend, dan (2) Memasang file pelacak kosong .gitkeep pada sub-direktori /static/fines dan /static/covers sebelum volume persistent Railway ditempelkan (mounted). Langkah ini memitigasi isu Permission Error (Errno 13) akibat restriksi root privilege volume Railway, menghilangkan polusi data lama (stale metrics pollution), dan secara instan berhasil menurunkan Error Rate sistem dari 44% menuju ke tingkat aman di angka 5.42%.

## 4. Evaluasi Arsitektur (*Microservices vs Monolith*)
Dari sisi DevOps, perubahan arsitektur dari Monolith ke Microservices pada sistem LenteraPustaka meningkatkan skalabilitas sistem, meskipun pengelolaannya menjadi lebih kompleks. Pada arsitektur monolith, proses deployment lebih sederhana karena hanya terdapat satu aplikasi yang dijalankan. Namun, jika satu fitur mengalami gangguan, seluruh sistem dapat ikut terdampak.

Setelah menggunakan microservices, setiap layanan dapat dikelola secara terpisah, termasuk dalam pengaturan penggunaan sumber daya seperti RAM dan CPU. Selain itu, jika satu layanan mengalami masalah, layanan lainnya tetap dapat berjalan dengan normal. Menurut saya, perubahan ini sangat bermanfaat karena memberikan pengalaman dalam mengelola infrastruktur modern, walaupun membutuhkan pengelolaan yang lebih teliti terhadap jaringan dan konfigurasi antar layanan.

## 5. Kesimpulan & Pelajaran Terbesar (*Lessons Learned*)
Pelajaran terbesar yang saya peroleh selama 15 minggu mengerjakan proyek komputasi awan ini adalah bahwa keberhasilan sebuah sistem sangat bergantung pada konfigurasi dan infrastruktur yang digunakan. Pengalaman mengatasi berbagai kendala, seperti error CORS, konfigurasi health check pada proses CI/CD GitHub Actions, serta pengelolaan data di cloud Railway, memberikan pemahaman yang lebih mendalam mengenai pentingnya pengelolaan infrastruktur dalam pengembangan perangkat lunak.

Saya juga menyadari bahwa aplikasi yang dibangun dengan baik tidak akan dapat berjalan optimal tanpa proses deployment dan integrasi yang tepat di lingkungan cloud. Melalui proyek ini, saya belajar untuk lebih teliti dalam menganalisis masalah, memahami log kesalahan, dan mengelola sumber daya sistem secara efektif. Pengalaman tersebut menjadi bekal dan pengalaman yang berharga dalam melakukan development dan production fase dalam merancang sebuah sistem.