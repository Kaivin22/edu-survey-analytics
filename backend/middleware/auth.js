const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'edu_survey_stakeholder_secret_key_2026';

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy mã xác thực. Vui lòng đăng nhập.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' });
    }
    req.user = user;
    next();
  });
};

// Middleware to authorize roles
// rolesParam can be a single string or an array of strings representing allowed role names
const authorizeRoles = (rolesParam) => {
  const allowedRoles = Array.isArray(rolesParam) ? rolesParam : [rolesParam];
  
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
    }

    const hasPermission = allowedRoles.includes(req.user.role);
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'Quyền truy cập bị từ chối cho vai trò của bạn.' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
