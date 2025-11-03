import * as z from 'zod';
import { CUISINE_TYPES } from '@/constants/cuisine-types';

export const UpdateRestaurantInfoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().optional(),
  phoneNo: z.string().optional(),
  location: z.string().optional(), 
  province: z.string().optional(),
  district: z.string().optional(),
  subDistrict: z.string().optional(),
  postalCode: z.string().optional(),
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
  isDeleted: z.boolean(),
  images: z.array(z.string()).nullish(),
});

export type RestaurantWithRating = z.infer<typeof RestaurantSchema> & {
  avgRating: number;
  reviewCount: number;
};

export type Restaurant = z.infer<typeof RestaurantSchema>;
