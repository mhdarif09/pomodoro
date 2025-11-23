# 📱 WhatsApp Reminder - Complete Server Setup Guide

**Project Path:** `/var/www/sarangtumbuh`

Panduan lengkap setup WhatsApp reminder untuk kirim notifikasi H-1 sebelum deadline task.

---

## 📋 Overview

**Fitur:**
- Kirim WhatsApp notification otomatis H-1 sebelum task deadline
- Scheduled daily jam 9:00 AM
- Menggunakan Fonnte API
- Queue-based untuk reliability

**Flow:**
1. Cron job trigger scheduler setiap menit
2. Scheduler jalankan command `reminders:send-deadline` jam 9 AM
3. Command dispatch job `SendTaskDeadlineReminders`
4. Job query tasks dengan deadline besok
5. Kirim WhatsApp via Fonnte API

---

## 🔧 Step 1: Get Fonnte API Token

### Register Fonnte
1. Buka https://fonnte.com
2. Register/Login
3. Go to Dashboard → API
4. Copy **API Token**

### Test Token (Optional)
```bash
curl -X POST https://api.fonnte.com/send \
  -H "Authorization: YOUR_TOKEN_HERE" \
  -d "target=628123456789" \
  -d "message=Test dari Fonnte"
```

---

## 🚀 Step 2: Deploy Code to Server

### SSH to Server
```bash
ssh user@your-server-ip
cd /var/www/sarangtumbuh
```

### Pull Latest Code
```bash
# If using git
git pull origin main

# Or upload files via FTP/SFTP
# Make sure these files exist:
# - app/Services/FonnteService.php
# - app/Jobs/SendTaskDeadlineReminders.php
# - app/Console/Commands/SendDeadlineReminders.php
# - database/migrations/2025_11_22_135648_add_phone_to_users_table.php
```

### Install Dependencies
```bash
# PHP dependencies
composer install --no-dev --optimize-autoloader

# No new NPM packages needed for WhatsApp feature
```

---

## 🗄️ Step 3: Database Migration

### Run Migration
```bash
cd /var/www/sarangtumbuh
php artisan migrate
```

**Expected output:**
```
Migrating: 2025_11_22_135648_add_phone_to_users_table
Migrated:  2025_11_22_135648_add_phone_to_users_table (123.45ms)
```

### Verify Migration
```bash
php artisan migrate:status
```

Should show:
```
[2025_11_22_135648] add_phone_to_users_table ................ Ran
```

### Check Database
```bash
mysql -u your_db_user -p
```

```sql
USE your_database_name;
DESCRIBE users;
```

Should show `phone` column (varchar, nullable).

---

## ⚙️ Step 4: Configure Environment

### Edit .env File
```bash
cd /var/www/sarangtumbuh
nano .env
```

### Add Fonnte Configuration
```env
# Fonnte API Configuration
FONNTE_API_TOKEN=your_fonnte_token_here

# Queue Configuration (if not already set)
QUEUE_CONNECTION=database
```

**Important:** Replace `your_fonnte_token_here` with your actual Fonnte token!

### Verify Configuration
```bash
php artisan tinker
```

```php
>>> config('services.fonnte.token')
=> "your_fonnte_token_here"  // Should show your token

>>> exit
```

---

## 🔄 Step 5: Setup Queue Worker

WhatsApp jobs run via queue. Pilih salah satu method:

### Option A: Using Supervisor (Recommended)

#### Install Supervisor
```bash
sudo apt update
sudo apt install supervisor
```

#### Create Config File
```bash
sudo nano /etc/supervisor/conf.d/sarangtumbuh-worker.conf
```

**Content:**
```ini
[program:sarangtumbuh-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/sarangtumbuh/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/sarangtumbuh/storage/logs/worker.log
stopwaitsecs=3600
```

#### Start Worker
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start sarangtumbuh-worker:*
```

#### Check Status
```bash
sudo supervisorctl status sarangtumbuh-worker:*
```

Should show:
```
sarangtumbuh-worker:sarangtumbuh-worker_00   RUNNING   pid 12345, uptime 0:00:05
```

### Option B: Using systemd

#### Create Service File
```bash
sudo nano /etc/systemd/system/sarangtumbuh-queue.service
```

**Content:**
```ini
[Unit]
Description=Sarangtumbuh Queue Worker

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/sarangtumbuh/artisan queue:work --sleep=3 --tries=3

[Install]
WantedBy=multi-user.target
```

#### Enable and Start
```bash
sudo systemctl enable sarangtumbuh-queue
sudo systemctl start sarangtumbuh-queue
sudo systemctl status sarangtumbuh-queue
```

---

## ⏰ Step 6: Setup Cron Job

### Edit Crontab
```bash
crontab -e
```

### Add Laravel Scheduler
```cron
# Laravel Scheduler for Sarangtumbuh
* * * * * cd /var/www/sarangtumbuh && php artisan schedule:run >> /dev/null 2>&1
```

**Important:** This runs every minute and Laravel scheduler will handle the 9 AM timing.

### Verify Scheduler
```bash
cd /var/www/sarangtumbuh
php artisan schedule:list
```

Should show:
```
0 9 * * *  reminders:send-deadline ................ Next Due: Tomorrow at 9:00 AM
```

---

## 🧹 Step 7: Clear Caches

```bash
cd /var/www/sarangtumbuh

# Clear all caches
php artisan optimize:clear

# Or individually:
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## 🔐 Step 8: Set Permissions

```bash
cd /var/www/sarangtumbuh

# Set ownership
sudo chown -R www-data:www-data storage bootstrap/cache

# Set permissions
sudo chmod -R 775 storage bootstrap/cache
```

---

## ✅ Step 9: Testing

### Test 1: Manual Command
```bash
cd /var/www/sarangtumbuh
php artisan reminders:send-deadline
```

**Expected output:**
```
Dispatching deadline reminder job...
Job dispatched successfully!
Tasks found: 0 (or number of tasks with deadline tomorrow)
```

### Test 2: Check Logs
```bash
tail -f /var/www/sarangtumbuh/storage/logs/laravel.log
```

Look for:
```
[2025-11-23 09:00:00] local.INFO: Checking tasks with deadline tomorrow...
[2025-11-23 09:00:00] local.INFO: Found 2 tasks with deadline tomorrow
[2025-11-23 09:00:00] local.INFO: WhatsApp sent successfully to 628123456789
```

### Test 3: Create Test Task
```bash
php artisan tinker
```

```php
// Get your user
$user = \App\Models\User::first();

// Update phone number (format: 62xxx without +)
$user->phone = '628123456789'; // Your WhatsApp number
$user->save();

// Create test task with deadline tomorrow
\App\Models\Task::create([
    'user_id' => $user->id,
    'title' => 'Test Task - Deadline Tomorrow',
    'description' => 'Testing WhatsApp reminder',
    'due_date' => now()->addDay()->format('Y-m-d'),
    'is_completed' => false,
    'status' => 'todo'
]);

exit
```

### Test 4: Trigger Reminder Manually
```bash
php artisan reminders:send-deadline
```

Check your WhatsApp! You should receive a message.

---

## 📊 Monitoring

### Check Queue Jobs
```bash
cd /var/www/sarangtumbuh

# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Clear failed jobs
php artisan queue:flush
```

### Check Worker Status
```bash
# If using Supervisor
sudo supervisorctl status sarangtumbuh-worker:*

# If using systemd
sudo systemctl status sarangtumbuh-queue
```

### Check Logs
```bash
# Laravel logs
tail -f /var/www/sarangtumbuh/storage/logs/laravel.log

# Worker logs (if using Supervisor)
tail -f /var/www/sarangtumbuh/storage/logs/worker.log

# System logs
sudo tail -f /var/log/syslog | grep CRON
```

---

## 🐛 Troubleshooting

### Problem 1: Cron Not Running

**Check cron logs:**
```bash
sudo grep CRON /var/log/syslog
```

**Should see:**
```
Nov 23 09:00:01 server CRON[12345]: (www-data) CMD (cd /var/www/sarangtumbuh && php artisan schedule:run)
```

**Fix: Check crontab user**
```bash
# Make sure cron is for www-data user
sudo crontab -u www-data -e
```

### Problem 2: Queue Worker Not Running

**Check status:**
```bash
sudo supervisorctl status sarangtumbuh-worker:*
```

**Restart:**
```bash
sudo supervisorctl restart sarangtumbuh-worker:*
```

**Check logs:**
```bash
tail -f /var/www/sarangtumbuh/storage/logs/worker.log
```

### Problem 3: Fonnte API Error

**Test API directly:**
```bash
curl -X POST https://api.fonnte.com/send \
  -H "Authorization: YOUR_TOKEN" \
  -d "target=628123456789" \
  -d "message=Test"
```

**Check token in .env:**
```bash
cd /var/www/sarangtumbuh
grep FONNTE_API_TOKEN .env
```

**Verify config loaded:**
```bash
php artisan tinker
>>> config('services.fonnte.token')
```

### Problem 4: No WhatsApp Received

**Check user has phone number:**
```bash
php artisan tinker
>>> \App\Models\User::whereNotNull('phone')->count()
```

**Check task has deadline tomorrow:**
```bash
php artisan tinker
>>> \App\Models\Task::whereDate('due_date', now()->addDay())->where('is_completed', false)->count()
```

**Check logs for errors:**
```bash
tail -f storage/logs/laravel.log | grep -i "fonnte\|whatsapp\|error"
```

---

## 📱 User Setup (Frontend)

Users need to add their WhatsApp number in profile:

### Steps for Users:
1. Login to application
2. Go to **Profile** (click profile icon in navbar)
3. Scroll to **Phone Number** field
4. Enter WhatsApp number in format: `628123456789`
   - Start with `62` (Indonesia country code)
   - No `+` or `0` at the beginning
   - Example: `628123456789` for `+62 812-3456-789`
5. Click **Save**

### Validation:
- Format must be: `62` + 9-12 digits
- Example valid: `628123456789`, `6281234567890`
- Example invalid: `+628123456789`, `08123456789`

---

## 🔄 Daily Operation

### What Happens Daily:

**9:00 AM Server Time:**
1. Cron triggers Laravel scheduler
2. Scheduler runs `reminders:send-deadline` command
3. Command queries tasks with `due_date = tomorrow` and `is_completed = false`
4. For each task, dispatch WhatsApp job to queue
5. Queue worker processes jobs
6. Fonnte API sends WhatsApp messages
7. Logs recorded in `storage/logs/laravel.log`

### Message Format:
```
🔔 Reminder: Task Deadline Tomorrow!

Task: [Task Title]
Due Date: [Due Date]
Priority: [Priority]

Jangan lupa selesaikan task ini ya!

- [User Name]
```

---

## 📝 Maintenance

### Weekly Checks:
```bash
# Check queue worker status
sudo supervisorctl status sarangtumbuh-worker:*

# Check failed jobs
php artisan queue:failed

# Check disk space
df -h

# Check logs size
du -sh /var/www/sarangtumbuh/storage/logs/
```

### Monthly Tasks:
```bash
# Rotate logs (if not using logrotate)
cd /var/www/sarangtumbuh/storage/logs
gzip laravel.log
mv laravel.log.gz laravel-$(date +%Y%m).log.gz
touch laravel.log
chown www-data:www-data laravel.log

# Clean old failed jobs
php artisan queue:flush
```

---

## 🎯 Quick Reference

### Important Paths:
```
Project Root:    /var/www/sarangtumbuh
Logs:            /var/www/sarangtumbuh/storage/logs/laravel.log
Worker Config:   /etc/supervisor/conf.d/sarangtumbuh-worker.conf
Crontab:         crontab -e (as www-data user)
```

### Important Commands:
```bash
# Manual trigger
php artisan reminders:send-deadline

# Check schedule
php artisan schedule:list

# Check queue
php artisan queue:failed

# Restart worker
sudo supervisorctl restart sarangtumbuh-worker:*

# View logs
tail -f storage/logs/laravel.log
```

### Important Files:
```
app/Services/FonnteService.php
app/Jobs/SendTaskDeadlineReminders.php
app/Console/Commands/SendDeadlineReminders.php
app/Console/Kernel.php
config/services.php
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Migration ran successfully (`php artisan migrate:status`)
- [ ] Fonnte token in `.env` (`grep FONNTE .env`)
- [ ] Config loaded (`php artisan tinker` → `config('services.fonnte.token')`)
- [ ] Cron job added (`crontab -l`)
- [ ] Scheduler shows command (`php artisan schedule:list`)
- [ ] Queue worker running (`sudo supervisorctl status`)
- [ ] Manual test works (`php artisan reminders:send-deadline`)
- [ ] Test WhatsApp received
- [ ] Logs show no errors (`tail -f storage/logs/laravel.log`)

---

## 🆘 Support

**If stuck, check:**
1. `storage/logs/laravel.log` - Application logs
2. `/var/log/syslog` - System logs (cron)
3. `storage/logs/worker.log` - Queue worker logs

**Common issues:**
- Token invalid → Check `.env` and run `php artisan config:clear`
- Worker not running → Restart supervisor
- Cron not triggering → Check crontab user
- No WhatsApp → Check user phone format (must be `62xxx`)

---

## 🎉 Done!

WhatsApp reminder sudah setup! Akan auto-send setiap hari jam 9 AM untuk tasks dengan deadline besok.

**Test tomorrow at 9 AM** atau trigger manual dengan `php artisan reminders:send-deadline`!
