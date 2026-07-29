import type { Request, Response } from 'express';
import { ok } from '@/shared/utils/response';
import { HomepageService } from './homepage.service';

export class HomepageController {
  private readonly service = new HomepageService();

  async get(req: Request, res: Response) {
    const doc = await this.service.getHomepage();
    return ok(res, doc);
  }

  async patchHero(req: Request, res: Response) {
    const updated = await this.service.updateHero(req.body);
    return ok(res, updated, 'Hero section updated');
  }
}
