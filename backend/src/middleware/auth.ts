import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';
import { pool } from '../db';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'nghe_florist_super_secure_jwt_secret_2026';

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role_id: number;
  role_name: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập để truy cập tài nguyên này' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };

    // Fetch user with role and permissions from DB to ensure status is active and not revoked
    const [userRows] = await pool.query<RowDataPacket[]>(`
      SELECT u.id, u.username, u.email, u.full_name, u.is_active,
             r.id as role_id, r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id = ? AND u.is_active = 1
      LIMIT 1
    `, [decoded.id]);

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại hoặc đã bị khóa' });
    }

    const user = userRows[0];

    // Fetch user permissions
    const [permRows] = await pool.query<RowDataPacket[]>(`
      SELECT p.name
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = ?
    `, [user.role_id]);

    const permissions = permRows.map(r => r.name);

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id,
      role_name: user.role_name,
      permissions
    };

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });
  }
}

// Strictly allow ONLY the 1 designated single admin account (admin@ngheflorist.vn)
export function requireSoleAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa xác thực danh tính' });
  }

  if (
    req.user.id === 1 &&
    req.user.role_name === 'admin' &&
    req.user.email === 'admin@ngheflorist.vn'
  ) {
    return next();
  }

  return res.status(403).json({
    error: 'Từ chối truy cập: Tài khoản này không có quyền quản trị viên hệ thống'
  });
}

export function requirePermission(permissionName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa xác thực danh tính' });
    }

    // Role admin has full permissions or check specific permission
    if (req.user.role_name === 'admin' || req.user.permissions.includes(permissionName)) {
      return next();
    }

    return res.status(403).json({
      error: `Bạn không có quyền thực hiện thao tác này (cần quyền: ${permissionName})`
    });
  };
}

export async function logAudit(
  req: Request,
  action: string,
  resource: string,
  resourceId?: string | number,
  details?: any
) {
  try {
    const userId = req.user?.id || null;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
    const detailsJson = details ? JSON.stringify(details) : null;

    await pool.query(`
      INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, action, resource, resourceId ? String(resourceId) : null, detailsJson, ipAddress]);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
