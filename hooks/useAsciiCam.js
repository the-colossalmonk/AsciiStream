import { useEffect, useRef, useState, useCallback } from 'react';
import { CHAR_SETS } from '../constants';

export const useAsciiCam = (settings) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [streamActive, setStreamActive] = useState(false);
    const [error, setError] = useState(null);

    // We use a ref for the ASCII output string to avoid re-rendering React components 60 times a second
    const asciiFrameRef = useRef("");
    const animationRef = useRef(0);

    const processFrame = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState !== 4) {
            animationRef.current = requestAnimationFrame(processFrame);
            return;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Calculate dimensions
        const width = settings.resolution;
        const aspectRatio = video.videoHeight / video.videoWidth;
        // factor of 0.5 compensates for character height being ~2x width usually
        const height = Math.floor(width * aspectRatio * 0.55);

        // Resize canvas to processing resolution
        canvas.width = width;
        canvas.height = height;

        // Apply mirroring if enabled
        if (settings.flipX) {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
        }

        // Draw resized image
        ctx.drawImage(video, 0, 0, width, height);

        // Get Pixel Data
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        let asciiStr = "";
        const chars = CHAR_SETS[settings.charSet];
        const charLen = chars.length;
        const noiseFactor = settings.noise * 255; // Pre-calculate noise scale

        // Loop through pixels
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // Calculate brightness (Rec. 601 luma)
            let brightness = (0.299 * r + 0.587 * g + 0.114 * b);

            // Apply Noise (Grain)
            if (settings.noise > 0) {
                brightness += (Math.random() - 0.5) * noiseFactor;
            }

            // Apply Contrast
            brightness = (brightness - 128) * settings.contrast + 128;

            // Apply Brightness Offset
            brightness += settings.brightness;

            // Clamp intermediate
            brightness = Math.max(0, Math.min(255, brightness));

            // Apply Gamma Correction
            // Formula: 255 * (value / 255) ^ (1 / gamma)
            if (settings.gamma !== 1.0) {
                brightness = 255 * Math.pow(brightness / 255, 1 / settings.gamma);
            }

            // Final Clamp
            brightness = Math.max(0, Math.min(255, brightness));

            if (settings.inverted) {
                brightness = 255 - brightness;
            }

            // Map to char, using 256 to ensure equal distribution across all characters
            const charIndex = Math.floor((brightness / 256) * charLen);
            // Safety check for index
            const safeIndex = Math.max(0, Math.min(charLen - 1, charIndex));
            asciiStr += chars[safeIndex];

            // Add newline at end of row
            if (((i / 4) + 1) % width === 0) {
                asciiStr += "\n";
            }
        }

        asciiFrameRef.current = asciiStr;
        animationRef.current = requestAnimationFrame(processFrame);
    }, [settings]);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: "user"
                    }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play(); // Important: must call play
                    setStreamActive(true);
                }
            } catch (err) {
                setError("Camera access denied or unavailable.");
                console.error(err);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(t => t.stop());
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Start processing loop when video is ready
    useEffect(() => {
        if (streamActive) {
            animationRef.current = requestAnimationFrame(processFrame);
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [streamActive, processFrame]);

    // Photo capture util (externalCanvas overrides the raw processing canvas)
    const capturePhoto = async (externalCanvas) => {
        const canvas = externalCanvas || canvasRef.current;
        if (!canvas) return null;
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    };

    // Recording state stored in refs to avoid triggering re-renders
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const recordingStartRef = useRef(0);
    const gifFramesRef = useRef([]); // for GIF export
    const gifCaptureIntervalRef = useRef(null);

    // externalCanvas: the high-res offscreen ASCII render canvas from AsciiDisplay
    const startRecording = ({ collectGifFrames = false, gifFps = 10, externalCanvas } = {}) => {
        const canvas = externalCanvas || canvasRef.current;
        if (!canvas) return;
        const stream = canvas.captureStream(30);
        recordedChunksRef.current = [];

        // Pick best supported codec for recording
        const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                recordedChunksRef.current.push(e.data);
            }
        };
        recordingStartRef.current = Date.now();

        if (collectGifFrames) {
            gifFramesRef.current = [];
            gifCaptureIntervalRef.current = setInterval(() => {
                canvas.toBlob((blob) => {
                    if (blob) gifFramesRef.current.push(blob);
                }, 'image/png');
            }, 1000 / gifFps);
        }

        mediaRecorderRef.current.start(100); // collect chunks every 100ms
    };

    const stopRecording = () => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current) {
                resolve(null);
                return;
            }
            mediaRecorderRef.current.onstop = () => {
                const duration = (Date.now() - recordingStartRef.current) / 1000;
                const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

                // clear gif interval if running
                if (gifCaptureIntervalRef.current) {
                    clearInterval(gifCaptureIntervalRef.current);
                    gifCaptureIntervalRef.current = null;
                }

                // if longer than 10s we don't bother keeping frames
                const frames = duration <= 10 ? gifFramesRef.current.slice() : [];
                if (duration > 10) {
                    gifFramesRef.current = [];
                }

                resolve({ videoBlob, duration, gifFrames: frames });
            };
            mediaRecorderRef.current.stop();
        });
    };

    return { videoRef, canvasRef, asciiFrameRef, error, capturePhoto, startRecording, stopRecording };
};
