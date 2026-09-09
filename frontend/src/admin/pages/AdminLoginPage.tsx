import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext';
import { LockOutlined, UserOutlined, ArrowRightOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import '../admin.css';

export default function AdminLoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login: setAuthSession } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập không thành công');
      }

      // Strictly allow ONLY the designated single admin account
      if (data.user?.role_name !== 'admin' || data.user?.email !== 'admin@ngheflorist.vn' || data.user?.id !== 1) {
        throw new Error('Tài khoản này không có quyền truy cập trang quản trị hệ thống');
      }

      setAuthSession(data.token, data.user);
      localStorage.setItem('nghe_customer_token', data.token);
      localStorage.setItem('nghe_customer_user', JSON.stringify(data.user));
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7FBFC',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '36px',
        border: '1px solid #E4EEF1',
        boxShadow: '0 8px 30px rgba(93, 158, 175, 0.12)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/images/logoNgheFlorist-dark.png"
            alt="Nghệ Florist"
            style={{ height: '48px', objectFit: 'contain', marginBottom: '12px' }}
          />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#26383D', margin: 0 }}>
            Hệ Thống Quản Trị
          </h2>
          <p style={{ fontSize: '13px', color: '#718287', marginTop: '6px' }}>
            Đăng nhập để quản trị sản phẩm, đơn hàng & nội dung CMS
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FDF2F2',
            color: '#E06060',
            border: '1px solid #F8D7DA',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">Email hoặc Tên đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <UserOutlined style={{ position: 'absolute', left: '12px', top: '13px', color: '#718287' }} />
              <input
                type="text"
                className="admin-input"
                style={{ paddingLeft: '36px' }}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                placeholder="Nhập email hoặc tên đăng nhập"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="admin-form-group" style={{ marginBottom: '24px' }}>
            <label className="admin-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <LockOutlined style={{ position: 'absolute', left: '12px', top: '13px', color: '#718287' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="admin-input"
                style={{ paddingLeft: '36px', paddingRight: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu quản trị"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#718287',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px'
                }}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}
          >
            {loading ? 'Đang xác thực...' : (
              <>
                <span>Đăng Nhập Quản Trị</span>
                <ArrowRightOutlined />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <LockOutlined style={{ fontSize: '12px', color: '#5D9EAF' }} />
          <span>Khu vực dành riêng cho Quản trị viên Nghệ Florist</span>
        </div>
      </div>
    </div>
  );
}
