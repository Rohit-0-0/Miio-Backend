import type { Request, Response } from 'express';
import { PropertyService } from './property.service';
import { ok, created } from '@/shared/utils/response';

export class PropertyController {
  private readonly service = new PropertyService();

  async list(req: Request, res: Response) {
    const result = await this.service.getProperties(req.query as any);
    return res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }

  async get(req: Request, res: Response) {
    const property = await this.service.getProperty(req.params['id'] as string);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    return ok(res, property);
  }

  async getBySlug(req: Request, res: Response) {
    const property = await this.service.getPropertyBySlug(req.params['slug'] as string);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    return ok(res, property);
  }

  async create(req: Request, res: Response) {
    const property = await this.service.createProperty(req.body);
    return created(res, property, 'Property created successfully');
  }

  async update(req: Request, res: Response) {
    const property = await this.service.updateProperty(req.params['id'] as string, req.body);
    return ok(res, property, 'Property updated successfully');
  }

  async delete(req: Request, res: Response) {
    await this.service.deleteProperty(req.params['id'] as string);
    return ok(res, null, 'Property deleted successfully');
  }
}
