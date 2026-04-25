<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('task'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'reminder_at' => 'nullable|date',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,csv,txt|max:10240',
            'status' => 'nullable|in:todo,in_progress,done',
            'priority' => 'nullable|string',
            'estimated_minutes' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'auto_open_url' => 'nullable|url',
        ];
    }
    
    protected function prepareForValidation()
    {
        if ($this->has('title')) {
            $this->merge(['title' => strip_tags($this->title)]);
        }
        if ($this->has('description')) {
            $this->merge(['description' => strip_tags($this->description)]);
        }
    }
}
