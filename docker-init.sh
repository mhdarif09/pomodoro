#!/bin/bash

# Setup .env
if [ ! -f ".env" ]; then
    echo "⚙️  Membuat .env dari .env.example..."
    cp .env.example .env
fi

# Generate APP_KEY
if ! grep -q "APP_KEY=" .env || [ -z "$(grep APP_KEY .env | cut -d '=' -f2)" ]; then
    echo "🔑 Generate APP_KEY..."
    php artisan key:generate
fi

# Migrate database
echo "🗄️ Migrating database..."
php artisan migrate --force

# SSL setup
bash /var/www/ssl-init.sh
