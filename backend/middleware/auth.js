import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'magiloc-secret-key-change-in-production';

/**
 * Crée un JWT token
 */
export const generateToken = () => {
  return jwt.sign(
    { authenticated: true },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Middleware pour vérifier le JWT token
 * Accepte le token via:
 * 1. En-tête Authorization: "Bearer <token>"
 * 2. Cookie 'auth_token'
 * 3. Query param 'token' (pour WebSocket compatibility, à éviter)
 */
export const verifyToken = (req, res, next) => {
  try {
    // 1. Vérifier l'en-tête Authorization
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Vérifier le cookie (fallback)
    if (!token && req.cookies?.auth_token) {
      token = req.cookies.auth_token;
    }

    // 3. Vérifier le query param (dernier recours, moins sûr)
    if (!token && req.query?.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    return res.status(403).json({
      error: 'Invalid token',
      message: err.message
    });
  }
};

/**
 * Middleware pour logger les requêtes (optional)
 */
export const logRequest = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
