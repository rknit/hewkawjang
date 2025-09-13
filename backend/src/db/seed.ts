import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { restaurantTable, usersTable } from './schema';
import { hashPassword } from '../utils/hash';

async function seed() {
  // Create a PostgreSQL connection
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error('SUPABASE_DB_URL environment variable is required');
  }

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  try {
    // Create a regular customer user
    const customerHashedPassword = await hashPassword('customer123');
    await db.insert(usersTable).values({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phoneNo: '0899999999',
      password: customerHashedPassword,
      displayName: 'John Doe',
    });

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.end();
  }
}

// Run the seed function
seed().catch(console.error);
