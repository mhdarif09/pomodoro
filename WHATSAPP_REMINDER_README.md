# WhatsApp Reminder Feature

Fitur otomatis untuk mengirim reminder WhatsApp H-1 sebelum deadline task menggunakan Fonnte API.

## 🎯 Fitur

- ✅ Notifikasi WhatsApp otomatis untuk task yang deadline besok
- ✅ User bisa update nomor WhatsApp sendiri via Profile
- ✅ Scheduler otomatis jalan setiap hari jam 09:00
- ✅ Hanya kirim untuk task yang belum selesai
- ✅ Logging lengkap untuk monitoring

## 📱 Format Pesan

```
🔔 *Reminder Task Deadline*

Halo {nama}! 👋

Task *"{judul_task}"* akan deadline besok ({tanggal})!

Jangan lupa diselesaikan ya 😊

Semangat! 💪
```

## 🚀 Quick Setup

### 1. Environment
```env
FONNTE_API_TOKEN=your_token_here
```

### 2. Migration
```bash
php artisan migrate
```

### 3. Cron Job
```bash
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

### 4. User Setup
1. Login → Profile
2. Isi WhatsApp Number: `628123456789`
3. Save

## 🧪 Testing

```bash
# Test manual
php artisan reminders:send-deadline

# Check scheduler
php artisan schedule:list

# Check logs
tail -f storage/logs/laravel.log | grep deadline
```

## 📁 Files

### New Files:
- `app/Services/FonnteService.php`
- `app/Jobs/SendTaskDeadlineReminders.php`
- `app/Console/Commands/SendDeadlineReminders.php`
- `database/migrations/2025_11_22_135648_add_phone_to_users_table.php`

### Modified Files:
- `app/Models/User.php`
- `app/Console/Kernel.php`
- `config/services.php`
- `app/Http/Requests/ProfileUpdateRequest.php`
- `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx`
- `resources/js/Layouts/AuthenticatedLayout.jsx`

## 📖 Documentation

Lihat [DEPLOYMENT_WHATSAPP_REMINDER.md](DEPLOYMENT_WHATSAPP_REMINDER.md) untuk panduan deployment lengkap.

## 🔧 Troubleshooting

**Notifikasi tidak terkirim?**
1. Check token: `php artisan tinker --execute="echo config('services.fonnte.token');"`
2. Check user phone: Pastikan format `628xxx`
3. Check logs: `tail -f storage/logs/laravel.log`

**Scheduler tidak jalan?**
1. Verify cron: `crontab -l`
2. Test manual: `php artisan schedule:run`
3. Check logs: `grep CRON /var/log/syslog`

## 📊 Monitoring

```bash
# Check recent activity
tail -50 storage/logs/laravel.log | grep "deadline"

# Count reminders sent today
grep "Deadline reminder sent successfully" storage/logs/laravel.log | grep "$(date +%Y-%m-%d)" | wc -l
```

## 🎯 How It Works

1. **Scheduler** runs daily at 09:00
2. **Job** queries tasks with `due_date = tomorrow` and `is_completed = false`
3. **Service** sends WhatsApp via Fonnte API
4. **Logs** all activities for monitoring

## 🔐 Security

- Token stored in `.env` (gitignored)
- Phone validation with regex
- Only sends to valid phone numbers
- Full activity logging

## 📝 License

Part of Pomodoro App
