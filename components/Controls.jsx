import React, { useState } from 'react';
import { CharSetType, ColorMode } from '../constants';
import { Settings, Sliders, Type, Monitor, Moon, Sun, Eye, Camera, Video, RotateCcw, FlipHorizontal, Waves, Gauge, ScanLine, Info, Zap, X } from 'lucide-react';

const Controls = ({
    settings,
    updateSettings,
    resetSettings,
    videoRef,
    // capture props
    captureMode,
    setCaptureMode,
    isRecording,
    onCapturePhoto,
    onStartRecording,
    onStopRecording,
    lastMedia,
    requestGifExport
}) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="absolute top-0 right-0 h-full w-full md:w-80 bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col gap-8 text-sm transform transition-transform duration-300 overflow-y-auto z-40 shadow-2xl">

            <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                <h2 className="text-lg font-medium text-white tracking-tight flex items-center gap-2">
                    <Settings size={18} />
                    <span>Configuration</span>
                </h2>
            </div>

            {/* Live Feed Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                    <Eye size={14} />
                    <span>Live Feed</span>
                </div>

                <div className="relative w-full aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 shadow-inner group">
                    <video
                        ref={videoRef}
                        className={`w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-500 ${settings.flipX ? 'scale-x-[-1]' : ''}`}
                        playsInline
                        muted
                        autoPlay
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-red-400 font-bold tracking-wider border border-red-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-[pulse_2s_infinite]" />
                        LIVE
                    </div>

                    Grid Overlay
                    <div className="absolute inset-0 pointer-events-none opacity-20"
                        style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .1) 25%, rgba(255, 255, 255, .1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .1) 75%, rgba(255, 255, 255, .1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .1) 25%, rgba(255, 255, 255, .1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .1) 75%, rgba(255, 255, 255, .1) 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }}
                    />
                </div>
            </div>

            {/* Render Mode */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                    <Type size={14} />
                    <span>Character Set</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {Object.values(CharSetType).map((type) => (
                        <button
                            key={type}
                            onClick={() => updateSettings({ charSet: type })}
                            className={`px-3 py-2 text-xs rounded border transition-all ${settings.charSet === type
                                ? 'bg-zinc-800 border-zinc-600 text-white font-medium'
                                : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Mode */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                    <Monitor size={14} />
                    <span>Color Theme</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {Object.values(ColorMode).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => updateSettings({ colorMode: mode })}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${settings.colorMode === mode
                                ? 'bg-zinc-800 border-zinc-600 text-white font-medium'
                                : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sliders */}
            <div className="space-y-6 pt-2 relative">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <Sliders size={14} />
                        <span>Adjustments</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className={`text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-zinc-900 ${showInfo ? 'text-white bg-zinc-900' : ''}`}
                            title="Guide"
                        >
                            <Info size={14} />
                        </button>
                        <button
                            onClick={resetSettings}
                            className="text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-zinc-900"
                            title="Reset to Defaults"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>
                </div>

                {/* Info Popup - Positioned absolute relative to the Sliders container or sidebar */}
                {showInfo && (
                    <div className="absolute top-8 left-0 right-0 z-50 bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-xl text-xs space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                            <span className="font-semibold text-white">Settings Guide</span>
                            <button onClick={() => setShowInfo(false)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
                        </div>
                        <ul className="space-y-2 text-zinc-400">
                            <li><strong className="text-zinc-300">Resolution:</strong> Character density. Higher is more detailed.</li>
                            <li><strong className="text-zinc-300">Contrast:</strong> Separation between light and dark areas.</li>
                            <li><strong className="text-zinc-300">Brightness:</strong> Overall lightness level.</li>
                            <li><strong className="text-zinc-300">Gamma:</strong> Adjusts mid-tone visibility.</li>
                            <li><strong className="text-zinc-300">Noise:</strong> Adds retro film grain texture.</li>
                            <li><strong className="text-zinc-300">Scanlines:</strong> Opacity of CRT monitor lines.</li>
                            <li><strong className="text-zinc-300">Font Size:</strong> Size of individual characters.</li>
                            <li><strong className="text-zinc-300">Glow:</strong> Intensity of the light bloom effect.</li>
                        </ul>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-zinc-500 text-xs">
                            <span>Resolution</span>
                            <span className="font-mono text-zinc-300">{settings.resolution}</span>
                        </div>
                        <input
                            type="range"
                            min="40"
                            max="500"
                            step="5"
                            value={settings.resolution}
                            onChange={(e) => updateSettings({ resolution: parseInt(e.target.value) })}
                            className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-zinc-500 text-xs">
                            <span>Contrast</span>
                            <span className="font-mono text-zinc-300">{settings.contrast.toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="3.0"
                            step="0.1"
                            value={settings.contrast}
                            onChange={(e) => updateSettings({ contrast: parseFloat(e.target.value) })}
                            className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-zinc-500 text-xs">
                            <span>Brightness</span>
                            <span className="font-mono text-zinc-300">{settings.brightness}</span>
                        </div>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            step="5"
                            value={settings.brightness}
                            onChange={(e) => updateSettings({ brightness: parseInt(e.target.value) })}
                            className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-zinc-500 text-xs">
                            <span className="flex items-center gap-1"><Gauge size={10} /> Gamma</span>
                            <span className="font-mono text-zinc-300">{settings.gamma.toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="3.0"
                            step="0.1"
                            value={settings.gamma}
                            onChange={(e) => updateSettings({ gamma: parseFloat(e.target.value) })}
                            className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-zinc-500 text-xs">
                            <span className="flex items-center gap-1"><Waves size={10} /> Noise (Grain)</span>
                            <span className="font-mono text-zinc-300">{(settings.noise * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={settings.noise}
                            onChange={(e) => updateSettings({ noise: parseFloat(e.target.value) })}
                            className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-zinc-500 text-xs">
                            <span className="flex items-center gap-1"><ScanLine size={10} /> Scanlines</span>
                            <span className="font-mono text-zinc-300">{(settings.scanlineIntensity * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={settings.scanlineIntensity}
                            onChange={(e) => updateSettings({ scanlineIntensity: parseFloat(e.target.value) })}
                            className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-zinc-500 text-xs">
                            <span>Font Size</span>
                            <span className="font-mono text-zinc-300">{settings.fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="2"
                            max="20"
                            step="1"
                            value={settings.fontSize}
                            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                            className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-zinc-500 text-xs">
                            <span className="flex items-center gap-1"><Zap size={10} /> Glow Effect</span>
                            <span className="font-mono text-zinc-300">{settings.glow}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={settings.glow || 0}
                            onChange={(e) => updateSettings({ glow: parseInt(e.target.value) })}
                            className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 mt-auto border-t border-zinc-900 space-y-4">
                {/* Flip Horizontal */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <FlipHorizontal size={16} />
                        <span className="text-sm font-medium">Flip Camera</span>
                    </div>
                    <button
                        onClick={() => updateSettings({ flipX: !settings.flipX })}
                        className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${settings.flipX ? 'bg-zinc-200' : 'bg-zinc-800'
                            }`}
                    >
                        <div
                            className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all duration-200 ${settings.flipX ? 'left-6 bg-white' : 'left-1 bg-zinc-500'
                                }`}
                        />
                    </button>
                </div>

                {/* Invert */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                        {settings.inverted ? <Sun size={16} /> : <Moon size={16} />}
                        <span className="text-sm font-medium">Invert Colors</span>
                    </div>
                    <button
                        onClick={() => updateSettings({ inverted: !settings.inverted })}
                        className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${settings.inverted ? 'bg-zinc-200' : 'bg-zinc-800'
                            }`}
                    >
                        <div
                            className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all duration-200 ${settings.inverted ? 'left-6 bg-white' : 'left-1 bg-zinc-500'
                                }`}
                        />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Controls;
