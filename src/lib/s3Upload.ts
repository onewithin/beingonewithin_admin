import { fetcher } from "./fetcher";
import { meditationApis } from "./api";

interface PresignedUrlResponse {
  presignedUrl: string;
  key: string;
  url: string;
}

export interface UploadProgress {
  percent: number;
  loaded: number; // bytes sent so far
  total: number; // file size in bytes
}

/**
 * Uploads a file straight to S3 with a presigned URL, so large audio never
 * passes through the API server. Resolves with the S3 key (audio/tmp/...) to
 * send to the meditation (`audioFile`) or thought (`link`) create/update endpoints.
 */
export async function uploadAudioToS3(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  if (file.size === 0) throw new Error("The selected audio file is empty");

  // The PUT must send the same Content-Type the URL was signed with
  const fileType = file.type || "application/octet-stream";

  const { presignedUrl, key } = await fetcher<PresignedUrlResponse>(
    meditationApis.presignedUrl,
    { method: "GET", params: { fileName: file.name, fileType } },
  );

  // An API without the presigned-url route falls through to GET /meditation/:id
  if (!presignedUrl || !key) {
    throw new Error("Could not get an upload URL from the server. Is the API up to date?");
  }

  await putFile(presignedUrl, file, fileType, (loaded) => {
    onProgress?.({
      // Hold at 99 until S3 confirms the upload
      percent: Math.min(99, Math.floor((loaded / file.size) * 100)),
      loaded,
      total: file.size,
    });
  });

  onProgress?.({ percent: 100, loaded: file.size, total: file.size });
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
        // S3 replies with an XML error body, e.g. <Code>SignatureDoesNotMatch</Code>
        const code = xhr.responseText?.match(/<Code>([^<]+)<\/Code>/)?.[1];
        reject(new Error(`Audio upload failed (status ${xhr.status}${code ? `: ${code}` : ""})`));
        return;
      }
      resolve();
    };
    xhr.onerror = () => reject(new Error("Network error while uploading audio"));
    xhr.send(file);
  });
}
