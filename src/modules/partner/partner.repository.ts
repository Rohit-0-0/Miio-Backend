import { SingletonRepository } from '@/shared/persistence/singleton.repository';

import type { PartnerDocument } from './partner.types';
import type { UpdatePartnerInput } from './partner.validation';
import { PARTNER_DOCUMENT } from './constants';

export class PartnerRepository extends SingletonRepository<
  UpdatePartnerInput,
  PartnerDocument
> {
  constructor() {
    super(PARTNER_DOCUMENT.ID, PARTNER_DOCUMENT.TYPE);
  }
}
