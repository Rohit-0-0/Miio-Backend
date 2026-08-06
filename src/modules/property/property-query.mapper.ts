import type { ListPropertyQuery } from './property.validation';
import type { GuestyListingsQuery } from '@/integrations/guesty';
import { GUESTY_CONSTANTS } from '@/integrations/guesty';

export class PropertyQueryMapper {
  static toGuestyListingsQuery(query: ListPropertyQuery): GuestyListingsQuery {
    const limit = query.limit || GUESTY_CONSTANTS.PAGINATION.DEFAULT_LIMIT;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const guestyQuery: GuestyListingsQuery = {
      limit,
      skip,
      ...(query.city && { city: query.city }),
    };

    if (query.checkIn && query.checkOut) {
      guestyQuery.availability = {
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        ...(query.guests ? { minOccupancy: query.guests } : {})
      };
    }

    return guestyQuery;
  }
}
