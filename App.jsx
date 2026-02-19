import React, { useState } from 'react';
import { useAsciiCam } from './hooks/useAsciiCam';
import AsciiDisplay from './components/AsciiDisplay';
import Controls from './components/Controls';
import { DEFAULT_SETTINGS } from './constants';
import { Menu, X } from 'lucide-react';

const App = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [showControls, setShowControls] = useState(true);

    // Initialize the hook
    const { videoRef, canvasRef, asciiFrameRef, error } = useAsciiCam(settings);

    const handleUpdateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const handleResetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
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
