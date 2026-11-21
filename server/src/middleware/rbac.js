/**
 * Role-Based Access Control middleware
 * @param {string[]} allowedRoles Array of acceptable roles (e.g. ['admin', 'staff'])
 */
export const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden: Access requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
