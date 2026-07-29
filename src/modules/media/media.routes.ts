import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '@/shared/middleware';
import { AppError } from '@/shared/errors';
import { MediaController } from './media.controller';

const router = Router();
const controller = new MediaController();

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new AppError(`Invalid file format: ${file.mimetype}. Allowed formats: jpg, jpeg, png, webp, svg`, 400));
    }
    cb(null, true);
  },
});

router.post(
  '/upload',
  upload.single('image'),
  asyncHandler(controller.upload.bind(controller)),
);

export default router;
