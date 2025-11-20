import dotenv from 'dotenv';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

// Railway provides DATABASE_URL, parse it or use individual vars
let poolConfig: any;

if (process.env.DATABASE_URL) {
  // Railway provides DATABASE_URL in format: postgresql://user:pass@host:port/db
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Fallback to individual connection parameters
  poolConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'army_recruitment',
    user: process.env.DATABASE_USER || process.env.USER || 'user',
    password: process.env.DATABASE_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function connectDatabase() {
  try {
    const client = await pool.connect();
    logger.info('Database connected successfully');
    client.release();
    return pool;
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

export { pool };

