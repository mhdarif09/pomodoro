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
        Schema::table('xp_payouts', function (Blueprint $table) {
            $table->decimal('fee', 10, 2)->default(0)->after('amount_idr');
            $table->decimal('net_amount_idr', 10, 2)->default(0)->after('fee');
            $table->string('payment_method')->nullable()->after('payment_details');
            $table->string('account_number')->nullable()->after('payment_method');
            $table->string('account_name')->nullable()->after('account_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('xp_payouts', function (Blueprint $table) {
            $table->dropColumn(['fee', 'net_amount_idr', 'payment_method', 'account_number', 'account_name']);
        });
    }
};
