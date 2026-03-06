export type UploadedAsset = {
  key: string;
  url: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
};

export function uploadAsset(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadedAsset> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload", true);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) {
        return;
      }
      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress(progress);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const payload = JSON.parse(xhr.responseText) as UploadedAsset;
          resolve(payload);
        } catch {
          reject(new Error("Invalid upload response"));
        }
        return;
      }

      reject(new Error(xhr.responseText || "Upload failed"));
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    const body = new FormData();
    body.set("file", file);
    xhr.send(body);
  });
}
