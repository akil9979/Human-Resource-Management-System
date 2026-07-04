import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the local uploads/leaves directory exists
const uploadDir = path.resolve('uploads', 'leaves');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

import { AuthRequest } from '../types/express.js';

// Configure Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: any, file, cb) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, `leave-${userId}-${uniqueSuffix}${fileExt}`);
  },
});

// Configure File Filters (PDF & standard images)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document format. Only PDF, JPEG, PNG, and WEBP files are allowed.'));
  }
};

// Set up the Multer Uploader
export const leaveUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default leaveUpload;
