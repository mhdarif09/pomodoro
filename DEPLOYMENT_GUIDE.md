# 🚀 Deployment Guide - New Features

Panduan lengkap untuk deploy 3 fitur baru ke server production.

---

## 📋 Summary Fitur Baru

### 1. WhatsApp Reminder (H-1 Task Deadline)
- Kirim notifikasi WhatsApp otomatis H-1 sebelum deadline task
- Menggunakan Fonnte API
- Scheduled daily at 9:00 AM

### 2. Kanban Board + Documents Integration
- Kanban board dengan drag-and-drop untuk tasks
- Delete document functionality
- Modern minimalist green theme
- Sync status antara Kanban dan Dashboard

### 3. Learning Hub (Pomodoro + Mini Modul Merge)
- Gabung Pomodoro dan Learning Center jadi 1 menu
- Navbar lebih rapi (4 items instead of 6)
- Tab navigation untuk akses kedua fitur

---

## 🔧 Pre-Deployment Checklist

### Local Testing
- [ ] Test WhatsApp reminder dengan test task
- [ ] Test Kanban drag-and-drop
- [ ] Test document delete
- [ ] Test Learning Hub navigation
- [ ] Run `npm run build` tanpa error
- [ ] Run `php artisan migrate` di local

### Environment Variables
- [ ] `FONNTE_API_TOKEN` sudah di `.env`
- [ ] Database credentials correct
- [ ] Queue driver configured

---

## 📦 Files to Deploy

### Backend (PHP)
```
app/Http/Controllers/
├── KanbanController.php (NEW)
├── LearningController.php (NEW)
├── DocumentController.php (MODIFIED)
└── TaskController.php (MODIFIED)

app/Models/
└── Task.php (MODIFIED)

app/Services/
└── FonnteService.php (NEW)

app/Jobs/
└── SendTaskDeadlineReminders.php (NEW)

app/Console/Commands/
└── SendDeadlineReminders.php (NEW)

app/Console/
└── Kernel.php (MODIFIED)

database/migrations/
├── 2025_11_22_135648_add_phone_to_users_table.php (NEW)
└── 2025_11_23_021305_add_status_to_tasks_table.php (NEW)

config/
└── services.php (MODIFIED)

routes/
└── web.php (MODIFIED)
```

### Frontend (JavaScript/React)
```
resources/js/Pages/
├── Docs/Index.jsx (MODIFIED)
└── Learning/Index.jsx (NEW)

resources/js/Components/
├── DocumentCard.jsx (NEW)
├── TaskCard.jsx (NEW)
└── KanbanBoard.jsx (NEW)

resources/js/Layouts/
└── AuthenticatedLayout.jsx (MODIFIED)

resources/js/Pages/Profile/Partials/
└── UpdateProfileInformationForm.jsx (MODIFIED)

app/Http/Requests/
└── ProfileUpdateRequest.php (MODIFIED)
```

### Config Files
```
.env.example (MODIFIED)
package.json (check @dnd-kit packages)
```

---

## 🚀 Deployment Steps

### Step 1: Backup Production

```bash
# Backup database
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# Backup files
tar -czf backup_files_$(date +%Y%m%d).tar.gz /path/to/app
```

### Step 2: Pull Code to Server

```bash
# SSH to server
ssh user@your-server.com

# Navigate to project
cd /path/to/your/project

# Pull latest code
git pull origin main

# Or upload via FTP/SFTP if not using git
```

### Step 3: Install Dependencies

```bash
# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install NPM packages (including @dnd-kit)
npm install

# Build assets
npm run build
```

### Step 4: Run Migrations

```bash
# Run migrations
php artisan migrate

# Check migration status
php artisan migrate:status
```

Expected new migrations:
- ✅ `add_phone_to_users_table`
- ✅ `add_status_to_tasks_table`

### Step 5: Update Environment Variables

Edit `.env` file:

```bash
nano .env
```

Add/Update:
```env
# Fonnte API for WhatsApp
FONNTE_API_TOKEN=your_fonnte_token_here

# Queue Configuration (if not already set)
QUEUE_CONNECTION=database
```

### Step 6: Clear Caches

```bash
# Clear all caches
php artisan optimize:clear

# Or individually:
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Step 7: Setup Cron Job (WhatsApp Reminder)

Edit crontab:
```bash
crontab -e
```

Add this line:
```cron
# Laravel Scheduler (includes WhatsApp reminder at 9 AM)
* * * * * cd /path/to/your/project && php artisan schedule:run >> /dev/null 2>&1
```

Verify scheduler:
```bash
php artisan schedule:list
```

Should show:
```
0 9 * * * reminders:send-deadline
```

### Step 8: Setup Queue Worker

**Option A: Using Supervisor (Recommended)**

Create supervisor config:
```bash
sudo nano /etc/supervisor/conf.d/laravel-worker.conf
```

Content:
```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/project/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/your/project/storage/logs/worker.log
stopwaitsecs=3600
```

Start supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

**Option B: Using systemd**

Create service file:
```bash
sudo nano /etc/systemd/system/laravel-queue.service
```

Content:
```ini
[Unit]
Description=Laravel Queue Worker

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /path/to/your/project/artisan queue:work

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable laravel-queue
sudo systemctl start laravel-queue
```

### Step 9: Set Permissions

```bash
# Storage and cache permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Step 10: Restart Services

```bash
# Restart PHP-FPM
sudo systemctl restart php8.2-fpm

# Restart Nginx/Apache
sudo systemctl restart nginx
# OR
sudo systemctl restart apache2

# Restart queue worker (if using supervisor)
sudo supervisorctl restart laravel-worker:*
```

---

## ✅ Post-Deployment Verification

### 1. Check Application

```bash
# Visit your site
https://your-domain.com

# Check for errors
tail -f storage/logs/laravel.log
```

### 2. Test WhatsApp Reminder

```bash
# Manually trigger reminder
php artisan reminders:send-deadline

# Check logs
tail -f storage/logs/laravel.log | grep "Fonnte"
```

### 3. Test Kanban Board

- [ ] Go to Documents page
- [ ] Switch to Kanban Board tab
- [ ] Drag a task between columns
- [ ] Verify status updates in database
- [ ] Check task appears in correct column on Dashboard

### 4. Test Document Delete

- [ ] Go to Documents tab
- [ ] Hover over a document (you own)
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] Verify document removed from database

### 5. Test Learning Hub

- [ ] Click "Learning" in navbar
- [ ] Verify 2 tabs visible
- [ ] Click Pomodoro tab → redirects to Pomodoro page
- [ ] Click Learning Center tab → redirects to Mini Modul page

### 6. Test Task Sync

**Kanban → Dashboard:**
- [ ] Drag task to "Done" column in Kanban
- [ ] Go to Dashboard
- [ ] Verify task is checked

**Dashboard → Kanban:**
- [ ] Check a task in Dashboard
- [ ] Go to Kanban Board
- [ ] Verify task is in "Done" column

---

## 🐛 Troubleshooting

### WhatsApp Reminder Not Sending

**Check 1: Cron job running?**
```bash
grep CRON /var/log/syslog
```

**Check 2: Scheduler working?**
```bash
php artisan schedule:list
php artisan schedule:test
```

**Check 3: Queue worker running?**
```bash
sudo supervisorctl status laravel-worker:*
# OR
sudo systemctl status laravel-queue
```

**Check 4: Fonnte token valid?**
```bash
php artisan tinker
>>> config('services.fonnte.token')
```

### Kanban Drag-and-Drop Not Working

**Check 1: Assets built?**
```bash
ls -la public/build/assets/
```

**Check 2: Browser console errors?**
- Open DevTools (F12)
- Check Console tab
- Look for JavaScript errors

**Fix: Rebuild assets**
```bash
npm run build
php artisan optimize:clear
```

### Learning Hub Shows 404

**Check 1: Route exists?**
```bash
php artisan route:list | grep learning
```

Should show:
```
GET|HEAD  dashboard/learning ... learning.index
```

**Fix: Clear route cache**
```bash
php artisan route:clear
php artisan optimize:clear
```

### Database Migration Errors

**Error: Column already exists**
```bash
# Check migration status
php artisan migrate:status

# Rollback if needed
php artisan migrate:rollback --step=1
```

---

## 📊 Monitoring

### Check Queue Jobs

```bash
# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all
```

### Check Logs

```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Queue worker logs (if using supervisor)
tail -f storage/logs/worker.log

# Nginx/Apache logs
tail -f /var/log/nginx/error.log
```

### Database Checks

```sql
-- Check tasks with status
SELECT id, title, status, is_completed FROM tasks LIMIT 10;

-- Check users with phone numbers
SELECT id, name, phone FROM users WHERE phone IS NOT NULL;

-- Check recent Pomodoro sessions
SELECT * FROM pomodoro_sessions ORDER BY created_at DESC LIMIT 5;
```

---

## 🔄 Rollback Plan

If something goes wrong:

### Step 1: Restore Database
```bash
mysql -u username -p database_name < backup_YYYYMMDD.sql
```

### Step 2: Restore Files
```bash
tar -xzf backup_files_YYYYMMDD.tar.gz -C /path/to/restore
```

### Step 3: Rollback Migrations
```bash
php artisan migrate:rollback --step=2
```

### Step 4: Rebuild Assets
```bash
npm run build
php artisan optimize:clear
```

---

## 📝 Summary

**New Features Deployed:**
1. ✅ WhatsApp Reminder (H-1 deadline)
2. ✅ Kanban Board + Documents
3. ✅ Learning Hub (Pomodoro + Mini Modul)

**Database Changes:**
- `users` table: added `phone` column
- `tasks` table: added `status` column

**New Routes:**
- `/dashboard/learning` - Learning Hub
- `/dashboard/kanban` - Kanban Board (via Documents)

**Cron Jobs:**
- Daily at 9:00 AM: Send WhatsApp reminders

**Queue Workers:**
- Process WhatsApp notification jobs

---

## 🎉 Done!

Semua fitur baru sudah deployed! 

**Next Steps:**
1. Monitor logs for 24 hours
2. Test WhatsApp reminder tomorrow at 9 AM
3. Gather user feedback
4. Plan next iteration

**Support:**
- Check `DEPLOYMENT_WHATSAPP_REMINDER.md` for detailed WhatsApp setup
- Check `walkthrough.md` for feature usage guide
