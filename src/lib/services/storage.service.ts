/**
 * storage.service — abstraction for file storage (Supabase Storage today,
 * Cloudflare R2 / S3 after migration — ADR-025). No caller yet; ready for use.
 */

export interface StorageService {
  /** Upload a file to a bucket path. Returns the stored object path. */
  upload(bucket: string, path: string, file: File | Blob): Promise<string>;
  /** Download a file as a Blob. */
  download(bucket: string, path: string): Promise<Blob>;
  /** Create a time-limited signed URL. */
  getSignedUrl(bucket: string, path: string, expiresInSeconds?: number): Promise<string>;
  /** Delete an object. */
  delete(bucket: string, path: string): Promise<void>;
}

import { supabaseStorageAdapter } from '@/lib/adapters/supabase/storage.supabase';

export const storageService: StorageService = supabaseStorageAdapter;
