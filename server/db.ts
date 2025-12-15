import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

// Database connection for Neon PostgreSQL
// Neon requires SSL for all connections in production
export let pool: pg.Pool | null = null;
export let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  db = drizzle(pool, { schema });
}
