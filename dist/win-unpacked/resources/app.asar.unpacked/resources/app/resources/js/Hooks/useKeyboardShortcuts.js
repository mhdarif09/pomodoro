import { useEffect, useRef } from 'react';

export default function useKeyboardShortcuts(actions) {
    const actionsRef = useRef(actions);

    useEffect(() => {
        actionsRef.current = actions;
    }, [actions]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignore inputs
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) {
                return;
            }

            // Build Combo String
            const modifiers = [];
            if (event.metaKey) modifiers.push('Meta'); // Command on Mac
            if (event.ctrlKey) modifiers.push('Ctrl');
            if (event.altKey) modifiers.push('Alt');
            if (event.shiftKey) modifiers.push('Shift');

            const key = event.code;

            // Avoid triggering for Modifier keys themselves (e.g. just pressing Alt)
            if (['MetaLeft', 'MetaRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight'].includes(key)) {
                return;
            }

            const combo = [...modifiers, key].join('+');
            const simpleKey = key; // fallback for single keys

            if (actionsRef.current[combo]) {
                event.preventDefault();
                actionsRef.current[combo]();
            } else if (actionsRef.current[simpleKey] && modifiers.length === 0) {
                // Only trigger simple key if NO modifiers (unless Shift is needed for the char, but coverage varies)
                // For "Space", event.code is Space. 
                event.preventDefault();
                actionsRef.current[simpleKey]();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
}
