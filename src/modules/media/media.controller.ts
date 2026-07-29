import type { Request, Response } from 'express';
import { MediaService } from './media.service';
import { ok } from '@/shared/utils/response';
import { AppError } from '@/shared/errors';

export class MediaController {
  private readonly service = new MediaService();

  async upload(req: Request, res: Response) {
    const file = req.file;

    if (!file) {
      throw new AppError('No image file provided', 400);
    }

    const imageAsset = await this.service.uploadImage(file.buffer, file.originalname, file.mimetype);

    return ok(res, imageAsset, 'Image uploaded successfully');
  }
}
