import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const LatexRenderer = ({ content }) => {
    if (!content) return null;

    // Split content by block math delimiters $$...$$
    // Then split by inline math delimiters $...$
    // This is a basic parser. For more complex nesting, a library is better, 
    // but standard OpenAI output is usually clean.

    const parts = [];
    let lastIndex = 0;

    // Regex for block math $$...$$
    // Using simple splitting since complex regex can be tricky with state
    const blockSplit = content.split('$$');

    blockSplit.forEach((blockPart, blockIdx) => {
        // Even indices are text (or contain inline math), Odd indices are block math
        if (blockIdx % 2 === 1) {
            parts.push({ type: 'block', content: blockPart });
        } else {
            // This part might contain inline math $...$
            const inlineSplit = blockPart.split('$');
            inlineSplit.forEach((inlinePart, inlineIdx) => {
                if (inlineIdx % 2 === 1) {
                    parts.push({ type: 'inline', content: inlinePart });
                } else {
                    parts.push({ type: 'text', content: inlinePart });
                }
            });
        }
    });

    return (
        <>
            {parts.map((part, idx) => {
                if (part.type === 'block') {
                    return <div key={idx} className="my-4 overflow-x-auto"><BlockMath math={part.content} /></div>;
                }
                if (part.type === 'inline') {
                    return <InlineMath key={idx} math={part.content} />;
                }
                return <span key={idx} className="whitespace-pre-wrap">{part.content}</span>;
            })}
        </>
    );
};

export default LatexRenderer;
