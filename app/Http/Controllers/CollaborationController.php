<?php

namespace App\Http\Controllers;

use App\Models\CollaborationRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CollaborationController extends Controller
{
    public function create()
    {
        return Inertia::render('Collaborate');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'type' => 'required|in:demo,collaboration,other',
            'message' => 'required|string|max:2000',
        ]);

        CollaborationRequest::create($validated);

        return redirect()->back()->with('success', 'Permintaan Anda telah dikirim! Kami akan segera menghubungi Anda.');
    }
}
