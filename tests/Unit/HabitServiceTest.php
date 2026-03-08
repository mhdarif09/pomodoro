<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\HabitService;
use App\Models\User;
use App\Models\PomodoroSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class HabitServiceTest extends TestCase
{
    use RefreshDatabase;

    private $habitService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->habitService = new HabitService();
    }

    public function test_it_identifies_peak_hours()
    {
        $user = User::factory()->create();

        // Create 5 sessions at 8 PM (20:00)
        for ($i = 0; $i < 5; $i++) {
            PomodoroSession::factory()->create([
                'user_id' => $user->id,
                'started_at' => Carbon::now()->setHour(20)->subDays($i),
                'ended_at' => Carbon::now()->setHour(20)->addMinutes(25)->subDays($i),
            ]);
        }

        // Create 2 sessions at 10 AM (10:00)
        for ($i = 0; $i < 2; $i++) {
            PomodoroSession::factory()->create([
                'user_id' => $user->id,
                'started_at' => Carbon::now()->setHour(10)->subDays($i),
                'ended_at' => Carbon::now()->setHour(10)->addMinutes(25)->subDays($i),
            ]);
        }

        $peakHours = $this->habitService->getPeakHours($user);

        // Should return 20 (8 PM) as the top peak hour
        $this->assertEquals(20, $peakHours[0]);
    }

    public function test_it_assigns_night_owl_persona()
    {
        $user = User::factory()->create();

        // Create sessions at 9 PM (21:00)
        PomodoroSession::factory()->count(3)->create([
            'user_id' => $user->id,
            'started_at' => Carbon::now()->setHour(21),
            'ended_at' => Carbon::now()->setHour(21)->addMinutes(25),
        ]);

        $persona = $this->habitService->getProductivityPersona($user);

        $this->assertStringContainsString('Night Owl', $persona);
    }

    public function test_it_assigns_early_bird_persona()
    {
        $user = User::factory()->create();

        // Create sessions at 7 AM
        PomodoroSession::factory()->count(3)->create([
            'user_id' => $user->id,
            'started_at' => Carbon::now()->setHour(7),
            'ended_at' => Carbon::now()->setHour(7)->addMinutes(25),
        ]);

        $persona = $this->habitService->getProductivityPersona($user);

        $this->assertStringContainsString('Early Bird', $persona);
    }
}
