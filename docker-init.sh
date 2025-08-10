#!/bin/bash

# Cek jika .env belum ada
if [ ! -f ".env" ]; then
    echo "⚙️  .env belum ada, membuat dari .env.example..."
    cp .env.example .env
fi

# Generate APP_KEY jika belum ada
if ! grep -q "APP_KEY=" .env || [ -z "$(grep APP_KEY .env | cut -d '=' -f2)" ]; then
    echo "🔑 Generate APP_KEY..."
    php artisan key:generate
fi

# Jalankan migrate
echo "🗄️ Migrating database..."
php artisan migrate --force
