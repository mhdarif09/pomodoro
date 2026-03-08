# User Tutorial & WhatsApp Warning - Feature Documentation

Fitur baru untuk membantu onboarding user baru dan memastikan mereka setup nomor WhatsApp untuk reminder.

---

## 🎯 Fitur Baru

### 1. **WhatsApp Warning Modal** ⚠️
- **Trigger**: User login tapi belum mengisi nomor HP di profile.
- **Action**: Muncul pop-up modal yang tidak bisa diclose sembarangan (harus klik tombol).
- **Options**:
  - "Setup Sekarang" -> Redirect ke Profile page.
  - "Nanti Saja" -> Close modal (akan muncul lagi next login/refresh).

### 2. **New User Tutorial** 🎓
- **Library**: `driver.js`
- **Trigger**: User baru login pertama kali (atau `has_seen_tutorial` = false).
- **Flow**:
  1. **Welcome**: Intro ke Dashboard.
  2. **Learning Hub**: Penjelasan fitur Pomodoro & Materi.
  3. **Documents & Kanban**: Penjelasan fitur manajemen tugas.
  4. **Profile**: Penjelasan setup akun & notifikasi.
- **Completion**: Setelah selesai/skip, status `has_seen_tutorial` diupdate jadi `true` via API.

---

## 📁 Files Created/Modified

### New Files:
- `database/migrations/2025_11_23_050531_add_has_seen_tutorial_to_users_table.php`
- `resources/js/Components/WhatsAppWarningModal.jsx`
- `resources/js/Components/TutorialGuide.jsx`

### Modified Files:
- `resources/js/Layouts/AuthenticatedLayout.jsx` - Integrated components
- `app/Http/Controllers/ProfileController.php` - Added `markTutorialSeen` method
- `routes/web.php` - Added API route

---

## 🚀 Deployment Steps

### 1. Run Migration
```bash
cd /var/www/sarangtumbuh
php artisan migrate
```

### 2. Install Dependencies
```bash
npm install driver.js
npm run build
```

---

## 🧪 Testing Guide

### Test 1: WhatsApp Warning
1. Login sebagai user yang **belum** punya nomor HP.
2. Refresh halaman Dashboard.
3. **Expected**: Muncul modal "Setup Nomor WhatsApp".
4. Klik "Setup Sekarang" -> Redirect ke Profile.
5. Isi nomor HP -> Save.
6. Refresh halaman -> **Expected**: Modal TIDAK muncul lagi.

### Test 2: User Tutorial
1. Login sebagai user baru (atau reset database).
2. Masuk ke Dashboard.
3. **Expected**: Tutorial tour dimulai otomatis.
4. Ikuti langkah-langkah (Next -> Next).
5. Klik "Selesai".
6. Refresh halaman -> **Expected**: Tutorial TIDAK muncul lagi.

### Test 3: Reset Tutorial (Manual)
```bash
php artisan tinker
>>> \App\Models\User::find(1)->update(['has_seen_tutorial' => false]);
```
Refresh halaman -> Tutorial harus muncul lagi.
