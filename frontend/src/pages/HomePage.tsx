import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightOutlined, CameraOutlined, StarOutlined, SmileOutlined, GiftOutlined } from '@ant-design/icons';
import Features from '../components/Features';
import ProductCard from '../components/ProductCard';
import ImageWithFallback, { BOTANICAL_FALLBACKS } from '../components/ImageWithFallback';
import useDeviceDetect from '../hooks/useDeviceDetect';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  product_count: number;
}

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  image_url?: string;
  featured_image?: string;
  category_name: string;
  supplier_country: string;
  tags: Array<{ id: number; name: string; slug: string }>;
  avg_rating: number;
  review_count: number;
}

interface BannerItem {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  cta_text?: string;
  cta_url?: string;
}

export interface ShowroomCollectionItem {
  id?: string | number;
  title: string;
  slug: string;
  icon: string;
  image: string;
  desc: string;
}

export const DEFAULT_SHOWROOM_COLLECTIONS: ShowroomCollectionItem[] = [
  { title: 'Bó hoa tươi', slug: 'bo-hoa', icon: '⚘', image: '/images/bo-hoa-hong.webp', desc: 'Thiết kế tinh tế, tự nhiên' },
  { title: 'Giỏ hoa tươi', slug: 'gio-hoa', icon: '🌿', image: '/images/gio-hoa-pastel.webp', desc: 'Trang nhã cho mọi dịp' },
  { title: 'Kệ hoa sự kiện', slug: 'ke-hoa', icon: '✦', image: '/images/ke-hoa-khai-truong.webp', desc: 'Khai trương & Chúc mừng' },
  { title: 'Lan hồ điệp', slug: 'lan-ho-diep', icon: '🪷', image: '/images/lan-ho-diep-trang.webp', desc: 'Quý phái & Đẳng cấp' },
  { title: 'Hoa cưới cô dâu', slug: 'hoa-cuoi', icon: '🎀', image: '/images/hoa-cuoi-cam-tay.webp', desc: 'Tinh khôi ngày hạnh phúc' }
];

interface HeroDeviceConfig {
  badge?: string;
  title?: string;
  subtitle?: string;
  cta_primary_text?: string;
  cta_primary_url?: string;
  cta_secondary_text?: string;
  cta_secondary_url?: string;
  hero_image?: string;
}

interface MultiDeviceHeroState {
  desktop?: HeroDeviceConfig;
  tablet?: HeroDeviceConfig;
  mobile?: HeroDeviceConfig;
  badge?: string;
  title?: string;
  subtitle?: string;
  cta_primary_text?: string;
  cta_primary_url?: string;
  cta_secondary_text?: string;
  cta_secondary_url?: string;
  hero_image?: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useDeviceDetect();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic CMS Data with Multi-Device support
  const [hero, setHero] = useState<MultiDeviceHeroState>({
    desktop: {
      badge: '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
      title: 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
      subtitle: 'Hoa tươi thiết kế cao cấp theo yêu cầu – Chụp và gửi ảnh duyệt thành phẩm trước khi giao hàng tận nơi.',
      cta_primary_text: 'Xem bộ sưu tập hoa',
      cta_primary_url: '/flowers',
      cta_secondary_text: 'Cắm hoa theo yêu cầu',
      cta_secondary_url: '/custom-order',
      hero_image: ''
    },
    tablet: {
      badge: '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
      title: 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
      subtitle: 'Hoa tươi thiết kế cao cấp theo yêu cầu – Chụp và gửi ảnh duyệt thành phẩm trước khi giao hàng tận nơi.',
      cta_primary_text: 'Xem bộ sưu tập hoa',
      cta_primary_url: '/flowers',
      cta_secondary_text: 'Cắm hoa theo yêu cầu',
      cta_secondary_url: '/custom-order',
      hero_image: ''
    },
    mobile: {
      badge: '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
      title: 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
      subtitle: 'Hoa tươi thiết kế cao cấp theo yêu cầu – Chụp và gửi ảnh duyệt thành phẩm trước khi giao hàng tận nơi.',
      cta_primary_text: 'Xem bộ sưu tập hoa',
      cta_primary_url: '/flowers',
      cta_secondary_text: 'Cắm hoa theo yêu cầu',
      cta_secondary_url: '/custom-order',
      hero_image: ''
    }
  });
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [customDesign, setCustomDesign] = useState({
    badge: 'Dịch vụ độc quyền',
    title: 'Cắm hoa theo yêu cầu & Ngân sách của riêng bạn',
    subtitle: 'Bạn có mẫu hoa ưng ý trên Pinterest hoặc muốn sáng tạo theo tone màu phong thủy? Hãy gửi hình ảnh và yêu cầu, florist của Nghệ Florist sẽ hiện thực hóa tác phẩm hoa gửi bạn kiểm duyệt trước khi giao.',
    image_url: '',
    cta_text: 'Gửi yêu cầu cắm hoa ngay',
    cta_url: '/custom-order'
  });
  const [showroomCollections, setShowroomCollections] = useState<ShowroomCollectionItem[]>(DEFAULT_SHOWROOM_COLLECTIONS);

  useEffect(() => {
    // Fetch CMS Homepage content (hero, banners, customDesign, collections)
    fetch('/api/content/homepage')
      .then(r => r.json())
      .then(data => {
        if (data.hero) setHero(data.hero);
        if (data.banners && data.banners.length > 0) setBanners(data.banners);
        if (data.customDesign) setCustomDesign(data.customDesign);
        if (data.collections && Array.isArray(data.collections) && data.collections.length > 0) {
          setShowroomCollections(data.collections);
        }
      })
      .catch(console.error);

    // Fetch categories
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        const cats: CategoryItem[] = data.categories || [];
        const mainCats = cats.filter(c => c.parent_id === null || c.product_count > 0).slice(0, 6);
        setCategories(mainCats);
      })
      .catch(console.error);

    // Fetch featured products
    fetch('/api/products?sort=best-seller&limit=8')
      .then(r => r.json())
      .then(data => {
        setFeaturedProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Budget tiers with real query params
  const budgetTiers = [
    { label: 'Dưới 500.000 ₫', sub: 'Món quà nhẹ nhàng, tinh tế', min: 0, max: 500000 },
    { label: '500.000 ₫ - 1.000.000 ₫', sub: 'Phổ biến nhất, sang trọng', min: 500000, max: 1000000 },
    { label: '1.000.000 ₫ - 2.000.000 ₫', sub: 'Hoa nhập khẩu cao cấp', min: 1000000, max: 2000000 },
    { label: 'Trên 2.000.000 ₫', sub: 'Thiết kế VIP & Khai trương lớn', min: 2000000, max: '' }
  ];

  // Memoize active hero configuration based on detected device
  const currentHero = useMemo(() => {
    const defaultData: HeroDeviceConfig = {
      badge: hero.badge || '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
      title: hero.title || 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
      subtitle: hero.subtitle || 'Hoa tươi thiết kế cao cấp theo yêu cầu – Chụp và gửi ảnh duyệt thành phẩm trước khi giao hàng tận nơi.',
      cta_primary_text: hero.cta_primary_text || 'Xem bộ sưu tập hoa',
      cta_primary_url: hero.cta_primary_url || '/flowers',
      cta_secondary_text: hero.cta_secondary_text || 'Cắm hoa theo yêu cầu',
      cta_secondary_url: hero.cta_secondary_url || '/custom-order',
      hero_image: hero.hero_image || ''
    };

    const desktopData = { ...defaultData, ...(hero.desktop || {}) };
    if (!desktopData.hero_image && hero.hero_image) {
      desktopData.hero_image = hero.hero_image;
    }

    if (isMobile) {
      const mobileData = { ...desktopData, ...(hero.mobile || {}) };
      mobileData.hero_image = ''; // Mobile hides hero image to optimize screen space
      return mobileData;
    }

    if (isTablet) {
      const tabletData = { ...desktopData, ...(hero.tablet || {}) };
      if (!tabletData.hero_image) {
        tabletData.hero_image = desktopData.hero_image || hero.hero_image || '';
      }
      return tabletData;
    }

    return desktopData;
  }, [hero, isMobile, isTablet]);

  return (
    <div className="homepage-showroom">
      {/* 1. HERO SECTION - MOBILE (<768px) - ẨN ẢNH, TẬP TRUNG THÔNG ĐIỆP & NÚT BẤM */}
      {isMobile && (
        <section
          style={{
            padding: '24px 16px 28px',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          {/* Thông điệp & CTA - Trên Mobile ẩn ảnh hoàn toàn để tối ưu không gian */}
          <div style={{ padding: '0 4px', textAlign: 'center', maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden' }}>
            {currentHero.badge && (
              <div
                className="badge badge-pastel"
                style={{ 
                  marginBottom: 10, 
                  display: 'inline-flex', 
                  alignItems: 'center',
                  fontSize: 'clamp(0.62rem, 2.7vw, 0.68rem)',
                  padding: '3px 9px',
                  letterSpacing: '-0.25px',
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2
                }}
              >
                {currentHero.badge}
              </div>
            )}
            <h1
              style={{
                fontSize: '1.35rem',
                color: 'var(--color-text)',
                lineHeight: 1.35,
                marginBottom: 8,
                fontFamily: 'var(--font-heading)',
                fontWeight: 700
              }}
            >
              {currentHero.title}
            </h1>

            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                marginBottom: 16
              }}
            >
              {currentHero.subtitle}
            </p>

            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: currentHero.cta_secondary_text ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr', 
                gap: 8,
                alignItems: 'stretch',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <Link
                to={currentHero.cta_primary_url || '/flowers'}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: '9px 6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  minHeight: 40,
                  boxShadow: '0 4px 14px rgba(42, 117, 211, 0.22)',
                  textAlign: 'center'
                }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentHero.cta_primary_text || 'Xem bộ sưu tập'}
                </span>
                <ArrowRightOutlined style={{ fontSize: 10, flexShrink: 0 }} />
              </Link>
              {currentHero.cta_secondary_text && (
                <Link
                  to={currentHero.cta_secondary_url || '/custom-order'}
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    padding: '9px 6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 40,
                    textAlign: 'center'
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentHero.cta_secondary_text}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 1. HERO SECTION - TABLET (768px - 1024px, ẢNH 4:3) & DESKTOP (>1024px, ẢNH 16:9) */}
      {!isMobile && (
        <section
          style={{
            background: 'linear-gradient(135deg, #F5FAFC 0%, #FFFFFF 60%, #EAF6F9 100%)',
            padding: isTablet ? '40px 0 52px' : '56px 0 72px',
            borderBottom: '1px solid var(--color-border)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isTablet ? '1.1fr 0.9fr' : '1.1fr 1fr',
                gap: isTablet ? 24 : 40,
                alignItems: 'center'
              }}
            >
              {/* Left Content */}
              <div style={{ maxWidth: 580 }}>
                <div
                  className="badge badge-pastel"
                  style={{ marginBottom: 16, padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  {currentHero.badge || '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST'}
                </div>
                <h1
                  style={{
                    fontSize: isTablet ? '2rem' : 'clamp(2.2rem, 3.8vw, 3.2rem)',
                    color: 'var(--color-text)',
                    lineHeight: 1.25,
                    marginBottom: 18
                  }}
                >
                  {currentHero.title}
                </h1>
                <p
                  style={{
                    fontSize: isTablet ? '1rem' : '1.1rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 28,
                    lineHeight: 1.7
                  }}
                >
                  {currentHero.subtitle}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  <Link to={currentHero.cta_primary_url || '/flowers'} className="btn btn-primary" style={{ padding: '13px 30px' }}>
                    {currentHero.cta_primary_text || 'Xem bộ sưu tập hoa'} <ArrowRightOutlined />
                  </Link>
                  <Link to={currentHero.cta_secondary_url || '/custom-order'} className="btn btn-outline" style={{ padding: '13px 26px' }}>
                    {currentHero.cta_secondary_text || 'Cắm hoa theo yêu cầu'}
                  </Link>
                </div>

                {/* Quick Trust Badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                    marginTop: 32,
                    paddingTop: 20,
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '0.88rem',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CameraOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 18 }} />
                    <span>Ảnh thật gửi duyệt 100%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StarOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 18 }} />
                    <span>Hoa nhập mới mỗi ngày</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Imagery: Tablet (4:3) / Desktop (16:9) */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                    border: '6px solid var(--color-white)',
                    background: 'var(--color-white)',
                    aspectRatio: isTablet ? '4 / 3' : '16 / 9',
                    maxHeight: isTablet ? '380px' : '480px'
                  }}
                >
                  <ImageWithFallback
                    src={currentHero.hero_image}
                    alt={currentHero.title || 'Nghệ Florist'}
                    fallbackSrc={BOTANICAL_FALLBACKS[0]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. BỘ SƯU TẬP NỔI BẬT (COLLECTIONS - SPEC #4) - Ẩn trên mobile và tablet */}
      <section className="hide-mobile-tablet" style={{ padding: '40px 0 24px', background: 'var(--color-white)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <div className="badge badge-pastel" style={{ marginBottom: 6, fontSize: '0.75rem' }}>Trưng bày nghệ thuật</div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', margin: 0 }}>Bộ sưu tập nổi bật</h2>
            </div>
            <Link to="/flowers" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
              Xem tất cả →
            </Link>
          </div>

          {/* Grid 3:4 cards on desktop */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 16
            }}
          >
            {showroomCollections.map((col) => (
              <Link
                key={col.slug}
                to={`/category/${col.slug}`}
                className="category-album-card"
              >
                <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
                  <ImageWithFallback
                    src={col.image}
                    alt={col.title}
                    fallbackSrc={BOTANICAL_FALLBACKS[1]}
                    className="collection-card-img"
                  />
                </div>
                <div className="collection-blur-layer" />
                <div className="collection-gradient-layer" />
                <div className="collection-card-content">
                  <h3 className="collection-card-title">{col.title}</h3>
                  {col.desc && (
                    <p className="collection-card-desc">{col.desc}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MẪU HOA NỔI BẬT (2 CỘT MOBILE, 3-4 CỘT TABLET/DESKTOP - SPEC #6) */}
      <section style={{ padding: '36px 0 48px', background: 'var(--color-background-soft)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.85rem)', margin: 0, lineHeight: 1.25, whiteSpace: 'nowrap' }}>
                Mẫu hoa nổi bật
              </h2>
            </div>
            <Link
              to="/flowers"
              className="btn btn-outline btn-sm"
              style={{
                fontSize: '0.82rem',
                padding: '7px 14px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                borderRadius: 'var(--radius-full)'
              }}
            >
              <span>Xem tất cả</span> <ArrowRightOutlined style={{ fontSize: 11 }} />
            </Link>
          </div>

          {loading ? (
            <div className="product-grid-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-card" style={{ height: 280 }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 12 }}>
                    <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 18, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid-4">
              {featuredProducts.slice(0, 8).map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  imageUrl={product.featured_image || product.image_url}
                  categoryName={product.category_name}
                  tags={product.tags}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. BANNERS QUẢNG CÁO (HOMEPAGE CAMPAIGN BANNERS) - TỈ LỆ CHUẨN NGANG 5:4 */}
      {banners && banners.length > 0 && (
        <section style={{ padding: '36px 0 28px', background: 'var(--color-white)' }}>
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: banners.length === 1 
                  ? 'minmax(320px, 640px)' 
                  : 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 24,
                maxWidth: '1200px',
                margin: '0 auto'
              }}
            >
              {banners.map((b) => (
                <Link
                  key={b.id}
                  to={b.cta_url || '/flowers'}
                  className="homepage-campaign-banner"
                  style={{
                    position: 'relative',
                    aspectRatio: '5 / 4',
                    width: '100%',
                    borderRadius: 'var(--radius-lg, 16px)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    display: 'block',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 16px rgba(38, 56, 61, 0.08)',
                    transition: 'all 0.35s ease'
                  }}
                >
                  {/* Background Image */}
                  <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
                    <ImageWithFallback
                      src={b.image_url}
                      alt={b.title}
                      fallbackSrc={BOTANICAL_FALLBACKS[0]}
                      className="banner-bg-img"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.2, 0, 0.2, 1)'
                      }}
                    />
                  </div>

                  {/* Soft Brand Tone Gradient Overlay from bottom */}
                  <div
                    className="banner-gradient-overlay"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(16, 36, 41, 0.92) 0%, rgba(22, 48, 55, 0.72) 48%, rgba(93, 158, 175, 0.12) 78%, transparent 100%)',
                      transition: 'background 0.35s ease'
                    }}
                  />

                  {/* Content pinned to bottom of 3:4 frame */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 2,
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      gap: 8
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                        fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: 0,
                        lineHeight: 1.3,
                        textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)'
                      }}
                    >
                      {b.title}
                    </h3>
                    {b.subtitle && (
                      <p
                        style={{
                          fontSize: '0.84rem',
                          color: '#EAF6F9',
                          margin: 0,
                          lineHeight: 1.45,
                          opacity: 0.95,
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        {b.subtitle}
                      </p>
                    )}
                    <div style={{ marginTop: 4 }}>
                      <span
                        className="banner-cta-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#FFFFFF',
                          color: 'var(--color-text, #26383D)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          padding: '7px 16px',
                          borderRadius: 'var(--radius-full)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        <span>{b.cta_text || 'Khám phá ngay'}</span>
                        <ArrowRightOutlined style={{ fontSize: 11 }} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* 5. THEO NGÂN SÁCH - Ẩn trên mobile và tablet */}
      <section className="hide-mobile-tablet" style={{ padding: '36px 0', background: 'var(--color-background-soft)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ marginBottom: 16 }}>
            <div className="badge badge-pastel" style={{ marginBottom: 6, fontSize: '0.75rem' }}>Chọn nhanh mức giá</div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', margin: 0 }}>Khoảng giá phù hợp với bạn</h2>
          </div>

          {/* Mobile Horizontal Scroll Chip Bar (Spec #9) */}
          <div className="budget-chip-bar mobile-only-element">
            <button
              onClick={() => navigate('/flowers')}
              className="budget-chip"
            >
              ✦ Tất cả mức giá
            </button>
            {budgetTiers.map((tier, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (tier.min !== undefined) params.append('minPrice', tier.min.toString());
                  if (tier.max !== '') params.append('maxPrice', tier.max.toString());
                  navigate(`/flowers?${params.toString()}`);
                }}
                className="budget-chip"
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Desktop/Tablet Budget Cards */}
          <div
            className="desktop-only-action"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16
            }}
          >
            {budgetTiers.map((tier, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (tier.min !== undefined) params.append('minPrice', tier.min.toString());
                  if (tier.max !== '') params.append('maxPrice', tier.max.toString());
                  navigate(`/flowers?${params.toString()}`);
                }}
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 18px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                  {tier.label}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  {tier.sub}
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                  Xem mẫu hoa →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. THIẾT KẾ RIÊNG (SPEC #14) */}
      <section style={{ padding: '48px 0', background: 'var(--color-white)' }}>
        <div className="container">
          <div
            className="custom-design-banner"
            style={{
              background: 'linear-gradient(135deg, #EAF6F9 0%, #FFFFFF 100%)',
              border: '1.5px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(20px, 4vw, 44px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 24,
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            <div>
              <div className="badge badge-pastel" style={{ marginBottom: 10, fontSize: '0.74rem' }}>Dịch vụ độc quyền</div>
              <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', lineHeight: 1.35, marginBottom: 12, color: 'var(--color-text)', wordBreak: 'break-word' }}>
                {customDesign?.title || 'Cắm hoa theo yêu cầu & Ngân sách của riêng bạn'}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: 20 }}>
                {customDesign?.subtitle || 'Bạn có mẫu hoa ưng ý hoặc muốn kết hợp màu sắc phong thủy? Florist sẽ hiện thực hóa tác phẩm và gửi ảnh duyệt thành phẩm trước khi giao.'}
              </p>
              <Link
                to={customDesign?.cta_url || '/custom-order'}
                className="btn btn-primary"
                style={{
                  padding: '12px 26px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                {customDesign?.cta_text || 'Gửi yêu cầu cắm hoa ngay'} <ArrowRightOutlined />
              </Link>
            </div>

            <div style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              width: '100%',
              aspectRatio: '16 / 10',
              maxHeight: 280,
              background: '#fff'
            }}>
              <ImageWithFallback
                src={customDesign?.image_url}
                alt="Thiết kế hoa theo yêu cầu"
                fallbackSrc={BOTANICAL_FALLBACKS[2]}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. CÂU CHUYỆN NGHỆ & 5 CAM KẾT CHẤT LƯỢNG */}
      <Features />

      {/* 8. BOTTOM CTA SECTION */}
      <section style={{ padding: '54px 0', textAlign: 'center', background: 'var(--color-white)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 12 }}>Sẵn sàng chọn đóa hoa hoàn hảo?</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 24 }}>
            Đội ngũ Nghệ Florist luôn sẵn sàng tư vấn trực tiếp qua Zalo, gửi mẫu hoa thực tế và chăm chút từng bông hoa dành cho bạn.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/flowers" className="btn btn-primary" style={{ padding: '12px 32px' }}>
              Khám phá tất cả mẫu hoa
            </Link>
            <Link to="/custom-order" className="btn btn-outline" style={{ padding: '12px 24px' }}>
              Thiết kế hoa theo yêu cầu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

