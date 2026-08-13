import type { Request, Response } from 'express';
import { ok } from '@/shared/utils/response';
import { PartnerWithUsService } from './partner-with-us.service';

export class PartnerWithUsController {
  private readonly service = new PartnerWithUsService();

  async get(req: Request, res: Response) {
    const data = await this.service.getPageData();
    return ok(res, data);
  }
}
