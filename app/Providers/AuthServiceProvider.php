<?php
// app/Providers/AuthServiceProvider.php
namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate; // Pastikan ini di-import
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    // ... (properti $policies)

    public function boot(): void
    {
        $this->registerPolicies();

        // Definisikan Gate untuk admin
        Gate::define('viewAdmin', function (User $user) {
            return $user->role === 'admin';
        });
    }
}