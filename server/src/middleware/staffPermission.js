import { errorResponse } from '../utils/apiResponse.js';

export const checkStaffSubPermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    // Admins and Front Desk always have broad clearance
    if (req.user.role === 'admin' || req.user.role === 'front_desk') {
      return next();
    }

    if (req.user.role === 'staff') {
      const permissions = req.user.staff_profile || {};
      if (permissionKey === 'shop' && permissions.can_access_pos) return next();
      if (permissionKey === 'cafe' && permissions.can_access_pos) return next();
      if (permissionKey === 'kitchen' && permissions.can_access_kitchen) return next();
      if (permissions[permissionKey]) return next();
    }

    return errorResponse(res, `Forbidden: Missing staff sub-permission '${permissionKey}'.`, 403);
  };
};
