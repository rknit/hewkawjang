"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRestaurantInfoSchema = exports.updateRestaurantSchema = exports.createRestaurantSchema = void 0;
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const schema_1 = require("../db/schema");
exports.createRestaurantSchema = zod_1.z.object({
    ownerId: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1, 'Restaurant name is required'),
    phoneNo: zod_1.z.string().min(5, 'Phone number is required'),
    // optional fields
    houseNo: zod_1.z.string().optional(),
    village: zod_1.z.string().optional(),
    building: zod_1.z.string().optional(),
    road: zod_1.z.string().optional(),
    soi: zod_1.z.string().optional(),
    subDistrict: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    province: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
    // details
    openTime: zod_1.z.string().optional(), // later can refine to time format
    closeTime: zod_1.z.string().optional(),
    priceRange: zod_1.z.number().optional(),
});
exports.updateRestaurantSchema = (0, drizzle_zod_1.createUpdateSchema)(schema_1.restaurantTable);
exports.updateRestaurantInfoSchema = exports.updateRestaurantSchema.required({
    id: true,
    ownerId: true, // to verify ownership
});
