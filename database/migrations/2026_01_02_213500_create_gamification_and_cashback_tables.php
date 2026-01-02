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
        // 1. User Points Table
        if (!Schema::hasTable('user_points')) {
            Schema::create('user_points', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->integer('current_points')->default(0);
                $table->integer('lifetime_points')->default(0);
                $table->timestamps();
            });
        }

        // 2. Point Transactions Table
        if (!Schema::hasTable('point_transactions')) {
            Schema::create('point_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->integer('amount'); // Positive for earned, negative for spent
                $table->string('type'); // earned, redeemed, expired, adjustment
                $table->string('source_type')->nullable(); // Class name of source
                $table->unsignedBigInteger('source_id')->nullable(); // ID of source
                $table->string('description')->nullable();
                $table->timestamps();
            });
        }

        // 3. Cashback Redemptions Table
        if (!Schema::hasTable('cashback_redemptions')) {
            Schema::create('cashback_redemptions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->integer('points_spent');
                $table->decimal('cashback_value', 10, 2); // IDR value
                $table->string('promo_code')->unique();
                $table->boolean('is_used')->default(false);
                $table->timestamp('used_at')->nullable();
                $table->unsignedBigInteger('subscription_id')->nullable(); 
                $table->timestamp('expires_at');
                $table->timestamps();
            });
        }

        // 4. Update Challenges Table
        if (Schema::hasTable('challenges') && !Schema::hasColumn('challenges', 'points_reward')) {
            Schema::table('challenges', function (Blueprint $table) {
                $table->integer('points_reward')->default(0)->after('xp_reward');
            });
        }

        // 5. Update Promos Table
        if (Schema::hasTable('promos')) {
            Schema::table('promos', function (Blueprint $table) {
                if (!Schema::hasColumn('promos', 'is_cashback_promo')) {
                    $table->boolean('is_cashback_promo')->default(false)->after('is_active');
                }
                if (!Schema::hasColumn('promos', 'cashback_redemption_id')) {
                    $table->unsignedBigInteger('cashback_redemption_id')->nullable()->after('is_cashback_promo');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promos', function (Blueprint $table) {
            $table->dropColumn(['is_cashback_promo', 'cashback_redemption_id']);
        });

        Schema::table('challenges', function (Blueprint $table) {
            $table->dropColumn('points_reward');
        });

        Schema::dropIfExists('cashback_redemptions');
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('user_points');
    }
};
