<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MemoryAgentService;
use Illuminate\Http\Request;

class SmartSuggestionsController extends Controller
{
    protected $memoryService;

    public function __construct(MemoryAgentService $memoryService)
    {
        $this->memoryService = $memoryService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        $suggestions = $this->memoryService->getSmartSuggestions($user);
        
        $heatmap = $request->has('include_heatmap') 
            ? $this->memoryService->getProductivityHeatmap($user) 
            : null;

        return response()->json([
            'suggestions' => $suggestions,
            'heatmap' => $heatmap
        ]);
    }
}
