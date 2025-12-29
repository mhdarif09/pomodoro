<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AIAssistantPageController extends Controller
{
    public function index()
    {
        return Inertia::render('AIAssistant/Index');
    }
}
