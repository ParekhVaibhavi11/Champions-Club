import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/apiResponse.js';

const JWT_SECRET = process.env.JWT_SECRET || 'champions_club_secret_key_2026';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return errorResponse(res, 'Authentication required. No token provided.', 401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return errorResponse(res, 'Invalid or expired token.', 403);
    }
    req.user = user;
    next();
  });
};
