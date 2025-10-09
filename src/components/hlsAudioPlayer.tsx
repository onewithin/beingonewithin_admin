import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface HLSAudioProps {
    fileName: string;
}

const HLSAudio = ({ fileName }: HLSAudioProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!fileName) return;

        const audio = audioRef.current;
        if (!audio) return;

        // Cleanup any previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Detect if file is HLS (.m3u8) or a normal audio file
        const isHLS = fileName.endsWith(".m3u8");

        if (isHLS && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                debug: false,
            });
            hlsRef.current = hls;

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error("HLS Error:", data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            setError("Network error - cannot load audio");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            setError("Media error - trying to recover");
                            hls.recoverMediaError();
                            break;
                        default:
                            setError("Fatal error - cannot play audio");
                            hls.destroy();
                            break;
                    }
                }
            });

            hls.loadSource(fileName);
            hls.attachMedia(audio);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("HLS Manifest parsed successfully");
            });

            return () => {
                hls.destroy();
            };
        } else if (
            isHLS &&
            audio.canPlayType("application/vnd.apple.mpegurl")
        ) {
            // Safari/iOS native support for HLS
            audio.src = fileName;

            const handleError = (e: Event) => {
                console.error("Audio error:", e);
                setError("Failed to load audio");
            };

            audio.addEventListener("error", handleError);
            return () => audio.removeEventListener("error", handleError);
        } else {
            // Normal audio link (mp3, wav, etc.)
            audio.src = fileName;

            const handleError = (e: Event) => {
                console.error("Audio error:", e);
                setError("Failed to load normal audio file");
            };

            audio.addEventListener("error", handleError);
            return () => audio.removeEventListener("error", handleError);
        }
    }, [fileName]);

    return (
        <div className="w-full">
            {error && (
                <div className="text-red-500 text-sm mb-2">{error}</div>
            )}
            <audio
                ref={audioRef}
                controls
                className="w-full mt-1"
                controlsList="nodownload noplaybackrate"
                preload="auto"
            >
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};

export default HLSAudio;
