import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ColorMode } from '../constants';
import {
    Camera, Video, X, Download, Twitter, Share2, Square,
    Instagram, MessageCircle
} from 'lucide-react';

// Snapchat SVG icon (not in Lucide)
const SnapchatIcon = ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 0C8.396 0 5.3 2.15 3.9 5.25c-.6 1.4-.75 2.85-.75 4.05 0 .35.025.7.05 1.05-.5.15-.95.2-1.35.2-.75 0-1.3-.2-1.55-.3l-.25-.1c-.05 0-.1-.025-.15-.025-.35 0-.65.225-.65.575 0 .25.15.475.4.55l.025.025c.25.1.9.325 1.25.725.2.2.3.45.3.75 0 .05-.025.1-.025.15-.05.275-.1.55-.15.8-.15.75-.3 1.55-.3 2.35 0 1.45.6 2.575 1.75 3.375.9.625 1.975.9 3.375.9.325 0 .65-.025.975-.075.325 1.025.8 1.95 1.45 2.725C9.25 23.75 10.6 24 12.017 24c1.425 0 2.775-.25 3.775-1.025.65-.775 1.125-1.7 1.45-2.725.325.05.65.075.975.075 1.4 0 2.475-.275 3.375-.9 1.15-.8 1.75-1.925 1.75-3.375 0-.8-.15-1.6-.3-2.35-.05-.25-.1-.525-.15-.8-.025-.05-.025-.1-.025-.15 0-.3.1-.55.3-.75.35-.4 1-.625 1.25-.725l.025-.025c.25-.075.4-.3.4-.55 0-.35-.3-.575-.65-.575-.05 0-.1.025-.15.025l-.25.1c-.25.1-.8.3-1.55.3-.4 0-.85-.05-1.35-.2.025-.35.05-.7.05-1.05 0-1.2-.15-2.65-.75-4.05C18.717 2.15 15.625 0 12.017 0z" />
    </svg>
);

// WhatsApp SVG icon
const WhatsAppIcon = ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

// Color map for ASCII canvas render
const COLOR_MAP = {
    [ColorMode.Green]: '#22c55e',
    [ColorMode.Amber]: '#f59e0b',
    [ColorMode.Cyan]: '#22d3ee',
    [ColorMode.Red]: '#ef4444',
    [ColorMode.Blue]: '#3b82f6',
    [ColorMode.Plasma]: '#d946ef',
    [ColorMode.White]: '#e5e5e5',
    [ColorMode.Matrix]: '#4ade80',
    [ColorMode.TrueColor]: '#e5e5e5',
};

const AsciiDisplay = ({
    asciiRef, canvasRef, colorMode, fontSize, glow,
    captureMode, setCaptureMode, isRecording,
    onCapturePhoto, onStartRecording, onStopRecording,
    lastMedia, requestGifExport,
    onDownloadCapture, onShareCapture,
    // Expose the ASCII render canvas to the parent for video recording
    onAsciiCanvasReady,
}) => {
    const preRef = useRef(null);
    // Offscreen canvas that mirrors the styled ASCII text render
    const asciiRenderCanvasRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [gifMode, setGifMode] = useState(false);

    // Check if running on desktop (for social share disable logic)
    const isDesktop = !navigator.userAgentData?.mobile && !/Mobi|Android/i.test(navigator.userAgent);

    // Fast render loop — ONLY updates the visible <pre> at 60fps (same as original)
    useEffect(() => {
        let animationId;
        const render = () => {
            if (preRef.current) preRef.current.textContent = asciiRef.current;
            animationId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationId);
    }, [asciiRef]);

    // Helper: draw current ASCII frame into the offscreen canvas (used for capture & recording)
    const drawOffscreenFrame = useCallback(() => {
        const oc = asciiRenderCanvasRef.current;
        const text = asciiRef.current;
        if (!oc || !text) return;

        const lines = text.split('\n');
        const cols = lines[0]?.length || 80;
        const rows = lines.length;
        const scale = 2;
        const charW = fontSize * 0.601 * scale;
        const charH = fontSize * scale;
        const W = Math.round(cols * charW);
        const H = Math.round(rows * charH);

        if (oc.width !== W || oc.height !== H) {
            oc.width = W;
            oc.height = H;
        }

        const ctx = oc.getContext('2d');
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);

        const textColor = COLOR_MAP[colorMode] || '#e5e5e5';
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize * scale}px monospace`;
        ctx.textBaseline = 'top';
        ctx.shadowBlur = (glow > 0 && colorMode !== ColorMode.TrueColor) ? glow * scale : 0;
        ctx.shadowColor = textColor;

        lines.forEach((line, i) => ctx.fillText(line, 0, i * charH));
    }, [asciiRef, colorMode, fontSize, glow]);

    // Offscreen canvas render loop — ONLY active during recording (feeds captureStream)
    useEffect(() => {
        if (!isRecording) return;
        let animationId;
        const loop = () => {
            drawOffscreenFrame();
            animationId = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(animationId);
    }, [isRecording, drawOffscreenFrame]);

    // Tell parent about the offscreen canvas so it can be used for recording
    useEffect(() => {
        if (onAsciiCanvasReady && asciiRenderCanvasRef.current) {
            onAsciiCanvasReady(asciiRenderCanvasRef.current);
        }
    }, [onAsciiCanvasReady]);


    // Show modal when a new capture arrives
    useEffect(() => {
        if (lastMedia) setShowModal(true);
    }, [lastMedia]);

    const getColorStyles = () => {
        switch (colorMode) {
            case ColorMode.Green: return 'text-green-500';
            case ColorMode.Amber: return 'text-amber-500';
            case ColorMode.Cyan: return 'text-cyan-400';
            case ColorMode.Red: return 'text-red-500';
            case ColorMode.Blue: return 'text-blue-500';
            case ColorMode.Plasma: return 'text-fuchsia-500';
            case ColorMode.White: return 'text-gray-200';
            case ColorMode.Matrix: return 'text-transparent bg-clip-text bg-gradient-to-b from-green-300 via-green-500 to-green-900';
            case ColorMode.TrueColor: return 'text-white';
            default: return 'text-gray-200';
        }
    };

    const getGlowStyle = () => {
        if (!glow) return {};
        let color = 'rgba(255,255,255,.5)';
        if (colorMode === ColorMode.Green) color = 'rgba(34,197,94,.5)';
        if (colorMode === ColorMode.Amber) color = 'rgba(245,158,11,.5)';
        if (colorMode === ColorMode.Cyan) color = 'rgba(34,211,238,.5)';
        if (colorMode === ColorMode.Red) color = 'rgba(239,68,68,.5)';
        if (colorMode === ColorMode.Blue) color = 'rgba(59,130,246,.5)';
        if (colorMode === ColorMode.Plasma) color = 'rgba(217,70,239,.5)';
        if (colorMode === ColorMode.TrueColor) return {};
        return { textShadow: `0 0 ${glow}px ${color}` };
    };

    // Capture photo from the offscreen ASCII canvas
    const handleCapture = useCallback(() => {
        if (captureMode === 'photo') {
            const oc = asciiRenderCanvasRef.current;
            if (oc) {
                drawOffscreenFrame(); // render latest frame into canvas
                oc.toBlob(blob => {
                    if (blob && typeof onCapturePhoto === 'function') onCapturePhoto(blob);
                }, 'image/png');
            } else {
                onCapturePhoto();
            }
        } else if (isRecording) {
            onStopRecording();
        } else {
            onStartRecording();
        }
    }, [captureMode, isRecording, drawOffscreenFrame, onCapturePhoto, onStartRecording, onStopRecording]);

    // Social share button definition
    const isMobile = !isDesktop;
    const socialButtons = [
        {
            label: 'Twitter',
            icon: <Twitter size={15} />,
            action: () => onShareCapture('twitter'),
            disabled: false,
        },
        {
            label: 'WhatsApp',
            icon: <WhatsAppIcon size={15} />,
            action: () => onShareCapture('whatsapp'),
            disabled: false, // works via web.whatsapp.com on desktop too
        },
        {
            label: 'Instagram',
            icon: <Instagram size={15} />,
            action: () => onShareCapture('instagram'),
            disabled: isDesktop, // Instagram has no web sharing API
        },
        {
            label: 'Snapchat',
            icon: <SnapchatIcon size={15} />,
            action: () => onShareCapture('snapchat'),
            disabled: isDesktop, // Snapchat has no web sharing API
        },
    ];

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden bg-black">

            {/* Hidden offscreen canvas */}
            <canvas ref={asciiRenderCanvasRef} style={{ display: 'none' }} />

            {/*
              Centering layer — takes all remaining space above the controls bar.
              The shrink-wrap div inside is `relative`-only, so it sizes exactly
              to the <pre> text. The canvas absolute inset-0 then perfectly
              overlaps the text for TrueColor mode.
            */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="relative">
                    <pre
                        ref={preRef}
                        className={`font-mono leading-none whitespace-pre select-none relative z-10 ${getColorStyles()}`}
                        style={{
                            fontSize: `${fontSize}px`,
                            WebkitFontSmoothing: 'antialiased',
                            ...getGlowStyle()
                        }}
                    />
                    <canvas
                        ref={canvasRef}
                        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${colorMode === ColorMode.TrueColor ? 'opacity-100 mix-blend-multiply z-20' : 'opacity-0 z-0'}`}
                        style={{
                            imageRendering: 'pixelated',
                            filter: colorMode === ColorMode.TrueColor ? 'brightness(1.5) saturate(1.3)' : 'none'
                        }}
                    />
                </div>
            </div>

            {/* Controls Bar — sits in normal flow at the bottom */}
            <div className="py-4 px-6 flex items-center gap-4 bg-black/60 backdrop-blur-md w-full justify-center z-30">
                <div className="flex gap-2 border-r border-zinc-700 pr-4">
                    <button
                        onClick={() => setCaptureMode('photo')}
                        title="Photo Mode"
                        className={`p-3 rounded-xl transition-all ${captureMode === 'photo' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        <Camera size={18} />
                    </button>
                    <button
                        onClick={() => setCaptureMode('video')}
                        title="Video Mode"
                        className={`p-3 rounded-xl transition-all ${captureMode === 'video' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        <Video size={18} />
                    </button>
                </div>

                <button
                    onClick={handleCapture}
                    title={captureMode === 'photo' ? 'Take Photo' : isRecording ? 'Stop Recording' : 'Start Recording'}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/40' : 'bg-white hover:bg-zinc-200'}`}
                >
                    {isRecording
                        ? <Square size={18} fill="white" stroke="white" />
                        : <div className="w-6 h-6 rounded-full bg-zinc-900" />
                    }
                </button>
            </div>

            {/* Fullscreen Modal */}
            {showModal && lastMedia && (
                <div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                        >
                            <X size={16} />
                        </button>

                        <div className="bg-black">
                            {lastMedia.type === 'photo' && <img src={lastMedia.url} alt="capture" className="w-full h-auto" />}
                            {lastMedia.type === 'video' && <video src={lastMedia.url} controls autoPlay loop className="w-full h-auto" />}
                            {lastMedia.type === 'gif' && <img src={lastMedia.url} alt="gif capture" className="w-full h-auto" />}
                        </div>

                        <div className="px-4 py-3 bg-zinc-950 flex items-center justify-between gap-2">
                            <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">AsciiStream</span>
                            <div className="flex items-center gap-2">
                                {/* GIF toggle — only shown for short videos */}
                                {lastMedia.type === 'video' && lastMedia.duration <= 10 && (
                                    <button
                                        onClick={() => {
                                            const next = !gifMode;
                                            setGifMode(next);
                                            // Kick off GIF encoding on first enable
                                            if (next) requestGifExport();
                                        }}
                                        title={gifMode ? 'Switch to Video download' : 'Switch to GIF download'}
                                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wider border transition-all ${gifMode
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                            : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                                            }`}
                                    >
                                        GIF
                                    </button>
                                )}
                                <button
                                    onClick={onDownloadCapture}
                                    title={gifMode ? (lastMedia.type === 'gif' ? 'Download GIF' : 'Encoding GIF…') : 'Download'}
                                    disabled={gifMode && lastMedia.type !== 'gif'}
                                    className={`p-2 rounded-lg transition-all ${gifMode && lastMedia.type !== 'gif' ? 'bg-zinc-900 text-zinc-600 cursor-wait animate-pulse' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'}`}
                                >
                                    <Download size={15} />
                                </button>
                                {socialButtons.map(btn => (
                                    <button
                                        key={btn.label}
                                        onClick={btn.disabled ? undefined : btn.action}
                                        title={btn.disabled ? `${btn.label} sharing not available on desktop` : `Share on ${btn.label}`}
                                        className={`p-2 rounded-lg transition-all ${btn.disabled
                                            ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-40'
                                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'}`}
                                    >
                                        {btn.icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsciiDisplay;
