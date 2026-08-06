const multer = require('multer');

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      const err = new Error('Profile picture must be a JPEG or PNG image');
      err.code = 'INVALID_FILE_TYPE';
      return cb(err);
    }
    cb(null, true);
  },
});

function profileImageUpload(req, res, next) {
  upload.single('profileImage')(req, res, (err) => {
    if (!err) {
      return next();
    }

    let message = 'Invalid profile picture';
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      message = 'Profile picture must be at most 2MB';
    } else if (err.code === 'INVALID_FILE_TYPE') {
      message = err.message;
    }

    return res.status(400).json({
      error: 'Validation failed',
      details: [{ field: 'profileImage', message }],
    });
  });
}

module.exports = profileImageUpload;
