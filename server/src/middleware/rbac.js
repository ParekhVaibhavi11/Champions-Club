import { errorResponse } from '../utils/apiResponse.js';

export const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized. Please login.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, `Forbidden: Requires one of [${allowedRoles.join(', ')}] role.`, 403);
    }

    next();
  };
};
