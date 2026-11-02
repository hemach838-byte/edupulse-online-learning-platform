const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for an authenticated user
 * @param {string} id - User ObjectId
 * @param {string} role - User role (STUDENT, INSTRUCTOR, ADMIN)
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'technoglobal_super_secret_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

module.exports = generateToken;
