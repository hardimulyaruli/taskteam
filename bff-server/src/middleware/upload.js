const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// ── Pastikan folder uploads ada ──
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Tipe file yang diizinkan ──
const ALLOWED_MIMETYPES = [
  // Dokumen
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  // Gambar
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Archive
  'application/zip',
  'application/x-rar-compressed',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES     = 5;                 // maks 5 file sekaligus

// ── Storage: simpan ke /uploads dengan nama uuid ──
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// ── Filter tipe file ──
function fileFilter(_req, file, cb) {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(
        new Error(`Tipe file tidak diizinkan: ${file.mimetype}`),
        { statusCode: 400 }
      ),
      false
    );
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

// ── Error handler multer ──
function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Ukuran file maksimal 10 MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: `Maksimal ${MAX_FILES} file sekaligus.` });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err?.statusCode === 400) {
    return res.status(400).json({ message: err.message });
  }

  next(err);
}

module.exports = {
  upload,
  handleUploadError,
  UPLOAD_DIR,
};