# Reflection Paper: LenteraPustaka Cloud Architecture

**Nama:** Maulana Malik Ibrahim
**NIM:** 10231051  
**Peran:** Lead Backend 

---

## 1. Lingkup Kontribusi & Fokus Utama
Sebagai Lead Backend, fokus utama saya dalam proyek LenteraPustaka adalah merancang, membangun, dan mengoptimalkan seluruh arsitektur API serta logika bisnis di sisi server. Tanggung jawab utama saya mencakup memimpin proses dekomposisi sistem dari monolith menjadi microservices (Auth Service dan Library Service), mengisolasi database postgres untuk masing-masing domain demi independensi data, serta mengintegrasikan pola-pola keandalan (*reliability patterns*) seperti *Circuit Breaker*, *Retry Logic*, *Exponential Backoff*, dan *Graceful Degradation*. 

Selain aspek arsitektur, saya bertanggung jawab penuh atas *security hardening* (seperti pengetatan skema validasi Pydantic, pembersihan kredensial keras, dan koordinasi rate limiting pada Nginx API Gateway), implementasi observabilitas (Structured JSON Logging, Correlation ID, dan Metrics Collector untuk p50/p95/p99 latency), serta penyusunan pengujian integrasi otomatis antarlayanan menggunakan pytest guna menjamin sistem siap digunakan pada tahap produksi (*production-ready*).

---

## 2. Analisis Keputusan Teknis (*Technical Decisions*)
* **Keputusan Teknis 1: Penerapan Strategi Database per Service (Pemisahan Database Terisolasi)**
  * **Alasan & Pertimbangan:** Untuk menghindari *shared database antipattern* yang merusak esensi arsitektur microservices, saya memutuskan memisahkan database monolith menjadi dua instansi PostgreSQL mandiri: `auth_db` untuk mengelola kredensial/profil user dan `library_db` (sebelumnya item_db) untuk inventaris buku, transaksi, serta denda. Pemisahan ini krusial untuk memastikan otonomi penuh dari masing-masing layanan dan mencegah dampak kegagalan database satu layanan merambat ke layanan lainnya.
  * **Dampak terhadap Sistem:** Otonomi data tercapai sepenuhnya, tetapi menghadirkan konsekuensi hilangnya integritas referensial fisik (*Foreign Key*) di tingkat database. Sebagai konsekuensinya (*trade-off*), validasi relasi data (seperti memverifikasi apakah `user_id` pada transaksi peminjaman benar-benar ada) harus ditangani di tingkat aplikasi melalui pemanggilan API HTTP inter-service menggunakan helper `check_user_exists` di [auth_client.py](file:///d:/HEXACORE/cc-kelompok-a-hexacore/services/library-service/auth_client.py) ke Auth Service.

* **Keputusan Teknis 2: Implementasi Circuit Breaker Pattern & Graceful Degradation**
  * **Alasan & Pertimbangan:** Komunikasi antarlayanan melalui HTTP rentan terhadap gangguan jaringan (*transient error*). Jika Auth Service mengalami *downtime*, Library Service berisiko terkena *cascading failure* karena kehabisan resource (thread/memory) saat menunggu timeout. Saya mengimplementasikan class [CircuitBreaker](file:///d:/HEXACORE/cc-kelompok-a-hexacore/services/library-service/circuit_breaker.py) (failure threshold: 5 kali gagal berturut-turut, cooldown: 30 detik sebelum mencoba status *HALF_OPEN*) dikombinasikan dengan *Retry Logic* dan *Exponential Backoff* (delay 0.5s, 1s, 2s).
  * **Dampak terhadap Sistem:** Sistem menjadi jauh lebih tangguh (*fault-tolerant*). Ketika Auth Service mati, Library Service langsung menolak request bermasalah dalam hitungan milidetik (*fail fast*). Selain itu, dengan dependensi `get_current_user_optional_degraded` di [main.py](file:///d:/HEXACORE/cc-kelompok-a-hexacore/services/library-service/main.py), fitur publik seperti `GET /items/public` tetap dapat diakses oleh browser pengunjung meskipun otentikasi user sedang tidak tersedia (*graceful degradation*).

* **Keputusan Teknis 3: Standardisasi Observabilitas dengan Structured Logging (JSON) & Metrics Collector Lintas Layanan**
  * **Alasan & Pertimbangan:** Pada arsitektur terdistribusi (microservices), penelusuran bug dengan log teks biasa sangat sulit karena log tersebar di beberapa container. Saya memutuskan menerapkan Structured Logging dengan format JSON menggunakan middleware khusus serta in-memory *Metrics Collector* di masing-masing service untuk merekam *Four Golden Signals* (Latency percentiles p50/p95/p99, request rate, dan error rate).
  * **Dampak terhadap Sistem:** Memudahkan agregasi log pada tools pemantauan, menyederhanakan debugging inter-service berkat injeksi header `X-Correlation-ID`, dan mempermudah frontend untuk memantau metrik performa server secara *real-time* melalui endpoint `/metrics`.

---

## 3. Resolusi Masalah & Kendala Kritis
* **Kendala 1 (Masalah CORS & Docker Container Networking):**
  * **Akar Masalah (*Root Cause*):** Di lingkungan lokal, frontend mengakses API melalui port Nginx Gateway (port 80). Namun secara internal di dalam Docker network (`lentera_net`), Library Service memanggil Auth Service menggunakan nama host container internal (`http://auth-service:8001`). Perbedaan antara domain eksternal dan pemanggilan internal ini memicu pemblokiran CORS oleh browser serta kegagalan verifikasi token akibat perbedaan pembacaan konfigurasi URL.
  * **Solusi yang Diterapkan:** Saya memperbarui [config.py](file:///d:/HEXACORE/cc-kelompok-a-hexacore/services/library-service/config.py) untuk membagi konfigurasi URL secara dinamis antara lokal (menggunakan docker network host) dan produksi di cloud (menggunakan domain Railway publik), serta menyetel header CORS `origins` secara presisi tanpa membiarkan wildcard (`*`) terbuka demi keamanan.

* **Kendala 2 (Sinkronisasi & Migrasi Data dari Database Monolith Lama):**
  * **Akar Masalah (*Root Cause*):** Memindahkan data produksi yang ada dari schema monolith tunggal ke database terpisah tanpa merusak relasi dan menghindari kegagalan duplikasi data saat script dijalankan ulang.
  * **Solusi yang Diterapkan:** Saya menulis script migrasi mandiri [migrate_data.py](file:///d:/HEXACORE/cc-kelompok-a-hexacore/scripts/migrate_data.py) menggunakan SQLAlchemy yang membaca data dari database monolith lama, lalu memetakan dan menyisipkan data tersebut ke database microservices baru secara aman menggunakan penanganan konflik `ON CONFLICT DO NOTHING` sehingga script bersifat *idempotent* (aman dijalankan berkali-kali).

---

## 4. Evaluasi Arsitektur (*Microservices vs Monolith*)
Dari kacamata Lead Backend, perombakan sistem LenteraPustaka dari Monolith menjadi Microservices adalah hal yang **sangat sepadan namun meningkatkan kompleksitas secara signifikan**. 

* **Kelebihan/Sepadan:** Isolasi layanan yang luar biasa. Jika database `auth_db` mengalami gangguan, `library-service` tetap menyala untuk fungsi publik. Skalabilitas horizontal juga menjadi lebih mudah karena setiap service dapat dinaikkan kapasitasnya (scaled) secara terpisah di Railway sesuai beban traffic.
* **Kompleksitas/Kekurangan:** Kehilangan relasi Foreign Key antar tabel secara fisik sehingga validasi data harus ditulis manual di level kode. Selain itu, dependensi terhadap jaringan meningkat tajam, yang mengharuskan kita menulis penanganan kegagalan jaringan secara eksplisit (Circuit Breaker & Retry). 

Secara keseluruhan, keputusan ini sangat tepat untuk jangka panjang demi keandalan aplikasi di production.

---

## 5. Kesimpulan & Pelajaran Terbesar (*Lessons Learned*)
Selama 15 minggu terakhir ini, pelajaran berharga yang paling mengubah cara pandang saya adalah bahwa rekayasa komputasi awan bukan sekadar menulis fungsionalitas aplikasi, melainkan **mendesain sistem agar siap menghadapi kegagalan** (*designing for failure*). Menulis logika CRUD backend konvensional sangatlah mudah, tetapi merancang sistem agar tetap dapat melayani pengguna secara elegan (*degraded*) ketika layanan pendukungnya tumbang adalah tantangan rekayasa yang sesungguhnya. Proyek ini memberikan pemahaman mendalam bagi saya mengenai integrasi distributed system, distributed tracing dengan correlation ID, unit testing terdistribusi, serta orkestrasi microservices menggunakan Docker dan deployment cloud dengan Railway.
