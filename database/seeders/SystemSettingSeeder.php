<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::updateOrCreate(
            ['key' => 'google_calendar_enabled'],
            [
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'system'
            ]
        );
    }
}
