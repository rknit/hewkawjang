import * as z from 'zod';
import { CUISINE_TYPES } from '@/constants/cuisine-types';
import { id } from 'zod/v4/locales';

export const UpdateRestaurantInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  phoneNo: z.string(),
  houseNo: z.string().nullable(),
  village: z.string().nullable(),
  building: z.string().nullable(),
  road: z.string().nullable(),
  soi: z.string().nullable(),
  subDistrict: z.string().nullable(),
  district: z.string().nullable(),
  province: z.string().nullable(),
  postalCode: z.string().nullable(),
  cuisineType: z.enum(CUISINE_TYPES),
  priceRange: z.number().nullable(),
  images: z.array(z.string()).nullish(),
  reservationFee: z.number().min(0),
  paymentMethod: z.enum(['MasterCard', 'Visa', 'HewkawjangWallet', 'PromptPay']),
});
export type UpdateRestaurantInfo = z.infer<typeof UpdateRestaurantInfoSchema>;

export const RestaurantSchema = z.object({
  id: z.number(),
  ownerId: z.number().nullable(),
  name: z.string(),
  phoneNo: z.string(),
  wallet: z.number(),
  houseNo: z.string().nullable(),
  village: z.string().nullable(),
  building: z.string().nullable(),
  road: z.string().nullable(),
  soi: z.string().nullable(),
  subDistrict: z.string().nullable(),
  district: z.string().nullable(),
  province: z.string().nullable(),
  postalCode: z.string().nullable(),
  cuisineType: z.enum(CUISINE_TYPES),
  priceRange: z.number().nullable(),
  status: z.enum(['open', 'closed']),
  activation: z.enum(['active', 'inactive']),
  isVerified: z.boolean(),
  isDeleted: z.boolean(),
  images: z.array(z.string()).nullish(),
  reservationFee: z.number().min(0),
  paymentMethod: z.enum(['MasterCard', 'Visa', 'HewkawjangWallet', 'PromptPay']),
});

export const DaysOffSchema = z.object({
  id: z.number(),
  restaurantId: z.number(),
  date: z.string(),
});

export type DaysOff = z.infer<typeof DaysOffSchema>;

export type RestaurantWithRating = z.infer<typeof RestaurantSchema> & {
  avgRating: number;
  reviewCount: number;
};

export const RestaurantWithAvgRatingSchema = RestaurantSchema.extend({
  avgRating: z.number(),
});
export type RestaurantWithAvgRating = z.infer<
  typeof RestaurantWithAvgRatingSchema
>;

export type Restaurant = z.infer<typeof RestaurantSchema>;

export const RestaurantHoursSchema = z.object({
  restaurantId: z.number(),
  dayOfWeek: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
  openTime: z.string(),
  closeTime: z.string(),
});
export type RestaurantHours = z.infer<typeof RestaurantHoursSchema>;