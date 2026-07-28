import type { Request, Response } from 'express';

import { ok } from '@/shared/utils/response';

import { PartnerService } from './partner.service';

export class PartnerController {
  private readonly service = new PartnerService();

  async get(req: Request, res: Response) {
    const partner = await this.service.getPartner();

    return ok(res, partner);
  }

  async update(req: Request, res: Response) {
    const partner = await this.service.updatePartner(req.body);

    return ok(res, partner, 'Partner page updated successfully');
  }
}
