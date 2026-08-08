/** Supabase implementation of StorageService (Supabase Storage). */
import { supabase } from '@/integrations/supabase/client';
import type { StorageService } from '@/lib/services/storage.service';

export const supabaseStorageAdapter: StorageService = {
  async upload(bucket, path, file) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });
    if (error) throw error;
    return data.path;
  },

  async download(bucket, path) {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) throw error;
    return data;
  },

  async getSignedUrl(bucket, path, expiresInSeconds = 3600) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  },

  async delete(bucket, path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};
