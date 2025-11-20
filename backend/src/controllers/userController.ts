import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../database/connection';

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'SELECT id, email, first_name, last_name, is_registered, created_at FROM users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { firstName, lastName } = req.body;

      const result = await pool.query(
        `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), updated_at = NOW()
         WHERE id = $3
         RETURNING id, email, first_name, last_name, is_registered`,
        [firstName, lastName, req.user.id]
      );

      res.json({ user: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Get user statistics including training progress, achievements, etc.
      res.json({ stats: {} });
    } catch (error) {
      next(error);
    }
  }

  async getAchievements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Get user achievements and badges
      res.json({ achievements: [] });
    } catch (error) {
      next(error);
    }
  }
}

