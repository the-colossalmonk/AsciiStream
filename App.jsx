import React, { useState, useRef } from 'react';
import { useAsciiCam } from './hooks/useAsciiCam';
import AsciiDisplay from './components/AsciiDisplay';
import Controls from './components/Controls';
import { DEFAULT_SETTINGS } from './constants';
import { Menu, X } from 'lucide-react';

const App = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [showControls, setShowControls] = useState(true);

    // capture state
    const [captureMode, setCaptureMode] = useState('photo'); // 'photo' | 'video'
    const [isRecording, setIsRecording] = useState(false);
    const [lastMedia, setLastMedia] = useState(null);

    // Holds reference to the high-res offscreen ASCII canvas from AsciiDisplay
    const asciiRenderCanvasRef = useRef(null);

    // reference to hold latest recording info (avoids stale closures)
    const recordingInfoRef = useRef(null);

    // Initialize the hook
    const { videoRef, canvasRef, asciiFrameRef, error, capturePhoto, startRecording, stopRecording } = useAsciiCam(settings);

    const handleUpdateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const handleResetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    const handleDownloadCapture = () => {
        if (lastMedia) {
            const a = document.createElement('a');
            a.href = lastMedia.url;
            a.download = lastMedia.type === 'photo' ? 'ascii.png' : lastMedia.type === 'gif' ? 'ascii.gif' : 'ascii.webm';
            a.click();
        }
    };

    const handleShareCapture = (platform) => {
        if (!lastMedia) return;
        const { url } = lastMedia;

        if (navigator.share && lastMedia.file) {
            try {
                navigator.share({
                    title: 'AsciiStream capture',
                    text: 'Check out my AsciiStream!',
                    files: [lastMedia.file]
                });
            } catch (e) {
                console.warn('Share failed', e);
            }
            return;
        }

        switch (platform) {
            case 'twitter':
                window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent('AsciiStream capture')}&url=${encodeURIComponent(url)}`,
                    '_blank'
                );
                break;
            case 'whatsapp':
                window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent('AsciiStream capture: ' + url)}`,
                    '_blank'
                );
                break;
            case 'instagram':
                alert('Instagram sharing is only supported on mobile devices via the native share sheet.');
                break;
            case 'snapchat':
                window.open(
                    `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`,
                    '_blank'
                );
                break;
            default:
                break;
        }
    };

    const handleCopyLink = () => {
        if (lastMedia) {
            navigator.clipboard.writeText(lastMedia.url);
            alert('Link copied to clipboard!');
        }
    };

    // capture handlers
    const doCapturePhoto = async (blobFromDisplay) => {
        const blob = blobFromDisplay instanceof Blob ? blobFromDisplay : await capturePhoto();
        if (blob) {
            const url = URL.createObjectURL(blob);
            setLastMedia({ type: 'photo', url, thumbnail: url, file: new File([blob], 'photo.png', { type: blob.type }) });
        }
    };

    const doStartRecording = () => {
        // Use the high-res ASCII render canvas for recording when available
        startRecording({ collectGifFrames: true, gifFps: 10, externalCanvas: asciiRenderCanvasRef.current });
        setIsRecording(true);
        recordingInfoRef.current = { start: Date.now() };
    };

    const doStopRecording = async () => {
        const result = await stopRecording();
        setIsRecording(false);
        if (result && result.videoBlob) {
            const videoUrl = URL.createObjectURL(result.videoBlob);
            const thumb = videoUrl; // using video itself as thumbnail
            const media = {
                type: 'video',
                url: videoUrl,
                thumbnail: thumb,
                duration: result.duration,
                file: new File([result.videoBlob], 'clip.webm', { type: result.videoBlob.type }),
                gifFrames: result.gifFrames
            };
            setLastMedia(media);
            recordingInfoRef.current = media;
        }
    };

    const handleRequestGif = async () => {
        const info = recordingInfoRef.current;
        if (!info || info.type !== 'video' || info.duration > 10) return;
        if (!info.gifFrames || info.gifFrames.length === 0) {
            console.warn('No GIF frames collected');
            return;
        }
        try {
            const GIF = (await import('gif.js.optimized')).default;
            const renderCanvas = asciiRenderCanvasRef.current;
            const w = renderCanvas?.width || 640;
            const h = renderCanvas?.height || 480;
            const encoder = new GIF({ workers: 2, quality: 10, width: w, height: h, workerScript: '/gif.worker.js' });
            const loadImg = (blob) => new Promise((res) => {
                const img = new Image();
                img.onload = () => res(img);
                img.src = URL.createObjectURL(blob);
            });
            for (const blob of info.gifFrames) {
                const img = await loadImg(blob);
                encoder.addFrame(img, { delay: Math.round(1000 / 10) });
            }
            encoder.on('finished', (gifBlob) => {
                const gifUrl = URL.createObjectURL(gifBlob);
                setLastMedia((m) => ({ ...m, type: 'gif', url: gifUrl, file: new File([gifBlob], 'clip.gif', { type: gifBlob.type }) }));
            });
            encoder.render();
        } catch (e) {
            console.error('GIF export failed', e);
            alert('GIF export failed: ' + e.message);
        }
    };

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden flex">

            {/* CRT Effects */}
            <div
                className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay scanline"
                style={{ opacity: settings.scanlineIntensity }}
            />
            <div className="absolute inset-0 pointer-events-none z-30 flicker bg-gradient-to-b from-transparent via-white/5 to-transparent h-2 w-full translate-y-[-100%]"
                style={{ animation: 'scan 8s linear infinite' }} />
            <style>{`
        @keyframes scan {
          0% { transform: translateY(-10vh); opacity: 0; }
          50% { opacity: 0.1; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
      `}</style>

            {/* Branding */}
            <div className="absolute top-6 left-6 z-50 pointer-events-none select-none mix-blend-difference">
                <h1 className="text-3xl font-bold tracking-tighter text-white mb-1">AsciiStream</h1>
                <p className="text-[9px] text-zinc-400 font-medium tracking-wide uppercase opacity-80">
                    Made with ❤️ by the.colossalmonk
                </p>
            </div>

            {/* Main Display Area */}
            {/* Adjust width/margin based on sidebar state for desktop */}
            <div
                className={`relative z-10 flex items-center justify-center bg-[#050505] transition-all duration-300 ease-in-out h-full w-full ${showControls ? 'md:mr-80' : 'mr-0'}`}
            >
                {error ? (
                    <div className="text-red-500 font-mono text-center p-8 border border-red-900 bg-red-900/10">
                        <h1 className="text-2xl font-bold mb-2">Error</h1>
                        <p>{error}</p>
                    </div>
                ) : (
                    <AsciiDisplay
                        asciiRef={asciiFrameRef}
                        canvasRef={canvasRef}
                        colorMode={settings.colorMode}
                        fontSize={settings.fontSize}
                        glow={settings.glow}
                        captureMode={captureMode}
                        setCaptureMode={setCaptureMode}
                        isRecording={isRecording}
                        onCapturePhoto={doCapturePhoto}
                        onStartRecording={doStartRecording}
                        onStopRecording={doStopRecording}
                        lastMedia={lastMedia}
                        requestGifExport={handleRequestGif}
                        onDownloadCapture={handleDownloadCapture}
                        onShareCapture={handleShareCapture}
                        onAsciiCanvasReady={(canvas) => { asciiRenderCanvasRef.current = canvas; }}
                    />
                )}
            </div>

            {/* Mobile Control Toggle */}
            <button
                onClick={() => setShowControls(!showControls)}
                className="fixed bottom-6 right-6 z-50 p-3 bg-zinc-800 text-white rounded-full border border-zinc-700 shadow-lg md:hidden"
            >
                {showControls ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Controls Sidebar */}
            <div className={`
        fixed inset-y-0 right-0 z-40 w-full md:w-80 bg-black shadow-2xl transition-transform duration-300 ease-in-out
        ${showControls ? 'translate-x-0' : 'translate-x-full'}
      `}>
                <Controls
                    settings={settings}
                    updateSettings={handleUpdateSettings}
                    resetSettings={handleResetSettings}
                    videoRef={videoRef}
                    captureMode={captureMode}
                    setCaptureMode={setCaptureMode}
                    isRecording={isRecording}
                    onCapturePhoto={doCapturePhoto}
                    onStartRecording={doStartRecording}
                    onStopRecording={doStopRecording}
                    lastMedia={lastMedia}
                    requestGifExport={handleRequestGif}
                />

                {/* Toggle button for Desktop to collapse sidebar */}
                <button
                    onClick={() => setShowControls(!showControls)}
                    className="hidden md:flex absolute top-1/2 -left-3 transform -translate-y-1/2 
                     bg-zinc-950 border-l border-t border-b border-zinc-800 text-zinc-400 
                     h-16 w-3 items-center justify-center hover:text-white rounded-l-md transition-colors"
                >
                    <div className="w-1 h-8 bg-current rounded-full opacity-50" />
                </button>
            </div>

        </div>
    );
};

export default App;
