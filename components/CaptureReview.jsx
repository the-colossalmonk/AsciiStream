import React from 'react';

// Simple "polaroid" wrapper with share buttons
const CaptureReview = ({ media, onDownload, onCopyLink }) => {
    if (!media) return null;

    const handleShare = async (platform) => {
        const { url, type } = media;
        // many platforms don't allow direct upload via URL; we rely on Web Share API
        if (navigator.share) {
            try {
                const shareData = { title: 'AsciiStream capture', text: 'Check out my AsciiStream!', url };
                if (media.file) {
                    shareData.files = [media.file];
                }
                await navigator.share(shareData);
            } catch (e) {
                console.warn('Share failed', e);
            }
            return;
        }

        // fallback: open a new window with prefilled data when possible
        switch (platform) {
            case 'twitter':
                window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent('AsciiStream capture')}&url=${encodeURIComponent(url)}`,
                    '_blank'
                );
                break;
            case 'whatsapp':
                window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent('AsciiStream capture') + '%20' + encodeURIComponent(url)}`,
                    '_blank'
                );
                break;
            case 'instagram':
                // cannot share via web; desktop disabled
                alert('Instagram sharing is only supported on mobile devices via the native share sheet');
                break;
            default:
                break;
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-6 bg-black/80">
            <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full">
                <div className="p-4">
                    <div className="border border-zinc-300 p-2 bg-white" style={{ boxShadow: '0 4px 6px rgba(0,0,0,.3)', transform: 'rotate(-2deg)' }}>
                        {media.type === 'photo' && <img src={media.url} alt="capture" className="w-full h-auto" />}
                        {media.type === 'video' && (
                            <video src={media.url} controls className="w-full h-auto" />
                        )}
                        {media.type === 'gif' && <img src={media.url} alt="gif capture" className="w-full h-auto" />}
                        <div className="mt-2 text-center text-xs text-zinc-500">AsciiStream</div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <button onClick={() => onDownload()} className="text-xs text-blue-500 hover:underline">Download</button>
                        <button onClick={() => handleShare('twitter')} className="text-xs text-blue-400 hover:underline">Twitter</button>
                        <button onClick={() => handleShare('whatsapp')} className="text-xs text-green-500 hover:underline">WhatsApp</button>
                        <button
                            onClick={() => handleShare('instagram')}
                            className={`text-xs ${navigator.share ? 'text-pink-500 hover:underline' : 'text-gray-500 cursor-not-allowed'}`}
                            disabled={!navigator.share}
                        >
                            Instagram
                        </button>
                        <button onClick={() => onCopyLink()} className="text-xs text-gray-600 hover:underline">Copy link</button>
                    </div>
                </div>
                <button
                    onClick={() => onDownload()}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default CaptureReview;
