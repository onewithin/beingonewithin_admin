import * as React from "react"
import { uploadAudioToS3 } from "@/lib/s3Upload"

/**
 * Uploads audio straight to S3 and tracks progress (null when idle).
 * Warns before the tab is closed while an upload is running.
 */
export function useAudioUpload() {
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null)
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
    setUploadProgress(0)
    try {
      return await uploadAudioToS3(file, setUploadProgress)
    } finally {
      setUploadProgress(null)
    }
  }, [])

  return { uploadAudio, uploadProgress, isUploading }
}
