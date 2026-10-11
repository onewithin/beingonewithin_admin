import * as React from "react"
import { uploadAudioToS3 } from "@/lib/s3Upload"

export interface UploadStats {
  loaded: number // bytes sent so far
  total: number // file size in bytes
  speed: number // average bytes per second since the upload started
  secondsLeft: number | null // null until the speed is known
}

/**
 * Uploads audio straight to S3 and tracks progress (null when idle).
 * Warns before the tab is closed while an upload is running.
 */
export function useAudioUpload() {
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null)
  const [uploadStats, setUploadStats] = React.useState<UploadStats | null>(null)
  const isUploading = uploadProgress !== null

  React.useEffect(() => {
    if (!isUploading) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [isUploading])

  // Resolves with the S3 key to send to the API in place of the file
  const uploadAudio = React.useCallback(async (file: File) => {
    const startedAt = Date.now()
    setUploadProgress(0)
    setUploadStats({ loaded: 0, total: file.size, speed: 0, secondsLeft: null })
    try {
      return await uploadAudioToS3(file, ({ percent, loaded, total }) => {
        const elapsedSeconds = (Date.now() - startedAt) / 1000
        const speed = elapsedSeconds > 0 ? loaded / elapsedSeconds : 0
        setUploadProgress(percent)
        setUploadStats({
          loaded,
          total,
          speed,
          secondsLeft: speed > 0 ? (total - loaded) / speed : null,
        })
      })
    } finally {
      setUploadProgress(null)
      setUploadStats(null)
    }
  }, [])

  return { uploadAudio, uploadProgress, uploadStats, isUploading }
}
