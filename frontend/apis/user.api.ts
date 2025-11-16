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
): Promise<number | null> {
  try {
    const res = await ApiService.post('/users/me/reviews', {
      reservationId,
      ...review,
    });

    // Assuming the backend response is { reviewId: number }
    if (res.data && res.data.reviewId) {
      return res.data.reviewId;
    } else {
      throw new Error('Review ID not found in response');
    }
  } catch (error) {
    normalizeError(error);
    return null;
  }
}

export async function deleteReview(reviewId: number): Promise<boolean> {
  try {
    await ApiService.delete(`/users/me/reviews/${reviewId}`);
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}
// Reservation schemas - using passthrough to allow extra fields from backend
const RestaurantSchema = z.object({
  id: z.number(),
  name: z.string(),
  phoneNo: z.string(),
  cuisineType: z.string(),
  priceRange: z.number().nullable().optional(),
  houseNo: z.string().nullable().optional(),
  village: z.string().nullable().optional(),
  building: z.string().nullable().optional(),
  road: z.string().nullable().optional(),
  soi: z.string().nullable().optional(),
  subDistrict: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  images: z.array(z.string()).nullable().optional(),
}).passthrough(); // Allow additional fields from backend

const ReservationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  restaurantId: z.number(),
  reserveAt: z.string(),
  reservationFee: z.number().nullable().optional(),
  numberOfAdult: z.number().nullable().optional(),
  numberOfChildren: z.number().nullable().optional(),
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
  reviewId: z.number().nullable().optional(),
}).passthrough(); // Allow additional fields from backend

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

export async function updateUserProfile(data: any): Promise<boolean> {
  try {
    await ApiService.post('/users/updateProfile', data);
    return true;
  } catch (error) {
    normalizeError(error);
    return false;
  }
}

export async function uploadProfileImage(file: File | Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await ApiService.post('/users/me/uploadProfileImage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.imageUrl;
}
