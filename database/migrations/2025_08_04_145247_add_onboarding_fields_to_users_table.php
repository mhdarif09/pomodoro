
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
        Schema::table('users', function (Blueprint $table) {
            $table->json('growth_goals')->nullable()->after('email');
            $table->string('learning_style')->nullable()->after('growth_goals');
            $table->string('focus_time')->nullable()->after('learning_style');
            $table->text('personal_motivation')->nullable()->after('focus_time');
            $table->boolean('onboarding_complete')->default(false)->after('personal_motivation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'growth_goals',
                'learning_style',
                'focus_time',
                'personal_motivation',
                'onboarding_complete'
            ]);
        });
    }
};