<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserReminder;
use App\Services\ReminderService;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    protected ReminderService $reminderService;

    public function __construct(ReminderService $reminderService)
    {
        $this->reminderService = $reminderService;
    }

    /**
     * Get user's reminders
     */
    public function index(Request $request)
    {
        $reminders = $request->user()->reminders()->get();
        return response()->json(['reminders' => $reminders]);
    }

    /**
     * Update reminder settings
     */
    public function update(Request $request, UserReminder $reminder)
    {
        $this->authorize('update', $reminder);

        $validated = $request->validate([
            'is_active' => 'sometimes|boolean',
            'frequency' => 'sometimes|in:daily,weekly,custom',
            'preferred_time' => 'sometimes|date_format:H:i',
            'settings' => 'sometimes|array',
        ]);

        $reminder->update($validated);

        return response()->json([
            'message' => 'Reminder updated successfully',
            'reminder' => $reminder->fresh()
        ]);
    }

    /**
     * Toggle reminder on/off
     */
    public function toggle(Request $request, UserReminder $reminder)
    {
        $this->authorize('update', $reminder);

        $reminder->is_active = !$reminder->is_active;
        $reminder->save();

        return response()->json([
            'message' => $reminder->is_active ? 'Reminder activated' : 'Reminder deactivated',
            'reminder' => $reminder
        ]);
    }

    /**
     * Send test reminder
     */
    public function sendTest(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:study,deadline,habit,comeback,motivation'
        ]);

        $sent = $this->reminderService->sendReminder($request->user(), $validated['type']);

        if ($sent) {
            return response()->json(['message' => 'Test reminder sent successfully!']);
        }

        return response()->json(['error' => 'Failed to send reminder. Check your phone number.'], 400);
    }

    /**
     * Get reminder statistics
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        $stats = [
            'total_sent' => $user->reminderLogs()->count(),
            'sent_this_week' => $user->reminderLogs()->where('sent_at', '>=', now()->subWeek())->count(),
            'active_reminders' => $user->reminders()->where('is_active', true)->count(),
            'last_sent' => $user->reminderLogs()->latest('sent_at')->first()?->sent_at,
        ];

        return response()->json($stats);
    }
}
