import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAdminAuth } from '../admin/AdminAuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface FooterConfig {
  brand_desc?: string;
  zalo?: string;
  zalo2?: string;
  instagram?: string;
  copyright?: string;
}

export default function Footer() {
  const { user, isAuthenticated } = useAdminAuth();
  const isAdmin = Boolean(isAuthenticated && user?.role_name === 'admin' && user?.email === 'admin@ngheflorist.vn' && user?.id === 1);
  const { settings, hotline1, hotline2, zaloUrl1, zaloUrl2 } = useSiteSettings();

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
              <img src="/images/logoNgheFlorist-dark.png" alt="Nghệ Florist" style={{ height: 50, width: 'auto', objectFit: 'contain' }} />
            </Link>
            <p style={{ marginBottom: 20 }}>
              {footerConfig.brand_desc}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <EnvironmentOutlined style={{ color: 'var(--color-primary-dark)' }} />
                <span>{settings.address || '22 ngõ 115 Phố Núi Trúc, Ba Đình, Hà Nội'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PhoneOutlined style={{ color: 'var(--color-primary-dark)' }} />
                <span>Hotline 1 / Zalo: <a href={zaloUrl1} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-dark)', fontWeight: 700, textDecoration: 'none' }}>{hotline1}</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PhoneOutlined style={{ color: 'var(--color-primary-dark)' }} />
                <span>Hotline 2 / Zalo: <a href={zaloUrl2} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-dark)', fontWeight: 700, textDecoration: 'none' }}>{hotline2}</a></span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <a
                  href={zaloUrl1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: '0.78rem', textDecoration: 'none' }}
                >
                  Zalo 1: {hotline1}
                </a>
                <a
                  href={zaloUrl2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-soft btn-sm"
                  style={{ borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: '0.78rem', textDecoration: 'none' }}
                >
                  Zalo 2: {hotline2}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MailOutlined style={{ color: 'var(--color-primary-dark)' }} />
                <span>{settings.email || 'ngheflorist.com@gmail.com'}</span>
              </div>
            </div>
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
            <img src="/images/logoNgheFlorist-dark.png" alt="Nghệ Florist" style={{ height: 42, width: 'auto' }} />
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px 20px', marginBottom: 20, fontSize: '0.92rem', fontWeight: 600 }}>
            <Link to="/" style={{ color: 'var(--color-text)' }}>Trang chủ</Link>
            <Link to="/flowers" style={{ color: 'var(--color-text)' }}>Bộ sưu tập</Link>
            <Link to="/custom-order" style={{ color: 'var(--color-text)' }}>Thiết kế riêng</Link>
            <Link to="/about" style={{ color: 'var(--color-text)' }}>Về Nghệ</Link>
            <Link to="/policy" style={{ color: 'var(--color-text)' }}>Liên hệ</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Hotline 1: <a href={`tel:${hotline1.replace(/\s+/g, '')}`} style={{ fontWeight: 700, color: 'var(--color-text)' }}>{hotline1}</a> • Hotline 2: <a href={`tel:${hotline2.replace(/\s+/g, '')}`} style={{ fontWeight: 700, color: 'var(--color-text)' }}>{hotline2}</a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', width: '100%', maxWidth: 360 }}>
              <a 
                href={zaloUrl1} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ flex: '1 1 140px', borderRadius: 'var(--radius-full)', padding: '9px 12px', fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none' }}
              >
                💬 Zalo 1 ({hotline1})
              </a>
              <a 
                href={zaloUrl2} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-soft btn-sm"
                style={{ flex: '1 1 140px', borderRadius: 'var(--radius-full)', padding: '9px 12px', fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none' }}
              >
                💬 Zalo 2 ({hotline2})
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            {footerConfig.copyright || `© ${new Date().getFullYear()} Nghệ Florist. Tất cả các quyền được bảo lưu.`}
          </div>
          <div>
            Digital Showroom Hoa Tươi Nghệ Thuật — Nghệ Florist
          </div>
        </div>
      </div>
    </footer>
  );
}
