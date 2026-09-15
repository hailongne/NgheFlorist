import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext';
import { 
  SaveOutlined, 
  CopyrightOutlined,
  EyeOutlined,
  AppstoreOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  LockOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  product_count: number;
  children?: CategoryNode[];
}

interface FooterConfig {
  brand_desc: string;
  copyright: string;
}

const DEFAULT_CATEGORY_TREE: CategoryNode[] = [
  {
    id: 1,
    name: 'Bó Hoa',
    slug: 'bo-hoa',
    product_count: 30,
    children: [
      { id: 11, name: '300k - 500k', slug: 'bo-hoa-300k-500k', product_count: 10 },
      { id: 12, name: '500k - 1000k', slug: 'bo-hoa-500k-1000k', product_count: 5 },
      { id: 13, name: '1000k - 1500k', slug: 'bo-hoa-1000k-1500k', product_count: 5 },
      { id: 14, name: '1500k - 2000k', slug: 'bo-hoa-1500k-2000k', product_count: 5 },
      { id: 15, name: '2000k trở lên', slug: 'bo-hoa-2000k-tro-len', product_count: 5 },
    ]
  },
  {
    id: 2,
    name: 'Giỏ Hoa',
    slug: 'gio-hoa',
    product_count: 30,
    children: [
      { id: 21, name: '500k - 600k', slug: 'gio-hoa-500k-600k', product_count: 5 },
      { id: 22, name: '600k - 800k', slug: 'gio-hoa-600k-800k', product_count: 5 },
      { id: 23, name: '800k - 1000k', slug: 'gio-hoa-800k-1000k', product_count: 5 },
      { id: 24, name: '1000k - 1500k', slug: 'gio-hoa-1000k-1500k', product_count: 5 },
      { id: 25, name: '1500k - 2000k', slug: 'gio-hoa-1500k-2000k', product_count: 5 },
      { id: 26, name: '2000k trở lên', slug: 'gio-hoa-2000k-tro-len', product_count: 5 },
    ]
  },
  {
    id: 3,
    name: 'Kệ Hoa',
    slug: 'ke-hoa',
    product_count: 20,
    children: [
      { id: 31, name: '1000k - 1200k', slug: 'ke-hoa-1000k-1200k', product_count: 5 },
      { id: 32, name: '1200k - 1500k', slug: 'ke-hoa-1200k-1500k', product_count: 5 },
      { id: 33, name: '1500k - 2000k', slug: 'ke-hoa-1500k-2000k', product_count: 5 },
      { id: 34, name: '2000k trở lên', slug: 'ke-hoa-2000k-tro-len', product_count: 5 },
    ]
  }
];

export default function AdminNavigationCmsPage() {
  const { token } = useAdminAuth();
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [hasDbCategories, setHasDbCategories] = useState(false);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    brand_desc: 'Nghệ Florist mang đến những tác phẩm hoa tươi nghệ thuật, tinh tế và tràn đầy cảm xúc. Từng đóa hoa được nâng niu tỉ mỉ từ khâu chọn hoa đến khi trao tận tay người nhận.',
    copyright: '© 2026 Nghệ Florist. Tất cả các quyền được bảo lưu.'
  });

  const [activeTab, setActiveTab] = useState<'both' | 'sidebar' | 'footer'>('both');
  const [loading, setLoading] = useState(true);
  const [savingFooter, setSavingFooter] = useState(false);
  const [footerToast, setFooterToast] = useState('');

  const fetchNavData = async () => {
    try {
      setLoading(true);
      const [catRes, sRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.tree && Array.isArray(catData.tree) && catData.tree.length > 0) {
          setCategoryTree(catData.tree);
          setHasDbCategories(true);
        } else {
          setCategoryTree(DEFAULT_CATEGORY_TREE);
          setHasDbCategories(false);
        }
      } else {
        setCategoryTree(DEFAULT_CATEGORY_TREE);
      }

      if (sRes.ok) {
        const s = await sRes.json();
        if (s.footerConfig) {
          setFooterConfig(prev => ({ 
            ...prev, 
            brand_desc: s.footerConfig.brand_desc || prev.brand_desc,
            copyright: s.footerConfig.copyright || prev.copyright
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching navigation data:', err);
      setCategoryTree(DEFAULT_CATEGORY_TREE);
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

  const displayCategoryTree = categoryTree.length > 0 ? categoryTree : DEFAULT_CATEGORY_TREE;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header & View Mode Switcher */}
      <div className="admin-page-header" style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 className="admin-page-title" style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderOutlined style={{ color: 'var(--admin-primary)' }} />
            Quản Lý Menu Sidebar & Chân Trang Footer
          </h1>
          <div className="admin-page-subtitle">
            Cấu trúc danh mục menu sidebar 2 tầng lấy từ cơ sở dữ liệu và tùy biến thông tin thương hiệu, bản quyền chân trang
          </div>
        </div>

        {/* View Mode Tabs */}
        <div style={{ display: 'flex', background: '#EAF6F9', padding: 4, borderRadius: 10, gap: 4 }}>
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'both' ? '#fff' : 'transparent',
              color: activeTab === 'both' ? 'var(--admin-primary-dark)' : 'var(--admin-text-secondary)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'both' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <AppstoreOutlined /> Song song 2 cột
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sidebar')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'sidebar' ? '#fff' : 'transparent',
              color: activeTab === 'sidebar' ? 'var(--admin-primary-dark)' : 'var(--admin-text-secondary)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'sidebar' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <FolderOutlined /> Menu Sidebar ({displayCategoryTree.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('footer')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'footer' ? '#fff' : 'transparent',
              color: activeTab === 'footer' ? 'var(--admin-primary-dark)' : 'var(--admin-text-secondary)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'footer' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <EyeOutlined /> Chân trang Footer
          </button>
        </div>
      </div>

      {/* Main Grid Container */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: activeTab === 'both' ? 'minmax(380px, 480px) 1fr' : '1fr', 
          gap: 24,
          alignItems: 'start'
        }}
      >
        {/* ======================================================== */}
        {/* COLUMN 1: SIDEBAR CATEGORIES TREE (MATCHING IMAGE 2) */}
        {/* ======================================================== */}
        {(activeTab === 'both' || activeTab === 'sidebar') && (
          <div className="admin-card" style={{ padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--admin-text)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-primary)' }} />
                Cấu Trúc Menu Sidebar (Danh Mục Hoa)
              </h3>
              <span className={`admin-badge ${hasDbCategories ? 'badge-success' : 'badge-info'}`}>
                {hasDbCategories ? 'Database Live' : 'Dữ liệu mẫu'}
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
              Sidebar của khách hàng hiển thị cây danh mục 2 tầng lấy trực tiếp từ Database. Đã loại bỏ các mục điều hướng thừa (Trang chủ, Về Nghệ...) giúp giao diện tập trung mua hàng.
            </p>

            {/* Link to Categories Management in Database */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <Link 
                to="/admin/categories" 
                className="admin-btn admin-btn-primary" 
                style={{ fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <DatabaseOutlined /> Quản Lý Danh Mục (Database) <ArrowRightOutlined />
              </Link>
              <button 
                type="button" 
                onClick={fetchNavData} 
                className="admin-btn admin-btn-outline" 
                style={{ fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Tải lại danh mục từ cơ sở dữ liệu"
              >
                <ReloadOutlined spin={loading} /> Làm mới
              </button>
            </div>

            {/* Visual Sidebar Tree Card (Styled exactly like Image 2) */}
            <div 
              style={{ 
                background: '#FFFFFF', 
                border: '1.5px solid #E2E8F0', 
                borderRadius: 14, 
                padding: '24px 20px', 
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: 700, 
                color: '#1E293B', 
                marginBottom: 16,
                letterSpacing: -0.2
              }}>
                Danh mục hoa
              </div>

              {/* Tất cả mẫu hoa */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#E6F4F8',
                  color: '#0E7490',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  marginBottom: 16
                }}
              >
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>📁</span>
                <span>Tất cả mẫu hoa</span>
              </div>

              {/* Category Tree 2 tầng */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {displayCategoryTree.map((cat) => (
                  <div key={cat.id || cat.slug} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {/* Parent Category */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: 6,
                        color: '#1E293B'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.98rem' }}>
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>📁</span>
                        <span>{cat.name}</span>
                      </div>
                      <span style={{
                        background: '#F1F5F9',
                        color: '#64748B',
                        borderRadius: 12,
                        padding: '2px 10px',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}>
                        {cat.product_count}
                      </span>
                    </div>

                    {/* Subcategories (Price Ranges) */}
                    {cat.children && cat.children.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 18 }}>
                        {cat.children.map((sub) => (
                          <div
                            key={sub.id || sub.slug}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '5px 8px',
                              borderRadius: 6,
                              color: '#475569',
                              fontSize: '0.9rem',
                              fontWeight: 500
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: '#94A3B8', fontWeight: 600 }}>↳</span>
                              <span>{sub.name}</span>
                            </div>
                            <span style={{
                              background: '#F1F5F9',
                              color: '#64748B',
                              borderRadius: 10,
                              padding: '1px 8px',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}>
                              {sub.product_count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Note box */}
            <div style={{ marginTop: 18, padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#64748B', display: 'flex', gap: 8 }}>
              <InfoCircleOutlined style={{ color: '#0284C7', marginTop: 2 }} />
              <div>
                Dữ liệu danh mục và số lượng hoa được tự động cập nhật khi bạn thêm hoặc chỉnh sửa danh mục/sản phẩm trong hệ thống.
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* COLUMN 2: FOOTER CONFIGURATION & EXACT LIVE PREVIEW */}
        {/* ======================================================== */}
        {(activeTab === 'both' || activeTab === 'footer') && (
          <div className="admin-card" style={{ padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--admin-text)' }}>
                <EyeOutlined style={{ color: 'var(--admin-primary)' }} />
                Cấu Hình Chân Trang (Footer)
              </h3>
              <span className="admin-badge badge-info">CMS Chân Trang</span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-secondary)', margin: '0 0 18px', lineHeight: 1.5 }}>
              Tùy biến các phần cho phép chỉnh sửa (Lời giới thiệu & Bản quyền). Các cột tiêu chuẩn khác được khóa theo thiết kế showroom hoa và không cần phần liên hệ vì đã có nút liên hệ ghim trên toàn trang web.
            </p>

            {footerToast && (
              <div style={{ padding: '10px 14px', background: '#F0FDF4', color: '#15803D', borderRadius: 8, border: '1px solid #BBF7D0', marginBottom: 16, fontSize: '0.88rem', fontWeight: 600 }}>
                {footerToast}
              </div>
            )}

            {/* Form chỉnh sửa các trường được phép */}
            <form onSubmit={handleSaveFooter} style={{ marginBottom: 28 }}>
              {/* Brand description */}
              <div className="admin-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="admin-label" style={{ margin: 0, fontWeight: 700 }}>
                    Lời giới thiệu thương hiệu ở chân trang <span style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 600 }}>(Chỉnh sửa được)</span>
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{footerConfig.brand_desc?.length || 0} ký tự</span>
                </div>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  placeholder="Nghệ Florist mang đến những tác phẩm hoa tươi nghệ thuật, tinh tế và tràn đầy cảm xúc..."
                  value={footerConfig.brand_desc}
                  onChange={(e) => setFooterConfig({ ...footerConfig, brand_desc: e.target.value })}
                  style={{ lineHeight: 1.6 }}
                />
              </div>

              {/* Copyright */}
              <div className="admin-form-group" style={{ marginBottom: 18 }}>
                <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <CopyrightOutlined /> Dòng bản quyền (Copyright) <span style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 600 }}>(Chỉnh sửa được)</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="© 2026 Nghệ Florist. Tất cả các quyền được bảo lưu."
                  value={footerConfig.copyright}
                  onChange={(e) => setFooterConfig({ ...footerConfig, copyright: e.target.value })}
                />
              </div>

              {/* Save Button */}
              <button 
                type="submit" 
                disabled={savingFooter} 
                className="admin-btn admin-btn-primary" 
                style={{ padding: '10px 24px', fontSize: '0.92rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <SaveOutlined /> {savingFooter ? 'Đang lưu cấu hình...' : 'Lưu Cấu Hình Chân Trang'}
              </button>
            </form>

            {/* Các phần mặc định không cho chỉnh sửa (Read-only / Locked info cards) */}
            <div style={{ marginBottom: 28, background: '#F8FAFC', padding: 18, borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <LockOutlined style={{ color: '#64748B' }} /> Các phần mặc định hệ thống (Không cho chỉnh sửa):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 8, border: '1px solid #CBD5E1' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1E293B', marginBottom: 4 }}>
                    Cột "Khám phá"
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
                    5 liên kết điều hướng: Trang chủ, Tất cả sản phẩm, Cắm hoa theo yêu cầu, Về chúng tôi, Chính sách & bảo hành.
                  </div>
                  <span className="admin-badge badge-warning" style={{ marginTop: 6, fontSize: '0.7rem' }}>Mặc định cố định</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 8, border: '1px solid #CBD5E1' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1E293B', marginBottom: 4 }}>
                    Cột "Danh mục hoa"
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
                    Tự động đồng bộ từ cơ sở dữ liệu: Bó hoa, Giỏ hoa, Kệ hoa, Lan hồ điệp...
                  </div>
                  <span className="admin-badge badge-success" style={{ marginTop: 6, fontSize: '0.7rem' }}>Tự động Database</span>
                </div>

                <div style={{ background: '#FFFFFF', padding: 12, borderRadius: 8, border: '1px solid #CBD5E1' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1E293B', marginBottom: 4 }}>
                    Cột "Cam kết dịch vụ"
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
                    3 cam kết vàng: Gửi ảnh duyệt trước khi giao, Hoa nhập tươi mới rạng sáng, Tặng kèm thiệp & banner cao cấp.
                  </div>
                  <span className="admin-badge badge-warning" style={{ marginTop: 6, fontSize: '0.7rem' }}>Mặc định cố định</span>
                </div>
              </div>
            </div>

            {/* LIVE FOOTER PREVIEW - 100% MATCHING CLIENT WEB FOOTER */}
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <EyeOutlined /> Xem trước chân trang thực tế (Live Footer Preview):
              </div>

              <div 
                style={{ 
                  background: '#26383D', 
                  color: '#CBD5E1', 
                  padding: '36px 28px 20px', 
                  borderRadius: 14, 
                  fontSize: '0.85rem', 
                  lineHeight: 1.65,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}
              >
                {/* 4-Column Grid matching desktop site-footer */}
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: 28,
                    marginBottom: 32
                  }}
                >
                  {/* Col 1: Brand Info */}
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <img 
                        src="/images/logoNgheFlorist-dark.png" 
                        alt="Nghệ Florist" 
                        style={{ height: 46, width: 'auto', objectFit: 'contain' }} 
                      />
                    </div>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.86rem', lineHeight: 1.6 }}>
                      {footerConfig.brand_desc || 'Mô tả tiệm hoa tươi nghệ thuật...'}
                    </p>
                  </div>

                  {/* Col 2: Khám phá */}
                  <div>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.96rem', marginBottom: 14 }}>
                      Khám phá
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#94A3B8', fontSize: '0.85rem' }}>
                      <span style={{ cursor: 'pointer' }}>Trang chủ</span>
                      <span style={{ cursor: 'pointer' }}>Tất cả sản phẩm</span>
                      <span style={{ cursor: 'pointer' }}>Cắm hoa theo yêu cầu</span>
                      <span style={{ cursor: 'pointer' }}>Về chúng tôi</span>
                      <span style={{ cursor: 'pointer' }}>Chính sách & bảo hành</span>
                    </div>
                  </div>

                  {/* Col 3: Danh mục hoa */}
                  <div>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.96rem', marginBottom: 14 }}>
                      Danh mục hoa
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#94A3B8', fontSize: '0.85rem' }}>
                      <span style={{ cursor: 'pointer' }}>Bó hoa tươi</span>
                      <span style={{ cursor: 'pointer' }}>Giỏ hoa tươi</span>
                      <span style={{ cursor: 'pointer' }}>Hoa cưới cô dâu</span>
                      <span style={{ cursor: 'pointer' }}>Kệ hoa khai trương</span>
                      <span style={{ cursor: 'pointer' }}>Lan hồ điệp</span>
                    </div>
                  </div>

                  {/* Col 4: Cam kết của chúng tôi */}
                  <div>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.96rem', marginBottom: 14 }}>
                      Cam kết của chúng tôi
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: '#94A3B8', fontSize: '0.82rem', marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <CheckCircleOutlined style={{ color: '#46B8B3', marginTop: 3 }} />
                        <span>Luôn chụp ảnh thành phẩm gửi khách hàng duyệt trước khi giao.</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <CheckCircleOutlined style={{ color: '#46B8B3', marginTop: 3 }} />
                        <span>Hoa nhập khẩu tươi mới rạng sáng mỗi ngày.</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <CheckCircleOutlined style={{ color: '#46B8B3', marginTop: 3 }} />
                        <span>Tặng kèm thiệp thiết kế & banner cao cấp theo yêu cầu.</span>
                      </div>
                    </div>
                    <div 
                      style={{ 
                        display: 'inline-block',
                        width: '100%', 
                        textAlign: 'center', 
                        padding: '8px 12px', 
                        border: '1px solid rgba(255,255,255,0.3)', 
                        borderRadius: 6, 
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.8rem',
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
                    borderTop: '1px solid rgba(255,255,255,0.1)', 
                    paddingTop: 16, 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    gap: 12,
                    fontSize: '0.78rem', 
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
        )}
      </div>
    </div>
  );
}
