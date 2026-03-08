<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Guild;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('guilds', function (Blueprint $table) {
            $table->string('invite_code', 10)->nullable()->unique()->after('emblem');
        });

        // Generate codes for existing guilds
        Guild::chunk(100, function ($guilds) {
            foreach ($guilds as $guild) {
                $guild->update(['invite_code' => strtoupper(Str::random(8))]);
            }
        });
        
        // Make non-nullable after filling
        Schema::table('guilds', function (Blueprint $table) {
            $table->string('invite_code', 10)->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guilds', function (Blueprint $table) {
            $table->dropColumn('invite_code');
        });
    }
};
