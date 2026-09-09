import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { SettingOutlined, SaveOutlined, MessageOutlined, LinkOutlined } from '@ant-design/icons';

interface SiteSettings {
  site_name: string;
  hotline: string;
  email: string;
  address: string;
  business_hours: string;
  currency: string;
  announcement: string;
}

interface ConversionConfig {
  zalo_url: string;
  fanpage_url: string;
  primary_channel: string;
  primary_cta_text: string;
  secondary_cta_text: string;
  request_message_template: string;
}

export default function AdminSettingsPage() {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    hotline: '',
    email: '',
    address: '',
    business_hours: '',
    currency: 'VND',
    announcement: ''
  });

  const [conversionConfig, setConversionConfig] = useState<ConversionConfig>({
    zalo_url: 'https://zalo.me/0987654321',
    fanpage_url: 'https://zalo.me/0862926866',
    primary_channel: 'zalo',
    primary_cta_text: 'Gửi qua Zalo 1 (0987 654 321)',
    secondary_cta_text: 'Gửi qua Zalo 2 (0862 926 866)',
    request_message_template: `Nghệ Florist – Yêu cầu tư vấn\n\nMã yêu cầu: {code}\nKhách hàng: {customer_name}\nSĐT: {phone}\nZalo: {zalo}\nLoại yêu cầu: {type_text}\nMẫu hoa: {product_name}\nLink mẫu: {product_url}\nNgân sách: {budget}\nMàu sắc: {color_tone}\nPhong cách: {style}\nNgày cần: {requested_date}\nThời gian: {requested_time}\nKhu vực giao: {delivery_area}\nLời nhắn: {message}\nGhi chú: {notes}`
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.siteSettings) {
          setSettings(prev => ({ ...prev, ...data.siteSettings }));
        }
        if (data.conversionConfig) {
          setConversionConfig(prev => ({ ...prev, ...data.conversionConfig }));
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          siteSettings: settings,
          conversionConfig
        })
      });
      if (res.ok) {
        window.dispatchEvent(new Event('site_settings_updated'));
        alert('Lưu cấu hình website và kênh chuyển đổi thành công!');
      } else {
        alert('Lỗi lưu cấu hình');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#5D9EAF' }}>Đang tải cài đặt...</div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Cài Đặt Website & Kênh Chuyển Đổi</h1>
          <div className="admin-page-subtitle">
            Cấu hình 2 kênh Zalo (Hotline 1 & Hotline 2), số điện thoại và mẫu tin nhắn tạo Lead tự động
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 760 }}>
        {/* CONVERSION & LEAD CHANNELS (PRIMARY) */}
        <div className="admin-card" style={{ border: '2px solid #BAE6FD', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#0284C7', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <MessageOutlined />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0C4A6E' }}>
                Kênh Chuyển Đổi Zalo (Hotline 1 & Hotline 2)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                Khách hàng sau khi chọn mẫu hoặc thiết kế riêng sẽ gửi đơn trực tiếp qua 2 kênh Zalo này (Không sử dụng Facebook)
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="admin-form-group">
              <label className="admin-label">Đường dẫn Zalo Hotline 1 (0987 654 321) *</label>
              <input
                type="text"
                className="admin-input"
                required
                placeholder="https://zalo.me/0987654321"
                value={conversionConfig.zalo_url}
                onChange={e => setConversionConfig({ ...conversionConfig, zalo_url: e.target.value })}
              />
              <small style={{ color: '#64748B', fontSize: '0.76rem', display: 'block', marginTop: 4 }}>
                Định dạng: <code>https://zalo.me/0987654321</code>
              </small>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Đường dẫn Zalo Hotline 2 (0862 926 866) *</label>
              <input
                type="text"
                className="admin-input"
                required
                placeholder="https://zalo.me/0862926866"
                value={conversionConfig.fanpage_url}
                onChange={e => setConversionConfig({ ...conversionConfig, fanpage_url: e.target.value })}
              />
              <small style={{ color: '#64748B', fontSize: '0.76rem', display: 'block', marginTop: 4 }}>
                Định dạng: <code>https://zalo.me/0862926866</code>
              </small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="admin-form-group">
              <label className="admin-label">Tiêu đề nút CTA Zalo 1</label>
              <input
                type="text"
                className="admin-input"
                value={conversionConfig.primary_cta_text}
                onChange={e => setConversionConfig({ ...conversionConfig, primary_cta_text: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Tiêu đề nút CTA Zalo 2</label>
              <input
                type="text"
                className="admin-input"
                value={conversionConfig.secondary_cta_text}
                onChange={e => setConversionConfig({ ...conversionConfig, secondary_cta_text: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Mẫu tin nhắn định dạng sao chép cho khách hàng</label>
            <textarea
              rows={6}
              className="admin-input"
              style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6 }}
              value={conversionConfig.request_message_template}
              onChange={e => setConversionConfig({ ...conversionConfig, request_message_template: e.target.value })}
            />
            <small style={{ color: '#64748B', fontSize: '0.76rem', display: 'block', marginTop: 4 }}>
              Các biến hỗ trợ: <code>{'{code}'}</code>, <code>{'{customer_name}'}</code>, <code>{'{phone}'}</code>, <code>{'{zalo}'}</code>, <code>{'{product_name}'}</code>, <code>{'{budget}'}</code>, <code>{'{requested_date}'}</code>...
            </small>
          </div>
        </div>

        {/* GENERAL STORE INFO */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
            Thông Tin Tiệm Hoa & Hotline
          </h3>

          <div className="admin-form-group">
            <label className="admin-label">Tên thương hiệu tiệm hoa *</label>
            <input
              type="text"
              className="admin-input"
              required
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-label">Hotline tư vấn đặt hoa *</label>
              <input
                type="text"
                className="admin-input"
                required
                value={settings.hotline}
                onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Email hỗ trợ khách hàng</label>
              <input
                type="email"
                className="admin-input"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Địa chỉ tiệm hoa *</label>
            <input
              type="text"
              className="admin-input"
              required
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-label">Giờ mở cửa phục vụ</label>
              <input
                type="text"
                className="admin-input"
                value={settings.business_hours}
                onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Đơn vị tiền tệ hiển thị</label>
              <input
                type="text"
                className="admin-input"
                disabled
                value={settings.currency}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Thanh thông báo đầu trang (Announcement Bar)</label>
            <input
              type="text"
              className="admin-input"
              placeholder="VD: Miễn phí thiệp chúc mừng & banner cao cấp cho mọi đơn hoa"
              value={settings.announcement}
              onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{ padding: '12px 32px', fontSize: '15px', fontWeight: 700, backgroundColor: '#0284C7' }}
          >
            <SaveOutlined /> {saving ? 'Đang lưu...' : 'Lưu Tất Cả Cài Đặt'}
          </button>
        </div>
      </form>
    </div>
  );
}
