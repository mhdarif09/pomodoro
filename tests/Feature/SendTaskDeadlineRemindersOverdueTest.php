<?php

namespace Tests\Feature;

use App\Jobs\SendTaskDeadlineReminders;
use App\Models\Task;
use App\Models\User;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class SendTaskDeadlineRemindersOverdueTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that overdue reminders are sent for tasks past deadline
     */
    public function test_overdue_reminders_are_sent_for_past_deadline_tasks()
    {
        // Create user with WhatsApp enabled
        $user = User::factory()->create([
            'phone' => '62812345678',
            'default_reminder_enabled' => true,
        ]);

        // Create an overdue task (due date was 5 hours ago)
        $overdueTask = Task::factory()->create([
            'user_id' => $user->id,
            'title' => 'Overdue Task',
            'due_date' => Carbon::now()->subHours(5),
            'status' => 'active',
            'is_completed' => false,
            'overdue_reminder_sent_at' => null,
        ]);

        // Create a task with future deadline (should NOT get overdue reminder)
        $futureTask = Task::factory()->create([
            'user_id' => $user->id,
            'title' => 'Future Task',
            'due_date' => Carbon::now()->addDays(2),
            'status' => 'active',
            'is_completed' => false,
            'overdue_reminder_sent_at' => null,
        ]);

        // Mock WhatsAppService
        $this->mock(WhatsAppService::class, function (MockInterface $mock) {
            $mock->shouldReceive('sendReminder')
                ->times(1) // Only once for the overdue task
                ->andReturn(['success' => true]);
        });

        // Dispatch the job
        $job = new SendTaskDeadlineReminders();
        $job->handle(app(WhatsAppService::class));

        // Verify overdue task has timestamp set
        $this->assertNotNull($overdueTask->refresh()->overdue_reminder_sent_at);

        // Verify future task does NOT have timestamp
        $this->assertNull($futureTask->refresh()->overdue_reminder_sent_at);
    }

    /**
     * Test that overdue reminders are NOT sent if already sent within 24 hours
     */
    public function test_overdue_reminders_not_sent_if_already_sent_recently()
    {
        $user = User::factory()->create([
            'phone' => '62812345678',
            'default_reminder_enabled' => true,
        ]);

        // Create overdue task with reminder sent recently (2 hours ago)
        $sentAt = Carbon::now()->subHours(2);
        $task = Task::factory()->create([
            'user_id' => $user->id,
            'due_date' => Carbon::now()->subHours(5),
            'status' => 'active',
            'is_completed' => false,
            'overdue_reminder_sent_at' => $sentAt, // Sent recently
        ]);

        // Mock WhatsAppService - should NOT be called (reminder sent < 24h ago)
        $this->mock(WhatsAppService::class, function (MockInterface $mock) {
            $mock->shouldReceive('sendReminder')->never();
        });

        $job = new SendTaskDeadlineReminders();
        $job->handle(app(WhatsAppService::class));

        // Verify timestamp hasn't changed
        $this->assertEquals($sentAt->timestamp, $task->refresh()->overdue_reminder_sent_at->timestamp);
    }

    /**
     * Test that overdue reminders are NOT sent for completed tasks
     */
    public function test_overdue_reminders_not_sent_for_completed_tasks()
    {
        $user = User::factory()->create([
            'phone' => '62812345678',
            'default_reminder_enabled' => true,
        ]);

        // Create overdue task that is already completed
        $task = Task::factory()->create([
            'user_id' => $user->id,
            'due_date' => Carbon::now()->subHours(5),
            'status' => 'done',
            'is_completed' => true,
            'overdue_reminder_sent_at' => null,
        ]);

        // Mock WhatsAppService - should NOT be called
        $this->mock(WhatsAppService::class, function (MockInterface $mock) {
            $mock->shouldReceive('sendReminder')->never();
        });

        $job = new SendTaskDeadlineReminders();
        $job->handle(app(WhatsAppService::class));

        // Verify no reminder was sent for completed task
        $this->assertNull($task->refresh()->overdue_reminder_sent_at);
    }

    /**
     * Test that overdue reminders are NOT sent if user has WhatsApp disabled
     */
    public function test_overdue_reminders_not_sent_if_whatsapp_disabled()
    {
        $user = User::factory()->create([
            'phone' => '62812345678',
            'default_reminder_enabled' => false, // Disabled!
        ]);

        $task = Task::factory()->create([
            'user_id' => $user->id,
            'due_date' => Carbon::now()->subHours(5),
            'status' => 'active',
            'is_completed' => false,
            'overdue_reminder_sent_at' => null,
        ]);

        // Mock WhatsAppService - should NOT be called
        $this->mock(WhatsAppService::class, function (MockInterface $mock) {
            $mock->shouldReceive('sendReminder')->never();
        });

        $job = new SendTaskDeadlineReminders();
        $job->handle(app(WhatsAppService::class));

        // Verify no reminder was sent
        $this->assertNull($task->refresh()->overdue_reminder_sent_at);
    }

    /**
     * Test that overdue reminders can be resent after 24 hours
     * (prevent spam but allow periodic reminders for persistent overdue tasks)
     */
    public function test_overdue_reminders_can_be_resent_after_24_hours()
    {
        $user = User::factory()->create([
            'phone' => '62812345678',
            'default_reminder_enabled' => true,
        ]);

        // Create a task that's been overdue for 30 hours
        $task = Task::factory()->create([
            'user_id' => $user->id,
            'due_date' => Carbon::now()->subHours(30),
            'status' => 'active',
            'is_completed' => false,
            'overdue_reminder_sent_at' => Carbon::now()->subHours(25), // Sent 25 hours ago
        ]);

        $mockService = $this->mock(WhatsAppService::class, function (MockInterface $mock) {
            $mock->shouldReceive('sendReminder')
                ->times(1)
                ->andReturn(['success' => true]);
        });

        // Job run - should send reminder again (> 24h since last reminder)
        $job = new SendTaskDeadlineReminders();
        $job->handle($mockService);

        // Verify timestamp was updated to now
        $this->assertNotNull($task->refresh()->overdue_reminder_sent_at);
        $this->assertTrue($task->overdue_reminder_sent_at->isToday());
    }
}
