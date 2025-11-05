import createHttpError from 'http-errors';
import { hashPassword } from '../utils/hash';
import { adminsTable } from '../db/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { Admin } from '../validators/admin.validator';

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
