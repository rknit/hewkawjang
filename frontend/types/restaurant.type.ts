import * as z from 'zod';

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
  openTime: z.string().nullable(),
  closeTime: z.string().nullable(),
  priceRange: z.number().nullable(),
  status: z.enum(['open', 'closed']),
});

export type Restaurant = z.infer<typeof RestaurantSchema>;

