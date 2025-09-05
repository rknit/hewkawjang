import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const connectionString = process.env.SUPABASE_DB_URL!;

export const supabase = createClient(supabaseUrl, supabaseKey);
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
