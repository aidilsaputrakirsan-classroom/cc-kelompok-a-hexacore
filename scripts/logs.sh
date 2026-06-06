#!/bin/bash
# Log helper script untuk debugging microservices
# Usage: ./scripts/logs.sh [command] [args]

case "$1" in
  all)
    echo "📋 Showing all service logs..."
    docker compose logs -f auth-service library-service
    ;;
  errors)
    echo "❌ Showing ERROR logs only..."
    docker compose logs auth-service library-service 2>&1 | grep -E '"level":\s*"ERROR"|"level":\s*"CRITICAL"'
    ;;
  trace)
    if [ -z "$2" ]; then
      echo "Usage: ./scripts/logs.sh trace <correlation-id>"
      exit 1
    fi
    echo "🔗 Tracing correlation ID: $2"
    docker compose logs auth-service library-service 2>&1 | grep "$2"
    ;;
  metrics)
    echo "📊 Fetching metrics..."
    echo "--- Auth Service ---"
    curl -s http://localhost/auth/metrics | (python3 -m json.tool || python -m json.tool || cat)
    echo ""
    echo "--- Library Service ---"
    curl -s http://localhost/items/metrics | (python3 -m json.tool || python -m json.tool || cat)
    ;;
  *)
    echo "Usage: ./scripts/logs.sh {all|errors|trace <id>|metrics}"
    ;;
esac
