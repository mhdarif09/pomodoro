import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import MathRenderer from './MathRenderer'; // Reuse existing renderer for formulas

/**
 * StepByStepSolver Component
 * Animates math solutions step by step for better understanding.
 * 
 * Logic:
 * 1. Takes full response text
 * 2. Splits by "Langkah X:" or "Step X:" or "**Step X**"
 * 3. Renders introductory text first
 * 4. Shows "Start Solution" button or auto-starts
 * 5. Reveals one step at a time with animation
 */
export default function StepByStepSolver({ content }) {
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1); // -1 = show intro only
    const [intro, setIntro] = useState('');

    useEffect(() => {
        parseContent(content);
    }, [content]);

    const parseContent = (text) => {
        // Regex to split by "Langkah X:" or "**Step X**"
        // Captures the header and the content
        // Example matches: "Langkah 1:", "**Step 2**:"
        const stepRegex = /(?:Langkah|Step)\s+\d+:?|(?:\*\*(?:Langkah|Step)\s+\d+\*\*):?/gi;

        const split = text.split(stepRegex);
        const matches = text.match(stepRegex);

        if (!matches || split.length < 2) {
            // No steps found, just set as intro
            setIntro(text);
            setSteps([]);
            return;
        }

        const newSteps = [];

        // split[0] is the intro text before first step
        setIntro(split[0]);

        // subsequent splits are step contents
        // matches[i] is the header for split[i+1]
        for (let i = 0; i < matches.length; i++) {
            if (split[i + 1] && split[i + 1].trim()) {
                newSteps.push({
                    header: matches[i].replace(/[:*]/g, '').trim(), // Clean header
                    content: split[i + 1].trim()
                });
            }
        }

        setSteps(newSteps);
        setCurrentStep(0); // Auto-start showing first step
    };

    if (steps.length === 0) {
        return <MathRenderer content={content} />;
    }

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        }
    };

    return (
        <div className="space-y-6">
            {/* Intro Section */}
            {intro && (
                <div className="text-[15px] leading-relaxed">
                    <MathRenderer content={intro} />
                </div>
            )}

            {/* Steps Visualizer */}
            <div className="space-y-4">
                {steps.map((step, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{
                            opacity: idx <= currentStep ? 1 : 0,
                            x: idx <= currentStep ? 0 : -20,
                            height: idx <= currentStep ? 'auto' : 0
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`overflow-hidden border-l-2 pl-4 py-2 ${idx === currentStep
                                ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10'
                                : 'border-slate-200 dark:border-slate-700 opacity-60'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx <= currentStep ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                {idx + 1}
                            </div>
                            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                {step.header}
                            </h4>
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 pl-8">
                            <MathRenderer content={step.content} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Controls */}
            {currentStep < steps.length - 1 ? (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextStep}
                    className="apple-button w-full bg-slate-900 dark:bg-teal-600 text-white py-3 flex items-center justify-center gap-2 shadow-lg"
                >
                    <span>Lanjut ke Langkah {currentStep + 2}</span>
                    <ChevronRightIcon className="w-4 h-4" />
                </motion.button>
            ) : (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-center mt-6"
                >
                    <div className="px-6 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        Selesai! Semangat belajarnya 🚀
                    </div>
                </motion.div>
            )}
        </div>
    );
}
