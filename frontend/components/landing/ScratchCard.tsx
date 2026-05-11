import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Incentive {
    label: string;
    isWin: boolean;
    rarity?: string;
}

interface ScratchCardProps {
    onComplete: (success: boolean) => void;
    attempts: number;
    onUseAttempt: () => void;
    incentives?: Incentive[];
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

const DEFAULT_INCENTIVES: Incentive[] = [
    { label: 'Free .cid Domain', isWin: true, rarity: 'Common' },
    { label: '10 CSPR', isWin: true, rarity: 'Common' },
    { label: '50 CSPR', isWin: true, rarity: 'Uncommon' },
    { label: 'Rare .cid Name', isWin: true, rarity: 'Rare' },
    { label: 'Try Again', isWin: false },
];

const SCRATCH_THRESHOLD = 55; // Percentage to auto-reveal

const ScratchCard: React.FC<ScratchCardProps> = ({
    onComplete,
    attempts,
    onUseAttempt,
    incentives = DEFAULT_INCENTIVES
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particleCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number>();
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);

    const [isScratched, setIsScratched] = useState(false);
    const [result, setResult] = useState<Incentive | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [scratchPercent, setScratchPercent] = useState(0);
    const [isRevealing, setIsRevealing] = useState(false);

    // Create metallic gradient pattern for scratch overlay
    const createScratchOverlay = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // Base metallic gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#c0c0c0');
        gradient.addColorStop(0.3, '#d4d4d4');
        gradient.addColorStop(0.5, '#a8a8a8');
        gradient.addColorStop(0.7, '#c8c8c8');
        gradient.addColorStop(1, '#b0b0b0');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add texture noise
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 20;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);

        // Add subtle pattern lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width + height; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(0, i);
            ctx.stroke();
        }

        // Add scratch prompt text
        ctx.save();
        ctx.font = 'bold 18px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(80, 80, 80, 0.8)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Text shadow effect
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillText('SCRATCH HERE', width / 2, height / 2 - 10);

        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
        ctx.fillText('Use your finger or mouse', width / 2, height / 2 + 15);
        ctx.restore();

        // Add coin icon hint
        const coinSize = 30;
        const coinX = width / 2;
        const coinY = height / 2 + 45;

        ctx.beginPath();
        ctx.arc(coinX, coinY, coinSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(180, 150, 50, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }, []);

    // Initialize canvas with scratch overlay
    const initScratch = useCallback(() => {
        if (attempts <= 0) return;

        setIsStarted(true);
        setIsScratched(false);
        setIsRevealing(false);
        setScratchPercent(0);
        onUseAttempt();

        // Select random result
        const randomIncentive = incentives[Math.floor(Math.random() * incentives.length)];
        setResult(randomIncentive);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.globalCompositeOperation = 'source-over';
        createScratchOverlay(ctx, canvas.width, canvas.height);
    }, [attempts, incentives, onUseAttempt, createScratchOverlay]);

    // Create scratch particles
    const createParticles = useCallback((x: number, y: number) => {
        const colors = ['#c0c0c0', '#d4d4d4', '#a8a8a8', '#e0e0e0', '#b8b8b8'];
        for (let i = 0; i < 5; i++) {
            particlesRef.current.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 2,
                life: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 3 + 1
            });
        }
    }, []);

    // Animate particles
    const animateParticles = useCallback(() => {
        const canvas = particleCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current = particlesRef.current.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // gravity
            p.life -= 0.03;

            if (p.life > 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
                ctx.globalAlpha = 1;
                return true;
            }
            return false;
        });

        if (particlesRef.current.length > 0 || isDrawing) {
            animationFrameRef.current = requestAnimationFrame(animateParticles);
        }
    }, [isDrawing]);

    // Scratch function with smooth brush
    const scratch = useCallback((x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas || isScratched || !isStarted) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.globalCompositeOperation = 'destination-out';

        // Draw line from last position for smooth strokes
        if (lastPosRef.current) {
            const lastX = lastPosRef.current.x;
            const lastY = lastPosRef.current.y;
            const dist = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
            const steps = Math.max(1, Math.floor(dist / 5));

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const cx = lastX + (x - lastX) * t;
                const cy = lastY + (y - lastY) * t;

                // Variable brush size for natural feel
                const brushSize = 25 + Math.sin(i * 0.5) * 5;

                ctx.beginPath();
                ctx.arc(cx, cy, brushSize, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.fill();
        }

        lastPosRef.current = { x, y };
        createParticles(x, y);
    }, [isScratched, isStarted, createParticles]);

    // Calculate scratch percentage
    const checkScratchPercentage = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || isScratched) return;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        // Sample every 4th pixel for performance
        for (let i = 0; i < pixels.length; i += 16) {
            if (pixels[i + 3] === 0) {
                transparentPixels++;
            }
        }

        const totalSampled = pixels.length / 16;
        const percentage = (transparentPixels / totalSampled) * 100;
        setScratchPercent(Math.round(percentage));

        if (percentage >= SCRATCH_THRESHOLD && !isScratched) {
            setIsRevealing(true);
            // Auto-reveal animation
            setTimeout(() => {
                setIsScratched(true);
                if (result) {
                    onComplete(result.isWin);
                }
            }, 500);
        }
    }, [isScratched, result, onComplete]);

    // Event handlers
    const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }, []);

    const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isStarted || isScratched) return;
        e.preventDefault();
        setIsDrawing(true);
        const coords = getCanvasCoords(e);
        if (coords) {
            scratch(coords.x, coords.y);
        }
        animateParticles();
    }, [isStarted, isScratched, getCanvasCoords, scratch, animateParticles]);

    const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || isScratched || !isStarted) return;
        e.preventDefault();
        const coords = getCanvasCoords(e);
        if (coords) {
            scratch(coords.x, coords.y);
        }
    }, [isDrawing, isScratched, isStarted, getCanvasCoords, scratch]);

    const handleEnd = useCallback(() => {
        setIsDrawing(false);
        lastPosRef.current = null;
        checkScratchPercentage();
    }, [checkScratchPercentage]);

    // Reset card for another attempt
    const resetCard = () => {
        setIsStarted(false);
        setResult(null);
        setScratchPercent(0);
        particlesRef.current = [];
    };

    // Cleanup animation frame on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Rarity color mapping
    const getRarityColor = (rarity?: string) => {
        switch (rarity) {
            case 'Rare': return 'text-purple-500';
            case 'Uncommon': return 'text-blue-500';
            default: return 'text-primary';
        }
    };

    const getRarityGlow = (rarity?: string) => {
        switch (rarity) {
            case 'Rare': return 'shadow-purple-500/50';
            case 'Uncommon': return 'shadow-blue-500/50';
            default: return 'shadow-primary/50';
        }
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Scratch Card Container */}
            <div
                ref={containerRef}
                className={`relative w-full max-w-md aspect-[2/1] rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                    isRevealing
                        ? 'border-primary shadow-2xl shadow-primary/30'
                        : 'border-gray-200 dark:border-white/10 shadow-xl'
                }`}
            >
                {/* Result Layer (underneath) */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-all duration-500 ${
                    isStarted ? 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                    {!isStarted ? (
                        <div className="text-text-muted dark:text-text-muted-dark">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest">Ready to scratch</p>
                            <p className="text-xs text-text-muted/60 mt-1">Click button below to start</p>
                        </div>
                    ) : result?.isWin ? (
                        <AnimatePresence>
                            {(isScratched || isRevealing) && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                    className="text-center"
                                >
                                    <motion.div
                                        initial={{ rotate: -10 }}
                                        animate={{ rotate: [0, -5, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="text-5xl mb-4"
                                    >
                                        🎉
                                    </motion.div>
                                    <p className={`text-xs font-black uppercase tracking-widest mb-2 ${getRarityColor(result.rarity)}`}>
                                        {result.rarity} Reward
                                    </p>
                                    <p className="text-2xl md:text-3xl font-black text-text-main dark:text-white mb-4">
                                        {result.label}
                                    </p>
                                    {isScratched && (
                                        <motion.button
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            disabled
                                            onClick={() => alert('Event coming soon!')}
                                            className="px-6 py-2.5 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed transition-all shadow-lg opacity-60"
                                        >
                                            Claim Reward
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        <AnimatePresence>
                            {(isScratched || isRevealing) && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center"
                                >
                                    <div className="text-4xl mb-4">😅</div>
                                    <p className="text-xl font-black text-text-main dark:text-white">Better luck next time!</p>
                                    <p className="text-sm text-text-muted dark:text-text-muted-dark mt-2">Complete more tasks for attempts.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                {/* Particle Canvas (for scratch effects) */}
                <canvas
                    ref={particleCanvasRef}
                    width={400}
                    height={200}
                    className="absolute inset-0 w-full h-full pointer-events-none z-20"
                />

                {/* Scratchable Canvas Layer */}
                {isStarted && (
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-500 ${
                            isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        } ${isRevealing ? 'animate-pulse' : ''}`}
                        style={{ cursor: isScratched ? 'default' : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 24 24\' fill=\'%23d4af37\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'10\'/%3E%3C/svg%3E") 16 16, crosshair' }}
                        onMouseDown={handleStart}
                        onMouseMove={handleMove}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onTouchStart={handleStart}
                        onTouchMove={handleMove}
                        onTouchEnd={handleEnd}
                    />
                )}

                {/* Progress indicator */}
                {isStarted && !isScratched && (
                    <div className="absolute bottom-2 left-2 right-2 z-30">
                        <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(scratchPercent, 100)}%` }}
                                transition={{ type: 'spring', damping: 20 }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {!isStarted && (
                <motion.button
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={initScratch}
                    disabled={attempts <= 0}
                    className={`px-12 py-4 rounded-full font-black text-lg transition-all ${
                        attempts > 0
                            ? 'bg-primary text-white hover:scale-105 shadow-xl shadow-primary/20 active:scale-95'
                            : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-white/30 cursor-not-allowed'
                    }`}
                >
                    {attempts > 0 ? '🎰 Start Scratching' : 'No Attempts Left'}
                </motion.button>
            )}

            {isScratched && (
                <motion.button
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={resetCard}
                    disabled={attempts <= 0}
                    className={`text-sm font-bold transition-all ${
                        attempts > 0
                            ? 'text-primary hover:underline cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {attempts > 0 ? '🎲 Scratch another?' : 'Complete tasks for more attempts'}
                </motion.button>
            )}
        </div>
    );
};

export default ScratchCard;
