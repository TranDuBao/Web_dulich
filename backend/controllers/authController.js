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

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        name,
        email,
        phone,
        role: 'user'
      }
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
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống' });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống' });
  }
};

module.exports = { register, login, getMe };
