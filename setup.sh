#!/bin/bash

echo "🚀 Starting backend setup..."

# 1. Membuat virtual environment (Venv)
python -m venv venv

# 2. Mengaktifkan venv
source venv/bin/activate

# 3. Install dependencies dari requirements.txt
pip install -r requirements.txt

# 4. Copy file environment
cp .env.example .env

echo "✅ Setup complete!"
echo "⚠️  Note: Sesuaikan DATABASE_URL di file .env dengan password PostgreSQL-mu dan buat database 'hexacore' di PostgreSQL. Jika belum, jalankan: psql -U postgres -c 'CREATE DATABASE hexacore;'"
echo ""
echo "💡 Run server with: uvicorn main:app --reload"
echo "   1. Start Backend: cd backend && uvicorn main:app --reload"
echo "   2. Start Frontend: cd frontend && npm run dev"
echo ""
echo "📚 Access:"
echo "   - API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo "   - Frontend: http://localhost:5173"
echo ""