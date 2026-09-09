import type { GuestyReviewListItem, HomepageTestimonialItem } from './reviews.types';

export function normalizeGuestyReview(raw: any): Omit<GuestyReviewListItem, 'featured'> | null {
  if (!raw) return null;

  const nested = raw.rawReview || {};
  const quote = nested.public_review || raw.publicReview || raw.public_review || '';
  if (!quote || !String(quote).trim()) return null;

  const id = raw._id || raw.id;
  const listingId = raw.listingId || raw.listing?._id || nested.listingId || '';
  if (!id) return null;

  const author =
    raw.reviewer?.firstName ||
    [raw.reviewer?.firstName, raw.reviewer?.lastName].filter(Boolean).join(' ') ||
    nested.reviewer_name ||
    'Guest';

  const createdAt = raw.createdAt || raw.createdAtGuesty || nested.created_at;
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const rating = Math.round(
    Number(nested.overall_rating ?? raw.overallRating ?? raw.rating ?? 5) || 5
  );

  const sourceRaw = nested.channel || raw.channel || raw.channelId || raw.source || 'Airbnb';
  const source =
    String(sourceRaw).toLowerCase().includes('airbnb')
      ? 'Airbnb'
      : String(sourceRaw).toLowerCase().includes('booking')
        ? 'Booking.com'
        : String(sourceRaw);

  return {
    id: String(id),
    listingId: String(listingId || ''),
    quote: String(quote).trim(),
    author: String(author),
    date,
    source: String(source),
    rating,
    createdAt,
  };
}

export function toHomepageTestimonial(item: Omit<GuestyReviewListItem, 'featured'>): HomepageTestimonialItem {
  return {
    quote: item.quote,
    author: item.author,
    date: item.date,
    source: item.source,
    rating: item.rating,
  };
}