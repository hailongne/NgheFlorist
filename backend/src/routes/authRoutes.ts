import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../db';
import { authenticateToken, JWT_SECRET, logAudit } from '../middleware/auth';
import { authRateLimiter } from '../middleware/security';

const router = Router();

// POST /api/auth/login
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập tài khoản/email và mật khẩu' });
    }

    const trimmedLogin = String(login).trim();

    // Query user by username or email
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT u.id, u.username, u.email, u.password_hash, u.full_name, u.is_active,
             r.id as role_id, r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE (u.username = ? OR u.email = ?)
      LIMIT 1
    `, [trimmedLogin, trimmedLogin]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa' });
    }

    const isMatch = await bcrypt.compare(String(password), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    // Update last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Fetch user permissions
    const [permRows] = await pool.query<RowDataPacket[]>(`
      SELECT p.name
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = ?
    `, [user.role_id]);

    const permissions = permRows.map(r => r.name);

    // Sign JWT token (valid for 30 days to support convenient multi-device usage)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Detailed audit log with device info
    await logAudit(req, 'LOGIN', 'user', user.id, {
      username: user.username,
      role: user.role_name,
      user_agent: req.headers['user-agent'] || 'Unknown'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role_id: user.role_id,
        role_name: user.role_name,
        permissions
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi đăng nhập' });
  }
});

// POST /api/auth/register (Customer registration only)
router.post('/register', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đủ tên tài khoản, email và mật khẩu' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có tối thiểu 6 ký tự' });
    }

    const trimmedUsername = String(username).trim();
    const trimmedEmail = String(email).trim().toLowerCase();

    // Security check: strictly disallow registering admin or system emails/usernames
    const lowerUser = trimmedUsername.toLowerCase();
    if (
      lowerUser === 'admin' ||
      lowerUser.includes('admin') ||
      lowerUser.includes('root') ||
      lowerUser.includes('ngheflorist') ||
      trimmedEmail === 'admin@ngheflorist.vn' ||
      trimmedEmail.endsWith('@ngheflorist.vn')
    ) {
      return res.status(400).json({ error: 'Tên tài khoản hoặc email được dành riêng cho hệ thống' });
    }

    // Check duplicate
    const [existing] = await pool.query<RowDataPacket[]>(`
      SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1
    `, [trimmedUsername, trimmedEmail]);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Tên tài khoản hoặc email đã được sử dụng' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(String(password), saltRounds);

    const [userRes] = await pool.query<ResultSetHeader>(`
      INSERT INTO users (username, email, password_hash, full_name, phone, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [trimmedUsername, trimmedEmail, passwordHash, full_name?.trim() || null, phone?.trim() || null]);

    const userId = userRes.insertId;

    // Strictly assign customer role (role_id: 2)
    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 2)', [userId]);

    const token = jwt.sign(
      { id: userId, username: trimmedUsername, email: trimmedEmail, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        username: trimmedUsername,
        email: trimmedEmail,
        full_name: full_name?.trim() || null,
        role_id: 2,
        role_name: 'customer',
        permissions: []
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi đăng ký' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  res.json({
    user: req.user
  });
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [userRows] = await pool.query<RowDataPacket[]>(`
      SELECT id, username, email, full_name, phone, created_at, last_login
      FROM users WHERE id = ?
    `, [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const [addrRows] = await pool.query<RowDataPacket[]>(`
      SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC LIMIT 1
    `, [userId]);

    res.json({
      user: userRows[0],
      delivery_info: addrRows.length > 0 ? addrRows[0] : null
    });
  } catch (err: any) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Lỗi tải thông tin tài khoản' });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { full_name, phone } = req.body;

    await pool.query(`
      UPDATE users SET full_name = ?, phone = ? WHERE id = ?
    `, [full_name?.trim() || null, phone?.trim() || null, userId]);

    const [userRows] = await pool.query<RowDataPacket[]>(`
      SELECT id, username, email, full_name, phone FROM users WHERE id = ?
    `, [userId]);

    res.json({
      success: true,
      user: userRows[0],
      message: 'Cập nhật thông tin thành công'
    });
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Lỗi cập nhật thông tin' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Vui lòng điền đủ mật khẩu hiện tại và mật khẩu mới' });
    }

    if (String(new_password).length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có tối thiểu 6 ký tự' });
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    const isMatch = await bcrypt.compare(String(current_password), rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác' });
    }

    const newHash = await bcrypt.hash(String(new_password), 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    await logAudit(req, 'CHANGE_PASSWORD', 'user', userId);

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công!'
    });
  } catch (err: any) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Lỗi khi đổi mật khẩu' });
  }
});

// GET /api/auth/delivery-info
router.get('/delivery-info', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [addrRows] = await pool.query<RowDataPacket[]>(`
      SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC LIMIT 1
    `, [userId]);

    res.json({
      delivery_info: addrRows.length > 0 ? addrRows[0] : null
    });
  } catch (err: any) {
    console.error('Delivery info fetch error:', err);
    res.status(500).json({ error: 'Lỗi tải thông tin nhận hoa' });
  }
});

// POST /api/auth/delivery-info
router.post('/delivery-info', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      ordering_name,
      ordering_phone,
      recipient_name,
      recipient_phone,
      delivery_address,
      preferred_delivery_time,
      card_message,
      payment_method,
      notes
    } = req.body;

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC LIMIT 1',
      [userId]
    );

    if (existing.length > 0) {
      await pool.query(`
        UPDATE user_addresses
        SET ordering_name = ?, ordering_phone = ?, recipient_name = ?, recipient_phone = ?,
            delivery_address = ?, preferred_delivery_time = ?, card_message = ?, payment_method = ?,
            notes = ?, is_default = 1, updated_at = NOW()
        WHERE id = ?
      `, [
        ordering_name?.trim() || null,
        ordering_phone?.trim() || null,
        recipient_name?.trim() || null,
        recipient_phone?.trim() || null,
        delivery_address?.trim() || null,
        preferred_delivery_time?.trim() || null,
        card_message?.trim() || null,
        payment_method?.trim() || 'Chuyển khoản QR ngân hàng',
        notes?.trim() || null,
        existing[0].id
      ]);
    } else {
      await pool.query(`
        INSERT INTO user_addresses (
          user_id, ordering_name, ordering_phone, recipient_name, recipient_phone,
          delivery_address, preferred_delivery_time, card_message, payment_method, notes, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        userId,
        ordering_name?.trim() || null,
        ordering_phone?.trim() || null,
        recipient_name?.trim() || null,
        recipient_phone?.trim() || null,
        delivery_address?.trim() || null,
        preferred_delivery_time?.trim() || null,
        card_message?.trim() || null,
        payment_method?.trim() || 'Chuyển khoản QR ngân hàng',
        notes?.trim() || null
      ]);
    }

    res.json({
      success: true,
      message: 'Đã lưu thông tin nhận hoa mặc định thành công! Hệ thống sẽ tự động điền khi bạn đặt hoa.'
    });
  } catch (err: any) {
    console.error('Save delivery info error:', err);
    res.status(500).json({ error: 'Lỗi lưu thông tin nhận hoa' });
  }
});

// GET /api/auth/my-orders
router.get('/my-orders', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [uRows] = await pool.query<RowDataPacket[]>('SELECT phone, full_name, username FROM users WHERE id = ?', [userId]);
    const phone = uRows.length > 0 ? uRows[0].phone : null;
    const name = uRows.length > 0 ? (uRows[0].full_name || uRows[0].username) : null;

    let [requests] = await pool.query<RowDataPacket[]>(`
      SELECT cr.*, 
        (SELECT file_url FROM customer_request_images WHERE request_id = cr.id LIMIT 1) as sample_img
      FROM customer_requests cr
      WHERE cr.phone = ? OR cr.customer_name = ?
      ORDER BY cr.id DESC LIMIT 25
    `, [phone || '', name || '']);

    res.json({
      requests
    });
  } catch (err: any) {
    console.error('My orders fetch error:', err);
    res.status(500).json({ error: 'Lỗi tải lịch sử yêu cầu hoa' });
  }
});

export default router;
