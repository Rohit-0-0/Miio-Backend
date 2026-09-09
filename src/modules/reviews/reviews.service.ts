import { GuestyProvider } from '@/integrations/guesty/guesty.provider';
import { ReviewsRepository } from './reviews.repository';
import { normalizeGuestyReview, toHomepageTestimonial } from './reviews.mapper';
import type {
  FeaturedReviewRef,
  GuestyReviewListItem,
  HomepageTestimonialItem,
  ReviewsListResult,
} from './reviews.types';

export class ReviewsService {
  private readonly guesty = new GuestyProvider();
  private readonly repository = new ReviewsRepository();

  async listReviews(params: {
    listingId?: string;
    limit?: number;
    skip?: number;
  }): Promise<ReviewsListResult> {
    const limit = params.limit ?? 20;
    const skip = params.skip ?? 0;

    const guestyQuery: { listingId?: string; limit: number; skip: number } = {
      limit,
      skip,
    };
    if (params.listingId) {
      guestyQuery.listingId = params.listingId;
    }

    const response = await this.guesty.getReviews(guestyQuery);

    const results = response?.results || response?.data || [];
    // Guesty Open API returns { data, limit, skip } — often no total count
    const pageLen = Array.isArray(results) ? results.length : 0;
    const count =
      typeof response?.count === 'number'
        ? response.count
        : pageLen < limit
          ? skip + pageLen
          : skip + pageLen + 1; // at least one more page may exist

    const featured = await this.repository.getFeaturedRefs();
    const featuredIds = new Set(featured.map((f) => f.reviewId));

    const items: GuestyReviewListItem[] = results
      .map((raw: any) => normalizeGuestyReview(raw))
      .filter(Boolean)
      .map((item: NonNullable<ReturnType<typeof normalizeGuestyReview>>) => ({
        ...item,
        featured: featuredIds.has(item.id),
      }));

    return { items, count, limit, skip };
  }

  async getFeatured(): Promise<FeaturedReviewRef[]> {
    return this.repository.getFeaturedRefs();
  }

  async setFeatured(items: FeaturedReviewRef[]): Promise<FeaturedReviewRef[]> {
    return this.repository.setFeaturedRefs(items);
  }

  async toggleFeatured(reviewId: string, listingId: string, featured: boolean): Promise<FeaturedReviewRef[]> {
    const current = await this.repository.getFeaturedRefs();
    let next: FeaturedReviewRef[];

    if (featured) {
      if (current.some((item) => item.reviewId === reviewId)) {
        next = current;
      } else {
        next = [...current, { reviewId, listingId }];
      }
    } else {
      next = current.filter((item) => item.reviewId !== reviewId);
    }

    return this.repository.setFeaturedRefs(next);
  }

  /**
   * Resolve featured Guesty review IDs into homepage testimonial cards.
   */
  async resolveFeaturedForHomepage(): Promise<HomepageTestimonialItem[]> {
    const featured = await this.repository.getFeaturedRefs();
    if (featured.length === 0) return [];

    const byListing = new Map<string, string[]>();
    const noListing: string[] = [];

    for (const item of featured) {
      if (item.listingId) {
        const list = byListing.get(item.listingId) || [];
        list.push(item.reviewId);
        byListing.set(item.listingId, list);
      } else {
        noListing.push(item.reviewId);
      }
    }

    const found = new Map<string, NonNullable<ReturnType<typeof normalizeGuestyReview>>>();

    await Promise.all(
      Array.from(byListing.entries()).map(async ([listingId, ids]) => {
        try {
          const response = await this.guesty.getReviews({ listingId, limit: 100, skip: 0 });
          const results = response?.results || response?.data || [];
          for (const raw of results) {
            const normalized = normalizeGuestyReview(raw);
            if (normalized && ids.includes(normalized.id)) {
              found.set(normalized.id, normalized);
            }
          }
        } catch (error) {
          console.error(`Failed to resolve reviews for listing ${listingId}:`, error);
        }
      })
    );

    // Fallback: scan account-wide pages for any remaining IDs
    const missing = featured.map((f) => f.reviewId).filter((id) => !found.has(id));
    if (missing.length > 0 || noListing.length > 0) {
      const needed = new Set([...missing, ...noListing]);
      let skip = 0;
      const pageSize = 100;
      let guard = 0;

      while (needed.size > 0 && guard < 10) {
        guard += 1;
        try {
          const response = await this.guesty.getReviews({ limit: pageSize, skip });
          const results = response?.results || response?.data || [];
          if (!results.length) break;

          for (const raw of results) {
            const normalized = normalizeGuestyReview(raw);
            if (normalized && needed.has(normalized.id)) {
              found.set(normalized.id, normalized);
              needed.delete(normalized.id);
            }
          }

          const count = typeof response?.count === 'number' ? response.count : undefined;
          skip += pageSize;
          if (count !== undefined && skip >= count) break;
          if (results.length < pageSize) break;
        } catch (error) {
          console.error('Failed account-wide review scan for featured resolve:', error);
          break;
        }
      }
    }

    return featured
      .map((ref) => found.get(ref.reviewId))
      .filter(Boolean)
      .map((item) => toHomepageTestimonial(item!));
  }
}