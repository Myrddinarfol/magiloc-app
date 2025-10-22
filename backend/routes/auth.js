/**
 * Routes d'authentification JWT
 * POST /api/auth/login - Génère un token JWT
 * POST /api/auth/verify - Vérifie la validité d'un token
 */

import express from 'express';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authentifie l'utilisateur et retourne un JWT token
 *
 * Body: { password: string }
 * Response: { token: string, expiresIn: string }
 */
router.post('/login', (req, res) => {
  try {
    const { password } = req.body;
    const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'MAGILOC25';

    if (!password) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Password is required'
      });
    }

    if (password !== AUTH_PASSWORD) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid password'
      });
    }

    const token = generateToken();
    res.json({
      token,
      expiresIn: '7d',
      type: 'Bearer',
      message: 'Login successful'
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
});

/**
 * POST /api/auth/verify
 * Vérifie qu'un token est valide
 *
 * Headers: Authorization: Bearer <token>
 * Response: { authenticated: boolean }
 */
router.post('/verify', verifyToken, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user
  });
});

export default router;
