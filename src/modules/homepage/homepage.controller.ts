import type { Request, Response } from 'express';
import { HomepageService } from './homepage.service';
import { ok } from '@/shared/utils/response';

export class HomepageController {
  private readonly service = new HomepageService();

  async get(req: Request, res: Response) {
    const doc = await this.service.getHomepage();
    return ok(res, doc);
  }

  // TODO: Extract user ID from req.user if auth is implemented
  private getUpdatedBy(req: Request): string {
    return (req as any).user?.id || 'admin';
  }

  async patchHero(req: Request, res: Response) {
    const doc = await this.service.updateHero(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Hero section updated successfully');
  }

  async patchFeaturedProperties(req: Request, res: Response) {
    const doc = await this.service.updateFeaturedProperties(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Featured Properties section updated successfully');
  }

  async patchEditorialStatement(req: Request, res: Response) {
    const doc = await this.service.updateEditorialStatement(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Editorial Statement section updated successfully');
  }

  async patchLocations(req: Request, res: Response) {
    const doc = await this.service.updateLocations(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Locations section updated successfully');
  }

  async patchTrust(req: Request, res: Response) {
    const doc = await this.service.updateTrust(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Trust section updated successfully');
  }

  async patchJournal(req: Request, res: Response) {
    const doc = await this.service.updateJournal(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Journal section updated successfully');
  }

  async patchFinalCta(req: Request, res: Response) {
    const doc = await this.service.updateFinalCta(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Final CTA section updated successfully');
  }

  async patchSeo(req: Request, res: Response) {
    const doc = await this.service.updateSeo(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'SEO section updated successfully');
  }
}
