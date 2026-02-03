import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const LatexRenderer = ({ content }) => {
    if (!content) return null;

    // Normalize LaTeX delimiters to standardized format
    // Convert \( \) to $ $ and \[ \] to $$ $$
    let normalized = content
        .replace(/\\\(/g, '$')
        .replace(/\\\)/g, '$')
        .replace(/\\\[/g, '$$')
        .replace(/\\\]/g, '$$');

    const parts = [];

    // Split by block math $$...$$ first
    const blockSplit = normalized.split('$$');

    blockSplit.forEach((blockPart, blockIdx) => {
        // Odd indices are block math
        if (blockIdx % 2 === 1) {
            parts.push({ type: 'block', content: blockPart.trim() });
        } else {
            // This part might contain inline math $...$
            const inlineSplit = blockPart.split('$');
            inlineSplit.forEach((inlinePart, inlineIdx) => {
                if (inlineIdx % 2 === 1) {
                    parts.push({ type: 'inline', content: inlinePart.trim() });
                } else if (inlinePart) {
                    parts.push({ type: 'text', content: inlinePart });
                }
            });
        }
    });

    return (
        <>
            {parts.map((part, idx) => {
                if (part.type === 'block') {
                    return (
                        <div key={idx} className="my-4 overflow-x-auto">
                            <BlockMath math={part.content} />
                        </div>
                    );
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

