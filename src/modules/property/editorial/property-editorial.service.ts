import { PropertyEditorialRepository } from './property-editorial.repository';
import type {
  CancellationPolicy,
  CancellationPolicyDocument,
  HouseRule,
  HouseRulesGroup,
  PropertyEditorialData,
} from './property-editorial.types';
import { DEFAULT_PROPERTY_EDITORIAL } from './property-editorial.types';

export class PropertyEditorialService {
  private readonly repo = new PropertyEditorialRepository();

  async getEditorial(guestyListingId: string): Promise<PropertyEditorialData> {
    const doc: any = await this.repo.findByGuestyId(guestyListingId);
    if (!doc) {
      const [houseRules, cancellationPolicy] = await Promise.all([
        this.resolveHouseRules([]),
        this.resolveCancellationPolicy(null),
      ]);
      return {
        ...DEFAULT_PROPERTY_EDITORIAL,
        guestyListingId,
        ...houseRules,
        cancellationPolicy,
      };
    }
    
    // Flatten the questions from the referenced FAQ group documents
    const flattenedFaqs = (doc.faqReferences || []).flatMap((group: any) => group?.questions || []);
    const [houseRules, cancellationPolicy] = await Promise.all([
      this.resolveHouseRules(doc.houseRuleReferences || []),
      this.resolveCancellationPolicy(doc.cancellationPolicyReference || null),
    ]);

    // Map Sanity schema fields to expected frontend interface
    return {
      ...DEFAULT_PROPERTY_EDITORIAL,
      guestyListingId,
      subtitle: doc.subtitle || '',
      shortDescription: doc.shortDescription || '',
      description: doc.overview || '',
      experience: doc.heroStory || '',
      faq: flattenedFaqs,
      seo: doc.seo || DEFAULT_PROPERTY_EDITORIAL.seo,
      // Map other fields as needed...
      ...doc,
      ...houseRules,
      cancellationPolicy,
    };
  }

  // The linked policy takes precedence; the CMS default policy applies when none is linked.
  private async resolveCancellationPolicy(
    linked: CancellationPolicyDocument | null,
  ): Promise<CancellationPolicy | null> {
    const policy = linked?.title ? linked : await this.repo.findDefaultCancellationPolicy();
    if (!policy?.title) return null;

    return {
      title: policy.title,
      ...(policy.summary ? { summary: policy.summary } : {}),
      ...(policy.intro ? { intro: policy.intro } : {}),
      tiers: (policy.tiers || [])
        .filter((tier) => Boolean(tier?.title))
        .map(({ title, timeframe, details }) => ({
          title,
          ...(timeframe ? { timeframe } : {}),
          ...(details ? { details } : {}),
        })),
      ...(policy.details?.length ? { details: policy.details } : {}),
    };
  }

  // Linked groups take precedence; the CMS default group applies when none are linked.
  private async resolveHouseRules(
    groups: (HouseRulesGroup | null)[],
  ): Promise<Pick<PropertyEditorialData, 'houseRules' | 'houseRulesIntro'>> {
    let validGroups = groups.filter((group): group is HouseRulesGroup => Boolean(group?.rules?.length));

    if (validGroups.length === 0) {
      const defaultGroup = await this.repo.findDefaultHouseRules();
      validGroups = defaultGroup?.rules?.length ? [defaultGroup] : [];
    }

    const houseRules: HouseRule[] = validGroups
      .flatMap((group) => group.rules || [])
      .filter((rule) => Boolean(rule?.rule))
      .map(({ category, rule, details, icon }) => ({
        category: category || 'additional',
        rule,
        ...(details ? { details } : {}),
        ...(icon ? { icon } : {}),
      }));

    const houseRulesIntro = validGroups.find((group) => group.intro)?.intro;

    return { houseRules, ...(houseRulesIntro ? { houseRulesIntro } : {}) };
  }

  async updateEditorial(guestyListingId: string, data: Partial<PropertyEditorialData>): Promise<PropertyEditorialData> {
    const updated = await this.repo.save(guestyListingId, data);
    return updated;
  }
}
