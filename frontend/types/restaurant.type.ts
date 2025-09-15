import * as z from 'zod';

export const UpdateRestaurantInfoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().optional(),
  phoneNo: z.string().optional(),
  location: z.string().optional(), // TODO: this mismatch with backend
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
  houseNo: z.string().nullable(),
  village: z.string().nullable(),
  building: z.string().nullable(),
  road: z.string().nullable(),
  soi: z.string().nullable(),
  subDistrict: z.string().nullable(),
  district: z.string().nullable(),
  province: z.string().nullable(),
  postalCode: z.string().nullable(),
  openTime: z.string().nullish(),
  closeTime: z.string().nullish(),
  priceRange: z.number().nullable(),
  status: z.enum(['open', 'closed']),
});
export type Restaurant = z.infer<typeof RestaurantSchema>;
