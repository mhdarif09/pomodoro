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
        // 1. Fix User Points Table
        Schema::table('user_points', function (Blueprint $table) {
            if (!Schema::hasColumn('user_points', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('user_points', 'current_points')) {
                $table->integer('current_points')->default(0);
            }
            if (!Schema::hasColumn('user_points', 'lifetime_points')) {
                $table->integer('lifetime_points')->default(0);
            }
        });

        // 2. Fix Point Transactions Table
        Schema::table('point_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('point_transactions', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('point_transactions', 'amount')) {
                $table->integer('amount')->default(0);
            }
            if (!Schema::hasColumn('point_transactions', 'type')) {
                // Wait, based on previous step, I agreed to use 'reason' instead of 'type'/'description' 
                // BUT the migration I read earlier (2025_12_28_183051) which seemingly CREATED xp_transactions (Wait, no).
                // I am looking at 'point_transactions', NOT 'xp_transactions'.
                // 'point_transactions' is a separate table created in '2026_01_02_213500'.
                // Let's stick to the schema defined in '2026_01_02_213500' for point_transactions.
                // It had: amount, type, source_type, source_id, description.
                
                $table->string('type')->nullable(); // earned, redeemed
            }
            if (!Schema::hasColumn('point_transactions', 'source_type')) {
                $table->string('source_type')->nullable();
            }
            if (!Schema::hasColumn('point_transactions', 'source_id')) {
                $table->unsignedBigInteger('source_id')->nullable();
            }
            if (!Schema::hasColumn('point_transactions', 'description')) {
                $table->string('description')->nullable();
            }
        });

        // 3. Fix Cashback Redemptions Table
        Schema::table('cashback_redemptions', function (Blueprint $table) {
            if (!Schema::hasColumn('cashback_redemptions', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('cashback_redemptions', 'points_spent')) {
                $table->integer('points_spent')->default(0);
            }
            if (!Schema::hasColumn('cashback_redemptions', 'cashback_value')) {
                $table->decimal('cashback_value', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('cashback_redemptions', 'promo_code')) {
                $table->string('promo_code')->nullable()->unique();
            }
            if (!Schema::hasColumn('cashback_redemptions', 'is_used')) {
                $table->boolean('is_used')->default(false);
            }
            if (!Schema::hasColumn('cashback_redemptions', 'used_at')) {
                $table->timestamp('used_at')->nullable();
            }
            if (!Schema::hasColumn('cashback_redemptions', 'subscription_id')) {
                $table->unsignedBigInteger('subscription_id')->nullable();
            }
            if (!Schema::hasColumn('cashback_redemptions', 'expires_at')) {
                $table->timestamp('expires_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Dropping columns is complex in SQLite/others without specific handling, 
        // usually safer to just ignore down or drop table if it was this specific migration creating them (which it isn't).
    }
};
