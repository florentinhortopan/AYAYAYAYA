import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { connectDatabase } from './database/connection';
import { connectRedis } from './database/redis';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import careerRoutes from './routes/career';
import trainingRoutes from './routes/training';
import financialRoutes from './routes/financial';
import communityRoutes from './routes/community';
import agentRoutes from './routes/agents';
import agentConfigRoutes from './routes/agentConfig';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 3001;

// Middleware
app.use(helmet());
// CORS configuration - Railway sets FRONTEND_URL automatically
const frontendUrl = process.env.FRONTEND_URL || process.env.RAILWAY_PUBLIC_DOMAIN || 'http://localhost:3000';
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint - API information
app.get('/', (req, res) => {
  const acceptsHtml = req.headers.accept?.includes('text/html');
  
  if (acceptsHtml) {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Army Recruitment Platform API</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            h1 { color: #667eea; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 5px; }
            .method { display: inline-block; padding: 2px 8px; background: #667eea; color: white; border-radius: 3px; font-size: 12px; margin-right: 10px; }
            .status { color: #28a745; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Army Recruitment Platform API</h1>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Status:</strong> <span class="status">Running</span></p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          
          <h2>Available Endpoints</h2>
          <div class="endpoint"><span class="method">GET</span> <code>/health</code> - Health check</div>
          <div class="endpoint"><span class="method">POST</span> <code>/api/auth/register</code> - User registration</div>
          <div class="endpoint"><span class="method">POST</span> <code>/api/auth/login</code> - User login</div>
          <div class="endpoint"><span class="method">GET</span> <code>/api/users/profile</code> - Get user profile</div>
          <div class="endpoint"><span class="method">GET</span> <code>/api/admin/users</code> - List all users (Admin)</div>
          <div class="endpoint"><span class="method">GET</span> <code>/api/career/paths</code> - Get career paths</div>
          <div class="endpoint"><span class="method">GET</span> <code>/api/training/programs</code> - Get training programs</div>
          <div class="endpoint"><span class="method">POST</span> <code>/api/agents/chat</code> - Chat with AI agents</div>
          
          <p><em>For JSON response, use: <code>Accept: application/json</code> header</em></p>
        </body>
      </html>
    `);
  } else {
    res.json({
      name: 'Army Recruitment Platform API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        users: '/api/users',
        admin: '/api/admin',
        career: '/api/career',
        training: '/api/training',
        financial: '/api/financial',
        community: '/api/community',
        agents: '/api/agents',
      },
      documentation: 'See API documentation for endpoint details'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/agent-config', agentConfigRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  
  // Serve frontend for all non-API routes (must be last route)
  app.get('*', (req, res, next) => {
    // Skip if API route or health check
    if (req.path.startsWith('/api') || req.path === '/health' || req.path.startsWith('/health')) {
      return next();
    }
    
    // Check if file exists, otherwise serve index.html for SPA routing
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) {
        next();
      }
    });
  });
}

// Error handling (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await connectDatabase();
    
    // Redis is optional - don't fail if it's not available
    try {
      await connectRedis();
    } catch (error) {
      logger.warn('Redis connection failed, continuing without Redis:', error);
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        logger.info(`Railway public domain: ${process.env.RAILWAY_PUBLIC_DOMAIN}`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

