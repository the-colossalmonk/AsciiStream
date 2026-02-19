import React, { useEffect, useRef } from 'react';
import { ColorMode } from '../constants';

const AsciiDisplay = ({ asciiRef, canvasRef, colorMode, fontSize, glow }) => {
    const containerRef = useRef(null);

    // Optimized render loop that bypasses React state for 60FPS text updates
    useEffect(() => {
        let animationId;

        const render = () => {
            if (containerRef.current) {
                containerRef.current.textContent = asciiRef.current;
            }
            animationId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [asciiRef]);

    // Dynamic styles based on color mode
    const getColorStyles = () => {
        switch (colorMode) {
            case ColorMode.Green:
                return 'text-green-500';
            case ColorMode.Amber:
                return 'text-amber-500';
            case ColorMode.Cyan:
                return 'text-cyan-400';
            case ColorMode.Red:
                return 'text-red-500';
            case ColorMode.Blue:
                return 'text-blue-500';
            case ColorMode.Plasma:
                return 'text-fuchsia-500';
            case ColorMode.White:
                return 'text-gray-200';
            case ColorMode.Matrix:
                return 'text-transparent bg-clip-text bg-gradient-to-b from-green-300 via-green-500 to-green-900';
            case ColorMode.TrueColor:
                // Pure white text acts as a mask for the multiply blend mode
                // If text is not white, the colors will be muddied.
                return 'text-white';
            default:
                return 'text-gray-200';
        }
    };

    const getGlowStyle = () => {
        if (glow === 0) return {};

        let color = 'rgba(255, 255, 255, 0.5)';
        if (colorMode === ColorMode.Green) color = 'rgba(34, 197, 94, 0.5)';
        if (colorMode === ColorMode.Amber) color = 'rgba(245, 158, 11, 0.5)';
        if (colorMode === ColorMode.Cyan) color = 'rgba(34, 211, 238, 0.5)';
        if (colorMode === ColorMode.Red) color = 'rgba(239, 68, 68, 0.5)';
        if (colorMode === ColorMode.Blue) color = 'rgba(59, 130, 246, 0.5)';
        if (colorMode === ColorMode.Plasma) color = 'rgba(217, 70, 239, 0.5)';
        // Disable glow for TrueColor as it interferes with the image clarity
        if (colorMode === ColorMode.TrueColor) return {};

        return {
            textShadow: `0 0 ${glow}px ${color}`
        };
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
            {/* 
        Container Wrapper:
        Crucial for TrueColor mode. It shrink-wraps the text content.
        The canvas is then absolutely positioned INSIDE this wrapper, ensuring
        it perfectly overlaps the text dimensions, not the screen dimensions.
      */}
            <div className="relative">
                <pre
                    ref={containerRef}
                    className={`font-mono leading-none whitespace-pre text-center select-none relative z-10 ${getColorStyles()}`}
                    style={{
                        fontSize: `${fontSize}px`,
                        transform: 'scale(1)',
                        WebkitFontSmoothing: 'antialiased',
                        ...getGlowStyle()
                    }}
                />

                <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${colorMode === ColorMode.TrueColor ? 'opacity-100 mix-blend-multiply z-20' : 'opacity-0 z-0'
                        }`}
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>
        </div>
    );
};

export default AsciiDisplay;
