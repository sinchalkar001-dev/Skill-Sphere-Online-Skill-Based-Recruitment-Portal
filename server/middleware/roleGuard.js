import ApiError from '../utils/ApiError.js';

/**
 * Role-based access control middleware
 * @param  {...string} roles - Allowed roles
 */
const roleGuard = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Not authorized');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not allowed to access this resource`
      );
    }

    next();
  };
};

export default roleGuard;
