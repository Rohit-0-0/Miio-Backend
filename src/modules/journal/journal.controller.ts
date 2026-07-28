import type { Request, Response } from 'express';
import { listJournalSchema } from './journal.validation';
import { ok } from '@/shared/utils/response';
import { JournalService } from './journal.service';

export class JournalController {
  private readonly service = new JournalService();

  async create(req: Request, res: Response) {
    const journal = await this.service.createJournal(req.body);
    return ok(res, journal, 'Journal created successfully');
  }

  async update(req: Request, res: Response) {
    const journal = await this.service.updateJournal(req.params['id'] as string, req.body);
    return ok(res, journal, 'Journal updated successfully');
  }

  async list(req: Request, res: Response) {
    const query = listJournalSchema.shape.query.parse(req.query);
    const result = await this.service.listJournals(query);
    return res.status(200).json({
      success: true,
      message: 'Success',
      data: result.data,
      pagination: result.pagination,
    });
  }

  async getBySlug(req: Request, res: Response) {
    const journal = await this.service.getJournalBySlug(req.params['slug'] as string);
    return ok(res, journal);
  }

  async getById(req: Request, res: Response) {
    const journal = await this.service.getJournalById(req.params['id'] as string);
    return ok(res, journal);
  }

  async delete(req: Request, res: Response) {
    await this.service.deleteJournal(req.params['id'] as string);
    return ok(res, null, 'Journal deleted successfully');
  }
}
