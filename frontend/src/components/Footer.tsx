import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useAdminAuth } from '../admin/AdminAuthContext';

interface FooterConfig {
  brand_desc?: string;
  copyright?: string;
}

export default function Footer() {
  const { user, isAuthenticated } = useAdminAuth();
  const isAdmin = Boolean(isAuthenticated && user?.role_name === 'admin' && user?.email === 'admin@ngheflorist.vn' && user?.id === 1);

  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    brand_desc: 'Nghệ Florist mang đến những tác phẩm hoa tươi nghệ thuật, tinh tế và tràn đầy cảm xúc. Từng đóa hoa được nâng niu tỉ mỉ từ khâu chọn hoa đến khi trao tận tay người nhận.',
    copyright: '© 2026 Nghệ Florist. Tất cả các quyền được bảo lưu.'
  });

  useEffect(() => {
    fetch('/api/content/settings')
      .then(r => r.json())
      .then(data => {
        if (data.footerConfig && Object.keys(data.footerConfig).length > 0) {
          setFooterConfig(data.footerConfig);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Desktop & Tablet Footer Grid */}
        <div className="footer-grid desktop-only-action">
          {/* Brand info */}
          <div className="footer-col">
            <Link to="/" className="site-logo" style={{ marginBottom: 16 }}>
              <img src="/images/logoNgheFlorist-brand-blue.png?v=2" alt="Nghệ Florist" style={{ height: 50, width: 'auto', objectFit: 'contain' }} />
            </Link>
            <p style={{ marginBottom: 0, lineHeight: 1.65, fontSize: '0.92rem' }}>
              {footerConfig.brand_desc}
            </p>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4>Khám phá</h4>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/flowers">Tất cả sản phẩm</Link></li>
              <li><Link to="/custom-order">Cắm hoa theo yêu cầu</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/policy">Chính sách & bảo hành</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4>Danh mục hoa</h4>
            <ul className="footer-links">
              <li><Link to="/category/bo-hoa">Bó hoa tươi</Link></li>
              <li><Link to="/category/gio-hoa">Giỏ hoa tươi</Link></li>
              <li><Link to="/category/hoa-cuoi">Hoa cưới cô dâu</Link></li>
              <li><Link to="/category/ke-hoa">Kệ hoa khai trương</Link></li>
              <li><Link to="/category/lan-ho-diep">Lan hồ điệp</Link></li>
              {isAdmin && (
                <li><Link to="/admin" style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>Quản trị viên (CMS)</Link></li>
              )}
            </ul>
          </div>

          {/* Policy & Trust */}
          <div className="footer-col">
            <h4>Cam kết của chúng tôi</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <CheckCircleOutlined style={{ color: 'var(--color-primary-dark)', marginTop: 4 }} />
                <span>Luôn chụp ảnh thành phẩm gửi khách hàng duyệt trước khi giao.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <CheckCircleOutlined style={{ color: 'var(--color-primary-dark)', marginTop: 4 }} />
                <span>Hoa nhập khẩu tươi mới rạng sáng mỗi ngày.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <CheckCircleOutlined style={{ color: 'var(--color-primary-dark)', marginTop: 4 }} />
                <span>Tặng kèm thiệp thiết kế & banner cao cấp theo yêu cầu.</span>
              </div>
            </div>
            <Link to="/custom-order" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
              Đặt cắm hoa theo mẫu riêng
            </Link>
          </div>
        </div>

        {/* Mobile Compact Footer (<768px) per Spec #17 */}
        <div className="mobile-only-element" style={{ textAlign: 'center', paddingBottom: 16 }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: 16 }}>
            <img src="/images/logoNgheFlorist-brand-blue.png?v=2" alt="Nghệ Florist" style={{ height: 42, width: 'auto' }} />
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px 20px', marginBottom: 16, fontSize: '0.92rem', fontWeight: 600 }}>
            <Link to="/" style={{ color: 'var(--color-text)' }}>Trang chủ</Link>
            <Link to="/flowers" style={{ color: 'var(--color-text)' }}>Bộ sưu tập</Link>
            <Link to="/custom-order" style={{ color: 'var(--color-text)' }}>Thiết kế riêng</Link>
            <Link to="/about" style={{ color: 'var(--color-text)' }}>Về Nghệ</Link>
            <Link to="/policy" style={{ color: 'var(--color-text)' }}>Liên hệ</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            {footerConfig.copyright || `© ${new Date().getFullYear()} Nghệ Florist. Tất cả các quyền được bảo lưu.`}
          </div>
          <div>
            Nghệ Florist - Tiệm hoa & quả nhập khẩu
          </div>
        </div>
      </div>
    </footer>
  );
}
