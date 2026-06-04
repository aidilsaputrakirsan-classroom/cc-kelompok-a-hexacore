# scripts/logs.ps1
# Log helper script untuk debugging microservices di Windows PowerShell
# Usage: .\scripts\logs.ps1 -Action [all|errors|trace|metrics] [-Param <value>]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "errors", "trace", "metrics")]
    [string]$Action,

    [Parameter(Mandatory=$false)]
    [string]$Param
)

if (-not $Action) {
    Write-Host "Usage: .\scripts\logs.ps1 -Action {all | errors | trace | metrics} [-Param <value>]" -ForegroundColor Yellow
    exit
}

switch ($Action) {
    "all" {
        Write-Host "=== Showing all service logs ===" -ForegroundColor Cyan
        docker compose logs -f auth-service library-service
    }
    "errors" {
        Write-Host "=== Showing ERROR and CRITICAL logs only ===" -ForegroundColor Red
        # Select-String is safe and works like grep
        docker compose logs auth-service library-service 2>&1 | Select-String -Pattern '"level":"ERROR"','"level":"CRITICAL"'
    }
    "trace" {
        if (-not $Param) {
            Write-Host "Error: -Param correlation-id wajib disertakan untuk melacak." -ForegroundColor Red
            Write-Host "Usage: .\scripts\logs.ps1 -Action trace -Param correlation-id" -ForegroundColor Yellow
            exit
        }
        Write-Host "=== Tracing correlation ID: $Param ===" -ForegroundColor Green
        docker compose logs auth-service library-service 2>&1 | Select-String -Pattern $Param
    }
    "metrics" {
        Write-Host "=== Fetching metrics ===" -ForegroundColor Cyan
        Write-Host "--- Auth Service ---" -ForegroundColor DarkCyan
        try {
            $auth = Invoke-RestMethod -Uri "http://localhost/auth/metrics" -TimeoutSec 5
            $auth | ConvertTo-Json -Depth 5
        } catch {
            $err = $_.Exception.Message
            Write-Host "Gagal mengambil metrik Auth Service: $err" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "--- Library Service ---" -ForegroundColor DarkCyan
        try {
            $lib = Invoke-RestMethod -Uri "http://localhost/items/metrics" -TimeoutSec 5
            $lib | ConvertTo-Json -Depth 5
        } catch {
            $err = $_.Exception.Message
            Write-Host "Gagal mengambil metrik Library Service: $err" -ForegroundColor Red
        }
    }
}
