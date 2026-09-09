import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
export const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'media';

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export function isSupabaseReady(): boolean {
  return !!supabase;
}

export interface UploadResult {
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  isCloud: boolean;
}

export async function uploadToStorage(
  file: Express.Multer.File,
  folder: string = 'media'
): Promise<UploadResult> {
  const ext = path.extname(file.originalname).toLowerCase();
  const cleanBase = path.basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .substring(0, 30);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const cleanFilename = `${cleanBase || 'image'}-${uniqueSuffix}${ext}`;
  const storagePath = folder ? `${folder}/${cleanFilename}` : cleanFilename;

  // 1. Upload to Supabase Storage
  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error, falling back to local disk:', error);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        return {
          filename: storagePath,
          original_name: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size,
          url: publicUrlData.publicUrl,
          isCloud: true
        };
      }
    } catch (supabaseErr) {
      console.error('Supabase upload exception, falling back to local disk:', supabaseErr);
    }
  }

  // 2. Fallback to Local Disk if Supabase is unavailable
  const localTargetDir = path.join(__dirname, '..', '..', 'uploads', folder);
  if (!fs.existsSync(localTargetDir)) {
    fs.mkdirSync(localTargetDir, { recursive: true });
  }
  const localFilePath = path.join(localTargetDir, cleanFilename);
  fs.writeFileSync(localFilePath, file.buffer);

  const localUrl = `/uploads/${folder ? folder + '/' : ''}${cleanFilename}`;
  return {
    filename: cleanFilename,
    original_name: file.originalname,
    mime_type: file.mimetype,
    file_size: file.size,
    url: localUrl,
    isCloud: false
  };
}

export async function deleteFromStorage(filenameOrUrl: string): Promise<boolean> {
  if (!filenameOrUrl) return false;

  // Check if Supabase URL or cloud storage path
  if (supabase && (filenameOrUrl.startsWith('http') || filenameOrUrl.includes('/'))) {
    try {
      let objectPath = filenameOrUrl;
      const publicPrefix = `/public/${BUCKET_NAME}/`;
      const idx = filenameOrUrl.indexOf(publicPrefix);
      if (idx !== -1) {
        objectPath = filenameOrUrl.substring(idx + publicPrefix.length);
      }

      const { error } = await supabase.storage.from(BUCKET_NAME).remove([objectPath]);
      if (!error) return true;
      console.error('Supabase delete error:', error);
    } catch (e) {
      console.error('Error deleting from Supabase:', e);
    }
  }

  // Local disk deletion
  try {
    const cleanRelative = filenameOrUrl.replace(/^\/uploads\//, '');
    const localPath = path.join(__dirname, '..', '..', 'uploads', cleanRelative);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
  } catch (err) {
    console.error('Error deleting local file:', err);
  }

  return false;
}
