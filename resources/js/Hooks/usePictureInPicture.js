import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for Picture-in-Picture Pomodoro Timer
 * Uses Canvas → Video approach for maximum browser compatibility
 * 
 * The canvas renders the timer state and streams it to a hidden <video>,
 * which is then shown in a PiP floating window.
 */
export default function usePictureInPicture() {
    const [isPiPActive, setIsPiPActive] = useState(false);
    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const timerStateRef = useRef({ secondsLeft: 0, totalDuration: 0, isRunning: false, taskTitle: '', isBreak: false });

    // Check PiP support
    const isPiPSupported = typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;

    // Create hidden canvas and video elements on mount
    useEffect(() => {
        if (!isPiPSupported) return;

        // Canvas for rendering timer
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
        canvasRef.current = canvas;

        // Video element for PiP
        const video = document.createElement('video');
        video.width = 320;
        video.height = 180;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.style.display = 'none';
        document.body.appendChild(video);
        videoRef.current = video;

        // Listen for PiP events
        video.addEventListener('leavepictureinpicture', () => {
            setIsPiPActive(false);
            stopRendering();
        });

        return () => {
            stopRendering();
            if (document.pictureInPictureElement === video) {
                document.exitPictureInPicture().catch(() => { });
            }
            canvas.remove();
            video.remove();
        };
    }, []);

    // Render timer on canvas
    const renderFrame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { secondsLeft, totalDuration, isRunning, taskTitle, isBreak } = timerStateRef.current;
        const w = canvas.width;
        const h = canvas.height;

        // Background
        ctx.fillStyle = '#0A0A0A';
        ctx.fillRect(0, 0, w, h);

        // Progress arc
        const centerX = w / 2;
        const centerY = h / 2 - 5;
        const radius = 55;
        const progress = totalDuration > 0 ? (totalDuration - secondsLeft) / totalDuration : 0;

        // Background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI * 1.5);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Progress arc
        const endAngle = -Math.PI / 2 + (Math.PI * 2 * progress);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
        ctx.strokeStyle = isBreak ? '#34D399' : '#10B981';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Timer text
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeStr, centerX, centerY);

        // Status label
        ctx.fillStyle = isBreak ? '#34D399' : '#10B981';
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.fillText(isBreak ? '☕ BREAK' : (isRunning ? '🔥 FOCUS' : '⏸ PAUSED'), centerX, centerY - radius - 12);

        // Task title (truncated)
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '11px Inter, system-ui, sans-serif';
        const displayTitle = taskTitle.length > 30 ? taskTitle.slice(0, 27) + '...' : taskTitle;
        ctx.fillText(displayTitle || 'Pomodoro', centerX, h - 15);

        // Pulsing dot when running
        if (isRunning) {
            const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(centerX + 45, centerY - radius - 12, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(16, 185, 129, ${pulse})`;
            ctx.fill();
        }

        animationFrameRef.current = requestAnimationFrame(renderFrame);
    }, []);

    const stopRendering = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    // Enter PiP
    const enterPiP = useCallback(async () => {
        if (!isPiPSupported || !canvasRef.current || !videoRef.current) return;

        try {
            // Start canvas rendering
            renderFrame();

            // Stream canvas to video
            const stream = canvasRef.current.captureStream(30);
            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            await videoRef.current.play();

            // Request PiP
            await videoRef.current.requestPictureInPicture();
            setIsPiPActive(true);
        } catch (err) {
            console.warn('PiP failed:', err);
            stopRendering();
        }
    }, [renderFrame, stopRendering]);

    // Exit PiP
    const exitPiP = useCallback(async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            }
        } catch (err) {
            console.warn('Exit PiP failed:', err);
        }
        setIsPiPActive(false);
        stopRendering();
    }, [stopRendering]);

    // Toggle PiP
    const togglePiP = useCallback(() => {
        if (isPiPActive) {
            exitPiP();
        } else {
            enterPiP();
        }
    }, [isPiPActive, enterPiP, exitPiP]);

    // Update timer state (call this from parent on every tick)
    const updateTimerState = useCallback((state) => {
        timerStateRef.current = { ...timerStateRef.current, ...state };
    }, []);

    return {
        isPiPActive,
        isPiPSupported,
        enterPiP,
        exitPiP,
        togglePiP,
        updateTimerState,
    };
}
