import { DEFAULT_ABOUT_DATA } from '@/infrastructure/sanity/bootstrap/about';

import { AboutRepository } from './about.repository';
import type { AboutDocument } from './about.types';
import type { UpdateAboutInput } from './about.validation';

export class AboutService {
  private readonly repository = new AboutRepository();

  async getAbout(): Promise<AboutDocument> {
    const about = await this.repository.find();

    if (about) {
      return about;
    }

    return this.repository.save(DEFAULT_ABOUT_DATA);
  }

  async updateAbout(
    data: UpdateAboutInput,
  ): Promise<AboutDocument> {
    return this.repository.save(data);
  }
}