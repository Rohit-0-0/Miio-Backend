import type { Request, Response, NextFunction } from 'express';
import { PropertyEditorialService } from './property-editorial.service';

export class PropertyEditorialController {
  private service = new PropertyEditorialService();

  // GET /api/v1/properties/editorial/:id (Admin endpoint)
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The frontend uses the Property ID (or guestyId). We map this to guestyListingId
      const id = req.params['id'] as string;
      const data = await this.service.getEditorial(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/properties/editorial/:id (Admin endpoint)
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params['id'] as string;
      const data = req.body;
      const result = await this.service.updateEditorial(id, data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
