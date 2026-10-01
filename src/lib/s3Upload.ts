import { fetcher } from "./fetcher";
import { uploadApi } from "./api";

// Parts uploaded at the same time, and attempts per part before giving up
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 3;

interface InitiateResponse {
  uploadId: string;
  key: string;
  partSize: number;
}

interface UploadedPart {
  partNumber: number;
  etag: string;
}

/**
 * Uploads a file straight to S3 using a multipart upload, so large audio
 * never passes through the API server. Resolves with the S3 key to send to
 * the meditation (`audioFile`) or thought (`link`) create/update endpoints.
 */
export async function uploadAudioToS3(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (file.size === 0) throw new Error("The selected audio file is empty");

  const { uploadId, key, partSize } = await fetcher<InitiateResponse>(
    uploadApi.initiate,
    {
      method: "POST",
      data: {
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      },
    },
  );

  const totalParts = Math.ceil(file.size / partSize);
  const bytesSent = new Array<number>(totalParts + 1).fill(0);
  const reportProgress = () => {
    const sent = bytesSent.reduce((sum, n) => sum + n, 0);
    // Hold at 99 until S3 has assembled the parts
    onProgress?.(Math.min(99, Math.floor((sent / file.size) * 100)));
  };

  const uploadedParts: UploadedPart[] = [];
  let nextPart = 1;
  let failed = false;

  const uploadPart = async (partNumber: number) => {
    const start = (partNumber - 1) * partSize;
    const blob = file.slice(start, Math.min(start + partSize, file.size));

    for (let attempt = 1; ; attempt++) {
      try {
        // Sign right before sending so long uploads never use an expired URL
        const { parts } = await fetcher<{ parts: { partNumber: number; url: string }[] }>(
          uploadApi.parts,
          { method: "POST", data: { key, uploadId, partNumbers: [partNumber] } },
        );
        const etag = await putBlob(parts[0].url, blob, (loaded) => {
          bytesSent[partNumber] = loaded;
          reportProgress();
        });
        return etag;
      } catch (error) {
        bytesSent[partNumber] = 0;
        reportProgress();
        if (attempt >= MAX_ATTEMPTS || failed) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
      }
    }
  };

  const worker = async () => {
    while (!failed && nextPart <= totalParts) {
      const partNumber = nextPart++;
      try {
        const etag = await uploadPart(partNumber);
        uploadedParts.push({ partNumber, etag });
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  };

  try {
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, totalParts) }, worker),
    );
    await fetcher(uploadApi.complete, {
      method: "POST",
      data: { key, uploadId, parts: uploadedParts },
    });
  } catch (error) {
    // Discard the parts already in S3; the original error is what matters
    fetcher(uploadApi.abort, {
      method: "POST",
      data: { key, uploadId },
    }).catch(() => {});
    throw error;
  }

  onProgress?.(100);
  return key;
}

// XHR instead of fetch: fetch can't report upload progress
function putBlob(
  url: string,
  blob: Blob,
  onProgress: (loaded: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (event) => onProgress(event.loaded);
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Audio upload failed (status ${xhr.status})`));
        return;
      }
      const etag = xhr.getResponseHeader("ETag");
      if (!etag) {
        reject(new Error("Audio upload failed: S3 bucket CORS must expose the ETag header"));
        return;
      }
      resolve(etag);
    };
    xhr.onerror = () => reject(new Error("Network error while uploading audio"));
    xhr.send(blob);
  });
}
