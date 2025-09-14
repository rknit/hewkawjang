import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { usersTable } from './db/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  throw new Error('SUPABASE_DB_URL environment variable is required');
}

export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

export let _dev_test_user_id: number | null = null;
if (process.env.NODE_ENV === 'development') {
  seedDB().catch((err) => {
    console.error('Error seeding database:', err);
  });
}

async function seedDB() {
  await db
    .insert(usersTable)
    .values({
      firstName: 'test',
      lastName: 'user',
      email: 'test@user.com',
      // password: test
      password: '$2a$10$X2U6Om92gqq/our85mCh3eGNelVcv/BIO97lmMAv4qLOVXSA2onwq',
      phoneNo: '1234567890',
    })
    .onConflictDoUpdate({
      target: usersTable.email,
      set: {
        firstName: 'test',
        lastName: 'user',
        password:
          '$2a$10$X2U6Om92gqq/our85mCh3eGNelVcv/BIO97lmMAv4qLOVXSA2onwq',
        phoneNo: '1234567890',
        isDeleted: false,
      },
    });

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, 'test@user.com'));

  if (user) {
    _dev_test_user_id = user.id;
    console.log('Development test user ID:', _dev_test_user_id);
  } else {
    throw new Error('Failed to retrieve test user after insertion');
  }
}
