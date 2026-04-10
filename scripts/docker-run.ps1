# ============================================================
# Script untuk menjalankan semua container (Versi Windows PowerShell)
# ============================================================

$ACTION = if ($args[0]) { $args[0] } else { "start" }

switch ($ACTION) {
    "start" {
        Write-Host "Starting all containers..." -ForegroundColor Cyan
        
        # Create network (Silently continue if exists)
        docker network create lentera_net 2>$null
        
        # Database
        Write-Host "Starting database..." -ForegroundColor Yellow
        docker run -d `
          --name db `
          --network lentera_net `
          -e POSTGRES_USER=postgres `
          -e POSTGRES_PASSWORD=postgres `
          -e POSTGRES_DB=lentera_pustaka `
          -p 5433:5432 `
          -v lentera_data:/var/lib/postgresql/data `
          postgres:16-alpine
        
        Write-Host "Waiting for database to be ready..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
        
        # Backend
        Write-Host "Starting backend..." -ForegroundColor Yellow
        docker run -d `
          --name lentera_be `
          --network lentera_net `
          --env-file backend/.env.docker `
          -p 8000:8000 `
          x3naline/lentera:be-v2
        
        # Frontend
        Write-Host "Starting frontend..." -ForegroundColor Yellow
        docker run -d `
          --name lentera_fe `
          --network lentera_net `
          -p 3000:80 `
          x3naline/lentera:fe-v1
        
        Write-Host "`n All containers started!" -ForegroundColor Green
        Write-Host "   Frontend: http://localhost:3000"
        Write-Host "   Backend:  http://localhost:8000/docs"
        Write-Host "   Database: localhost:5433"
    }
    
    "stop" {
        Write-Host "Stopping all containers..." -ForegroundColor Red
        docker stop lentera_fe lentera_be db 2>$null
        docker rm lentera_fe lentera_be db 2>$null
        Write-Host "All containers stopped and removed." -ForegroundColor Green
    }
    
    "status" {
        Write-Host "Container Status:" -ForegroundColor Cyan
        docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
    }

    "logs" {
        $TARGET = if ($args[1]) { $args[1] } else { "lentera_be" }
        Write-Host "Logs for $TARGET (Press Ctrl+C to stop):" -ForegroundColor Cyan
        docker logs -f $TARGET
    }

    Default {
        Write-Host "Usage: .\scripts\docker-run.ps1 [start|stop|status|logs]" -ForegroundColor White
    }
}