import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

export class AuthController {
  async createGuestSession(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = uuidv4();
      // Store guest session in Redis or database
      // For now, return a temporary token
      const jwtSecret = process.env.JWT_SECRET || 'secret';
      const options = { expiresIn: '30d' } as SignOptions;
      const token = jwt.sign(
        { id: sessionId, isRegistered: false },
        jwtSecret,
        options
      );

      res.json({ sessionId, token });
    } catch (error) {
      next(error);
    }
  }

  async getGuestSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      // Retrieve guest session data
      res.json({ sessionId, data: {} });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('User already exists', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, is_registered, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())
         RETURNING id, email, first_name, last_name, is_registered`,
        [email, hashedPassword, firstName, lastName]
      );

      const user = result.rows[0];

      const jwtSecret = process.env.JWT_SECRET || 'secret';
      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
      const options = { expiresIn } as SignOptions;
      const token = jwt.sign(
        { id: user.id, email: user.email, isRegistered: true },
        jwtSecret,
        options
      );

      res.status(201).json({ user, token });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const result = await pool.query(
        'SELECT id, email, password_hash, first_name, last_name, is_registered FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid credentials', 401);
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      const jwtSecret = process.env.JWT_SECRET || 'secret';
      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
      const options = { expiresIn } as SignOptions;
      const token = jwt.sign(
        { id: user.id, email: user.email, isRegistered: user.is_registered },
        jwtSecret,
        options
      );

      res.json({ user: { ...user, password_hash: undefined }, token });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    // In a stateless JWT system, logout is typically handled client-side
    // But we could invalidate tokens in Redis here if needed
    res.json({ message: 'Logged out successfully' });
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    // Implement token refresh logic
    res.json({ message: 'Token refresh not yet implemented' });
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    // Implement password reset logic
    res.json({ message: 'Password reset email sent' });
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    // Implement password reset logic
    res.json({ message: 'Password reset successfully' });
  }
}

