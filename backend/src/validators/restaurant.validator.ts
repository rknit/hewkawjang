import { createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { restaurantTable } from '../db/schema';

export const createRestaurantSchema = z.object({
  ownerId: z.number().int().positive(),
  name: z.string().min(1, 'Restaurant name is required'),
  phoneNo: z.string().min(5, 'Phone number is required'),

  // optional fields
  houseNo: z.string().optional(),
  village: z.string().optional(),
  building: z.string().optional(),
  road: z.string().optional(),
  soi: z.string().optional(),
  subDistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),

  // details
  priceRange: z.number().optional(),
  cuisineType: z.enum(['Thai',
  'Chinese',
  'Japanese',
  'Korean',
  'Western',
  'Seafood',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Bakery',
  'Cafe',
  'Buffet',
  'BBQ',
  'Steakhouse',
  'Fast Food',
  'Indian',
  'Italian',
  'Other',]),
  images: z.array(z.string()).optional(),
  reservationFee: z.number().min(0),
  paymentMethod: z.enum(['MasterCard', 'Visa', 'HewkawjangWallet', 'PromptPay']),
});
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;

export const updateRestaurantSchema = createUpdateSchema(restaurantTable);
export type UpdateRestaurant = z.infer<typeof updateRestaurantSchema>;

export const updateRestaurantInfoSchema = updateRestaurantSchema.required({
  id: true,
  ownerId: true, // to verify ownership
});
export type UpdateRestaurantInfo = z.infer<typeof updateRestaurantInfoSchema>;
