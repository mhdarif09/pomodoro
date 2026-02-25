<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Display admin settings page.
     */
    public function index()
    {
        $settings = AppSetting::all()->map(function ($s) {
            return [
                'id' => $s->id,
                'key' => $s->key,
                'value' => $s->value,
                'description' => $s->description,
                'group' => $s->group,
            ];
        });

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Bulk update settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required|string',
        ]);

        foreach ($request->settings as $setting) {
            AppSetting::set($setting['key'], $setting['value']);
        }

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
