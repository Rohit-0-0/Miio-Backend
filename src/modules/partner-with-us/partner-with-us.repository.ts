import { SingletonRepository } from '@/shared/persistence/singleton.repository';
import { DOCUMENT_IDS } from '@/infrastructure/sanity/document-ids';
import type { PartnerWithUsData, PartnerWithUsDocument } from './partner-with-us.types';

export const DEFAULT_PARTNER_WITH_US_DATA: PartnerWithUsData = {
  headline: 'A more considered way to manage your property',
  problem: 'Inconsistent income. Time-consuming management.',
  solution: 'Full-service management. Design-led approach. Reliable returns.',
  processCtaText: 'Simple steps -> Enquire now.',
  ctaButton: {
    label: 'Enquire now',
    link: '#enquire',
  },
};

export class PartnerWithUsRepository extends SingletonRepository<
  PartnerWithUsData,
  PartnerWithUsDocument
> {
  constructor() {
    super(DOCUMENT_IDS.PARTNER_WITH_US, 'partnerWithUs');
  }
}
