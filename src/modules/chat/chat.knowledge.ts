import { GuestyProvider } from '@/integrations/guesty';
import { logger } from '@/shared/logger';

/**
 * Knowledge layer for the chatbot: turns live Guesty listings into a compact, plain-text
 * fact sheet that goes into the model's instructions.
 *
 * Safety rules:
 *  - WHITELIST only. Guesty listings also contain door codes, lock codes, wifi passwords,
 *    private descriptions, house manuals, owner and financial data. None of those fields are
 *    read here, so they can never reach the model (or a guest).
 *  - Only the suburb/state/country is shared, never the street address.
 *  - If a fact is missing in Guesty we say so explicitly ("not stated"), so the model has
 *    nothing to invent and can offer a human handoff instead.
 */

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_TEXT_CHARS = 700;
const MAX_AMENITIES = 80;

/** The only listing fields we read. Everything else on the Guesty object is ignored. */
interface RawListing {
  _id?: string;
  title?: string;
  nickname?: string;
  type?: string;
  propertyType?: string;
  roomType?: string;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  accommodates?: number;
  active?: boolean;
  isListed?: boolean;
  minimumAge?: number;
  defaultCheckInTime?: string;
  defaultCheckOutTime?: string;
  address?: { city?: string; state?: string; country?: string };
  amenities?: string[];
  terms?: { minNights?: number; maxNights?: number };
  prices?: {
    currency?: string;
    basePrice?: number;
    weekendBasePrice?: number;
    weekendDays?: number[];
    cleaningFee?: number;
    extraPersonFee?: number | null;
    guestsIncludedInRegularFee?: number | null;
    securityDepositFee?: number | null;
  };
  publicDescription?: {
    summary?: string;
    space?: string;
    access?: string;
    neighborhood?: string;
    transit?: string;
    notes?: string;
    houseRules?: string;
  };
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function clean(text: string | undefined): string {
  if (!text) return '';
  const plain = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > MAX_TEXT_CHARS ? `${plain.slice(0, MAX_TEXT_CHARS)}...` : plain;
}

function money(value: number | null | undefined, currency: string): string | null {
  return typeof value === 'number' && value > 0 ? `${value} ${currency}` : null;
}

function nights(n: number): string {
  return `${n} night${n === 1 ? '' : 's'}`;
}

function formatListing(l: RawListing, index: number): string {
  const lines: string[] = [];
  const place = [l.address?.city, l.address?.state, l.address?.country].filter(Boolean).join(', ');

  lines.push(`[${index}] ${l.title ?? 'Untitled'} (listingId: ${l._id})`);
  if (place) lines.push(`Location: ${place}`);

  const typeBits = [l.propertyType, l.roomType].filter(Boolean).join(' / ');
  if (typeBits) lines.push(`Type: ${typeBits}`);

  const size: string[] = [];
  if (l.accommodates) size.push(`sleeps up to ${l.accommodates} guests`);
  if (l.bedrooms !== undefined) size.push(`${l.bedrooms} bedroom(s)`);
  if (l.beds !== undefined) size.push(`${l.beds} bed(s)`);
  if (l.bathrooms !== undefined) size.push(`${l.bathrooms} bathroom(s)`);
  if (size.length) lines.push(`Size: ${size.join(', ')}`);

  const p = l.prices;
  if (p?.basePrice) {
    const cur = p.currency ?? 'AUD';
    const price: string[] = [`base rate ${p.basePrice} ${cur} per night`];
    if (p.weekendBasePrice && p.weekendBasePrice !== p.basePrice) {
      const days = (p.weekendDays ?? [])
        .map((d) => DAY_NAMES[d])
        .filter(Boolean)
        .join(', ');
      price.push(`weekend rate ${p.weekendBasePrice} ${cur} per night${days ? ` (${days} nights)` : ''}`);
    }
    const cleaning = money(p.cleaningFee, cur);
    if (cleaning) price.push(`one-off cleaning fee ${cleaning}`);
    const extra = money(p.extraPersonFee ?? undefined, cur);
    if (extra) price.push(`extra guest fee ${extra} per night`);
    const deposit = money(p.securityDepositFee ?? undefined, cur);
    if (deposit) price.push(`security deposit ${deposit}`);
    lines.push(`Pricing: ${price.join('; ')}`);
  } else {
    lines.push('Pricing: not available');
  }

  const stay: string[] = [];
  if (l.terms?.minNights) stay.push(`minimum stay ${nights(l.terms.minNights)}`);
  if (l.terms?.maxNights) stay.push(`maximum stay ${nights(l.terms.maxNights)}`);
  if (l.defaultCheckInTime) stay.push(`check-in from ${l.defaultCheckInTime}`);
  if (l.defaultCheckOutTime) stay.push(`check-out by ${l.defaultCheckOutTime}`);
  if (l.minimumAge) stay.push(`minimum guest age ${l.minimumAge}`);
  if (stay.length) lines.push(`Stay rules: ${stay.join('; ')}`);

  const amenities = (l.amenities ?? []).slice(0, MAX_AMENITIES);
  if (amenities.length) lines.push(`Amenities: ${amenities.join(', ')}`);

  // Policies that guests ask about a lot. Only state them if the listing really says so.
  const petAmenities = amenities.filter((a) => /\bpets?\b|\bdogs?\b/i.test(a));
  lines.push(
    petAmenities.length
      ? `Pets: amenity list says "${petAmenities.join('", "')}"`
      : 'Pets: NOT STATED in listing data',
  );
  const smokingAmenities = amenities.filter((a) => /smoking/i.test(a));
  lines.push(
    smokingAmenities.length
      ? `Smoking: amenity list says "${smokingAmenities.join('", "')}"`
      : 'Smoking: NOT STATED in listing data',
  );

  const d = l.publicDescription;
  const rules = clean(d?.houseRules);
  lines.push(rules ? `House rules: ${rules}` : 'House rules: NOT STATED in listing data');

  const sections: Array<[string, string]> = [
    ['Summary', clean(d?.summary)],
    ['The space', clean(d?.space)],
    ['Guest access', clean(d?.access)],
    ['Neighbourhood', clean(d?.neighborhood)],
    ['Getting around', clean(d?.transit)],
    ['Notes', clean(d?.notes)],
  ];
  for (const [label, value] of sections) {
    if (value) lines.push(`${label}: ${value}`);
  }

  return lines.join('\n');
}

/** Minimal per-listing data the live tools use to validate input and explain results. */
export interface ListingMeta {
  id: string;
  title: string;
  city: string;
  accommodates: number;
  minNights: number | null;
  maxNights: number | null;
}

interface Knowledge {
  text: string;
  index: Map<string, ListingMeta>;
}

/** Listings guests can actually book: active, listed, and not a child unit of a multi-unit. */
function visibleListings(listings: RawListing[]): RawListing[] {
  return listings.filter(
    (l) => l._id && l.active !== false && l.isListed !== false && l.type !== 'MTL_CHILD',
  );
}

function buildKnowledge(listings: RawListing[]): Knowledge | null {
  const visible = visibleListings(listings);
  if (visible.length === 0) return null;

  const index = new Map<string, ListingMeta>();
  for (const l of visible) {
    index.set(l._id as string, {
      id: l._id as string,
      title: l.title ?? 'Untitled',
      city: l.address?.city ?? '',
      accommodates: l.accommodates ?? 0,
      minNights: l.terms?.minNights ?? null,
      maxNights: l.terms?.maxNights ?? null,
    });
  }

  return { text: visible.map((l, i) => formatListing(l, i + 1)).join('\n\n'), index };
}

let cache: (Knowledge & { fetchedAt: number }) | null = null;
let inFlight: Promise<Knowledge | null> | null = null;

async function refresh(): Promise<Knowledge | null> {
  try {
    const response = await new GuestyProvider().getListings({ limit: 100 });
    const built = buildKnowledge(response.results as unknown as RawListing[]);
    if (!built) {
      logger.warn('[chat] knowledge: Guesty returned no visible listings');
      return cache;
    }
    cache = { ...built, fetchedAt: Date.now() };
    return cache;
  } catch (error) {
    logger.error(error, '[chat] knowledge: failed to load listings from Guesty');
    // Serve the last good copy rather than leaving the bot without facts.
    return cache;
  } finally {
    inFlight = null;
  }
}

/** Cached for 10 minutes; if Guesty is down the last good copy is reused. */
async function loadKnowledge(): Promise<Knowledge | null> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache;
  inFlight ??= refresh();
  return inFlight;
}

/** The property fact sheet for the prompt, or null if it can't be loaded at all. */
export async function getPropertyFacts(): Promise<string | null> {
  return (await loadKnowledge())?.text ?? null;
}

/** Bookable listings keyed by Guesty listing id, or null if they can't be loaded. */
export async function getListingIndex(): Promise<Map<string, ListingMeta> | null> {
  return (await loadKnowledge())?.index ?? null;
}
