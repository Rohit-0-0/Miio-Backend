import { tool } from 'ai';
import { z } from 'zod';

import { BookingEngineService } from '@/integrations/booking-engine/services/booking-engine.service';
import { AppError } from '@/shared/errors';
import { logger } from '@/shared/logger';

import { getListingIndex, type ListingMeta } from './chat.knowledge';

/**
 * Live tools the model can call. They are READ-ONLY (search + price quote); nothing here
 * creates a reservation or takes payment.
 *
 * Rules every tool follows:
 *  - Validate input in code (dates, guest counts, listing ids). Never trust the model.
 *  - Return small, structured results with a plain-language reason when something is not
 *    possible, so the model reports facts instead of guessing.
 *  - Never throw to the model; return { ok: false } so it can apologise or hand off.
 */

const MAX_STAY_NIGHTS = 90;

// ---------- date helpers ----------

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD');

function todaySydney(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney' }).format(new Date());
}

function parseIsoDate(value: string): Date | null {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

type StayCheck = { ok: true; nights: number } | { ok: false; error: string };

function validateStay(checkIn: string, checkOut: string): StayCheck {
  const start = parseIsoDate(checkIn);
  const end = parseIsoDate(checkOut);
  if (!start || !end) return { ok: false, error: 'Dates must be real calendar dates in YYYY-MM-DD format.' };
  if (checkIn < todaySydney()) {
    return { ok: false, error: `Check-in cannot be in the past (today is ${todaySydney()} in Sydney).` };
  }
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (nights < 1) return { ok: false, error: 'Check-out must be after check-in.' };
  if (nights > MAX_STAY_NIGHTS) {
    return { ok: false, error: `Stays longer than ${MAX_STAY_NIGHTS} nights cannot be quoted here.` };
  }
  return { ok: true, nights };
}

// ---------- shared input ----------

const guestsInput = {
  adults: z.number().int().min(1).max(20).describe('Number of adults (at least 1).'),
  children: z.number().int().min(0).max(20).default(0).describe('Number of children (2-12 years).'),
  infants: z.number().int().min(0).max(10).default(0).describe('Number of infants (under 2).'),
};

const datesInput = {
  checkIn: isoDate.describe('Check-in date, YYYY-MM-DD.'),
  checkOut: isoDate.describe('Check-out date, YYYY-MM-DD (the morning the guest leaves).'),
};

function fail(error: string) {
  return { ok: false as const, error };
}

// ---------- Guesty response shapes (parsed so missing data can never become a guess) ----------

const searchResultSchema = z.array(
  z.object({
    _id: z.string(),
    title: z.string().optional(),
    accommodates: z.number().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    address: z.object({ city: z.string().optional() }).optional(),
    prices: z.object({ currency: z.string().optional() }).optional(),
    nightlyRates: z.record(z.string(), z.number()).optional(),
  }),
);

const quoteSchema = z.object({
  rates: z.object({
    ratePlans: z
      .array(
        z.object({
          ratePlan: z.object({
            cancellationPolicy: z.string().optional(),
            money: z.object({
              currency: z.string(),
              fareAccommodation: z.number(),
              fareAccommodationAdjusted: z.number().optional(),
              fareCleaning: z.number().default(0),
              totalTaxes: z.number().default(0),
              subTotalPrice: z.number(),
              invoiceItems: z
                .array(z.object({ title: z.string(), amount: z.number(), type: z.string() }))
                .default([]),
            }),
          }),
        }),
      )
      .min(1),
  }),
});

const guestyErrorSchema = z.object({
  error: z.object({
    code: z.union([z.string(), z.number()]).optional(),
    message: z.string().optional(),
  }),
});

type UnavailableReason = 'MIN_STAY' | 'MAX_STAY' | 'NOT_AVAILABLE' | 'TOO_MANY_GUESTS';

/** Turns a Guesty quote error into a business reason, or null if it is a real failure. */
function classifyQuoteError(error: unknown): UnavailableReason | null {
  if (!(error instanceof AppError)) return null;
  const parsed = guestyErrorSchema.safeParse(error.details);
  if (!parsed.success) return null;

  const { code, message } = parsed.data.error;
  if (code === 'LISTING_IS_NOT_AVAILABLE') {
    // Guesty also sets minNights/maxNights flags for per-date calendar rules (e.g. a 2-night
    // gap between bookings). Those are NOT the listing's standard limits, so we deliberately
    // do not turn them into a "minimum/maximum stay" reason with a number. The property's
    // own min/max stay is checked up front from its listing terms instead.
    return 'NOT_AVAILABLE';
  }
  if (code === 'VALIDATION_ERROR' && /guest count/i.test(message ?? '')) return 'TOO_MANY_GUESTS';
  return null;
}

function describeUnavailable(reason: UnavailableReason, listing: ListingMeta): string {
  switch (reason) {
    case 'MIN_STAY':
      return `The stay is shorter than this property's minimum stay${listing.minNights ? ` (${listing.minNights} nights)` : ''}.`;
    case 'MAX_STAY':
      return `The stay is longer than this property's maximum stay${listing.maxNights ? ` (${listing.maxNights} nights)` : ''}.`;
    case 'TOO_MANY_GUESTS':
      return `This property sleeps at most ${listing.accommodates} guests.`;
    case 'NOT_AVAILABLE':
      return 'These dates are not available for this property (already booked, blocked, or a stay-length rule applies on some of these dates). The exact reason is not known.';
  }
}

// ---------- tools ----------

export const chatTools = {
  search_available_properties: tool({
    description:
      'Search which Miio properties are free for specific dates and a number of guests. ' +
      'Use this when the guest asks what is available, or has not chosen a property. ' +
      'You MUST have check-in date, check-out date and guest numbers first; ask if missing. ' +
      'Results already respect each property\'s minimum stay and capacity. ' +
      'The nightly rate is an average for those dates, not a final total: call get_stay_quote for a total.',
    inputSchema: z.object({ ...datesInput, ...guestsInput }),
    execute: async ({ checkIn, checkOut, adults, children, infants }) => {
      const stay = validateStay(checkIn, checkOut);
      if (!stay.ok) return fail(stay.error);

      const index = await getListingIndex();
      const totalGuests = adults + children + infants;

      try {
        // Total guests are passed as "adults" on purpose: the search helper would otherwise
        // add hidden "suitable for children/infants" filters and silently drop properties.
        const raw: unknown = await BookingEngineService.searchListings({
          checkIn,
          checkOut,
          adults: totalGuests,
        });
        const parsed = searchResultSchema.safeParse(raw);
        if (!parsed.success) {
          logger.error({ issues: parsed.error.issues }, '[chat] search: unexpected Guesty response');
          return fail('Availability could not be checked right now.');
        }

        // Only show properties guests can actually book (hides multi-unit child listings).
        const properties = parsed.data
          .filter((l) => !index || index.has(l._id))
          .map((l) => {
            const rates = Object.values(l.nightlyRates ?? {});
            const average =
              rates.length === stay.nights
                ? Math.round(rates.reduce((sum, r) => sum + r, 0) / rates.length)
                : null;
            return {
              listingId: l._id,
              title: l.title ?? 'Untitled',
              city: l.address?.city ?? null,
              sleeps: l.accommodates ?? null,
              bedrooms: l.bedrooms ?? null,
              bathrooms: l.bathrooms ?? null,
              currency: l.prices?.currency ?? 'AUD',
              averageNightlyRateBeforeFees: average,
            };
          });

        if (properties.length === 0) {
          return {
            ok: true as const,
            checkIn,
            checkOut,
            nights: stay.nights,
            guests: totalGuests,
            properties,
            note:
              'No property is free for these dates and guest count, or the stay is shorter than ' +
              "every available property's minimum stay. Do not guess which; offer different dates or the Miio team.",
            propertyStayRules: index
              ? [...index.values()].map((p) => ({
                  title: p.title,
                  sleeps: p.accommodates,
                  minimumNights: p.minNights,
                  maximumNights: p.maxNights,
                }))
              : null,
          };
        }

        return {
          ok: true as const,
          checkIn,
          checkOut,
          nights: stay.nights,
          guests: totalGuests,
          properties,
        };
      } catch (error) {
        logger.error(error, '[chat] search_available_properties failed');
        return fail('Availability could not be checked right now.');
      }
    },
  }),

  get_stay_quote: tool({
    description:
      'Check whether ONE specific property is available for the dates and get its exact price ' +
      '(accommodation, cleaning, other fees, taxes and total). Use this when the guest asks for a price, ' +
      'a total, or availability for a named property. Needs the listingId (from the property facts or ' +
      'from search results), dates and guest numbers; ask the guest if anything is missing.',
    inputSchema: z.object({
      listingId: z.string().min(1).max(64).describe('The Guesty listingId of the property.'),
      ...datesInput,
      ...guestsInput,
    }),
    execute: async ({ listingId, checkIn, checkOut, adults, children, infants }) => {
      const stay = validateStay(checkIn, checkOut);
      if (!stay.ok) return fail(stay.error);

      const index = await getListingIndex();
      if (!index) return fail('Property information could not be loaded right now.');
      const listing = index.get(listingId);
      if (!listing) {
        return fail('Unknown listingId. Use a listingId from the property facts or from search results.');
      }

      const totalGuests = adults + children + infants;
      const unavailable = (reason: UnavailableReason) => ({
        ok: true as const,
        available: false as const,
        reason,
        message: describeUnavailable(reason, listing),
        listingId,
        title: listing.title,
        checkIn,
        checkOut,
        nights: stay.nights,
      });

      // Rules we already know: answer instantly without calling Guesty.
      if (totalGuests > listing.accommodates) return unavailable('TOO_MANY_GUESTS');
      if (listing.minNights && stay.nights < listing.minNights) return unavailable('MIN_STAY');
      if (listing.maxNights && stay.nights > listing.maxNights) return unavailable('MAX_STAY');

      try {
        const raw: unknown = await BookingEngineService.createQuote({
          listingId,
          checkInDateLocalized: checkIn,
          checkOutDateLocalized: checkOut,
          guestsCount: totalGuests,
          numberOfGuests: {
            numberOfAdults: adults,
            numberOfChildren: children,
            numberOfInfants: infants,
            numberOfPets: 0,
          },
        });

        const parsed = quoteSchema.safeParse(raw);
        const plan = parsed.success ? parsed.data.rates.ratePlans[0]?.ratePlan : undefined;
        if (!plan) {
          logger.error('[chat] quote: unexpected Guesty response shape');
          return fail('The price could not be calculated right now.');
        }

        const money = plan.money;
        const accommodation = money.fareAccommodationAdjusted ?? money.fareAccommodation;
        // Everything charged that is not the room rate or cleaning (e.g. extra fees), itemised.
        const otherFees = money.invoiceItems
          .filter((i) => i.type !== 'ACCOMMODATION_FARE' && i.type !== 'CLEANING_FEE')
          .map((i) => ({ name: i.title, amount: i.amount }));

        return {
          ok: true as const,
          available: true as const,
          listingId,
          title: listing.title,
          checkIn,
          checkOut,
          nights: stay.nights,
          guests: { adults, children, infants },
          currency: money.currency,
          accommodation,
          cleaningFee: money.fareCleaning,
          otherFees,
          taxes: money.totalTaxes,
          // subTotalPrice is before taxes in Guesty, so the guest pays subtotal + taxes.
          total: money.subTotalPrice + money.totalTaxes,
          cancellationPolicyLabel: plan.cancellationPolicy ?? null,
          note:
            'This is a price check only; nothing is reserved or held. ' +
            'Only the cancellation policy NAME is known, not its terms.',
        };
      } catch (error) {
        const reason = classifyQuoteError(error);
        if (reason) return unavailable(reason);
        logger.error(error, '[chat] get_stay_quote failed');
        return fail('The price could not be calculated right now.');
      }
    },
  }),
};
