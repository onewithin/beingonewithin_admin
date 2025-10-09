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

        // Clean up previous instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        if (Hls.isSupported()) {
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
                console.log("Manifest parsed successfully");
            });

            // Listen for when the duration is available
            hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
                console.log("Level loaded, duration:", data.details.totalduration);
                if (audio && data.details.totalduration) {
                    audio.currentTime = 0; // Force update
                }
            });

            // Additional audio events
            const handleLoadedMetadata = () => {
                console.log("Metadata loaded, duration:", audio.duration);
            };

            const handleDurationChange = () => {
                console.log("Duration changed:", audio.duration);
            };

            const handleCanPlay = () => {
                console.log("Can play, duration:", audio.duration);
            };

            audio.addEventListener("loadedmetadata", handleLoadedMetadata);
            audio.addEventListener("durationchange", handleDurationChange);
            audio.addEventListener("canplay", handleCanPlay);

            return () => {
                audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
                audio.removeEventListener("durationchange", handleDurationChange);
                audio.removeEventListener("canplay", handleCanPlay);
                hls.destroy();
                hlsRef.current = null;
            };
        } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari / iOS native support
            audio.src = fileName;

            const handleLoadedMetadata = () => {
                console.log("Safari - Audio metadata loaded, duration:", audio.duration);
            };

            const handleError = (e: Event) => {
                console.error("Audio error:", e);
                setError("Failed to load audio");
            };

            audio.addEventListener("loadedmetadata", handleLoadedMetadata);
            audio.addEventListener("error", handleError);

            return () => {
                audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
                audio.removeEventListener("error", handleError);
            };
        } else {
            setError("HLS is not supported in this browser");
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