import { supabase } from "./supabase";

function buildFilePath(file) {
  const safeName = file.name.replace(/\s+/g, "-");
  return `${Date.now()}-${safeName}`;
}

export async function uploadFile(file, bucket) {
  const filePath = buildFilePath(file);
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: false });

  return { data, error, filePath };
}

export function getPublicUrl(filePath, bucket) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl || null;
}

export async function deleteFile(filePath, bucket) {
  return supabase.storage.from(bucket).remove([filePath]);
}

export async function listFiles(bucket) {
  return supabase.storage.from(bucket).list();
}
