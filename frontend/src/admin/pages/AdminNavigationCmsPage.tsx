import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { 
  SaveOutlined, 
  CopyrightOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  LockOutlined,
  FileTextOutlined
} from '@ant-design/icons';

interface FooterConfig {
  brand_desc: string;
  copyright: string;
}

export default function AdminNavigationCmsPage() {
  const { token } = useAdminAuth();
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    brand_desc: 'Nghệ Florist mang đến những tác phẩm hoa tươi nghệ thuật, tinh tế và tràn đầy cảm xúc. Từng đóa hoa được nâng niu tỉ mỉ từ khâu chọn hoa đến khi trao tận tay người nhận.',
    copyright: '© 2026 Nghệ Florist. Tất cả các quyền được bảo lưu.'
  });

  const [loading, setLoading] = useState(true);
  const [savingFooter, setSavingFooter] = useState(false);
  const [footerToast, setFooterToast] = useState('');

  const fetchNavData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings', { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (res.ok) {
        const s = await res.json();
        if (s.footerConfig) {
          setFooterConfig(prev => ({ 
            ...prev, 
            brand_desc: s.footerConfig.brand_desc || prev.brand_desc,
            copyright: s.footerConfig.copyright || prev.copyright
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching footer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavData();
  }, [token]);

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFooter(true);
    setFooterToast('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          footerConfig: {
            brand_desc: footerConfig.brand_desc.trim(),
            copyright: footerConfig.copyright.trim()
          } 
        })
      });

      if (res.ok) {
        setFooterToast('✓ Đã lưu cấu hình chân trang thành công!');
        setTimeout(() => setFooterToast(''), 4000);
      } else {
        alert('Lỗi lưu cấu hình chân trang');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSavingFooter(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header */}
      <div className="admin-page-header" style={{ marginBottom: 24 }}>
        <h1 className="admin-page-title" style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileTextOutlined style={{ color: 'var(--admin-primary)' }} />
          Quản Lý Chân Trang (Footer)
        </h1>
        <div className="admin-page-subtitle">
          Tùy biến câu chuyện thương hiệu và dòng bản quyền chân trang website. Footer hiển thị preview chuẩn 100% giao diện thực tế.
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="admin-card" style={{ padding: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--admin-text)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-primary)' }} />
            Nội Dung Chân Trang Được Phép Chỉnh Sửa
          </h3>
          <span className="admin-badge badge-info">CMS Chân Trang</span>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-secondary)', margin: '0 0 20px', lineHeight: 1.5 }}>
          Các phần có thể chỉnh sửa gồm Lời giới thiệu thương hiệu và Dòng bản quyền. Các cột mặc định khác (Khám phá, Danh mục hoa, Cam kết) được khóa cố định theo chuẩn giao diện. Chân trang không cần mục liên hệ vì website đã có nút liên hệ ghim.
        </p>

        {footerToast && (
          <div style={{ padding: '12px 16px', background: '#F0FDF4', color: '#15803D', borderRadius: 8, border: '1px solid #BBF7D0', marginBottom: 20, fontSize: '0.9rem', fontWeight: 600 }}>
            {footerToast}
          </div>
        )}

        <form onSubmit={handleSaveFooter}>
          {/* Brand description */}
          <div className="admin-form-group" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="admin-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem' }}>
                Lời giới thiệu thương hiệu ở chân trang <span style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 600 }}>(Có thể chỉnh sửa)</span>
              </label>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{footerConfig.brand_desc?.length || 0} ký tự</span>
            </div>
            <textarea
              className="admin-textarea"
              rows={3}
              placeholder="Nghệ Florist mang đến những tác phẩm hoa tươi nghệ thuật, tinh tế và tràn đầy cảm xúc..."
              value={footerConfig.brand_desc}
              onChange={(e) => setFooterConfig({ ...footerConfig, brand_desc: e.target.value })}
              style={{ lineHeight: 1.6, fontSize: '0.92rem' }}
            />
          </div>

          {/* Copyright */}
          <div className="admin-form-group" style={{ marginBottom: 24 }}>
            <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.92rem', marginBottom: 8 }}>
              <CopyrightOutlined /> Dòng bản quyền (Copyright) <span style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 600 }}>(Có thể chỉnh sửa)</span>
            </label>
            <input
              type="text"
              className="admin-input"
              placeholder="© 2026 Nghệ Florist. Tất cả các quyền được bảo lưu."
              value={footerConfig.copyright}
              onChange={(e) => setFooterConfig({ ...footerConfig, copyright: e.target.value })}
              style={{ fontSize: '0.92rem' }}
            />
          </div>

          {/* Save Button */}
          <button 
            type="submit" 
            disabled={savingFooter} 
            className="admin-btn admin-btn-primary" 
            style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <SaveOutlined /> {savingFooter ? 'Đang lưu cấu hình...' : 'Lưu Cấu Hình Chân Trang'}
          </button>
        </form>
      </div>

      {/* Default Non-editable Parts Info Card */}
      <div className="admin-card" style={{ padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: 28, background: '#F8FAFC' }}>
        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#334155', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <LockOutlined style={{ color: '#64748B' }} /> Các phần mặc định hệ thống (Không cho chỉnh sửa trực tiếp tại đây):
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>Cột "Khám phá"</div>
              <span className="admin-badge badge-warning" style={{ fontSize: '0.72rem' }}>Mặc định</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.6 }}>
              Bao gồm 5 liên kết điều hướng: Trang chủ, Tất cả sản phẩm, Cắm hoa theo yêu cầu, Về chúng tôi, Chính sách & bảo hành.
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>Cột "Danh mục hoa"</div>
              <span className="admin-badge badge-success" style={{ fontSize: '0.72rem' }}>Tự động Database</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.6 }}>
              Tự động lấy theo dữ liệu danh mục trong cơ sở dữ liệu (quản lý tại trang Quản Lý Danh Mục Hoa).
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>Cột "Cam kết của chúng tôi"</div>
              <span className="admin-badge badge-warning" style={{ fontSize: '0.72rem' }}>Mặc định</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.6 }}>
              3 cam kết tiêu chuẩn: Gửi ảnh duyệt trước khi giao, Hoa nhập mới mỗi ngày, Tặng thiệp & banner + Nút đặt cắm hoa.
            </div>
          </div>
        </div>
      </div>

      {/* LIVE FOOTER PREVIEW - 100% MATCHING CLIENT WEB FOOTER */}
      <div className="admin-card" style={{ padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <EyeOutlined /> Xem trước chân trang thực tế (Live Footer Preview):
        </div>

        {/* Realistic Footer Container - Exact Light Theme matching Website Footer */}
        <div 
          style={{ 
            background: '#FFFFFF', 
            color: '#475569', 
            padding: '44px 36px 24px', 
            borderRadius: 14, 
            border: '1px solid #E2E8F0',
            fontSize: '0.88rem', 
            lineHeight: 1.65,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}
        >
          {/* 4-Column Grid matching desktop site-footer */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 36,
              marginBottom: 36
            }}
          >
            {/* Col 1: Brand Info */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <img 
                  src="/images/logoNgheFlorist.png" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/logoNgheFlorist-dark.png';
                  }}
                  alt="Nghệ Florist" 
                  style={{ height: 48, width: 'auto', objectFit: 'contain' }} 
                />
              </div>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem', lineHeight: 1.65 }}>
                {footerConfig.brand_desc || 'Mô tả tiệm hoa tươi nghệ thuật...'}
              </p>
            </div>

            {/* Col 2: Khám phá */}
            <div>
              <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem', marginBottom: 16 }}>
                Khám phá
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: '#64748B', fontSize: '0.88rem' }}>
                <span style={{ cursor: 'pointer' }}>Trang chủ</span>
                <span style={{ cursor: 'pointer' }}>Tất cả sản phẩm</span>
                <span style={{ cursor: 'pointer' }}>Cắm hoa theo yêu cầu</span>
                <span style={{ cursor: 'pointer' }}>Về chúng tôi</span>
                <span style={{ cursor: 'pointer' }}>Chính sách & bảo hành</span>
              </div>
            </div>

            {/* Col 3: Danh mục hoa */}
            <div>
              <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem', marginBottom: 16 }}>
                Danh mục hoa
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: '#64748B', fontSize: '0.88rem' }}>
                <span style={{ cursor: 'pointer' }}>Bó hoa tươi</span>
                <span style={{ cursor: 'pointer' }}>Giỏ hoa tươi</span>
                <span style={{ cursor: 'pointer' }}>Hoa cưới cô dâu</span>
                <span style={{ cursor: 'pointer' }}>Kệ hoa khai trương</span>
                <span style={{ cursor: 'pointer' }}>Lan hồ điệp</span>
                <span style={{ color: '#0D9488', fontWeight: 600 }}>Quản trị viên (CMS)</span>
              </div>
            </div>

            {/* Col 4: Cam kết của chúng tôi */}
            <div>
              <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem', marginBottom: 16 }}>
                Cam kết của chúng tôi
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#64748B', fontSize: '0.84rem', marginBottom: 18 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <CheckCircleOutlined style={{ color: '#0D9488', marginTop: 3, fontSize: '0.95rem' }} />
                  <span>Luôn chụp ảnh thành phẩm gửi khách hàng duyệt trước khi giao.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <CheckCircleOutlined style={{ color: '#0D9488', marginTop: 3, fontSize: '0.95rem' }} />
                  <span>Hoa nhập khẩu tươi mới rạng sáng mỗi ngày.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <CheckCircleOutlined style={{ color: '#0D9488', marginTop: 3, fontSize: '0.95rem' }} />
                  <span>Tặng kèm thiệp thiết kế & banner cao cấp theo yêu cầu.</span>
                </div>
              </div>
              <div 
                style={{ 
                  display: 'inline-block',
                  width: '100%', 
                  textAlign: 'center', 
                  padding: '9px 16px', 
                  border: '1.5px solid #0D9488', 
                  borderRadius: 24, 
                  color: '#0D9488',
                  background: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Đặt cắm hoa theo mẫu riêng
              </div>
            </div>
          </div>

          {/* Footer bottom bar */}
          <div 
            style={{ 
              borderTop: '1px solid #E2E8F0', 
              paddingTop: 20, 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: 12,
              fontSize: '0.82rem', 
              color: '#64748B' 
            }}
          >
            <div>
              {footerConfig.copyright || '© 2026 Nghệ Florist. Tất cả các quyền được bảo lưu.'}
            </div>
            <div>
              Digital Showroom Hoa Tươi Nghệ Thuật — Nghệ Florist
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
