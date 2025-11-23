# 📱 WhatsApp Reminder Deployment Guide

Panduan deployment fitur WhatsApp reminder untuk task deadline H-1 menggunakan Fonnte API.

---

## 📋 Prerequisites

- [x] Server dengan PHP 8.1+
- [x] Laravel 10+ sudah terinstall
- [x] Akses SSH ke server
- [x] Fonnte API Token (sudah ada)
- [x] Cron job access

---

## 🚀 Deployment Steps

### 1. Push Code ke Server

```bash
# Di local
git add .
git commit -m "Add WhatsApp reminder feature for task deadlines"
git push origin main
```

```bash
# Di server
cd /path/to/your/project
git pull origin main
```

---

### 2. Install Dependencies (Jika Ada Perubahan)

```bash
composer install --no-dev --optimize-autoloader
npm install && npm run build
```

---

### 3. Run Database Migration

```bash
php artisan migrate --force
```

**Expected Output:**
```
Running migrations.
2025_11_22_135648_add_phone_to_users_table ................ DONE
```

---

### 4. Configure Environment Variables

Edit file `.env` di server:

```bash
nano .env
```

Tambahkan/update:

```env
# Fonnte WhatsApp API
FONNTE_API_TOKEN=THX3gGK3q4CV7LaE7jcz

# Queue Connection (recommended for production)
QUEUE_CONNECTION=database
```

**Jika menggunakan database queue**, jalankan:

```bash
php artisan queue:table
php artisan migrate
```

---

### 5. Clear Cache

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize
```

---

### 6. Setup Cron Job (PENTING!)

Edit crontab di server:

```bash
crontab -e
```

Tambahkan baris ini:

```cron
* * * * * cd /path/to/your/project && php artisan schedule:run >> /dev/null 2>&1
```

**Ganti `/path/to/your/project`** dengan path absolut project kamu!

**Verify cron job:**

```bash
crontab -l
```

---

### 7. Setup Queue Worker (Opsional tapi Recommended)

Jika menggunakan queue, setup supervisor untuk queue worker:

**Install Supervisor:**

```bash
sudo apt-get install supervisor
```

**Create config file:**

```bash
sudo nano /etc/supervisor/conf.d/laravel-worker.conf
```

**Isi dengan:**

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/project/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/your/project/storage/logs/worker.log
stopwaitsecs=3600
```

**Start supervisor:**

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

---

### 8. Test Command di Server

```bash
php artisan reminders:send-deadline
```

**Expected Output:**

```
🔔 Checking for tasks with deadline tomorrow...
✅ Deadline reminder job has been dispatched!
```

---

### 9. Verify Scheduler

```bash
php artisan schedule:list
```

**Expected Output:**

```
0 9 * * *  php artisan reminders:send-deadline ........ Next Due: X hours from now
```

---

### 10. Check Logs

```bash
tail -f storage/logs/laravel.log | grep -i "deadline\|reminder"
```

**Expected Log:**

```
[2025-11-23 09:00:00] production.INFO: Checking tasks for deadline reminders {"tomorrow":"2025-11-24","tasks_found":X}
[2025-11-23 09:00:01] production.INFO: Deadline reminders job completed {"tasks_processed":X}
```

---

## 🔍 Verification Checklist

Setelah deployment, verify semua berjalan dengan baik:

```bash
# 1. Check migration
php artisan tinker --execute="echo Schema::hasColumn('users', 'phone') ? 'OK' : 'FAIL';"

# 2. Check config
php artisan tinker --execute="echo config('services.fonnte.token') ? 'OK' : 'FAIL';"

# 3. Check command
php artisan list | grep reminder

# 4. Check scheduler
php artisan schedule:list

# 5. Test execution
php artisan reminders:send-deadline
```

---

## 📁 Files Modified/Created

### New Files:
- `database/migrations/2025_11_22_135648_add_phone_to_users_table.php`
- `app/Services/FonnteService.php`
- `app/Jobs/SendTaskDeadlineReminders.php`
- `app/Console/Commands/SendDeadlineReminders.php`

### Modified Files:
- `app/Models/User.php` - Added `phone` to fillable
- `app/Console/Kernel.php` - Added scheduler
- `config/services.php` - Added Fonnte config
- `.env.example` - Added `FONNTE_API_TOKEN`
- `app/Http/Requests/ProfileUpdateRequest.php` - Added phone validation
- `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx` - Added phone field
- `resources/js/Layouts/AuthenticatedLayout.jsx` - Added Profile link

---

## 🔧 Troubleshooting

### Cron tidak jalan?

**Check cron logs:**

```bash
grep CRON /var/log/syslog
```

**Test manual:**

```bash
cd /path/to/your/project && php artisan schedule:run
```

### Notifikasi tidak terkirim?

**Check 1: Fonnte Token**

```bash
php artisan tinker --execute="echo config('services.fonnte.token');"
```

**Check 2: User Phone**

```bash
php artisan tinker
>>> \App\Models\User::whereNotNull('phone')->count()
```

**Check 3: Tasks Tomorrow**

```bash
php artisan tinker
>>> \App\Models\Task::whereDate('due_date', \Carbon\Carbon::tomorrow())->where('is_completed', false)->count()
```

**Check 4: Logs**

```bash
tail -100 storage/logs/laravel.log | grep -i "fonnte\|whatsapp\|deadline"
```

### Queue tidak jalan?

**Check queue worker:**

```bash
sudo supervisorctl status laravel-worker:*
```

**Restart queue:**

```bash
sudo supervisorctl restart laravel-worker:*
```

---

## 📊 Monitoring

### Daily Check Commands:

```bash
# Check scheduler status
php artisan schedule:list

# Check recent logs
tail -50 storage/logs/laravel.log | grep "deadline"

# Check queue jobs (if using queue)
php artisan queue:failed
```

### Weekly Check:

```bash
# Check how many reminders sent this week
grep "Deadline reminder sent successfully" storage/logs/laravel.log | wc -l
```

---

## 🎯 User Instructions

Setelah deployment, inform users:

1. **Update Profile**:
   - Login ke aplikasi
   - Klik menu "Profile" di sidebar
   - Isi "WhatsApp Number" dengan format: `628123456789`
   - Klik "Save"

2. **Notifikasi akan dikirim**:
   - Setiap hari jam 09:00 pagi
   - Untuk task yang deadline besok (H-1)
   - Hanya untuk task yang belum selesai

3. **Format Pesan**:
   ```
   🔔 *Reminder Task Deadline*
   
   Halo {nama}! 👋
   
   Task *"{judul_task}"* akan deadline besok ({tanggal})!
   
   Jangan lupa diselesaikan ya 😊
   
   Semangat! 💪
   ```

---

## 🔐 Security Notes

- ✅ Fonnte token stored in `.env` (not in git)
- ✅ Phone validation with regex pattern
- ✅ Only sends to users with valid phone numbers
- ✅ Logs all activities for audit trail
- ✅ Queue jobs for better performance

---

## 📝 Rollback Plan

Jika ada masalah dan perlu rollback:

```bash
# 1. Rollback migration
php artisan migrate:rollback --step=1

# 2. Revert code
git revert HEAD
git push origin main

# 3. Di server
git pull origin main
php artisan config:clear
php artisan cache:clear
```

---

## 📞 Support

Jika ada masalah:

1. Check logs: `storage/logs/laravel.log`
2. Check scheduler: `php artisan schedule:list`
3. Test manual: `php artisan reminders:send-deadline`
4. Check Fonnte API status: https://api.fonnte.com

---

## ✅ Post-Deployment Checklist

- [ ] Code pushed to server
- [ ] Migration executed successfully
- [ ] `.env` configured with Fonnte token
- [ ] Cron job setup and verified
- [ ] Queue worker running (if using queue)
- [ ] Test command executed successfully
- [ ] Logs showing correct execution
- [ ] Users informed about new feature
- [ ] Documentation shared with team

---

**Deployment Date**: _________________

**Deployed By**: _________________

**Server**: _________________

**Status**: ⬜ Success  ⬜ Failed  ⬜ Partial

**Notes**: _________________
