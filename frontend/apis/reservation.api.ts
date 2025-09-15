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

export async function deleteRestaurant(restaurantId: number): Promise<void> {
  try {
    await ApiService.delete(`/restaurant/${restaurantId}`);
  } catch (error) {
    normalizeError(error);
  }
}
