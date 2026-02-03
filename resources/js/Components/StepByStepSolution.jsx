import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LatexRenderer from './LatexRenderer';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

const StepByStepSolution = ({ content }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [steps, setSteps] = useState([]);

    useEffect(() => {
        // Parse the content to extract steps
        // Look for numbered steps like "1.", "2.", etc. or "**Step 1:**" patterns
        const parseSteps = () => {
            if (!content) return [];

            // Split by numbered patterns
            const stepRegex = /(?:^|\n)(?:\*\*)?(?:Step )?\d+\.?(?:\*\*)?[:\s]/gi;
            const parts = content.split(stepRegex);

            // Find all step headers
            const headers = content.match(stepRegex);

            if (!headers || parts.length <= 1) {
                // No clear steps found, treat whole content as one step
                return [{ title: 'Solution', content: content }];
            }

            const parsedSteps = [];
            parts.forEach((part, idx) => {
                if (idx === 0 && !part.trim()) return; // Skip empty first part

                const stepContent = part.trim();
                if (!stepContent) return;

                // Extract title from first line or use step number
                const lines = stepContent.split('\n');
                let title = lines[0];
                let body = lines.slice(1).join('\n').trim();

                // If title is very long, use generic title
                if (title.length > 80) {
                    body = stepContent;
                    title = headers && headers[idx - 1]
                        ? headers[idx - 1].trim()
                        : `Step ${parsedSteps.length + 1}`;
                }

                parsedSteps.push({
                    title: title,
                    content: body || stepContent
                });
            });

            return parsedSteps.length > 0 ? parsedSteps : [{ title: 'Solution', content: content }];
        };

        const parsedSteps = parseSteps();
        setSteps(parsedSteps);
    }, [content]);

    useEffect(() => {
        if (isPlaying && currentStep < steps.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 3000); // 3 seconds per step
            return () => clearTimeout(timer);
        } else if (currentStep >= steps.length - 1) {
            setIsPlaying(false);
        }
    }, [isPlaying, currentStep, steps.length]);

    const handlePlay = () => {
        if (currentStep >= steps.length - 1) {
            setCurrentStep(0);
        }
        setIsPlaying(true);
    };

    const handlePause = () => setIsPlaying(false);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
            setIsPlaying(false);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            setIsPlaying(false);
        }
    };

    if (steps.length === 0) return <LatexRenderer content={content} />;

    // If only 1 step, just render normally without controls
    if (steps.length === 1) return <LatexRenderer content={content} />;

    return (
        <div className="space-y-4">
            {/* Step Display */}
            <div className="min-h-[200px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="space-y-3"
                    >
                        {/* Step Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-500 text-white font-bold shadow-lg shadow-teal-500/30">
                                {currentStep + 1}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                                    {steps[currentStep].title}
                                </h4>
                                <p className="text-xs text-slate-400">
                                    Step {currentStep + 1} of {steps.length}
                                </p>
                            </div>
                            {currentStep === steps.length - 1 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2 text-green-500"
                                >
                                    <CheckCircleIcon className="w-6 h-6" />
                                    <span className="text-xs font-bold">Complete!</span>
                                </motion.div>
                            )}
                        </div>

                        {/* Step Content */}
                        <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                            <LatexRenderer content={steps[currentStep].content} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-2 justify-center">
                {steps.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setCurrentStep(idx);
                            setIsPlaying(false);
                        }}
                        className={`h-2 rounded-full transition-all ${idx === currentStep
                                ? 'w-8 bg-teal-500'
                                : idx < currentStep
                                    ? 'w-2 bg-green-400'
                                    : 'w-2 bg-slate-300 dark:bg-slate-600'
                            }`}
                    />
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="px-6 py-3 rounded-2xl bg-teal-500 text-white font-bold shadow-lg shadow-teal-500/25 hover:bg-teal-600 transition-all flex items-center gap-2"
                >
                    {isPlaying ? (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                            Pause
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            {currentStep >= steps.length - 1 ? 'Replay' : 'Play'}
                        </>
                    )}
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentStep >= steps.length - 1}
                    className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default StepByStepSolution;
