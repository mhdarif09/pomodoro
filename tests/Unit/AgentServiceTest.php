<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\AgentService;
use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class AgentServiceTest extends TestCase
{
    use RefreshDatabase;

    private $agentService;
    private $habitServiceMock;
    private $predictionServiceMock;
    private $autoSchedulerServiceMock;
    private $bossBattleServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->habitServiceMock = $this->createMock(\App\Services\HabitService::class);
        $this->predictionServiceMock = $this->createMock(\App\Services\PredictionService::class);
        $this->autoSchedulerServiceMock = $this->createMock(\App\Services\AutoSchedulerService::class);
        $this->bossBattleServiceMock = $this->createMock(\App\Services\BossBattleService::class);
        
        $this->agentService = new AgentService(
            $this->habitServiceMock,
            $this->predictionServiceMock,
            $this->autoSchedulerServiceMock,
            $this->bossBattleServiceMock
        );
    }

    public function test_it_returns_low_risk_for_no_tasks()
    {
        $user = User::factory()->create();

        $result = $this->agentService->calculateRisk($user);

        $this->assertEquals('LOW', $result['level']);
        $this->assertEquals('maintain_streak', $result['action']);
    }

    public function test_it_returns_high_risk_for_overdue_tasks()
    {
        $user = User::factory()->create();
        
        // Create an overdue task
        Task::factory()->create([
            'user_id' => $user->id,
            'title' => 'Overdue Task',
            'due_date' => Carbon::now()->subDay(),
            'status' => 'todo'
        ]);

        $result = $this->agentService->calculateRisk($user);

        $this->assertEquals('HIGH', $result['level']);
        $this->assertEquals('recover_overdue', $result['action']);
    }

    public function test_it_returns_medium_risk_for_urgent_tasks()
    {
        $user = User::factory()->create();

        // Create a task due in 2 hours
        Task::factory()->create([
            'user_id' => $user->id,
            'title' => 'Urgent Task',
            'due_date' => Carbon::now()->addHours(2),
            'status' => 'todo'
        ]);

        $this->predictionServiceMock->method('calculateSuccessProbability')->willReturn(100);

        $result = $this->agentService->calculateRisk($user);

        $this->assertEquals('MEDIUM', $result['level']);
        $this->assertEquals('plan_day', $result['action']);
    }
}
