<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\PomodoroSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PomodoroSession>
 */
class PomodoroSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'focus_minutes' => 25,
            'break_minutes' => 5,
            'started_at' => now(),
            'ended_at' => now()->addMinutes(25),
        ];
    }
}
