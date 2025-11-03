import "@nutrition-app/types";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Security headers middleware
export const secureHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:",],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || 'http://localhost:3000']
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" }
});

// Rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 250, // limit each IP to 250 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later'
  }
});
/**
 * Authentication middleware.
 * Verifies JWT and attaches payload to `req.user`.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Temporary debug logging for token verification — gated behind DEBUG_AUTH env var.
    // NOTE: Keep this off in CI/production. Set DEBUG_AUTH=1 locally to enable.
    if (process.env.DEBUG_AUTH === '1' || process.env.DEBUG_AUTH === 'true') {
      // We avoid printing the full token or secret. Instead log a masked token and a short hash to help correlate logs.
      const maskToken = (t) => (t && t.length > 8) ? `${t.slice(0, 4)}...${t.slice(-4)}` : '<<masked>>';
      const tokenHash = crypto.createHash('sha256').update(token || '').digest('hex').slice(0, 8);
      console.log(`DEBUG-REMOVE-ONCE-DONE: verifying token mask=${maskToken(token)} hash=${tokenHash}`);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (process.env.DEBUG_AUTH === '1' || process.env.DEBUG_AUTH === 'true') {
      console.log('DEBUG-REMOVE-ONCE-DONE: decoded token payload:', decoded);
    }
    req.user = decoded; // attach decoded payload (not sensitive) for downstream handlers
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

