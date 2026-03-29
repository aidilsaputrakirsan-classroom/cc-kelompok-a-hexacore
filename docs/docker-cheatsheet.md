# 🐳 Docker Cheatsheet — LenteraPustaka HEXACORE

> Referensi cepat Docker commands untuk proyek **LenteraPustaka** (Backend FastAPI + Frontend React).  
> **Kelompok A HEXACORE** · Komputasi Awan · Institut Teknologi Kalimantan

---

## 📦 Build Image

| Command | Keterangan |
|---------|------------|
| `docker build -t <nama>:<tag> .` | Build image dari Dockerfile di direktori saat ini |
| `docker build -t <nama>:<tag> <path>` | Build image dari direktori tertentu |
| `docker build --no-cache -t <nama>:<tag> .` | Build ulang tanpa menggunakan cache |

### Contoh untuk proyek ini:
```bash
# Build image backend
cd backend
docker build -t cloudapp-backend:v1 .

# Build image backend dengan tag versi baru
docker build -t cloudapp-backend:v2 .

# Build ulang tanpa cache (jika ada masalah layer)
docker build --no-cache -t cloudapp-backend:v1 .

# Lihat waktu build (Linux/Mac)
time docker build -t cloudapp-backend:v1 .
```

---

## 🏃 Run Container

| Command | Keterangan |
|---------|------------|
| `docker run <image>` | Jalankan container di foreground |
| `docker run -d <image>` | Jalankan di background (detached) |
| `docker run -p <host>:<container> <image>` | Mapping port host ke container |
| `docker run --name <nama> <image>` | Beri nama container |
| `docker run --env-file <file> <image>` | Load env vars dari file |
| `docker run -e KEY=VALUE <image>` | Set satu env var |

### Contoh untuk proyek ini:
```bash
# Jalankan backend di foreground (lihat log langsung)
docker run -p 8000:8000 --env-file .env cloudapp-backend:v1

# Jalankan backend di background dengan nama
docker run -d -p 8000:8000 --env-file .env --name backend cloudapp-backend:v1

# Akses API setelah container berjalan
# Buka browser: http://localhost:8000/docs
# Health check: http://localhost:8000/health
```

> ⚠️ **Catatan untuk Windows/Mac:** Gunakan `host.docker.internal` sebagai host database di `.env`:
> ```
> DATABASE_URL=postgresql://postgres:PASSWORD@host.docker.internal:5432/cloudapp
> ```

---

## 🔍 Inspect & Monitor

| Command | Keterangan |
|---------|------------|
| `docker ps` | Lihat container yang sedang berjalan |
| `docker ps -a` | Lihat semua container (termasuk stopped) |
| `docker logs <id/nama>` | Lihat log container |
| `docker logs -f <id/nama>` | Follow log secara real-time |
| `docker logs --tail 50 <id/nama>` | Lihat 50 baris terakhir log |
| `docker inspect <id/nama>` | Detail lengkap container/image |
| `docker stats` | Monitor resource usage real-time |

### Contoh untuk proyek ini:
```bash
# Cek apakah container backend berjalan
docker ps

# Lihat log backend
docker logs backend

# Ikuti log backend secara real-time (Ctrl+C untuk berhenti)
docker logs -f backend

# Lihat detail container (termasuk health status)
docker inspect backend

# Cek status health check
docker inspect --format='{{.State.Health.Status}}' backend
```

---

## 💻 Exec — Masuk ke Container

| Command | Keterangan |
|---------|------------|
| `docker exec -it <id/nama> bash` | Masuk ke shell bash container |
| `docker exec -it <id/nama> sh` | Masuk ke shell sh (untuk Alpine) |
| `docker exec <id/nama> <command>` | Jalankan command di dalam container |

### Contoh untuk proyek ini:
```bash
# Masuk ke dalam container backend
docker exec -it backend bash

# Di dalam container, bisa jalankan:
ls -la                  # lihat struktur file
python --version        # cek versi Python
pip list                # lihat packages terinstall
cat requirements.txt    # cek file requirements
env | grep DATABASE     # cek env variable database

# Keluar dari container
exit
```

---

## 🛑 Stop & Remove

| Command | Keterangan |
|---------|------------|
| `docker stop <id/nama>` | Hentikan container (graceful) |
| `docker kill <id/nama>` | Paksa hentikan container |
| `docker rm <id/nama>` | Hapus container (harus stopped dulu) |
| `docker stop <id> && docker rm <id>` | Stop lalu hapus |
| `docker rm -f <id/nama>` | Paksa hapus (stop + rm) |
| `docker stop $(docker ps -q)` | Stop semua container yang berjalan |
| `docker rm $(docker ps -aq)` | Hapus semua container |

### Contoh untuk proyek ini:
```bash
# Stop container backend
docker stop backend

# Hapus container backend
docker rm backend

# Stop dan hapus sekaligus
docker rm -f backend

# Restart container (stop + start ulang)
docker restart backend
```

---

## 🖼️ Image Management

| Command | Keterangan |
|---------|------------|
| `docker images` | Lihat semua image lokal |
| `docker images <nama>` | Filter image berdasarkan nama |
| `docker rmi <image>` | Hapus image |
| `docker image prune` | Hapus dangling images (tanpa tag) |
| `docker history <image>` | Lihat layer history image |

### Contoh untuk proyek ini:
```bash
# Lihat semua image
docker images

# Lihat image cloudapp saja
docker images cloudapp-backend

# Lihat ukuran image
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Lihat layer history (untuk analisis ukuran)
docker history cloudapp-backend:v1

# Hapus image lama
docker rmi cloudapp-backend:v1
```

---

## ☁️ Push & Pull (Docker Hub)

| Command | Keterangan |
|---------|------------|
| `docker login` | Login ke Docker Hub |
| `docker tag <local> <user>/<repo>:<tag>` | Beri tag untuk Docker Hub |
| `docker push <user>/<repo>:<tag>` | Upload image ke Docker Hub |
| `docker pull <user>/<repo>:<tag>` | Download image dari Docker Hub |
| `docker logout` | Logout dari Docker Hub |

### Contoh untuk proyek ini:
```bash
# Login ke Docker Hub (masukkan username + password/token)
docker login

# Beri tag image sesuai username Docker Hub
docker tag cloudapp-backend:v1 namauser/cloudapp-backend:v1

# Push ke Docker Hub
docker push namauser/cloudapp-backend:v1

# Verifikasi: hapus lokal lalu pull ulang
docker rmi namauser/cloudapp-backend:v1
docker pull namauser/cloudapp-backend:v1

# Jalankan dari Docker Hub
docker run -p 8000:8000 --env-file .env namauser/cloudapp-backend:v1
```

> 💡 Ganti `namauser` dengan username Docker Hub tim kalian.

---

## 🧹 Cleanup

| Command | Keterangan |
|---------|------------|
| `docker system prune` | Hapus semua resource tidak terpakai |
| `docker system prune -a` | Hapus semua termasuk images tidak terpakai |
| `docker image prune` | Hapus dangling images saja |
| `docker container prune` | Hapus stopped containers |
| `docker system df` | Lihat penggunaan disk Docker |

```bash
# Lihat berapa disk yang digunakan Docker
docker system df

# Bersih-bersih ringan (container stopped + dangling images)
docker system prune

# ⚠️ Nuclear option — hapus SEMUA yang tidak aktif
docker system prune -a
# Hati-hati! Ini menghapus semua images yang tidak dipakai container aktif
```

---

## 📋 Quick Reference — Workflow Lengkap

```bash
# === ALUR LENGKAP: dari kode ke Docker Hub ===

# 1. Pastikan Docker Desktop running
docker --version
docker compose version

# 2. Masuk ke folder backend
cd backend

# 3. Build image
docker build -t cloudapp-backend:v1 .

# 4. Test jalankan container
docker run -p 8000:8000 --env-file .env cloudapp-backend:v1
# Buka http://localhost:8000/health — harus return {"status": "healthy"}

# 5. Jalankan di background
docker run -d -p 8000:8000 --env-file .env --name backend cloudapp-backend:v1

# 6. Cek status
docker ps
docker logs backend

# 7. Tag untuk Docker Hub
docker tag cloudapp-backend:v1 namauser/cloudapp-backend:v1

# 8. Push ke Docker Hub
docker login
docker push namauser/cloudapp-backend:v1

# 9. Cleanup setelah selesai
docker stop backend
docker rm backend
```

---

## 🔗 Referensi

- [Docker Docs — Get Started](https://docs.docker.com/get-started/)
- [Dockerfile Best Practices](https://docs.docker.com/build/building/best-practices/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Cheat Sheet PDF](https://docs.docker.com/get-started/docker_cheatsheet.pdf)

---