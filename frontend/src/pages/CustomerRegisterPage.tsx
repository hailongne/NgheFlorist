import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';

export default function CustomerRegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          full_name: fullName.trim() || undefined,
          phone: phone.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đăng ký không thành công');
      }

      localStorage.setItem('nghe_customer_token', data.token);
      localStorage.setItem('nghe_customer_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7FBFC',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '36px',
        border: '1px solid #E4EEF1',
        boxShadow: '0 8px 30px rgba(93, 158, 175, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#26383D', margin: 0 }}>
            Tạo Tài Khoản Mới
          </h2>
          <p style={{ fontSize: '13px', color: '#718287', marginTop: '6px' }}>
            Trở thành khách hàng thân thiết của Nghệ Florist
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
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#26383D', marginBottom: '6px' }}>
              Họ và tên của bạn
            </label>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E4EEF1', borderRadius: '8px', boxSizing: 'border-box' }}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#26383D', marginBottom: '6px' }}>
              Tên tài khoản (viết liền, không dấu) *
            </label>
            <input
              type="text"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E4EEF1', borderRadius: '8px', boxSizing: 'border-box' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nguyenvana"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#26383D', marginBottom: '6px' }}>
              Email nhận thông báo đơn hoa *
            </label>
            <input
              type="email"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E4EEF1', borderRadius: '8px', boxSizing: 'border-box' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#26383D', marginBottom: '6px' }}>
              Số điện thoại
            </label>
            <input
              type="tel"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E4EEF1', borderRadius: '8px', boxSizing: 'border-box' }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0987654321"
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#26383D', marginBottom: '6px' }}>
              Mật khẩu (Tối thiểu 6 ký tự) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E4EEF1', borderRadius: '8px', boxSizing: 'border-box' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
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
            {loading ? 'Đang tạo tài khoản...' : (
              <>
                <span>Hoàn Tất Đăng Ký</span>
                <ArrowRightOutlined />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#718287' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: '#5D9EAF', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
