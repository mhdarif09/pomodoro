<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\PredictionService;
use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class PredictionServiceTest extends TestCase
{
    use RefreshDatabase;

    private $predictionService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->predictionService = new PredictionService();
    }

    public function test_it_calculates_high_probability_with_high_velocity()
    {
        $user = User::factory()->create();

        // Simulate high velocity: 5 completed tasks per day for 14 days = 70 tasks
        for($i=0; $i<70; $i++) {
            Task::factory()->create([
                'user_id' => $user->id,
                'status' => 'done',
                'updated_at' => Carbon::now()->subDays(rand(0, 13))
            ]);
        }

        // 2 tasks due today
        Task::factory()->count(2)->create([
            'user_id' => $user->id,
            'due_date' => Carbon::today(),
            'status' => 'todo'
        ]);

        $probability = $this->predictionService->calculateSuccessProbability($user);

        // Velocity = 5/day. Load = 2. Probability should be 100.
        $this->assertEquals(100, $probability);
    }

    public function test_it_calculates_low_probability_with_low_velocity()
    {
        $user = User::factory()->create();

        // Simulate low velocity: 3 completed tasks in 14 days (~0.2/day)
        Task::factory()->count(3)->create([
            'user_id' => $user->id,
            'status' => 'done',
            'updated_at' => Carbon::now()->subDays(2)
        ]);

        // 5 tasks due today
        Task::factory()->count(5)->create([
            'user_id' => $user->id,
            'due_date' => Carbon::today(),
            'status' => 'todo'
        ]);

        $probability = $this->predictionService->calculateSuccessProbability($user);

        // Velocity ~0.2. Load = 5. Probability should be very low.
        $this->assertLessThan(20, $probability);
    }
}
