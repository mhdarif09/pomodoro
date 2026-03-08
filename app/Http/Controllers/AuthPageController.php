<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class AuthPageController extends Controller
{
    /**
     * Display the login view.
     */
    public function login()
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Display the registration view.
     */
    public function register()
    {
        return Inertia::render('Auth/Register');
    }
}
