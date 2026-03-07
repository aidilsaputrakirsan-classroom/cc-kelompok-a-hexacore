| Gambar |Deskripsi |
|------|-----|
|<img src="test/categories.png">|Daftar 6 poin dengan total 22 sub-poin yang akan di testing `endpointnya via Swagger atau Thunder Client`|
| <img src="test/systemget1.png"> | Hasil respon pada endpoin `system/health` mengatakan `app LenteraPustaka versi 0.3.0 berada dalam status healthy`|
| <img src="test/responsystemget.png"> | Hasil respon pada endpoin `system/team` mengatakan `team cloud-team-hexacore app LenteraPustaka memiliki 4 member dengan role yang berbeda`|
| <img src="test/post4.png"> | Input value pada endpoin `categories/post` yang digunakan adalah <pre><code>{"name": "Non-Fiksi", "description": "Karya tulis informatif yang menyajikan fakta, data, dan kejadian nyata untuk memberikan pengetahuan kepada pembaca"}</code></pre>|
|<img src="test/responspost.png"> | Hasil respons pada endpoin `categories/post` akan menampilkan input value sebelumnya|
|<img src="test/responsget.png"> |Hasil respons pada endpoin `categories/get` adalah menampilkan list value yang telah di buat pada `categories/post` sebelumnya|
|<img src="test/get2.png"> |Input value pada endpoin `categories/get/category_id` yang digunakan adalah 1 (disesuaikan dengan `category_id` dalam database)|
|<img src="test/responsget2.png">|Hasil respons pada endpoin `categories/get/category_id` adalah menampilkan data `categories` berdasarkan `category_id` dalam database|
|<img src="test/put3.png">|Input value pada endpoin `categories/put` yang digunakan dengan `category_id` 1 dan <pre><code>{"name": "Fiksi", "description": "Karya sastra naratif yang isinya bersumber dari imajinasi, khayalan, atau rekaan penulis, bukan berdasarkan fakta atau kenyataan"}</code></pre>
|<img src="test/responsput.png">|Hasil respons pada endpoin `categories/put` adalah menampilkan data yang diupdate sebelumnya|