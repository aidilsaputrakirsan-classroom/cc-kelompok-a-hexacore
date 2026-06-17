# Reflection Paper: LenteraPustaka Cloud Architecture

**Nama:** Micka Mayulia Utama 
**NIM:** 10231053  
**Peran:** Lead Frontend 

---

## 1. Lingkup Kontribusi & Fokus Utama
###### Selama pengembangan LenteraPustaka, fokus utama saya sebagai Lead Frontend adalah mengoordinasikan pengembangan antarmuka pengguna sekaligus memastikan integrasi yang lancar antara frontend dan layanan backend setelah sistem bermigrasi dari arsitektur monolith ke microservices. Tanggung jawab tersebut tidak hanya mencakup implementasi fitur pada sisi pengguna, tetapi juga melakukan code review, menjaga konsistensi tampilan dan pengalaman pengguna, serta memastikan setiap perubahan pada layanan backend dapat diakomodasi dengan baik oleh frontend.

## 2. Analisis Keputusan Teknis (*Technical Decisions*)
##### **Keputusan Teknis 1: Melakukan Refactoring Struktur Frontend dengan Memisahkan Halaman ke dalam Folder Pages**

###### **Alasan & Pertimbangan**: Pada tahap awal pengembangan, sebagian besar halaman dan logika antarmuka masih terpusat dalam file utama sehingga kode menjadi semakin sulit dikelola seiring bertambahnya fitur. Sebagai Lead Frontend, saya memutuskan untuk melakukan refactoring dengan memisahkan setiap halaman ke dalam folder *pages* dan mengorganisasi komponen sesuai fungsinya. Pendekatan ini dipilih untuk meningkatkan keterbacaan kode, mempermudah proses pengembangan secara kolaboratif, serta mengurangi risiko konflik ketika beberapa anggota tim mengerjakan fitur yang berbeda secara bersamaan. *Trade-off* dari keputusan ini adalah dibutuhkannya waktu tambahan untuk melakukan penyesuaian struktur proyek dan memastikan seluruh anggota tim memahami organisasi kode yang baru.

###### **Dampak terhadap Sistem**: Struktur kode menjadi lebih terorganisasi dan mudah dipelihara. Proses pengembangan fitur baru juga menjadi lebih efisien karena setiap halaman memiliki lokasi dan tanggung jawab yang jelas. Selain itu, risiko merge conflict pada file utama dapat dikurangi karena perubahan kode tidak lagi terpusat pada satu berkas.

##### **Keputusan Teknis 2: Memfokuskan Antarmuka Frontend pada Pengguna Member dan Tidak Menyediakan UI Khusus untuk Registrasi Admin**

###### **Alasan & Pertimbangan:** Selama pengembangan LenteraPustaka, saya dan tim frontend memutuskan untuk memfokuskan pengembangan antarmuka pada kebutuhan pengguna member karena fitur-fitur utama sistem, seperti pencarian dan peminjaman buku, ditujukan untuk pengguna tersebut. Sementara itu, proses registrasi dan pengelolaan akun admin tetap dilakukan melalui endpoint backend yang diuji menggunakan Swagger tanpa dibuatkan antarmuka khusus di frontend. Keputusan ini diambil untuk mengoptimalkan waktu pengembangan dan memprioritaskan fitur yang memiliki dampak langsung terhadap pengalaman pengguna utama. Trade-off dari keputusan ini adalah proses pengelolaan admin menjadi kurang praktis karena masih memerlukan akses langsung ke API melalui Swagger atau alat serupa.

###### **Dampak terhadap Sistem:** Keputusan ini memungkinkan tim frontend lebih fokus menyelesaikan fitur-fitur yang digunakan oleh mayoritas pengguna sehingga pengembangan antarmuka dapat berjalan lebih efisien. Selain itu, kompleksitas frontend dapat dikurangi karena tidak perlu menangani alur registrasi dan manajemen akun admin. Namun, konsekuensinya adalah proses administrasi sistem tidak dapat dilakukan langsung melalui aplikasi dan masih bergantung pada akses ke layanan backend.


## 3. Resolusi Masalah & Kendala Kritis
###### **Kendala yang Dihadapi:** Salah satu kendala paling rumit yang saya hadapi adalah masalah integrasi frontend setelah sistem bermigrasi dari arsitektur monolith ke microservices. Pada beberapa tahap pengujian, frontend gagal menampilkan data atau mengakses fitur tertentu karena permintaan (*request*) dikirim ke layanan yang tidak sesuai. Selain itu, perubahan endpoint dan kontrak API selama proses pengembangan juga menyebabkan beberapa fitur yang sebelumnya berjalan normal menjadi tidak berfungsi.

###### **Akar Masalah (Root Cause):** Masalah ini terjadi karena pada arsitektur microservices frontend harus berkomunikasi dengan lebih dari satu layanan, yaitu Auth Service dan Item Service. Setiap layanan memiliki endpoint, format respons, dan konfigurasi yang berbeda. Ketika terjadi perubahan pada salah satu layanan atau konfigurasi environment, frontend harus menyesuaikan kembali proses integrasinya. Tidak adanya API Gateway juga menyebabkan frontend perlu mengetahui secara langsung alamat masing-masing layanan sehingga risiko kesalahan konfigurasi menjadi lebih tinggi.

###### **Solusi yang Diterapkan:** Untuk mengatasi permasalahan tersebut, saya melakukan pengecekan ulang terhadap kontrak API, menyesuaikan konfigurasi endpoint pada frontend, serta melakukan pengujian integrasi secara berkala setiap kali terdapat perubahan pada layanan backend. Saya juga memperkuat proses code review dan validasi sebelum melakukan merge agar perubahan yang berpotensi memengaruhi integrasi dapat terdeteksi lebih awal. Dengan pendekatan tersebut, proses komunikasi antara frontend dan layanan backend menjadi lebih stabil dan risiko kesalahan akibat perubahan endpoint dapat diminimalkan.


## 4. Evaluasi Arsitektur (*Microservices vs Monolith*)
###### Sebagai Lead Frontend, saya melihat bahwa perombakan sistem dari monolith ke microservices memberikan dampak positif sekaligus tantangan baru. Dari sisi positif, pemisahan layanan menjadi Auth Service dan Item Service membuat tanggung jawab setiap layanan lebih jelas sehingga pengembangan backend dapat dilakukan secara lebih terstruktur. Bagi frontend, pemisahan ini membantu memahami fungsi setiap layanan dan mempermudah proses pengembangan fitur yang bergantung pada layanan tertentu. Selain itu, pengalaman bekerja dengan arsitektur microservices memberikan pemahaman yang lebih mendalam mengenai integrasi layanan, containerisasi, CI/CD, dan deployment cloud yang sulit diperoleh jika sistem tetap menggunakan arsitektur monolith.
###### Namun, dari sisi frontend, migrasi ini juga meningkatkan kompleksitas integrasi. Frontend tidak lagi hanya berkomunikasi dengan satu backend, melainkan harus menangani beberapa layanan dengan endpoint dan konfigurasi yang berbeda. Perubahan pada salah satu layanan dapat langsung memengaruhi fitur di frontend, sehingga proses debugging dan pengujian integrasi menjadi lebih menantang. Kondisi ini semakin terasa karena implementasi proyek belum menggunakan API Gateway, sehingga frontend perlu mengetahui alamat masing-masing layanan secara langsung.
###### Secara keseluruhan, untuk skala proyek LenteraPustaka yang relatif kecil, manfaat microservices mungkin belum sepenuhnya terasa dari sisi frontend dibandingkan kompleksitas tambahan yang ditimbulkannya. Namun, dari perspektif pembelajaran dan kesiapan menghadapi pengembangan sistem berskala lebih besar, perombakan ini tetap sepadan karena memberikan pengalaman nyata dalam menghadapi tantangan integrasi layanan yang umum ditemui pada lingkungan pengembangan modern.


## 5. Kesimpulan & Pelajaran Terbesar (*Lessons Learned*)
###### Selama 15 minggu pengembangan LenteraPustaka, pelajaran terbesar yang saya peroleh adalah bahwa pengembangan frontend tidak hanya berfokus pada pembuatan antarmuka yang menarik dan fungsional, tetapi juga sangat bergantung pada kualitas kolaborasi antar tim, desain arsitektur sistem, dan konsistensi integrasi dengan layanan backend. Sebelum mengikuti proyek ini, saya cenderung memandang frontend sebagai lapisan yang terpisah dari proses pengembangan sistem secara keseluruhan. Namun, melalui pengalaman bekerja dengan arsitektur microservices, Docker, CI/CD, dan deployment berbasis cloud, saya memahami bahwa setiap keputusan pada satu bagian sistem dapat memberikan dampak langsung pada bagian lainnya. Saya juga belajar bahwa komunikasi tim, dokumentasi API yang baik, dan pengelolaan struktur kode yang rapi sama pentingnya dengan kemampuan teknis dalam menulis kode. Pengalaman ini memberikan pemahaman yang lebih menyeluruh mengenai rekayasa perangkat lunak modern serta mempersiapkan saya untuk menghadapi tantangan pengembangan sistem yang lebih kompleks di masa mendatang.
