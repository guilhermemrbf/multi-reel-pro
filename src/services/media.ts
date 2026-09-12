import { supabase } from "@/integrations/supabase/client";
import type { MediaAsset } from "@/types/growkit";

export const MEDIA_BUCKET = "media-assets";
export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
export const ACCEPTED_MIME_TYPES = ["video/mp4", "video/quicktime"];
export const ACCEPTED_EXTENSIONS = [".mp4", ".mov"];

export function validateVideoFile(file: File): string | null {
  if (file.size === 0) return "O arquivo está vazio.";
  if (file.size > MAX_FILE_SIZE_BYTES) return "O arquivo excede o limite de 500 MB.";
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Extensão inválida. Envie um arquivo MP4 ou MOV.";
  }
  if (file.type && !ACCEPTED_MIME_TYPES.includes(file.type)) {
    return "Formato não suportado. Envie um arquivo MP4 ou MOV.";
  }
  return null;
}

/**
 * Reads the video duration in the browser.
 * Placeholder seam for a future FFmpeg.wasm pre-processing pipeline:
 * transcoding/compression should be plugged in here, before uploadMediaAsset.
 */
export function readVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : null;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
  });
}

export async function listMediaAssets(limit = 60): Promise<MediaAsset[]> {
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function uploadMediaAsset(file: File): Promise<MediaAsset> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Sessão expirada. Entre novamente.");
  const userId = userData.user.id;

  const mediaId = crypto.randomUUID();
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const storagePath = `${userId}/${mediaId}/video${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, file, { contentType: file.type || "video/mp4", upsert: false });
  if (uploadError) throw uploadError;

  const duration = await readVideoDuration(file);

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      id: mediaId,
      user_id: userId,
      storage_path: storagePath,
      original_filename: file.name,
      mime_type: file.type || null,
      file_size_bytes: file.size,
      duration_seconds: duration,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    throw error;
  }
  return data;
}

export async function deleteMediaAsset(asset: MediaAsset): Promise<void> {
  const { error } = await supabase.from("media_assets").delete().eq("id", asset.id);
  if (error) throw error;
  await supabase.storage.from(MEDIA_BUCKET).remove([asset.storage_path]);
}

/** Private bucket: playback always uses a short-lived signed URL. */
export async function createSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
