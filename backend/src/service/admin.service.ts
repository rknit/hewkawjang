import createHttpError from 'http-errors';
import { hashPassword } from '../utils/hash';
import { adminsTable, restaurantTable } from '../db/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { Admin } from '../validators/admin.validator';
import RestaurantService from './restaurant.service';
import NotificationService from './notification.service';

export default class AdminService {
  static async getAdminById(adminId: number): Promise<Admin> {
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.id, adminId))
      .limit(1);
    if (!admin) {
      throw createHttpError.NotFound('Admin not found');
    }

    return admin;
  }

  static async banRestaurant(restaurantId: number): Promise<void> {
    const restaurant = await RestaurantService.getRestaurantById(restaurantId);
    if (!restaurant) {
      throw createHttpError.NotFound('Restaurant not found');
    }

    if (restaurant.isDeleted) {
      throw createHttpError.BadRequest('Restaurant is already deleted');
    }

    // Notify the restaurant owner about the ban
    await NotificationService.createNotifications([
      {
        userId: restaurant.ownerId,
        title: 'Your restaurant has been banned',
        message: `Your restaurant "${restaurant.name}" has been banned by an admin.`,
        imageUrl: restaurant.images?.[0] || null,
        notificationType: 'system',
      },
    ]);

    // Soft delete the restaurant
    await RestaurantService.deleteRestaurant(restaurantId);
  }

  // NOTE: This method is only for development purposes
  static async createAdminBypass(data: {
    email: string;
    password: string;
  }): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      throw createHttpError.Forbidden(
        'Admin bypass creation is only allowed in development mode',
      );
    }

    const hashedPassword = await hashPassword(data.password);
    await db
      .insert(adminsTable)
      .values({
        email: data.email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'McAdminFace',
        phoneNo: '000-000-0000',
      })
      .onConflictDoNothing();
  }
}
