<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($this->user()->id)],
            'phone' => ['nullable', 'string', 'regex:/^62[0-9]{9,12}$/', 'max:15', Rule::unique(User::class)->ignore($this->user()->id)],
            'timezone' => ['required', 'string', Rule::in(['WIB', 'WITA', 'WIT'])],
            'default_reminder_enabled' => ['nullable', 'boolean'],
            'default_reminder_time' => ['nullable', 'string', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d$/'],
            'default_reminder_days_before' => ['nullable', 'integer', 'min:0', 'max:7'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'default_reminder_enabled' => $this->boolean('default_reminder_enabled'),
            'default_reminder_time' => $this->input('default_reminder_time', '09:00'),
            'default_reminder_days_before' => (int) $this->input('default_reminder_days_before', 1),
        ]);
    }
}
