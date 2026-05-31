"""
Data Migration Script - LenteraPustaka
Migrasi data relasional lengkap dari Monolith ke Microservices (Database-per-service).

Usage:
    python scripts/migrate_data.py
"""
import os
import sys
from sqlalchemy import create_engine, text

# Database URLs
MONOLITH_DB_URL = os.getenv(
    "MONOLITH_DB_URL",
    "postgresql://postgres:malik@localhost:5432/lentera_pustaka"
)
AUTH_DB_URL = os.getenv(
    "AUTH_DB_URL",
    "postgresql://postgres:postgres@localhost:5433/auth_db"
)
ITEM_DB_URL = os.getenv(
    "ITEM_DB_URL",
    "postgresql://postgres:postgres@localhost:5434/item_db"
)


def migrate():
    print("=" * 60)
    print("[START] DATA MIGRATION STARTED: Monolith -> Microservices")
    print("=" * 60)

    try:
        monolith = create_engine(MONOLITH_DB_URL)
        auth_db = create_engine(AUTH_DB_URL)
        item_db = create_engine(ITEM_DB_URL)
        
        # Test connections
        with monolith.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[OK] Connected to Monolith Database")
        
        with auth_db.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[OK] Connected to Auth Service Database (auth_db)")
        
        with item_db.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[OK] Connected to Library Service Database (item_db)")
        
    except Exception as e:
        print(f"\n[ERROR] Database connection failure: {e}")
        print("Pastikan semua kontainer database menyala (docker compose up -d) dan monolit db aktif.")
        sys.exit(1)

    # 1. Migrate users
    print("\n[1/7] Migrating users -> auth_db.users...")
    with monolith.connect() as src:
        users = src.execute(text("SELECT * FROM users")).fetchall()
        print(f"      Found {len(users)} users in monolith")

    with auth_db.connect() as dst:
        for u in users:
            dst.execute(
                text("""
                    INSERT INTO users (user_id, email, password_hash, full_name, role, created_at)
                    VALUES (:user_id, :email, :password_hash, :full_name, :role, :created_at)
                    ON CONFLICT (user_id) DO NOTHING
                """),
                {
                    "user_id": u.user_id,
                    "email": u.email,
                    "password_hash": u.password_hash,
                    "full_name": u.full_name,
                    "role": u.role,
                    "created_at": u.created_at,
                }
            )
        dst.commit()
    print(f"      [OK] Migrated {len(users)} users successfully")

    # 2. Migrate categories
    print("\n[2/7] Migrating categories -> item_db.categories...")
    with monolith.connect() as src:
        categories = src.execute(text("SELECT * FROM categories")).fetchall()
        print(f"      Found {len(categories)} categories in monolith")

    with item_db.connect() as dst:
        for c in categories:
            dst.execute(
                text("""
                    INSERT INTO categories (category_id, name, description)
                    VALUES (:category_id, :name, :description)
                    ON CONFLICT (category_id) DO NOTHING
                """),
                {
                    "category_id": c.category_id,
                    "name": c.name,
                    "description": c.description,
                }
            )
        dst.commit()
    print(f"      [OK] Migrated {len(categories)} categories successfully")

    # 3. Migrate genres
    print("\n[3/7] Migrating genres -> item_db.genres...")
    with monolith.connect() as src:
        genres = src.execute(text("SELECT * FROM genres")).fetchall()
        print(f"      Found {len(genres)} genres in monolith")

    with item_db.connect() as dst:
        for g in genres:
            dst.execute(
                text("""
                    INSERT INTO genres (genre_id, name, description)
                    VALUES (:genre_id, :name, :description)
                    ON CONFLICT (genre_id) DO NOTHING
                """),
                {
                    "genre_id": g.genre_id,
                    "name": g.name,
                    "description": g.description,
                }
            )
        dst.commit()
    print(f"      [OK] Migrated {len(genres)} genres successfully")

    # 4. Migrate books
    print("\n[4/7] Migrating books -> item_db.books...")
    with monolith.connect() as src:
        books = src.execute(text("SELECT * FROM books")).fetchall()
        print(f"      Found {len(books)} books in monolith")

    with item_db.connect() as dst:
        for b in books:
            dst.execute(
                text("""
                    INSERT INTO books (book_id, category_id, isbn, title, author, publisher, 
                                       publication_year, synopsis, cover_image_url, total_stock, available_stock)
                    VALUES (:book_id, :category_id, :isbn, :title, :author, :publisher, 
                            :publication_year, :synopsis, :cover_image_url, :total_stock, :available_stock)
                    ON CONFLICT (book_id) DO NOTHING
                """),
                {
                    "book_id": b.book_id,
                    "category_id": b.category_id,
                    "isbn": b.isbn,
                    "title": b.title,
                    "author": b.author,
                    "publisher": b.publisher,
                    "publication_year": b.publication_year,
                    "synopsis": b.synopsis,
                    "cover_image_url": b.cover_image_url,
                    "total_stock": b.total_stock,
                    "available_stock": b.available_stock,
                }
            )
        dst.commit()
    print(f"      [OK] Migrated {len(books)} books successfully")

    # 5. Migrate book_genres (Many-to-Many Association)
    print("\n[5/7] Migrating book_genres relation -> item_db.book_genres...")
    with monolith.connect() as src:
        book_genres_list = src.execute(text("SELECT * FROM book_genres")).fetchall()
        print(f"      Found {len(book_genres_list)} book-genre relationships in monolith")

    with item_db.connect() as dst:
        for bg in book_genres_list:
            dst.execute(
                text("""
                    INSERT INTO book_genres (book_id, genre_id)
                    VALUES (:book_id, :genre_id)
                    ON CONFLICT (book_id, genre_id) DO NOTHING
                """),
                {
                    "book_id": bg.book_id,
                    "genre_id": bg.genre_id,
                }
            )
        dst.commit()
    print(f"      [OK] Migrated {len(book_genres_list)} book_genres successfully")

    # 6. Migrate transactions
    print("\n[6/7] Migrating transactions -> item_db.transactions...")
    with monolith.connect() as src:
        transactions = src.execute(text("SELECT * FROM transactions")).fetchall()
        print(f"      Found {len(transactions)} transactions in monolith")

    with item_db.connect() as dst:
        for t in transactions:
            dst.execute(
                text("""
                    INSERT INTO transactions (transaction_id, user_id, book_id, borrow_date, due_date, return_date, status)
                    VALUES (:transaction_id, :user_id, :book_id, :borrow_date, :due_date, :return_date, :status)
                    ON CONFLICT (transaction_id) DO NOTHING
                """),
                {
                    "transaction_id": t.transaction_id,
                    "user_id": t.user_id,
                    "book_id": t.book_id,
                    "borrow_date": t.borrow_date,
                    "due_date": t.due_date,
                    "return_date": t.return_date,
                    "status": t.status,
                }
            )
        dst.commit()
    print(f"      [OK] Migrated {len(transactions)} transactions successfully")

    # 7. Migrate fines
    print("\n[7/7] Migrating fines -> item_db.fines...")
    with monolith.connect() as src:
        fines = src.execute(text("SELECT * FROM fines")).fetchall()
        print(f"      Found {len(fines)} fines in monolith")

    with item_db.connect() as dst:
        for f in fines:
            dst.execute(
                text("""
                    INSERT INTO fines (fine_id, transaction_id, amount, status, payment_proof_url, rejection_note)
                    VALUES (:fine_id, :transaction_id, :amount, :status, :payment_proof_url, :rejection_note)
                    ON CONFLICT (fine_id) DO NOTHING
                """),
                {
                    "fine_id": f.fine_id,
                    "transaction_id": f.transaction_id,
                    "amount": f.amount,
                    "status": f.status,
                    "payment_proof_url": f.payment_proof_url,
                    "rejection_note": f.rejection_note,
                }
            )
        dst.commit()
    print(f"      [OK] Migrated {len(fines)} fines successfully")

    # 8. Reset primary key sequences in both databases to prevent autoincrement collisions
    print("\n[8/8] Resetting auto-increment sequences in target databases...")
    try:
        with auth_db.connect() as dst:
            dst.execute(text("SELECT setval('users_user_id_seq', COALESCE((SELECT MAX(user_id) FROM users), 1))"))
            dst.commit()
        print("      [OK] Reset users_user_id_seq in auth_db")

        with item_db.connect() as dst:
            dst.execute(text("SELECT setval('categories_category_id_seq', COALESCE((SELECT MAX(category_id) FROM categories), 1))"))
            dst.execute(text("SELECT setval('genres_genre_id_seq', COALESCE((SELECT MAX(genre_id) FROM genres), 1))"))
            dst.execute(text("SELECT setval('books_book_id_seq', COALESCE((SELECT MAX(book_id) FROM books), 1))"))
            dst.execute(text("SELECT setval('transactions_transaction_id_seq', COALESCE((SELECT MAX(transaction_id) FROM transactions), 1))"))
            dst.execute(text("SELECT setval('fines_fine_id_seq', COALESCE((SELECT MAX(fine_id) FROM fines), 1))"))
            dst.commit()
        print("      [OK] Reset auto-increment sequences in item_db")
    except Exception as seq_err:
        print(f"      [WARNING] Failed to reset auto-increment sequences: {seq_err}")

    print("\n" + "=" * 60)
    print("[SUCCESS] DATA MIGRATION COMPLETED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"\n[ERROR] Critical failure during migration: {e}")
        sys.exit(1)
