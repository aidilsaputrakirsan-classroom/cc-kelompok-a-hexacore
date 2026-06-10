# 🛠️ Makefile Shortcut Commands — Hexacore (Lead DevOps Mode)

.PHONY: up down build logs ps clean lint test pr-check restart shell-backend shell-db

# 🐳 Docker Compose Shortcuts

# Menjalankan semua services di background
up:
	docker compose up -d

# Menjalankan mode Produksi dengan overrides
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Menjalankan mode Development (Alias untuk up)
dev:
	docker compose up -d

# ... (lanjutkan dengan target yang sudah ada: down, build, dll)

# Menampilkan live logs khusus Produksi
logs-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Menampilkan status khusus Produksi
ps-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Mematikan semua services
down:
	docker compose down

# Melakukan build/rebuild ulang docker images tanpa menjalankan
build:
	docker compose build

# Start services dengan memaksa rebuild container
rebuild:
	docker compose up --build -d

# Restart semua container
restart:
	docker compose restart

# Menampilkan live logs dari semua services
logs:
	docker compose logs -f

# Menampilkan status container yang berjalan
ps:
	docker compose ps

# Membersihkan container, network, dan volume (⚠️ data db lokal akan hilang)
clean:
	docker compose down -v
	docker system prune -f

# 💻 Shell Access Shortcuts

# Masuk ke terminal container auth atau library service
shell-auth:
	docker compose exec auth-service sh

shell-library:
	docker compose exec library-service sh

# Masuk ke CLI PostgreSQL di container auth-db atau item-db
shell-auth-db:
	docker compose exec auth-db psql -U postgres -d auth_db

shell-item-db:
	docker compose exec item-db psql -U postgres -d item_db

# 🧪 Workflow Automation & Testing (CI/CD Local Simulation)

# Menjalankan linter di container backend
lint:
	@echo "Running linter..."
	docker compose exec backend flake8 . || echo "Linter finished with warnings"

# Menjalankan unit test asli di dalam container backend
test:
	@echo "Running backend tests inside docker..."
	docker compose exec backend pytest

# Simulasi total sebelum Push / Pull Request (Build + Test)
pr-check: build up
	@echo "Running local PR Check..."
	docker compose exec backend pytest
	@echo "✅ Local PR Check Passed! Code is ready to push."