import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined, ArrowRightOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

export default function CustomerLoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in as Admin, redirect directly to /admin
  useEffect(() => {
    const adminToken = localStorage.getItem('nghe_admin_token');
    const adminUser = localStorage.getItem('nghe_admin_user');
    if (adminToken && adminUser) {
      try {
        const parsed = JSON.parse(adminUser);
        if (parsed.role_name === 'admin' && parsed.email === 'admin@ngheflorist.vn') {
          navigate('/admin');
        }
      } catch {}
    }
  }, [navigate]);

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

      localStorage.setItem('nghe_customer_token', data.token);
      localStorage.setItem('nghe_customer_user', JSON.stringify(data.user));

      if (data.user?.role_name === 'admin') {
        localStorage.setItem('nghe_admin_token', data.token);
        localStorage.setItem('nghe_admin_user', JSON.stringify(data.user));
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7FBFC',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '36px',
        border: '1px solid #E4EEF1',
        boxShadow: '0 8px 30px rgba(93, 158, 175, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#26383D', margin: 0 }}>
            Đăng Nhập Tài Khoản
          </h2>
          <p style={{ fontSize: '13px', color: '#718287', marginTop: '6px' }}>
            Theo dõi đơn hàng hoa và nhận ưu đãi riêng từ Nghệ Florist
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FDF2F2',
            color: '#E06060',
            border: '1px solid #F8D7DA',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#26383D', marginBottom: '6px' }}>
              Tên tài khoản hoặc Email
            </label>
            <div style={{ position: 'relative' }}>
              <UserOutlined style={{ position: 'absolute', left: '12px', top: '12px', color: '#718287' }} />
              <input
                type="text"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: '1px solid #E4EEF1',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="example@gmail.com"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#26383D', marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <LockOutlined style={{ position: 'absolute', left: '12px', top: '12px', color: '#718287' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 36px',
                  border: '1px solid #E4EEF1',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#5D9EAF',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Đang đăng nhập...' : (
              <>
                <span>Đăng Nhập</span>
                <ArrowRightOutlined />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#718287' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: '#5D9EAF', fontWeight: 600, textDecoration: 'none' }}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
