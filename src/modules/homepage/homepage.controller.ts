import type { Request, Response } from 'express';
import { HomepageService } from './homepage.service';
import { ok } from '@/shared/utils/response';

export class HomepageController {
  private readonly service = new HomepageService();

  async get(req: Request, res: Response) {
    const doc = await this.service.getHomepage();
    return ok(res, doc);
  }

}
