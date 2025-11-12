import ApiService from '@/services/api.service';
import { Reservation, ReservationSchema } from '@/types/reservation.type';
import { normalizeError } from '@/utils/api-error';
import { th } from 'zod/v4/locales';

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
    console.log('createReservation error:', error);
    normalizeError(error);
    throw error;
  }
}

export async function cancelReservation(
  reservationId: number,
  cancelBy: 'user' | 'restaurant_owner',
): Promise<boolean> {
  try {
    await ApiService.post(`/reservations/${reservationId}/cancel`, {
      cancelBy,
    });
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}

export async function updateReservationStatus(
  reservationId: number,
  status: string,
  updateBy: 'user' | 'restaurant_owner',
): Promise<boolean> {
  try {
    await ApiService.patch(`/reservations/${reservationId}/status`, {
      status,
      updateBy,
    });
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}

export async function fetchReservationsByRestaurantInOneMonth(
  restaurantId: number,
  month: number,
  year: number,
): Promise<Reservation[] | null> {
  try {
    const res = await ApiService.get(
      `/reservations/${restaurantId}/inspect?month=${month}&year=${year}`,
      {},
    );
    const reservations = res.data.map((r: any) => ReservationSchema.parse(r));
    return reservations;
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

// Confirm reservation (restaurant owner action)
export async function confirmReservation(
  reservationId: number,
): Promise<boolean> {
  try {
    await ApiService.post(`/reservations/${reservationId}/confirm`);
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}

// Mark customer as arrived (restaurant owner action)
export async function markCustomerArrived(
  reservationId: number,
): Promise<boolean> {
  try {
    await ApiService.post(`/reservations/${reservationId}/arrived`);
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}

// Mark customer as no-show (restaurant owner action)
export async function markCustomerNoShow(
  reservationId: number,
): Promise<boolean> {
  try {
    await ApiService.post(`/reservations/${reservationId}/no-show`);
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}
