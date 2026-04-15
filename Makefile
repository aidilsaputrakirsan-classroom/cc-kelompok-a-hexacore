# Shortcut Commands untuk me
up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up --build -d

logs:
	docker compose logs -f

ps:
	docker compose ps

# Perintah sakti buat hapus semua sampah docker
clean:
	docker compose down -v
	docker system prune -f