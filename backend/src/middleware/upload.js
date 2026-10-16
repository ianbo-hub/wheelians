// Multer config for image uploads (cars + sell-car submissions).
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config');

fs.mkdirSync(config.uploadDir, { recursive: true });
fs.mkdirSync(path.join(config.uploadDir, 'cars'),     { recursive: true });
fs.mkdirSync(path.join(config.uploadDir, 'sell-car'), { recursive: true });

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

function makeUpload(subdir) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(config.uploadDir, subdir)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().slice(0, 6) || '.jpg';
      const name = crypto.randomBytes(10).toString('hex') + ext;
      cb(null, name);
    },
  });

  return multer({
    storage,
    limits: { fileSize: config.maxUploadMb * 1024 * 1024, files: 10 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED.has(file.mimetype)) cb(null, true);
      else cb(new Error(`Unsupported type: ${file.mimetype}`));
    },
  });
}

module.exports = {
  carImages:        makeUpload('cars'),
  sellCarImages:    makeUpload('sell-car'),
};
