<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\AutoSchedulerService;
use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class AutoSchedulerServiceTest extends TestCase
{
    use RefreshDatabase;

    private $scheduler;

    protected function setUp(): void
    {
        parent::setUp();
        $this->scheduler = new AutoSchedulerService();
    }

    public function test_it_suggests_reschedule_when_overloaded()
    {
        $user = User::factory()->create();

        // Create 6 tasks due today (Overload > 5)
        // 3 High priority (should stay)
        Task::factory()->count(3)->create([
            'user_id' => $user->id,
            'due_date' => Carbon::today(),
            'status' => 'todo',
            'priority' => 'Tinggi'
        ]);

        // 3 Low/Medium priority (should move)
        Task::factory()->count(3)->create([
            'user_id' => $user->id,
            'due_date' => Carbon::today(),
            'status' => 'todo',
            'priority' => 'Sedang'
        ]);

        $suggestion = $this->scheduler->suggestReschedule($user);

        $this->assertNotNull($suggestion);
        $this->assertEquals('rescue', $suggestion['type']);
        $this->assertEquals(3, $suggestion['tasks_count']); // Only the 3 Sedang tasks
        $this->assertEquals(Carbon::tomorrow()->toDateString(), $suggestion['target_date']);
    }

    public function test_it_does_not_suggest_reschedule_when_load_is_okay()
    {
        $user = User::factory()->create();

        // Create 2 tasks due today
        Task::factory()->count(2)->create([
            'user_id' => $user->id,
            'due_date' => Carbon::today(),
            'status' => 'todo'
        ]);

        $this->assertNull($this->scheduler->suggestReschedule($user));
    }
}
