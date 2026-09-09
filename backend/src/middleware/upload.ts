import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists for local fallback
export const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jfif', '.avif', '.heic', '.heif'];

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isImageMime = file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';
  const isAllowedExt = allowedExts.includes(ext);

  if (!isImageMime && !isAllowedExt) {
    return cb(new Error('Chỉ chấp nhận các định dạng ảnh hợp lệ: JPG, JPEG, PNG, WEBP, GIF, JFIF, AVIF, HEIC'));
  }
  cb(null, true);
};

// Memory storage keeps file buffers in memory for direct cloud upload to Supabase
const memoryStorage = multer.memoryStorage();

export const uploadImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB max
  },
  fileFilter
});
