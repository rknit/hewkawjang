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
  openTime: z.string().nullable(),
  closeTime: z.string().nullable(),
  priceRange: z.number().nullable(),
  description: z.string().nullable(),
  status: z.enum(['open', 'closed']),
});
export type Restaurant = z.infer<typeof RestaurantSchema>;

export const OpeningHourSchema = z.object({
  id: z.number(),
  restaurantId: z.number(),
  dayOfWeek: z.enum([
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]),
  openTime: z.string(),   // format: 'HH:mm'
  closeTime: z.string(),  // format: 'HH:mm'
  isClosed: z.boolean().optional(), // optional for days when restaurant is closed
});

export type OpeningHour = z.infer<typeof OpeningHourSchema>;
