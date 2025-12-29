<?php

namespace App\Providers;

use Native\Laravel\Facades\Window;
use Native\Laravel\Contracts\ProvidesPhpIni;
use Native\Laravel\Events\App\OpenedWithUrl;
use Illuminate\Support\Facades\Event;

class NativeAppServiceProvider implements ProvidesPhpIni
{
    /**
     * Executed once the native application has been booted.
     * Use this method to open windows, register global shortcuts, etc.
     */
    public function boot(): void
    {
        $this->configureWindow();

        // Handle Deep Linking (Back to App after Login)
        Event::listen(OpenedWithUrl::class, function (OpenedWithUrl $event) {
            $url = $event->url;
            
            // Expected format: sarangtumbuh://login?url=SIGNED_URL_HERE
            if (str_contains($url, 'sarangtumbuh://login')) {
                $query = parse_url($url, PHP_URL_QUERY);
                parse_str($query, $params);
                
                if (isset($params['url'])) {
                    Window::get()->loadURL($params['url']);
                }
            }
        });

        // Future: Register Global Shortcuts here
        // Shortcut::register('Alt+Shift+F', function() { ... });

        // Future: Register Custom Menus here
        // Menu::new()->...
    }

    /**
     * Configure the main application window.
     */
    protected function configureWindow(): void
    {
        Window::open()
            ->title('Sarang Tumbuh - Desktop')
            ->width(1280)
            ->height(832)
            ->route('login');
    }

    /**
     * Return an array of php.ini directives to be set.
     */
    public function phpIni(): array
    {
        return [
        ];
    }
}
