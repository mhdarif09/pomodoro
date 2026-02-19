<?php

namespace App\Services;

use App\Models\User;
use App\Models\Task;
use Google\Client as GoogleClient;
use Google\Service\Calendar as GoogleCalendar;
use Google\Service\Calendar\Event;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GoogleCalendarService
{
    protected $client;

    public function __construct()
    {
        $this->client = new GoogleClient();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setAccessType('offline');
    }

    /**
     * Setup client for a specific user.
     * Refreshes token if expired.
     */
    protected function setupClient(User $user)
    {
        if (!$user->google_access_token) {
            return false;
        }

        $this->client->setAccessToken($user->google_access_token);

        if ($this->client->isAccessTokenExpired()) {
            if ($user->google_refresh_token) {
                try {
                    $newAccessToken = $this->client->fetchAccessTokenWithRefreshToken($user->google_refresh_token);
                    
                    if (!isset($newAccessToken['error'])) {
                        $user->update([
                            'google_access_token' => $newAccessToken['access_token'],
                            'google_token_expires_at' => now()->addSeconds($newAccessToken['expires_in']),
                        ]);
                        $this->client->setAccessToken($newAccessToken['access_token']);
                    } else {
                        Log::error('Failed to refresh Google token', ['error' => $newAccessToken]);
                        return false;
                    }
                } catch (\Exception $e) {
                    Log::error('Exception refreshing Google token: ' . $e->getMessage());
                    return false;
                }
            } else {
                return false; // Token expired and no refresh token
            }
        }

        return true;
    }

    /**
     * Get upcoming events for context (Read-Only)
     */
    public function getUpcomingEvents(User $user, $days = 1)
    {
        if (!$this->setupClient($user)) return [];

        $service = new GoogleCalendar($this->client);
        $calendarId = $user->google_calendar_id ?? 'primary';
        
        $start = Carbon::now()->toRfc3339String();
        $end = Carbon::now()->addDays($days)->endOfDay()->toRfc3339String();

        try {
            $events = $service->events->listEvents($calendarId, [
                'timeMin' => $start,
                'timeMax' => $end,
                'orderBy' => 'startTime',
                'singleEvents' => true,
            ]);

            return collect($events->getItems())->map(function ($event) {
                // Determine start/end time (handling full-day events)
                $start = $event->start->dateTime ?? $event->start->date;
                $end = $event->end->dateTime ?? $event->end->date;
                
                return [
                    'id' => $event->id,
                    'summary' => $event->summary,
                    'start' => Carbon::parse($start)->format('Y-m-d H:i'),
                    'end' => Carbon::parse($end)->format('Y-m-d H:i'),
                    'is_all_day' => !isset($event->start->dateTime),
                ];
            });

        } catch (\Exception $e) {
            Log::error('GCal List Events Error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Create or Update an event for a Task (Sync)
     */
    public function syncTaskToCalendar(User $user, Task $task)
    {
        if (!$this->setupClient($user)) return false;

        $service = new GoogleCalendar($this->client);
        $calendarId = $user->google_calendar_id ?? 'primary';

        // Prepare Event Data
        $summary = "Focus: " . $task->title;
        $description = $task->description ?? '';
        
        // Default duration 30 mins if not set
        $duration = $task->estimated_minutes ?? 30;
        
        // If task has scheduled time, use it. Otherwise use due date or now.
        // Logic: specific 'start_date' > 'due_date' (all day) > now
        if ($task->start_date) {
            $start = Carbon::parse($task->start_date); // Assume has time? If date defined usually date
            // If just date, treat as all day? For now let's assume specific block if 'reminder_at' exists?
            // Simplified: Use now if no specific time block, or use a default slot tomorrow.
        } 
        
        // Basic impl: Create event at the due_date (All Day) or specific time?
        // Proposal: If no specific time, don't auto-schedule blindly.
        // User asked for "Auto-sync new tasks". Best practice: All-Day event on Due Date.
        
        if (!$task->due_date) return false;

        $startDt = Carbon::parse($task->due_date);
        
        $eventData = new Event([
            'summary' => $summary,
            'description' => $description,
            'start' => ['date' => $startDt->format('Y-m-d')],
            'end' => ['date' => $startDt->format('Y-m-d')],
        ]);

        try {
            $service->events->insert($calendarId, $eventData);
            return true;
        } catch (\Exception $e) {
            Log::error('GCal Insert Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Smart Time Blocking (Premium)
     * Finds a free slot of $minutes duration on $date and books it.
     */
    /**
     * Get Free Slots for a given date
     * Default: 09:00 - 17:00
     */
    public function findFreeSlots(User $user, $date = null)
    {
        if (!$this->setupClient($user)) return [];

        $targetDate = $date ? Carbon::parse($date) : Carbon::today();
        $service = new GoogleCalendar($this->client);
        $calendarId = $user->google_calendar_id ?? 'primary';

        // Define working hours (09:00 - 17:00)
        $workStart = $targetDate->copy()->setHour(9)->setMinute(0)->setSecond(0);
        $workEnd = $targetDate->copy()->setHour(17)->setMinute(0)->setSecond(0);

        // Fetch Busy Slots
        $freebusy = $service->freebusy->query(new \Google\Service\Calendar\FreeBusyRequest([
            'timeMin' => $workStart->toRfc3339String(),
            'timeMax' => $workEnd->toRfc3339String(),
            'items' => [['id' => $calendarId]],
        ]));

        $busySlots = $freebusy->getCalendars()[$calendarId]->getBusy();
        
        $freeSlots = [];
        $currentStart = $workStart->copy();

        foreach ($busySlots as $busy) {
            $busyStart = Carbon::parse($busy['start']);
            $busyEnd = Carbon::parse($busy['end']);

            // If busy block starts after current start time, we have a gap
            if ($busyStart->gt($currentStart)) {
                $duration = $currentStart->diffInMinutes($busyStart);
                if ($duration >= 15) { // Minimum 15 mins
                    $freeSlots[] = [
                        'start' => $currentStart->format('H:i'),
                        'end' => $busyStart->format('H:i'),
                        'duration' => $duration,
                        'start_dt' => $currentStart->copy(),
                        'end_dt' => $busyStart->copy()
                    ];
                }
            }

            // Move pointer to end of this busy block
            if ($busyEnd->gt($currentStart)) {
                $currentStart = $busyEnd;
            }
        }

        // Check for slot after last busy block until workEnd
        if ($currentStart->lt($workEnd)) {
            $duration = $currentStart->diffInMinutes($workEnd);
            if ($duration >= 15) {
                $freeSlots[] = [
                    'start' => $currentStart->format('H:i'),
                    'end' => $workEnd->format('H:i'),
                    'duration' => $duration,
                    'start_dt' => $currentStart->copy(),
                    'end_dt' => $workEnd->copy()
                ];
            }
        }

        return $freeSlots;
    }

    /**
     * Auto Schedule High Priority Tasks to Free Slots
     */
    public function autoScheduleTasks(User $user)
    {
        if (!$this->setupClient($user)) return ['success' => false, 'message' => 'Gagal koneksi GCal.'];

        // 1. Get High Priority Tasks (Not Completed, Todo/Progress)
        $tasks = Task::where('user_id', $user->id)
            ->whereIn('status', ['todo', 'in_progress'])
            ->where('is_completed', false)
            ->whereNull('start_date') // Only schedule unscheduled tasks
            ->orderByRaw("FIELD(priority, 'Mendesak', 'Tinggi', 'Sedang', 'Rendah')")
            ->orderBy('due_date', 'asc') // Sooner deadline first
            ->limit(10)
            ->get();

        if ($tasks->isEmpty()) {
            return ['success' => true, 'message' => 'Tidak ada tugas prioritas yang perlu dijadwalkan.', 'scheduled_count' => 0];
        }

        // 2. Find Free Slots for Today & Tomorrow
        $slotsToday = $this->findFreeSlots($user, Carbon::today());
        $slotsTomorrow = $this->findFreeSlots($user, Carbon::tomorrow());
        
        // Merge slots
        $allSlots = array_merge($slotsToday, $slotsTomorrow);

        $scheduledCount = 0;
        $service = new GoogleCalendar($this->client);
        $calendarId = $user->google_calendar_id ?? 'primary';

        foreach ($tasks as $task) {
            $taskDuration = $task->estimated_minutes ?? 30; // Default 30 min
            
            // Find fitting slot
            foreach ($allSlots as $key => $slot) {
                if ($slot['duration'] >= $taskDuration) {
                    // Schedule here!
                    $startDt = $slot['start_dt'];
                    $endDt = $startDt->copy()->addMinutes($taskDuration);

                    // Create GCal Event
                    $event = new Event([
                        'summary' => "⚡ Focus: " . $task->title,
                        'description' => "Auto-scheduled by AI Assistant\n" . ($task->description ?? ''),
                        'start' => ['dateTime' => $startDt->toRfc3339String()],
                        'end' => ['dateTime' => $endDt->toRfc3339String()],
                        'colorId' => '10' // Basil (Greenish)
                    ]);

                    try {
                        $service->events->insert($calendarId, $event);

                        // Update Task in DB
                        $task->update([
                            'start_date' => $startDt->format('Y-m-d'),
                            'start_time' => $startDt->format('H:i'), // Assuming you might add this column or just ignore
                            'notes' => ($task->notes ?? "") . "<p><i>Auto-scheduled for " . $startDt->format('d M H:i') . "</i></p>"
                        ]);

                        $scheduledCount++;

                        // Consume slot (Update duration/start or remove)
                        // Simplified: Modify slot for next iteration
                        $newDuration = $slot['duration'] - $taskDuration;
                        if ($newDuration >= 15) {
                            $allSlots[$key]['start_dt'] = $endDt;
                            $allSlots[$key]['duration'] = $newDuration;
                        } else {
                            unset($allSlots[$key]);
                        }
                        
                        break; // Move to next task
                    } catch (\Exception $e) {
                        Log::error("Failed to auto-schedule task {$task->id}: " . $e->getMessage());
                    }
                }
            }
        }

        return [
            'success' => true, 
            'message' => "Berhasil menjadwalkan {$scheduledCount} tugas prioritas!",
            'scheduled_count' => $scheduledCount
        ];
    }
}
