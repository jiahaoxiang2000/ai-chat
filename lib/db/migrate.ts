import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Load environment variables from .env.local
config({
  path: '.env.local',
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is not defined');
    process.exit(1);
  }

  console.log('🔄 Connecting to PostgreSQL database...');
  
  try {
    // Configure connection with more robust settings for local development
    const connection = postgres(process.env.POSTGRES_URL, { 
      max: 1,
      connect_timeout: 10,
      idle_timeout: 10,
      prepare: false
    });
    
    const db = drizzle(connection);

    console.log('⏳ Running migrations...');

    const start = Date.now();
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    const end = Date.now();

    console.log('✅ Migrations completed in', end - start, 'ms');
    console.log('🔄 Closing database connection...');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed');
    console.error(err);
    process.exit(1);
  }
};

runMigrate();
