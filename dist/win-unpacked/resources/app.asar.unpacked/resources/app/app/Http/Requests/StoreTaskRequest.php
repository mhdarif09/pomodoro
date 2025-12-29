<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Izinkan semua user yang terotentikasi
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000', // Max 2000 chars untuk security
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'document' => 'nullable|file|mimes:pdf,jpg,png,doc,docx|max:2048',
            'status' => 'nullable|in:todo,in_progress,done', // Whitelist status values
            'estimated_minutes' => 'nullable|integer|min:0',
            'subtasks' => 'nullable|array',
            'subtasks.*.title' => 'required|string|max:255',
        ];
    }

    /**
     * Prepare the data for validation - sanitize inputs
     */
    protected function prepareForValidation()
    {
        // Sanitize title and description
        if ($this->has('title')) {
            $this->merge([
                'title' => strip_tags($this->title), // Remove HTML tags
            ]);
        }

        if ($this->has('description')) {
            $this->merge([
                'description' => strip_tags($this->description), // Remove HTML tags
            ]);
        }
    }
}