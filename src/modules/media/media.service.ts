import { sanityClient } from '@/infrastructure/sanity';
import type { ImageAsset } from './media.types';
import { AppError } from '@/shared/errors';
import imageSize from 'image-size';

export class MediaService {
  async uploadImage(buffer: Buffer, filename: string, mimeType: string): Promise<ImageAsset> {
    try {
      // Validate dimensions
      let dimensions;
      try {
        dimensions = imageSize(buffer);
      } catch {
        throw new AppError('Invalid image file', 400);
      }

      if (!dimensions || !dimensions.width || !dimensions.height) {
        throw new AppError('Could not determine image dimensions', 400);
      }

      if (dimensions.width < 300 || dimensions.height < 300) {
        throw new AppError(`Image dimensions are too small (${dimensions.width}x${dimensions.height}). Minimum is 300x300.`, 400);
      }

      if (dimensions.width > 8000 || dimensions.height > 8000) {
        throw new AppError(`Image dimensions are too large (${dimensions.width}x${dimensions.height}). Maximum is 8000x8000.`, 400);
      }

      // Upload to Sanity
      const asset = await sanityClient.assets.upload('image', buffer, {
        filename,
        contentType: mimeType,
      });

      return {
        assetId: asset._id,
        filename: asset.originalFilename || filename,
        width: asset.metadata?.dimensions?.width || dimensions.width,
        height: asset.metadata?.dimensions?.height || dimensions.height,
        mimeType: asset.mimeType,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to upload media: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
}
