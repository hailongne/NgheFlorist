import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext';
import { 
  ShopOutlined, 
  SaveOutlined, 
  EyeOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  CustomerServiceOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { formatPhoneNumber } from '../../context/SiteSettingsContext';

interface SiteSettings {
  site_name: string;
  hotline: string;
  email: string;
  address: string;
  business_hours: string;
  currency: string;
  announcement?: string;
}

export default function AdminSettingsPage() {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Nghệ Florist — Tiệm hoa & quả nhập khẩu',
    hotline: '0862926866',
    email: 'ngheflorist.com@gmail.com',
    address: '22 ngõ 115 phố Núi Trúc, Ba Đình, Hà Nội',
    business_hours: '07:30 - 21:30 hàng ngày',
    currency: 'VND'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.siteSettings && Object.keys(data.siteSettings).length > 0) {
          setSettings(prev => ({ ...prev, ...data.siteSettings }));
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          siteSettings: settings
        })
      });
      if (res.ok) {
        window.dispatchEvent(new Event('site_settings_updated'));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert('Lỗi lưu cài đặt website');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#5D9EAF' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>Đang tải cài đặt website...</div>
      </div>
    );
  }

  const formattedDisplayHotline = formatPhoneNumber(settings.hotline, '0862 926 866');

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto' }}>
      {/* Header bar */}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 className="admin-page-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            Cài Đặt Website
          </h1>
          <div className="admin-page-subtitle" style={{ fontSize: '0.88rem', color: '#64748B', marginTop: 4 }}>
            Quản lý thông tin thương hiệu, hotline tư vấn, email, địa chỉ tiệm hoa và đồng bộ hiển thị toàn hệ thống
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saveSuccess && (
            <span style={{ color: '#16A34A', fontSize: '0.88rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleOutlined /> Đã lưu thành công!
            </span>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave()}
            className="admin-btn admin-btn-primary"
            style={{ 
              padding: '10px 24px', 
              fontSize: '14px', 
              fontWeight: 700, 
              backgroundColor: 'var(--color-primary-dark)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 8
            }}
          >
            <SaveOutlined /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Balanced 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, alignItems: 'start' }}>
          
          {/* CỘT 1: THÔNG TIN TIỆM HOA & LIÊN HỆ */}
          <div className="admin-card" style={{ padding: 24, borderRadius: 12, border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: 'rgba(93, 158, 175, 0.12)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                <ShopOutlined />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E293B' }}>
                  Thông Tin Tiệm Hoa & Liên Hệ
                </h3>
                <span style={{ fontSize: '0.80rem', color: '#64748B' }}>
                  Được đồng bộ trực tiếp trên Chân trang (Footer), Header và hóa đơn
                </span>
              </div>
            </div>

            <div className="admin-form-group" style={{ marginBottom: 18 }}>
              <label className="admin-label" style={{ fontWeight: 600, fontSize: '0.86rem', marginBottom: 6, display: 'block' }}>
                Tên thương hiệu tiệm hoa <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                className="admin-input"
                required
                placeholder="VD: Nghệ Florist — Tiệm hoa & quả nhập khẩu"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                style={{ borderRadius: 8, padding: '9px 12px', fontSize: '0.9rem' }}
              />
              <small style={{ color: '#64748B', fontSize: '0.78rem', display: 'block', marginTop: 4 }}>
                Hiển thị trên tiêu đề website, thương hiệu tiệm hoa và hóa đơn
              </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div className="admin-form-group">
                <label className="admin-label" style={{ fontWeight: 600, fontSize: '0.86rem', marginBottom: 6, display: 'block' }}>
                  Hotline tư vấn đặt hoa <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  placeholder="0862 926 866"
                  value={settings.hotline}
                  onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                  style={{ borderRadius: 8, padding: '9px 12px', fontSize: '0.9rem' }}
                />
                <small style={{ color: '#0D9488', fontSize: '0.76rem', display: 'block', marginTop: 4, fontWeight: 500 }}>
                  ✓ Đồng bộ số điện thoại ở Footer
                </small>
              </div>

              <div className="admin-form-group">
                <label className="admin-label" style={{ fontWeight: 600, fontSize: '0.86rem', marginBottom: 6, display: 'block' }}>
                  Email hỗ trợ khách hàng
                </label>
                <input
                  type="email"
                  className="admin-input"
                  placeholder="ngheflorist.com@gmail.com"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  style={{ borderRadius: 8, padding: '9px 12px', fontSize: '0.9rem' }}
                />
                <small style={{ color: '#0D9488', fontSize: '0.76rem', display: 'block', marginTop: 4, fontWeight: 500 }}>
                  ✓ Đồng bộ email ở Footer
                </small>
              </div>
            </div>

            <div className="admin-form-group" style={{ marginBottom: 18 }}>
              <label className="admin-label" style={{ fontWeight: 600, fontSize: '0.86rem', marginBottom: 6, display: 'block' }}>
                Địa chỉ tiệm hoa / Showroom <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                className="admin-input"
                required
                placeholder="VD: 22 ngõ 115 phố Núi Trúc, Ba Đình, Hà Nội"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                style={{ borderRadius: 8, padding: '9px 12px', fontSize: '0.9rem' }}
              />
              <small style={{ color: '#0D9488', fontSize: '0.76rem', display: 'block', marginTop: 4, fontWeight: 500 }}>
                ✓ Đồng bộ địa chỉ ở Footer & trang Về Chúng Tôi
              </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="admin-form-group">
                <label className="admin-label" style={{ fontWeight: 600, fontSize: '0.86rem', marginBottom: 6, display: 'block' }}>
                  Giờ mở cửa phục vụ
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="07:30 - 21:30 hàng ngày"
                  value={settings.business_hours}
                  onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                  style={{ borderRadius: 8, padding: '9px 12px', fontSize: '0.9rem' }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label" style={{ fontWeight: 600, fontSize: '0.86rem', marginBottom: 6, display: 'block' }}>
                  Đơn vị tiền tệ
                </label>
                <input
                  type="text"
                  className="admin-input"
                  disabled
                  value={settings.currency}
                  style={{ borderRadius: 8, padding: '9px 12px', fontSize: '0.9rem', backgroundColor: '#F8FAFC', color: '#64748B' }}
                />
              </div>
            </div>
          </div>

          {/* CỘT 2: XEM TRƯỚC CHÂN TRANG & TIỆN ÍCH TƯ VẤN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Card Live Preview Footer */}
            <div className="admin-card" style={{ padding: 24, borderRadius: 12, border: '1.5px solid #CBD5E1', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                    <EyeOutlined />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: '#0F172A' }}>
                      Xem Trước Thông Tin Chân Trang
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Được cập nhật tự động khi bạn thay đổi thông tin
                    </span>
                  </div>
                </div>
                <span className="badge" style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                  Đang đồng bộ
                </span>
              </div>

              {/* Box mô phỏng chân trang */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0', 
                borderRadius: 10, 
                padding: '16px 18px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src="/images/logoNgheFlorist-brand-blue.png?v=2" alt="Nghệ Florist" style={{ height: 32, width: 'auto' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.84rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <EnvironmentOutlined style={{ color: 'var(--color-primary-dark)', marginTop: 3 }} />
                    <span style={{ fontWeight: 500 }}>{settings.address || '22 ngõ 115 phố Núi Trúc, Ba Đình, Hà Nội'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MailOutlined style={{ color: 'var(--color-primary-dark)' }} />
                    <span style={{ color: 'var(--color-primary-dark)', fontWeight: 500 }}>
                      {settings.email || 'ngheflorist.com@gmail.com'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PhoneOutlined style={{ color: 'var(--color-primary-dark)' }} />
                    <span style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                      {formattedDisplayHotline}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
                💡 <em>Số điện thoại <strong>{formattedDisplayHotline}</strong> sẽ hiển thị trên cả phiên bản máy tính, tablet và điện thoại di động ở chân trang website.</em>
              </div>
            </div>

            {/* Thông tin đồng bộ & điều hướng Nút Tư Vấn */}
            <div style={{ 
              padding: '18px 20px', 
              backgroundColor: '#FFFFFF', 
              borderRadius: 12, 
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CustomerServiceOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 20 }} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                  Nút Tư Vấn & Kênh Liên Hệ Nổi
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', lineHeight: 1.6 }}>
                Các nút liên hệ nhanh như Zalo, Hotline, Messenger hay Fanpage hiện được quản lý độc lập tại mục <strong>Quản Lý Nút Tư Vấn</strong>, giúp bạn chủ động bật/tắt hoặc sắp xếp vị trí bất cứ lúc nào.
              </p>
              <div>
                <Link 
                  to="/admin/contact-widgets" 
                  className="admin-btn admin-btn-outline"
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    padding: '8px 16px',
                    borderRadius: 8
                  }}
                >
                  Mở trang Quản Lý Nút Tư Vấn <ArrowRightOutlined />
                </Link>
              </div>
            </div>

            <div style={{ 
              padding: '14px 16px', 
              backgroundColor: 'rgba(93, 158, 175, 0.08)', 
              borderRadius: 10, 
              border: '1px solid rgba(93, 158, 175, 0.2)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: '0.80rem',
              color: '#334155',
              lineHeight: 1.5
            }}>
              <InfoCircleOutlined style={{ color: 'var(--color-primary-dark)', marginTop: 2, flexShrink: 0 }} />
              <div>
                Mọi thay đổi cài đặt khi được lưu sẽ được cập nhật tự động lên trang khách hàng mà không cần khởi động lại máy chủ.
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Save Action */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="submit"
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{ 
              padding: '12px 32px', 
              fontSize: '15px', 
              fontWeight: 700, 
              backgroundColor: 'var(--color-primary-dark)',
              borderRadius: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <SaveOutlined /> {saving ? 'Đang lưu...' : 'Lưu Tất Cả Cài Đặt'}
          </button>
          {saveSuccess && (
            <span style={{ color: '#16A34A', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleOutlined /> Đã lưu thành công!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
