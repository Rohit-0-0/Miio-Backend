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

  async patchWhyMiio(req: Request, res: Response) {
    const doc = await this.service.updateWhyMiio(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Why Miio section updated successfully');
  }

  async patchExperiences(req: Request, res: Response) {
    const doc = await this.service.updateExperiences(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Experiences section updated successfully');
  }

  async patchTestimonials(req: Request, res: Response) {
    const doc = await this.service.updateTestimonials(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Testimonials section updated successfully');
  }

  async patchFaq(req: Request, res: Response) {
    const doc = await this.service.updateFaq(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'FAQ section updated successfully');
  }

  async patchNewsletter(req: Request, res: Response) {
    const doc = await this.service.updateNewsletter(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'Newsletter section updated successfully');
  }

  async patchSeo(req: Request, res: Response) {
    const doc = await this.service.updateSeo(req.body, this.getUpdatedBy(req));
    return ok(res, doc, 'SEO section updated successfully');
  }
}
