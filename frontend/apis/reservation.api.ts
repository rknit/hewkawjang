import ApiService from '@/services/api.service';
import { Reservation, ReservationSchema } from '@/types/reservation.type';
import { normalizeError } from '@/utils/api-error';

export async function fetchUnconfirmedReservations(
  restaurantId: number,
  offset?: number,
): Promise<Reservation[] | null> {
  try {
    const res = await ApiService.get('/reservations/unconfirmed/inspect', {
      params: { restaurantId, offset },
    });
    return res.data.map((r: any) => ReservationSchema.parse(r));
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

export async function createReservation(payload: {
  restaurantId: number;
  reserveAt: string; // ISO string
  numberOfAdult?: number;
  numberOfChildren?: number;
  numberOfElderly?: number;
}): Promise<Reservation | null> {
  try {
    const res = await ApiService.post('/reservations/create', payload);
    return ReservationSchema.parse(res.data);
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

// Public-facing: fetch reservations for a restaurant (supports status, offset, limit)
export async function fetchReservationsByRestaurant(
  restaurantId: number,
  options?: { status?: string | string[]; offset?: number; limit?: number },
): Promise<Reservation[] | null> {
  try {
    const params: any = { restaurantId };
    if (options?.offset !== undefined) params.offset = options.offset;
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.status !== undefined) {
      params.status = Array.isArray(options.status)
        ? options.status.join(',')
        : options.status;
    }

    const res = await ApiService.get('/reservations/by-restaurant', {
      params,
    });

    return res.data.map((r: any) => ReservationSchema.parse(r));
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

export async function cancelReservation(
  reservationId: number,
  restaurantId: number,
): Promise<boolean> {
  try {
    await ApiService.post('/reservations/cancel', {
      reservationId,
      restaurantId,
    });
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}
