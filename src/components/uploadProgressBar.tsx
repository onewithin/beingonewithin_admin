import type { UploadStats } from "@/hooks/use-audio-upload"

interface UploadProgressBarProps {
    progress: number | null
    stats?: UploadStats | null
}

const formatMB = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`

const formatTimeLeft = (seconds: number) => {
    const s = Math.ceil(seconds)
    if (s < 60) return `${s}s left`
    return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s left`
}

const UploadProgressBar = ({ progress, stats }: UploadProgressBarProps) => {
    if (progress === null) return null

    const remaining = stats ? Math.max(0, stats.total - stats.loaded) : 0

    return (
        <div className="mt-2">
            <div className="h-2 w-full rounded-full bg-[#D9D9D9]">
                <div className="h-2 rounded-full bg-[#2b7272] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-[#777777] text-[12px] mt-1">
                <span>Uploading audio... {progress}%</span>
                {stats && <span>{formatMB(stats.loaded)} / {formatMB(stats.total)}</span>}
            </div>
            {stats && (
                <div className="flex justify-between text-[#777777] text-[12px]">
                    <span>{formatMB(remaining)} remaining</span>
                    <span>
                        {remaining === 0
                            ? 'Finishing...'
                            : stats.secondsLeft === null
                                ? 'Calculating time left...'
                                : `${formatMB(stats.speed)}/s · ${formatTimeLeft(stats.secondsLeft)}`}
                    </span>
                </div>
            )}
        </div>
    )
}

export default UploadProgressBar
