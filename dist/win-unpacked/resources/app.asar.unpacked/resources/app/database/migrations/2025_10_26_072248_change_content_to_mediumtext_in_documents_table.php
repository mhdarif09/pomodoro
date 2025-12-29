<?php

use Illuminate\Database\Migrations\Migration;
// Impor 'DB' untuk bisa menjalankan perintah SQL mentah
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Jalankan migrasi.
     */
    public function up(): void
    {
        // Jalankan perintah SQL langsung untuk mengubah tipe kolom
        // Perintah ini spesifik untuk MySQL/MariaDB
        DB::statement("ALTER TABLE documents MODIFY COLUMN content MEDIUMTEXT NULL");
    }

    /**
     * Batalkan migrasi.
     */
    public function down(): void
    {
        // Jalankan perintah SQL langsung untuk mengembalikan tipe kolom ke JSON
        DB::statement("ALTER TABLE documents MODIFY COLUMN content JSON NULL");
    }
};