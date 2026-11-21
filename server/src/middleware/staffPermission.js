import { errorResponse } from '../utils/apiResponse.js';

export const checkStaffSubPermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized.', 401);
    }

    if (req.user.role === 'admin' || req.user.role === 'member') {
      return next();
    }

    if (req.user.role === 'staff') {
      const permissions = req.user.staff_profile || {};
      if (permissionKey === 'shop' && permissions.department === 'shop' && permissions.can_access_pos) return next();
      if (permissionKey === 'cafe' && permissions.department === 'cafe' && permissions.can_access_pos) return next();
      if (permissionKey === 'kitchen' && permissions.department === 'kitchen' && permissions.can_access_kitchen) return next();
      if (permissions[permissionKey]) return next();
    }

    return errorResponse(res, `Forbidden: Missing staff sub-permission '${permissionKey}'.`, 403);
  };
};
