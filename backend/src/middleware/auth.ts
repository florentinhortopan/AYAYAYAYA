import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isRegistered: boolean;
  };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as { id: string; email: string; isRegistered: boolean };

    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
}

export function requireRegistered(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.isRegistered) {
    throw new AppError('Registered account required', 403);
  }
  next();
}

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.id) {
      throw new AppError('Authentication required', 401);
    }

    const { pool } = await import('../database/connection');
    const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      throw new AppError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
}

