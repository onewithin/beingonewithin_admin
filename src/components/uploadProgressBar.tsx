interface UploadProgressBarProps {
    progress: number | null
}

const UploadProgressBar = ({ progress }: UploadProgressBarProps) => {
    if (progress === null) return null

    return (
        <div className="mt-2">
            <div className="h-2 w-full rounded-full bg-[#D9D9D9]">
                <div className="h-2 rounded-full bg-[#2b7272] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[#777777] text-[12px] mt-1">Uploading audio... {progress}%</p>
        </div>
    )
}

export default UploadProgressBar
