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
