import type { Request, Response } from 'express';

import { ok } from '@/shared/utils/response';

import { AboutService } from './about.service';

export class AboutController {
  private readonly service = new AboutService();

  async get(req: Request, res: Response) {
    const about = await this.service.getAbout();

    return ok(res, about);
  }

  async update(req: Request, res: Response) {
    const about = await this.service.updateAbout(req.body);

    return ok(res, about, 'About page updated successfully');
  }
}