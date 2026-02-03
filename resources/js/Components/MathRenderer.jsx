import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

/**
 * LaTeX Math Renderer Component
 * Renders mathematical formulas using KaTeX
 */
export default function MathRenderer({ content }) {
    if (!content) return null;

    const renderMath = (text) => {
        // Regex patterns
        const patterns = [
            // Display math: $$...$$ or \[...\]
            { regex: /\$\$([\s\S]*?)\$\$/g, type: 'display' },
            { regex: /\\\[([\s\S]*?)\\\]/g, type: 'display' },
            // Inline math: \(...\) or $...$ (careful with $)
            { regex: /\\\(([\s\S]*?)\\\)/g, type: 'inline' },
            { regex: /\$([^\$\n]+?)\$/g, type: 'inline' }
        ];

        // Find all matches
        let allMatches = [];

        patterns.forEach(({ regex, type }) => {
            let match;
            regex.lastIndex = 0; // Reset regex
            while ((match = regex.exec(text)) !== null) {
                allMatches.push({
                    index: match.index,
                    length: match[0].length,
                    formula: match[1],
                    type: type,
                    fullMatch: match[0]
                });
            }
        });

        // Sort by index
        allMatches.sort((a, b) => a.index - b.index);

        // Filter overlaps (keep first one found at a position)
        const uniqueMatches = [];
        let lastEnd = 0;
        allMatches.forEach(m => {
            if (m.index >= lastEnd) {
                uniqueMatches.push(m);
                lastEnd = m.index + m.length;
            }
        });

        const parts = [];
        let lastIndex = 0;

        uniqueMatches.forEach((m, i) => {
            // Text before match
            if (m.index > lastIndex) {
                parts.push(
                    <span key={`text-${i}`}>
                        {text.substring(lastIndex, m.index)}
                    </span>
                );
            }

            // Math Element
            parts.push(
                <span
                    key={`math-${i}`}
                    className={m.type === 'display' ? 'block my-4 text-center overflow-x-auto scroller-hide text-lg' : 'inline-block mx-1'}
                    dangerouslySetInnerHTML={{
                        __html: renderKatex(m.formula, m.type === 'display')
                    }}
                />
            );

            lastIndex = m.index + m.length;
        });

        // Remaining text
        if (lastIndex < text.length) {
            parts.push(
                <span key="text-final">
                    {text.substring(lastIndex)}
                </span>
            );
        }

        return parts.length > 0 ? parts : text;
    };

    const renderKatex = (formula, displayMode = false) => {
        try {
            return katex.renderToString(formula, {
                displayMode,
                throwOnError: false,
                errorColor: '#cc0000',
                strict: false
            });
        } catch (error) {
            console.error('KaTeX rendering error:', error);
            return `<span class="text-red-500 font-mono text-sm">${formula}</span>`;
        }
    };

    return (
        <div className="math-content text-slate-800 dark:text-slate-200">
            {renderMath(content)}
        </div>
    );
}
