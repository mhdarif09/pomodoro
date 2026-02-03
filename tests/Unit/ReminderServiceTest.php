<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\ReminderService;
use App\Services\FonnteService;
use App\Services\HabitService;
use App\Models\User;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class ReminderServiceTest extends TestCase
{
    use RefreshDatabase;

    private $reminderService;
    private $fonnteMock;
    private $habitMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->fonnteMock = Mockery::mock(FonnteService::class);
        $this->habitMock = Mockery::mock(HabitService::class);
        
        $this->reminderService = new ReminderService($this->fonnteMock, $this->habitMock);
    }

    public function test_it_sends_deadline_reminder()
    {
        $user = User::factory()->create(['phone' => '081234567890']);
        
        // Create urgent task
        Task::factory()->create([
            'user_id' => $user->id,
            'due_date' => Carbon::now()->addHours(2),
            'status' => 'todo'
        ]);

        $this->habitMock->shouldReceive('isPeakTime')->andReturn(false);
        
        // Expect sendMessage to be called
        $this->fonnteMock->shouldReceive('sendMessage')
            ->once()
            ->withArgs(function ($phone, $message) {
                return $phone === '081234567890' && str_contains($message, 'You have 1 tasks due soon');
            });

        $this->reminderService->sendContextualReminder($user);
    }

    public function test_it_sends_peak_time_reminder()
    {
        $user = User::factory()->create(['phone' => '081234567890']);
        
        $this->habitMock->shouldReceive('isPeakTime')->andReturn(true);
        
        $this->fonnteMock->shouldReceive('sendMessage')
            ->once()
            ->withArgs(function ($phone, $message) {
                return str_contains($message, "usually you're on fire at this time");
            });

        $this->reminderService->sendContextualReminder($user);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
