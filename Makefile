# 🛠️ Makefile Shortcut Commands — Hexacore (Lead DevOps Mode)

.PHONY: up down build logs ps clean lint test pr-check restart shell-backend shell-db

# 🐳 Docker Compose Shortcuts

# Menjalankan semua services di background
up:
	docker compose up -d

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

# Masuk ke terminal container backend
shell-backend:
	docker compose exec backend sh

# Masuk ke CLI PostgreSQL Database lokal
shell-db:
	docker compose exec db psql -U postgres

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