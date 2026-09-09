import type { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';

export class ReviewsController {
  private readonly service = new ReviewsService();

  list = async (req: Request, res: Response) => {
    const listingIdRaw = req.query['listingId'];
    const listingId = typeof listingIdRaw === 'string' ? listingIdRaw : undefined;
    const limitRaw = req.query['limit'];
    const skipRaw = req.query['skip'];
    const limit = limitRaw ? Number(limitRaw) : 20;
    const skip = skipRaw ? Number(skipRaw) : 0;

    const params: { listingId?: string; limit: number; skip: number } = { limit, skip };
    if (listingId) {
      params.listingId = listingId;
    }

    const data = await this.service.listReviews(params);
    return res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: data.items,
      pagination: {
        count: data.count,
        limit: data.limit,
        skip: data.skip,
      },
    });
  };

  getFeatured = async (_req: Request, res: Response) => {
    const data = await this.service.getFeatured();
    return res.status(200).json({
      success: true,
      message: 'Featured reviews retrieved successfully',
      data,
    });
  };

  setFeatured = async (req: Request, res: Response) => {
    const items = req.body?.items || [];
    const data = await this.service.setFeatured(items);
    return res.status(200).json({
      success: true,
      message: 'Featured reviews updated successfully',
      data,
    });
  };

  toggleFeatured = async (req: Request, res: Response) => {
    const { reviewId, listingId = '', featured } = req.body || {};
    if (!reviewId || typeof featured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'reviewId and featured (boolean) are required',
      });
    }

    const data = await this.service.toggleFeatured(String(reviewId), String(listingId), featured);
    return res.status(200).json({
      success: true,
      message: 'Featured state updated successfully',
      data,
    });
  };
}
