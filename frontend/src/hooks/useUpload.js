import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  const upload = useCallback(async (file, bucket) => {
    if (!file) {
      setError("Please select a file to upload.");
      return null;
    }

    setUploading(true);
    setError(null);
    setUrl(null);

    const safeName = file.name.replace(/\s+/g, "-");
    const filePath = `${Date.now()}-${safeName}`;
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    setUploading(false);
    const publicUrl = publicData?.publicUrl || null;
    setUrl(publicUrl);
    return publicUrl;
  }, []);

  return { upload, url, uploading, error };
}
