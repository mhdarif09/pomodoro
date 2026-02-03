<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\BossBattleService;
use App\Models\User;
use App\Models\Task;
use App\Models\Subtask;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BossBattleServiceTest extends TestCase
{
    use RefreshDatabase;

    private $bossService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->bossService = new BossBattleService();
    }

    public function test_it_identifies_boss_tasks()
    {
        $user = User::factory()->create();

        // Create a user task directly with high priority
        $bossTask = Task::factory()->create([
            'user_id' => $user->id, 
            'title' => 'Big Project',
            'priority' => 'Tinggi', 
            'estimated_minutes' => 300, // > 240
            'status' => 'todo'
        ]);

        // Create a normal task
        Task::factory()->create([
            'user_id' => $user->id,
            'title' => 'Small Task',
            'priority' => 'Rendah',
            'estimated_minutes' => 30,
            'status' => 'todo'
        ]);

        $bosses = $this->bossService->getActiveBosses($user);

        $this->assertCount(1, $bosses);
        $this->assertEquals('Big Project', $bosses->first()['name']);
    }

    public function test_it_calculates_boss_health()
    {
        $user = User::factory()->create();
        $bossTask = Task::factory()->create([
            'user_id' => $user->id,
            'priority' => 'Tinggi',
            'status' => 'todo'
        ]);

        // Add 5 subtasks
        $subtasks = [];
        for ($i=0; $i<5; $i++) {
            $subtasks[] = $bossTask->subtasks()->create(['title' => "Subtask $i", 'is_completed' => false]);
        }

        // Complete 1 subtask
        $subtasks[0]->update(['is_completed' => true]);

        $bosses = $this->bossService->getActiveBosses($user);
        $boss = $bosses->first();

        // 5 total, 1 done. 4 remaining. Health = 80%.
        $this->assertEquals(80, $boss['health_percent']);
        $this->assertEquals('Strong 💪', $boss['status']);
    }
}
