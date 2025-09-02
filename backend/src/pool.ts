import { Pool } from "pg";
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST as string,
  user: process.env.POSTGRES_USER as string,
  password: process.env.POSTGRES_PASSWORD as string,
  database: process.env.POSTGRES_DB as string,
  port: parseInt(process.env.POSTGRES_PORT as string),
  idleTimeoutMillis: 30000,
});

export default pool;