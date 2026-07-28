import { DEFAULT_PARTNER_DATA } from '@/infrastructure/sanity/bootstrap/partner';

import { PartnerRepository } from './partner.repository';
import type { PartnerDocument } from './partner.types';
import type { UpdatePartnerInput } from './partner.validation';

export class PartnerService {
  private readonly repository = new PartnerRepository();

  async getPartner(): Promise<PartnerDocument> {
    const partner = await this.repository.find();

    if (partner) {
      return partner;
    }

    return this.repository.save(DEFAULT_PARTNER_DATA);
  }

  async updatePartner(
    data: UpdatePartnerInput,
  ): Promise<PartnerDocument> {
    return this.repository.save(data);
  }
}
