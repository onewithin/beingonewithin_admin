import { fetcher } from "./fetcher";
import { meditationApis } from "./api";

interface PresignedUrlResponse {
  presignedUrl: string;
  key: string;
  url: string;
}

/**
 * Uploads a file straight to S3 with a presigned URL, so large audio never
 * passes through the API server. Resolves with the S3 key (audio/tmp/...) to
 * send to the meditation (`audioFile`) or thought (`link`) create/update endpoints.
 */
export async function uploadAudioToS3(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (file.size === 0) throw new Error("The selected audio file is empty");

  // The PUT must send the same Content-Type the URL was signed with
  const fileType = file.type || "application/octet-stream";

  const { presignedUrl, key } = await fetcher<PresignedUrlResponse>(
    meditationApis.presignedUrl,
    { method: "GET", params: { fileName: file.name, fileType } },
  );

  await putFile(presignedUrl, file, fileType, (loaded) => {
    // Hold at 99 until S3 confirms the upload
    onProgress?.(Math.min(99, Math.floor((loaded / file.size) * 100)));
  });

  onProgress?.(100);
  return key;
}

// XHR instead of fetch: fetch can't report upload progress
function putFile(
  url: string,
  file: File,
  contentType: string,
  onProgress: (loaded: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => onProgress(event.loaded);
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Audio upload failed (status ${xhr.status})`));
        return;
      }
      resolve();
    };
    xhr.onerror = () => reject(new Error("Network error while uploading audio"));
    xhr.send(file);
  });
}
