<?php

namespace App\Providers;

// [ PENAMBAHAN 1: Impor kelas Task dan TaskPolicy ]
use App\Models\Task;
use App\Policies\TaskPolicy;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // [ PENAMBAHAN 2: Daftarkan TaskPolicy di sini ]
        Task::class => TaskPolicy::class,
        Document::class => DocumentPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // [ KODE ASLI ANDA - TIDAK DIUBAH ]
        $this->registerPolicies();

        // [ KODE ASLI ANDA - TIDAK DIUBAH ]
        // Definisikan Gate untuk admin
        Gate::define('viewAdmin', function (User $user) {
            return $user->role === 'admin';
        });

        
    }
}