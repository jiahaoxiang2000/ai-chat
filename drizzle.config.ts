import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables
config({
  path: '.env.local',
});

// Verify the POSTGRES_URL environment variable is set
if (!process.env.POSTGRES_URL) {
  console.error('POSTGRES_URL environment variable is not defined');
  process.exit(1);
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
});
