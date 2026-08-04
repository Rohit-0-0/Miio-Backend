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

  async getByIds(req: Request, res: Response) {
    const idsString = req.query['ids'] as string;
    const ids = idsString.split(',').map(id => id.trim()).filter(Boolean);
    const properties = await this.service.getPropertiesByIds(ids);
    
    return res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: properties,
    });
  }

  async get(req: Request, res: Response) {
    const id = req.params['id'] as string;
    
    // Admin / Database requests use internal ID (assuming UUID or custom ID, not Guesty 24-hex)
    // But since Guesty ID is canonical, we'll try to fetch from Guesty.
    // If it fails, we fall back to database to keep admin working if needed.
    try {
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        const property = await this.service.getGuestyPropertyById(id);
        if (property) {
          return ok(res, property);
        }
      }
    } catch (e) {
      // Ignore guesty error and fallback
    }

    const property = await this.service.getProperty(id);
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
