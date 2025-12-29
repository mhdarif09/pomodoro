{{-- resources/views/admin/dashboard.blade.php --}}
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            Admin Dashboard
        </h2>
    </x-slot>

    <div class="py-12 px-4">
        <h3 class="text-lg font-bold">Halo Admin {{ auth()->user()->name }}</h3>
        <p>Selamat datang di panel admin Pomodoro App.</p>
    </div>
</x-app-layout>
