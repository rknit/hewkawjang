import ApiService from '@/services/api.service';
import { User, UserSchema } from '@/types/user.type';
import { normalizeError } from '@/utils/api-error';
import { z } from 'zod';

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await ApiService.get('/users/me');
    return UserSchema.parse(res.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function deleteCurrentUser(): Promise<boolean> {
  try {
    await ApiService.delete('/users/me');
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}

export async function fetchUserById(id: number): Promise<User | null> {
  try {
    const res = await ApiService.get(`/users/${id}`);
    return UserSchema.parse(res.data);
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

export async function submitReview(
  reservationId: number,
  review: { rating: number; attachPhotos: string[]; comment: string },
): Promise<boolean> {
  try {
    await ApiService.post('/users/me/reviews', {
      reservationId,
      ...review,
    });
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}

// Reservation schemas
const RestaurantSchema = z.object({
  id: z.number(),
  name: z.string(),
  phoneNo: z.string(),
  cuisineType: z.string(),
  priceRange: z.number().nullable(),
  houseNo: z.string().nullable(),
  village: z.string().nullable(),
  building: z.string().nullable(),
  road: z.string().nullable(),
  soi: z.string().nullable(),
  subDistrict: z.string().nullable(),
  district: z.string().nullable(),
  province: z.string().nullable(),
  postalCode: z.string().nullable(),
});

const ReservationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  restaurantId: z.number(),
  reserveAt: z.string(),
  reservationfee: z.number().nullable(),
  numberOfAdult: z.number().nullable(),
  numberOfChildren: z.number().nullable(),
  status: z.enum([
    'unconfirmed',
    'expired',
    'confirmed',
    'cancelled',
    'rejected',
    'completed',
    'uncompleted',
  ]),
  createdAt: z.string(),
  restaurant: RestaurantSchema,
});

export type UserReservation = z.infer<typeof ReservationSchema>;
export type ReservationStatus = UserReservation['status'];

const ReservationsResponseSchema = z.array(ReservationSchema);

export async function fetchUserReservations(
  status?: ReservationStatus | ReservationStatus[],
  offset?: number,
  limit?: number,
): Promise<UserReservation[]> {
  try {
    const params = new URLSearchParams();
    if (status) {
      if (Array.isArray(status)) {
        status.forEach((s) => params.append('status', s));
      } else {
        params.append('status', status);
      }
    }
    if (offset !== undefined) params.append('offset', offset.toString());
    if (limit !== undefined) params.append('limit', limit.toString());

    const res = await ApiService.get(
      `/users/me/reservations?${params.toString()}`,
    );
    return ReservationsResponseSchema.parse(res.data);
  } catch (error) {
    normalizeError(error);
    return [];
  }
}

