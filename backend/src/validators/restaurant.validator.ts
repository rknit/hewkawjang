// validators/restaurant.validator.ts
import { z } from "zod";

export const createRestaurantSchema = z.object({
  ownerId: z.number().int().positive(),
  name: z.string().min(1, "Restaurant name is required"),
  phoneNo: z.string().min(5, "Phone number is required"),
  
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
  openTime: z.string().optional(),   // later can refine to time format
  closeTime: z.string().optional(),
  priceRange: z.number().optional(),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
