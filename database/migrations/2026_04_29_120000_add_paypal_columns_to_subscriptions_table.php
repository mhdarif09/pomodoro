<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('payment_gateway')->nullable()->after('payment_type');
            $table->string('paypal_order_id')->nullable()->after('midtrans_transaction_id');
            $table->string('paypal_capture_id')->nullable()->after('paypal_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['payment_gateway', 'paypal_order_id', 'paypal_capture_id']);
        });
    }
};
