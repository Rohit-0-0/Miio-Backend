import { PartnerWithUsRepository, DEFAULT_PARTNER_WITH_US_DATA } from './partner-with-us.repository';
import type { PartnerWithUsDocument } from './partner-with-us.types';

export class PartnerWithUsService {
  private readonly repository = new PartnerWithUsRepository();

  async getPageData(): Promise<PartnerWithUsDocument> {
    const data = await this.repository.find();

    if (data) {
      return data;
    }

    return this.repository.save(DEFAULT_PARTNER_WITH_US_DATA);
  }
}
