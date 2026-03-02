<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReflectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_answer' => 'required|string|max:5000',
            'ai_question' => 'nullable|string|max:1000',
        ];
    }
}
