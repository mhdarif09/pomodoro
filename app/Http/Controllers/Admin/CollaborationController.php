<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CollaborationRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CollaborationController extends Controller
{
    public function index()
    {
        $requests = CollaborationRequest::latest()->paginate(20);

        return Inertia::render('Admin/Collaborations/Index', [
            'requests' => $requests
        ]);
    }

    public function update(Request $request, CollaborationRequest $collaboration)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,contacted,rejected',
        ]);

        $collaboration->update($validated);

        return redirect()->back()->with('success', 'Status updated successfully.');
    }
}
