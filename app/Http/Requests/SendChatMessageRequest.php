<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendChatMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // We perform authorization checking inside the controller method based on session ownership and plan limits.
    }

    public function rules(): array
    {
        return [
            'message' => 'nullable|string|max:10000',
            'history' => 'nullable|array',
            'webSearch' => 'nullable|boolean',
            'tools' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // Max 10MB image
        ];
    }
}
