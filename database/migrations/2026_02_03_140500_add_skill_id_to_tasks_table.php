<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Cleanup from potential failed migrations
        if (Schema::hasColumn('tasks', 'skill_id')) {
            Schema::table('tasks', function (Blueprint $table) {
                // We don't try to drop foreign key here because we assume it failed to be created
                // If it existed, we'd need to drop it first. 
                // But generally dropColumn drops FKs too in some DBs, or we can try/catch.
                // Let's just drop the column.
                $table->dropColumn('skill_id');
            });
        }

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('skill_id')->nullable()->constrained('skills')->nullOnDelete()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['skill_id']);
            $table->dropColumn('skill_id');
        });
    }
};
