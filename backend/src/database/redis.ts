import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Railway provides REDIS_URL automatically, with fallback for local
const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL || 'redis://localhost:6379';
const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

export async function connectRedis() {
  try {
    await redisClient.connect();
    logger.info('Redis connected successfully');
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
}

export { redisClient };

