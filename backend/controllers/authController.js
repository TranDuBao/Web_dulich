const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || '', 'user']
    );

    const token = jwt.sign(
      { id: result.insertId, name, email, role: 'user' },
      process.env.JWT_SECRET || 'supersecretkeytravelportal2026',
      { expiresIn: '30d' }
    );

    const [insertedUsers] = await db.query(
      'SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      token,
      user: insertedUsers[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'supersecretkeytravelportal2026',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống' });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống' });
  }
};

// Update profile details
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone, avatarUrl } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Tên hiển thị không được để trống' });
  }

  try {
    await db.query(
      'UPDATE users SET name = ?, phone = ?, avatar_url = ? WHERE id = ?',
      [name, phone || '', avatarUrl || null, userId]
    );
    const [updatedUsers] = await db.query(
      'SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Cập nhật thông tin cá nhân thành công!',
      user: updatedUsers[0]
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật hồ sơ' });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Vui lòng điền mật khẩu hiện tại và mật khẩu mới' });
  }

  try {
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi đổi mật khẩu' });
  }
};

// Profile statistics on bookings and spendings
const getProfileStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const [spentTour] = await db.query('SELECT SUM(total_price) as total FROM bookings WHERE user_id = ? AND type = "tour" AND status = "confirmed"', [userId]);
    const [spentHotel] = await db.query('SELECT SUM(total_price) as total FROM bookings WHERE user_id = ? AND type = "hotel" AND status = "confirmed"', [userId]);
    const [spentFlight] = await db.query('SELECT SUM(total_price) as total FROM bookings WHERE user_id = ? AND type = "flight" AND status = "confirmed"', [userId]);

    const [statusCounts] = await db.query(
      `SELECT 
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM bookings WHERE user_id = ?`,
      [userId]
    );

    const tourSpent = parseFloat(spentTour[0]?.total || 0);
    const hotelSpent = parseFloat(spentHotel[0]?.total || 0);
    const flightSpent = parseFloat(spentFlight[0]?.total || 0);
    const totalSpent = tourSpent + hotelSpent + flightSpent;

    // Calculate loyalty points: 1 point per 100,000 VND spent
    const loyaltyPoints = Math.floor(totalSpent / 100000);

    // Membership ranks: Bronze, Silver, Gold, Platinum
    let rank = 'Bronze';
    let nextRankThreshold = 5000000;
    if (totalSpent >= 50000000) {
      rank = 'Platinum';
      nextRankThreshold = 0;
    } else if (totalSpent >= 15000000) {
      rank = 'Gold';
      nextRankThreshold = 50000000;
    } else if (totalSpent >= 5000000) {
      rank = 'Silver';
      nextRankThreshold = 15000000;
    }

    res.json({
      tourSpent,
      hotelSpent,
      flightSpent,
      totalSpent,
      loyaltyPoints,
      rank,
      nextRankThreshold,
      bookingsCount: {
        pending: parseInt(statusCounts[0]?.pending || 0),
        confirmed: parseInt(statusCounts[0]?.confirmed || 0),
        cancelled: parseInt(statusCounts[0]?.cancelled || 0)
      }
    });
  } catch (error) {
    console.error('getProfileStats error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi tải số liệu thống kê' });
  }
};

// Admin operations: Manage Accounts
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, phone, role, avatar_url, created_at FROM users ORDER BY role, id DESC');
    res.json(users);
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách tài khoản' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'hotel_owner', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }
    
    // Avoid changing own role
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: 'Bạn không thể tự thay đổi vai trò của chính mình' });
    }

    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản cần cập nhật' });
    }

    res.json({ message: 'Đã cập nhật vai trò người dùng thành công' });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật vai trò' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Avoid deleting own account
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của chính mình' });
    }

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản cần xóa' });
    }

    res.json({ message: 'Đã xóa tài khoản người dùng thành công' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi xóa tài khoản' });
  }
};

module.exports = { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword, 
  getProfileStats, 
  getAllUsers, 
  updateUserRole, 
  deleteUser 
};
