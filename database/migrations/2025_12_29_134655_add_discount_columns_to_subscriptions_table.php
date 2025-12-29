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
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->default(0)->after('status');
            $table->string('duration')->default('monthly')->after('price');
            $table->string('promo_code')->nullable()->after('duration');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('promo_code');
            $table->decimal('final_price', 12, 2)->nullable()->after('discount_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            //
        });
    }
};
