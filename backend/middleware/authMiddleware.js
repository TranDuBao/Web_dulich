const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeytravelportal2026');
      req.user = decoded;
      return next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ message: 'Không thể xác thực, token không hợp lệ hoặc đã hết hạn' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không thể xác thực, không tìm thấy token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Quyền truy cập bị từ chối, yêu cầu vai trò admin' });
  }
};

const hotelOwner = (req, res, next) => {
  if (req.user && req.user.role === 'hotel_owner') {
    next();
  } else {
    res.status(403).json({ message: 'Quyền truy cập bị từ chối, yêu cầu vai trò chủ khách sạn' });
  }
};

const hotelOwnerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'hotel_owner' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Quyền truy cập bị từ chối, yêu cầu vai trò admin hoặc chủ khách sạn' });
  }
};

module.exports = { protect, admin, hotelOwner, hotelOwnerOrAdmin };
