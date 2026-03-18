import sys
import os

# Tambahkan direktori saat ini ke path agar bisa import modul backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Category, Genre, Book, book_genres
from auth import hash_password

def seed_data():
    """Mengisi database dengan data awal yang konsisten dan valid."""
    print("🚀 Memulai proses seeding database...")
    
    # 1. Reset Database (Hapus semua tabel & Buat ulang)
    #    Ini penting agar ID ter-reset dan data bersih.
    print("🧹 Membersihkan database lama...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # ============================================================
        # 2. SEED USERS (Admin & Member)
        # ============================================================
        print("👤 Membuat users...")
        
        # Password Hash dibuat langsung pakai fungsi backend Anda -> DIJAMIN VALID
        admin_pass = hash_password("Admin@123")
        member_pass = hash_password("Member@123")
        
        users = [
            User(email="admin@itk.ac.id", full_name="Administrator LenteraPustaka", role="admin", password_hash=admin_pass),
            User(email="maulana@student.itk.ac.id", full_name="Maulana Malik Ibrahim", role="member", password_hash=member_pass),
            User(email="micka@student.itk.ac.id", full_name="Micka Mayulia Utama", role="member", password_hash=member_pass),
            User(email="khanza@student.itk.ac.id", full_name="Khanza Nabila Tsabita", role="member", password_hash=member_pass),
            User(email="aqila@student.itk.ac.id", full_name="Muhammad Aqila Ardhi", role="member", password_hash=member_pass),
        ]
        db.add_all(users)
        db.commit()

        # ============================================================
        # 3. SEED CATEGORIES
        # ============================================================
        print("📚 Membuat categories...")
        categories = [
            Category(name="Fiksi", description="Novel, cerpen, dan karya fiksi imajinatif"),
            Category(name="Non-Fiksi", description="Buku faktual: biografi, sejarah, sains populer"),
            Category(name="Teknologi", description="Pemrograman, jaringan, sistem informasi, AI"),
            Category(name="Pendidikan", description="Buku teks, referensi akademik, panduan belajar"),
            Category(name="Pengembangan Diri", description="Motivasi, kepemimpinan, produktivitas"),
            Category(name="Sains", description="Fisika, kimia, biologi, matematika"),
        ]
        db.add_all(categories)
        db.commit()
        
        # Simpan referensi object untuk dipakai saat buat buku
        cat_fiksi = categories[0]
        cat_nonfiksi = categories[1]
        cat_tekno = categories[2]
        cat_pendidikan = categories[3]
        cat_selfdev = categories[4]
        cat_sains = categories[5]

        # ============================================================
        # 4. SEED GENRES
        # ============================================================
        print("🏷️  Membuat genres...")
        genres = [
            Genre(name="Horor", description="Cerita yang menakutkan dan menegangkan"),
            Genre(name="Romance", description="Kisah cinta dan hubungan romantis"),
            Genre(name="Thriller", description="Penuh suspense dan ketegangan"),
            Genre(name="Sejarah", description="Berlatarkan peristiwa sejarah nyata"),
            Genre(name="Petualangan", description="Eksplorasi, aksi, dan petualangan seru"),
            Genre(name="Humor", description="Komedi dan cerita ringan menghibur"),
            Genre(name="Biografi", description="Kisah hidup tokoh nyata"),
            Genre(name="Sains Populer", description="Sains yang disajikan untuk umum"),
            Genre(name="Tutorial", description="Panduan langkah demi langkah"),
            Genre(name="Algoritma", description="Struktur data dan algoritma pemrograman"),
        ]
        db.add_all(genres)
        db.commit()
        
        # Map genre name to object for easy access
        g_map = {g.name: g for g in genres}

        # ============================================================
        # 5. SEED BOOKS
        # ============================================================
        print("📖 Membuat buku...")
        
        books_data = [
            {
                "cat": cat_fiksi, "isbn": "978-602-03-3446-5", "title": "Laskar Pelangi", 
                "author": "Andrea Hirata", "pub": "Bentang Pustaka", "year": 2005,
                "syn": "Novel tentang semangat anak-anak Belitung mengejar mimpi.",
                "stock": 5, "genres": ["Petualangan", "Humor"]
            },
            {
                "cat": cat_fiksi, "isbn": "978-979-22-9544-0", "title": "Bumi Manusia", 
                "author": "Pramoedya Ananta Toer", "pub": "Lentera Dipantara", "year": 1980,
                "syn": "Kisah perjuangan Minke, pribumi terdidik di masa kolonial.",
                "stock": 4, "genres": ["Sejarah", "Romance"]
            },
            {
                "cat": cat_tekno, "isbn": "978-623-00-1234-5", "title": "Pemrograman Web dengan FastAPI", 
                "author": "Tim Pengajar ITK", "pub": "Institut Teknologi Kalimantan", "year": 2024,
                "syn": "Panduan komprehensif membangun REST API modern.",
                "stock": 10, "genres": ["Tutorial"]
            },
            {
                "cat": cat_tekno, "isbn": "978-0-13-468599-1", "title": "Clean Code", 
                "author": "Robert C. Martin", "pub": "Prentice Hall", "year": 2008,
                "syn": "Panduan menulis kode yang bersih dan maintainable.",
                "stock": 6, "genres": ["Tutorial", "Algoritma"]
            },
            {
                "cat": cat_sains, "isbn": "978-0-06-112009-3", "title": "Brief History of Time", 
                "author": "Stephen Hawking", "pub": "Bantam Books", "year": 1988,
                "syn": "Penjelasan menakjubkan tentang asal usul alam semesta.",
                "stock": 3, "genres": ["Sains Populer"]
            },
        ]

        for b in books_data:
            book = Book(
                category_id=b["cat"].category_id,
                isbn=b["isbn"],
                title=b["title"],
                author=b["author"],
                publisher=b["pub"],
                publication_year=b["year"],
                synopsis=b["syn"],
                total_stock=b["stock"],
                available_stock=b["stock"]
            )
            # Relasi Many-to-Many Genre
            for g_name in b["genres"]:
                if g_name in g_map:
                    book.genres.append(g_map[g_name])
            
            db.add(book)
        
        db.commit()
        print("✅ Seeding selesai! Database siap digunakan.")
        print("🔑 Admin: admin@itk.ac.id / Admin@123")
        print("🔑 Member: maulana@student.itk.ac.id / Member@123")

    except Exception as e:
        print(f"❌ Terjadi kesalahan saat seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()