import type { Request, Response, NextFunction } from 'express';
import { StaysPageService } from './stays-page.service';
import {
  updateGeneralSchema,
  updateFiltersSchema,
  updateEmptyStateSchema,
  updateFinalCtaSchema,
  updateSeoSchema,
} from './stays-page.validation';

export class StaysPageController {
  private service = new StaysPageService();

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getStaysPage();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  updateGeneral = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateGeneralSchema.parse(req.body);
      const result = await this.service.updateGeneral(data, (req as any).user?.id);
      res.json({ success: true, data: result.general });
    } catch (error) {
      next(error);
    }
  };

  updateFilters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateFiltersSchema.parse(req.body);
      const result = await this.service.updateFilters(data, (req as any).user?.id);
      res.json({ success: true, data: result.filters });
    } catch (error) {
      next(error);
    }
  };

  updateEmptyState = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateEmptyStateSchema.parse(req.body);
      const result = await this.service.updateEmptyState(data as any, (req as any).user?.id);
      res.json({ success: true, data: result.emptyState });
    } catch (error) {
      next(error);
    }
  };

  updateFinalCta = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateFinalCtaSchema.parse(req.body);
      const payload: {
        heading: string;
        buttonText: string;
        buttonLink: string;
        description?: string;
      } = {
        heading: data.heading,
        buttonText: data.buttonText,
        buttonLink: data.buttonLink,
      };
      if (data.description !== undefined) {
        payload.description = data.description;
      }
      const result = await this.service.updateFinalCta(payload, (req as any).user?.id);
      res.json({ success: true, data: result.finalCta });
    } catch (error) {
      next(error);
    }
  };

  updateSeo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateSeoSchema.parse(req.body);
      const result = await this.service.updateSeo(data as any, (req as any).user?.id);
      res.json({ success: true, data: result.seo });
    } catch (error) {
      next(error);
    }
  };
}
