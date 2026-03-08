<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Tambahkan kolom 'user_id' sebagai foreign key yang terhubung ke tabel 'users'
            $table->foreignId('user_id')
                  ->after('id') // (Opsional) Menempatkan kolom ini setelah 'id' agar rapi
                  ->constrained() // Menghubungkan ke tabel 'users'
                  ->onDelete('cascade'); // Jika user dihapus, semua tugasnya juga ikut terhapus
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Logika untuk rollback: hapus foreign key, lalu hapus kolomnya
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};