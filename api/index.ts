// Vercel serverless function entry point
// This file exports the Express app for Vercel's serverless functions
// The backend is built before this file is processed, so we can import from dist
import app from '../backend/dist/index';

export default app;

