import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../database/connection';
import bcrypt from 'bcryptjs';

export class AdminController {
  // Get all users with pagination
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const search = req.query.search as string || '';

      let query = `
        SELECT 
          id, email, first_name, last_name, is_registered, is_admin, 
          phone, date_of_birth, location, created_at, updated_at
        FROM users
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        query += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
      const countParams: any[] = [];
      if (search) {
        countQuery += ` AND (email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)`;
        countParams.push(`%${search}%`);
      }
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        users: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT 
          id, email, first_name, last_name, is_registered, is_admin,
          phone, date_of_birth, location, created_at, updated_at
         FROM users WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  // Update user (admin)
  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, firstName, lastName, isRegistered, isAdmin, phone, dateOfBirth, location } = req.body;

      // Check if user exists
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      // Check if email is being changed and if it's already taken
      if (email) {
        const emailCheck = await pool.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, id]
        );
        if (emailCheck.rows.length > 0) {
          throw new AppError('Email already in use', 409);
        }
      }

      const result = await pool.query(
        `UPDATE users SET
          email = COALESCE($1, email),
          first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          is_registered = COALESCE($4, is_registered),
          is_admin = COALESCE($5, is_admin),
          phone = COALESCE($6, phone),
          date_of_birth = COALESCE($7, date_of_birth),
          location = COALESCE($8, location),
          updated_at = NOW()
         WHERE id = $9
         RETURNING id, email, first_name, last_name, is_registered, is_admin, phone, date_of_birth, location, created_at, updated_at`,
        [email, firstName, lastName, isRegistered, isAdmin, phone, dateOfBirth, location, id]
      );

      res.json({ user: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (id === req.user?.id) {
        throw new AppError('Cannot delete your own account', 400);
      }

      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, email', [id]);

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      res.json({ message: 'User deleted successfully', user: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  // Reset user password (admin)
  async resetUserPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const result = await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email',
        [hashedPassword, id]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      res.json({ message: 'Password reset successfully', user: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  // Get user statistics
  async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE is_registered = true) as registered_users,
          COUNT(*) FILTER (WHERE is_registered = false) as guest_users,
          COUNT(*) FILTER (WHERE is_admin = true) as admin_users,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_week,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month
        FROM users
      `);

      res.json({ stats: stats.rows[0] });
    } catch (error) {
      next(error);
    }
  }
}

