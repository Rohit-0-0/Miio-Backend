import { AppError } from '@/shared/errors';
import { generateUniqueSlug, buildPagination } from '@/shared/utils';

import { JournalRepository } from './journal.repository';
import { JournalMapper } from './journal.mapper';
import type { JournalDocument } from './journal.types';
import type { CreateJournalInput, UpdateJournalInput, ListJournalQuery } from './journal.validation';
import { READING_TIME_WPM } from './constants';

export class JournalService {
  private readonly repository = new JournalRepository();

  private calculateReadingTime(content: string): number {
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / READING_TIME_WPM);
  }

  async createJournal(data: CreateJournalInput): Promise<JournalDocument> {
    const exists = await this.repository.existsByTitle(data.title);
    if (exists) {
      throw new AppError('A journal article with this title already exists', 409, 'CONFLICT');
    }

    const slug = await generateUniqueSlug(data.title, (s) => this.repository.existsBySlug(s));
    const readingTime = this.calculateReadingTime(data.content);

    return this.repository.create({
      ...data,
      slug,
      readingTime,
    });
  }

  async updateJournal(id: string, data: UpdateJournalInput): Promise<JournalDocument> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Journal article not found', 404, 'RESOURCE_NOT_FOUND');
    }

    const updates = { ...data } as Partial<Omit<JournalDocument, '_id' | '_type' | '_createdAt' | '_updatedAt'>>;

    if (data.title && data.title !== existing.title) {
      updates.slug = await generateUniqueSlug(data.title, (s) => this.repository.existsBySlug(s));
    }

    if (data.content && data.content !== existing.content) {
      updates.readingTime = this.calculateReadingTime(data.content);
    }

    return this.repository.update(id, updates);
  }

  async listJournals(query: ListJournalQuery) {
    const { items, total } = await this.repository.findAll(query);
    const pagination = buildPagination(total, query);

    return { data: items.map(item => JournalMapper.toDto(item)), pagination };
  }

  async getJournalById(id: string): Promise<JournalDocument> {
    const journal = await this.repository.findById(id);
    if (!journal) {
      throw new AppError('Journal article not found', 404, 'RESOURCE_NOT_FOUND');
    }
    return JournalMapper.toDto(journal);
  }

  async getJournalBySlug(slug: string): Promise<JournalDocument> {
    const journal = await this.repository.findBySlug(slug);
    if (!journal) {
      throw new AppError('Journal article not found', 404, 'RESOURCE_NOT_FOUND');
    }
    return JournalMapper.toDto(journal);
  }

  async deleteJournal(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Journal article not found', 404, 'RESOURCE_NOT_FOUND');
    }
    await this.repository.delete(id);
  }
}
