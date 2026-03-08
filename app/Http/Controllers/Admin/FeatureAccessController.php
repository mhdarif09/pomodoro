<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Inertia\Inertia;

class FeatureAccessController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/FeatureAccess', [
            'settings' => Setting::where('group', 'system')->pluck('value', 'key'),
        ]);
    }
}
