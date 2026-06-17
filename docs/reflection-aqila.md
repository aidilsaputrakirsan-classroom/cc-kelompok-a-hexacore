# Reflection Paper: LenteraPustaka Cloud Architecture

**Nama:** Muhammad Aqila Ardhi  
**NIM:** 10231057  
**Peran:** Lead QA & Docs  

---

## 1. Lingkup Kontribusi & Fokus Utama
Sebagai Lead QA & Docs dalam pengembangan aplikasi LenteraPustaka, fokus utama saya adalah memastikan keselarasan antara kualitas perangkat lunak yang dibangun dengan representasi dokumentasi teknisnya. Lingkup kerja saya mencakup pengujian API secara terintegrasi (menggunakan Pytest dan antarmuka Swagger), mendesain kerangka pelacakan galat (*bug tracking*), serta menyusun dan merawat seluruh artefak dokumentasi repositori (seperti *Readme*, *Deployment Guide*, dan ERD). Saya bertugas memastikan bahwa peralihan arsitektur dari *monolith* menuju *microservices* tidak mengorbankan reliabilitas fitur-fitur utama dan rekam jejak pengembangannya tetap tertata rapi bagi penguji.

## 2. Analisis Keputusan Teknis (*Technical Decisions*)

* **Keputusan Teknis 1: Membangun Sistem *Bug Tracking* Terpusat Berbasis Delegasi Spesifik**
  * **Alasan & Pertimbangan:** Pada arsitektur *microservices*, sumber masalah sering kali bias. Ketika sebuah data gagal tampil di layar, sangat sulit membedakan apakah itu murni kegagalan *render* di sisi aplikasi React atau kegagalan struktur respons dari sisi FastAPI. Alih-alih melakukan pelaporan *bug* secara reaktif melalui obrolan (yang rawan terlewat), saya memutuskan untuk membangun dokumen daftar "What Needs to be Fixed" yang terstruktur, di mana setiap temuan diinvestigasi terlebih dahulu sebelum diserahkan.
  * **Dampak terhadap Sistem:** Keputusan ini memakan waktu lebih banyak di fase awal pengujian karena saya harus melakukan triase (*triage*). Namun, *trade-off* ini menghasilkan efisiensi penyelesaian masalah yang luar biasa. Pemisahan tugas menjadi mutlak dan jelas; saya dapat mendelegasikan perbaikan tampilan secara eksklusif kepada Micka selaku PIC *Frontend*, dan penyesuaian parameter logika kepada Maulana selaku PIC *Backend*, sehingga tidak ada tumpang tindih pekerjaan.

* **Keputusan Teknis 2: Penyelarasan Dokumentasi Arsitektur secara Transparan (Menghapus Entitas Gateway)**
  * **Alasan & Pertimbangan:** Pada awalnya, rencana rancangan sistem kami menyertakan Nginx sebagai API *Gateway*. Namun, dalam eksekusi *deployment* aktual di platform Railway, tim memutuskan untuk menggunakan arsitektur *Direct Client-to-Microservice*, di mana *Frontend* langsung menembak URL dari *Auth Service* dan *Library Service* secara terpisah melalui *Environment Variables*. Sebagai Lead Docs, saya mengambil keputusan teknis untuk merombak total diagram dan narasi *Readme*, menghapus seluruh klaim penggunaan *Gateway* di peladen produksi.
  * **Dampak terhadap Sistem:** *Trade-off* dari keputusan ini adalah tim harus siap menghadapi pertanyaan penguji mengenai potensi masalah keamanan (*CORS*) dari arsitektur *direct-call*. Namun, keputusan ini menghindarkan tim dari penalti akademis akibat ketidaksesuaian antara dokumentasi dan bukti *Live Demo*. Sistem menjadi terdokumentasi dengan sangat jujur (100% akurat), dan penguji dapat melihat dengan jelas peran aplikasi React kami yang kini merangkap fungsi perutean.

## 3. Resolusi Masalah & Kendala Kritis

* **Kendala yang Dihadapi:** Manajemen pelacakan dan penyelesaian *bug* visibilitas sistem (*system visibility*) pasca-evaluasi *midterm*. Kendala paling mengganggu adalah hilangnya indikator *loading* saat sistem sedang memproses data, serta terjadinya beberapa galat pada tampilan kolom isian (*field display errors*).
* **Akar Masalah (*Root Cause*):** Dalam sistem terdistribusi yang terpecah menjadi `auth_db` dan `item_db`, setiap aksi pengguna memerlukan panggilan HTTP (API *calls*) yang memakan jeda waktu. Absennya indikator *loading* di *Frontend* membuat antarmuka seolah-olah membeku (*crash*), sehingga memicu pengguna melakukan klik berulang. Selain itu, anomali pada *field display* terjadi karena ketidakselarasan penangkapan *state* data antara *Frontend* dan format JSON yang dikirimkan *Backend*.
* **Solusi yang Diterapkan:** Melalui daftar inventaris *bug* yang telah saya buat, saya langsung membedah masalah ini secara faktual. Saya menugaskan Micka untuk secara khusus menambahkan penanganan *state loading* dan merevisi komponen antarmuka yang menyebabkan *field display error* di React. Sementara itu, saya berkoordinasi dengan Maulana untuk memastikan aliran data dari *endpoint* FastAPI tidak terputus. Saya kemudian melakukan verifikasi pengujian ulang (*re-test*), dan seluruh *bug* tersebut sukses dinyatakan tuntas (*rectified*) tepat setelah *milestone* ujian tengah semester (UTS) berakhir.

## 4. Evaluasi Arsitektur (*Microservices vs Monolith*)
Sebagai pihak yang bertanggung jawab atas penjaminan mutu (QA), saya menilai bahwa transisi menuju *Microservices* menuntut kompromi yang sangat besar di sektor kemudahan pengujian. Menguji sistem *monolith* jauh lebih sederhana karena seluruh logika bersumber dari satu mesin. Namun, dengan *Microservices*, saya harus mengeksekusi pengujian Swagger di *port* `8001` untuk *Auth* dan `8002` untuk *Library* secara terpisah. Kendati demikian, arsitektur ini terbukti sangat sepadan. Isolasi layanan membuat pengujian unit (*unit test*) menjadi sangat terfokus. Jika *Library Service* mengalami *error* fatal saat memproses transaksi buku, aplikasi tetap stabil dan fitur *login* di *Auth Service* tidak akan ikut mati. 

## 5. Kesimpulan & Pelajaran Terbesar (*Lessons Learned*)
Pelajaran paling esensial yang saya dapatkan selama 15 minggu ini adalah menyadari bahwa rekayasa perangkat lunak berskala *cloud* tidak akan bisa bertahan tanpa kedisiplinan administratif. Sehebat apa pun arsitektur *Backend* dan *Frontend* yang dibangun, sistem tersebut akan runtuh jika diwarnai dengan miskomunikasi teknis. Peran QA bukan sekadar mencari kesalahan rekan tim, melainkan menjadi jembatan pemahaman. Dokumentasi—baik itu *API Contract*, skema ERD, maupun rekam jejak *bug*—adalah kontrak kerja nyata yang menyatukan alur pikir saya, Maulana, Micka, dan Khanza. Tanpa standardisasi tersebut, mustahil kami bisa merilis LenteraPustaka tepat waktu dengan fungsionalitas lintas-layanan yang stabil.