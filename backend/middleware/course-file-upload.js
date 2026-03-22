import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure base directory exists
const baseDir = path.join(process.cwd(), 'public', 'uploads', 'course-files');
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Dynamic destination: group by subject (subjectId or subject name)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subjectFolder = (req.body?.subjectId || req.body?.subject || 'unknown').toString();
    const dest = path.join(baseDir, subjectFolder);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const timestamp = Date.now();
    cb(null, `${timestamp}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const courseFileUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1,
    fieldNameSize: 100,
    fieldSize: 10 * 1024 * 1024,
    fields: 10
  }
});

export default courseFileUpload;
export { courseFileUpload };
