import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'photos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure file filter for images only
const fileFilter = (req, file, cb) => {
  // Allow common image formats
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Create multer instance for photo + PDF uploads
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow common image formats + pdf
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files plus PDF are allowed (JPEG, PNG, GIF, WebP, PDF)'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for course files
    files: 1, // Only one file
    fieldNameSize: 100,
    fieldSize: 10 * 1024 * 1024, // 10MB for form fields
    fields: 10 // Max number of form fields
  }
});

export default upload;
export { upload };

