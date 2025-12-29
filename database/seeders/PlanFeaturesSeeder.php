<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanFeaturesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * This seeder populates the features field for existing plans
     */
    public function run(): void
    {
        // Free Plan Features
        $freeFeatures = [
            'Pomodoro Timer Basic',
            'Kanban Board (3 tasks)',
            'Learning Dashboard',
            'Gamification (Level & XP)',
            'Akses Komunitas'
        ];

        // Premium Features (Monthly & Yearly)
        $premiumFeatures = [
            'Semua Fitur Free',
            'Pomodoro Timer Unlimited',
            'Kanban Board Unlimited',
            'AI Genius Assistant',
            'Auto Open URL',
            'Laporan Produktivitas',
            'Priority Support',
            'Gamification Lengkap'
        ];

        // Update Free Plans
        Plan::where('price', 0)
            ->orWhere('name', 'LIKE', '%free%')
            ->orWhere('name', 'LIKE', '%gratis%')
            ->orWhere('name', 'LIKE', '%explorer%')
            ->update(['features' => json_encode($freeFeatures)]);

        // Update Premium Plans (Monthly)
        Plan::where('price', '>', 0)
            ->where(function($query) {
                $query->where('duration', 'monthly')
                      ->orWhere('name', 'LIKE', '%monthly%')
                      ->orWhere('name', 'LIKE', '%bulanan%')
                      ->orWhere('name', 'LIKE', '%navigator%')
                      ->orWhere('name', 'LIKE', '%premium%');
            })
            ->where('duration', '!=', 'yearly')
            ->update(['features' => json_encode($premiumFeatures)]);

        // Update Premium Plans (Yearly) - with bonus feature
        $yearlyFeatures = array_merge($premiumFeatures, ['Hemat 20% - Bonus Extended AI Quota']);
        
        Plan::where('price', '>', 0)
            ->where(function($query) {
                $query->where('duration', 'yearly')
                      ->orWhere('name', 'LIKE', '%yearly%')
                      ->orWhere('name', 'LIKE', '%tahunan%')
                      ->orWhere('name', 'LIKE', '%annual%');
            })
            ->update(['features' => json_encode($yearlyFeatures)]);

        $this->command->info('Plan features updated successfully!');
        
        // Display updated plans
        $plans = Plan::all();
        foreach ($plans as $plan) {
            $this->command->info("Plan: {$plan->name} - Features: " . count($plan->features ?? []));
        }
    }
}
