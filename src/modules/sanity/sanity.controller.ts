import type { Request, Response } from 'express';

import { ok } from '@/shared/utils/response';

import { SanityService } from './sanity.service';

const sanityService = new SanityService();

export class SanityController {
  async test(req: Request, res: Response) {
    const data = await sanityService.testConnection();

    return ok(res, data, 'Sanity connection successful');
  }
}