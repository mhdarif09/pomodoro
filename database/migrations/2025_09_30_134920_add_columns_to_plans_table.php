<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('plans', function (Blueprint $table) {
            // Jika kolom is_active belum ada, tambahkan
            if (!Schema::hasColumn('plans', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
            
            // Jika kolom price belum ada, tambahkan
            if (!Schema::hasColumn('plans', 'price')) {
                $table->decimal('price', 10, 2)->default(0);
            }
            
            // Jika kolom duration belum ada, tambahkan
            if (!Schema::hasColumn('plans', 'duration')) {
                $table->enum('duration', ['monthly', 'yearly'])->default('monthly');
            }
        });
    }

    public function down()
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'price', 'duration']);
        });
    }
};