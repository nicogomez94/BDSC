import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.resolve(__dirname, '..', '..', 'uploads');
const SITE_CONTENT_UPLOADS_DIR = path.join(UPLOADS_ROOT, 'site-content');

fs.mkdirSync(SITE_CONTENT_UPLOADS_DIR, { recursive: true });

const IMAGE_EXTENSIONS_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, SITE_CONTENT_UPLOADS_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = IMAGE_EXTENSIONS_BY_MIME[file.mimetype] || path.extname(file.originalname || '').toLowerCase() || '.img';
    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${uniqueId}${extension}`);
  },
});

const imageFileFilter = (_req, file, callback) => {
  if (file.mimetype?.startsWith('image/')) {
    callback(null, true);
    return;
  }

  const error = new Error('Solo se permiten archivos de imagen.');
  error.status = 400;
  callback(error);
};

export const siteContentImageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
