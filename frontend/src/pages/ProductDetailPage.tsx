import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircleOutlined, 
  CameraOutlined, 
  SafetyCertificateOutlined,
  HeartOutlined,
  HeartFilled,
  ArrowLeftOutlined,
  MessageOutlined,
  GiftOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import ImageWithFallback, { getFallbackForId } from '../components/ImageWithFallback';
import { useCustomerRequest } from '../context/RequestContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import ProductCard from '../components/ProductCard';

interface ProductImage {
  id: number;
  url: string;
  alt_text: string;
  is_featured: number;
  sort_order: number;
}

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  price: number;
  currency: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  parent_category_name: string | null;
  images: ProductImage[];
  related: Array<{
    id: number;
    name: string;
    slug: string;
    price: number;
    currency: string;
    image_url: string;
  }>;
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { openRequestModal } = useCustomerRequest();
  const { zaloUrl1, zaloUrl2, hotline1, hotline2, ctaText1, ctaText2 } = useSiteSettings();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');

    fetch(`/api/products/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Không tìm thấy mẫu hoa này');
        return r.json();
      })
      .then((data: ProductDetail) => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          const featured = data.images.find(img => img.is_featured === 1);
          setSelectedImage(featured ? featured.url : data.images[0].url);
        } else {
          setSelectedImage(getFallbackForId(data.id));
        }

        // Check wishlist
        try {
          const saved = localStorage.getItem('nghe_wishlist');
          if (saved) {
            const list = JSON.parse(saved);
            setIsWishlisted(list.includes(data.id));
          }
        } catch {}
      })
      .catch(err => {
        setError(err.message || 'Lỗi tải thông tin mẫu hoa');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleWishlist = () => {
    if (!product) return;
    setIsWishlisted(prev => {
      const next = !prev;
      try {
        const saved = localStorage.getItem('nghe_wishlist');
        let list: number[] = saved ? JSON.parse(saved) : [];
        if (next) {
          list.push(product.id);
        } else {
          list = list.filter(item => item !== product.id);
        }
        localStorage.setItem('nghe_wishlist', JSON.stringify(list));
      } catch {}
      return next;
    });
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const activePrice = product ? Number(product.price) : 0;

  const handleSelectSample = () => {
    if (!product) return;
    openRequestModal({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: activePrice,
      imageUrl: selectedImage || getFallbackForId(product.id)
    }, 'PRODUCT_SELECTION');
  };

  const handleCustomDesign = () => {
    if (!product) return;
    openRequestModal({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: activePrice,
      imageUrl: selectedImage || getFallbackForId(product.id)
    }, 'CUSTOM_DESIGN');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: 'var(--color-text-secondary)' }}>Đang tải thông tin mẫu hoa...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Không tìm thấy mẫu hoa</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          Mẫu hoa này có thể đã được lưu trữ hoặc đường dẫn không chính xác.
        </p>
        <button onClick={() => navigate('/flowers')} className="btn btn-primary">
          Xem tất cả mẫu hoa
        </button>
      </div>
    );
  }

  return (
    <div className="page-product-detail" style={{ paddingBottom: 80, overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* BREADCRUMB (Desktop / Tablet) */}
      <div className="desktop-only-element" style={{ background: 'var(--color-background-soft)', borderBottom: '1px solid var(--color-border)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', color: 'var(--color-text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <Link to="/" style={{ color: 'inherit' }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/flowers" style={{ color: 'inherit' }}>Mẫu hoa</Link>
          <span>/</span>
          {product.category_name && (
            <>
              <Link to={`/category/${product.category_slug}`} style={{ color: 'inherit' }}>
                {product.category_name}
              </Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: 'var(--color-text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
        </div>
      </div>

      {/* Mobile Top Navigation Bar */}
      <div className="mobile-only-element" style={{ padding: '10px 14px', background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', boxSizing: 'border-box' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6, 
            background: 'var(--color-background-soft)', 
            border: '1px solid var(--color-border)', 
            borderRadius: 'var(--radius-full)', 
            padding: '6px 14px', 
            fontSize: '0.82rem', 
            fontWeight: 600,
            color: 'var(--color-text)',
            cursor: 'pointer' 
          }}
        >
          <ArrowLeftOutlined /> Quay lại
        </button>
        {product.category_name && (
          <Link 
            to={`/category/${product.category_slug}`}
            style={{ 
              fontSize: '0.78rem', 
              fontWeight: 600, 
              color: 'var(--color-primary-dark)', 
              background: 'var(--color-primary-light)', 
              padding: '4px 10px', 
              borderRadius: 'var(--radius-full)',
              textDecoration: 'none',
              maxWidth: 160,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {product.category_name}
          </Link>
        )}
      </div>

      <div className="container" style={{ marginTop: 20, width: '100%', boxSizing: 'border-box' }}>
        {/* Desktop / Tablet Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-soft btn-sm desktop-only-element"
          style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeftOutlined /> Quay lại danh sách
        </button>

        {/* MAIN PRODUCT DETAIL GRID */}
        <div className="product-detail-layout">
          {/* GALLERY */}
          <div className="product-detail-gallery">
            {/* Mobile Lookbook Swipe Gallery */}
            <div className="mobile-only-element" style={{ marginBottom: 18, width: '100%', boxSizing: 'border-box' }}>
              <div className="lookbook-gallery-mobile">
                {(product.images && product.images.length > 0 ? product.images : [{ id: product.id, url: selectedImage, alt_text: product.name, is_featured: 1, sort_order: 0 }]).map((img, i) => (
                  <div key={img.id || i} className="lookbook-slide" style={{ position: 'relative' }}>
                    <ImageWithFallback
                      src={img.url}
                      alt={img.alt_text || product.name}
                      fallbackSrc={getFallbackForId(product.id + i)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Floating Wishlist Button on Mobile */}
                    <button
                      onClick={toggleWishlist}
                      className="card-wishlist-btn"
                      style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, minHeight: 34, fontSize: 15 }}
                      aria-label={isWishlisted ? 'Bỏ lưu' : 'Lưu mẫu'}
                      title="Lưu mẫu hoa"
                    >
                      {isWishlisted ? <HeartFilled style={{ color: '#E11D48' }} /> : <HeartOutlined />}
                    </button>
                  </div>
                ))}
              </div>
              {product.images && product.images.length > 1 && (
                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: -6 }}>
                  Vuốt ngang để xem {product.images.length} góc chụp ảnh thực tế ➔
                </div>
              )}
            </div>

            {/* Desktop / Tablet Gallery */}
            <div className="desktop-only-element">
              {/* Main Featured Image */}
              <div 
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-white)',
                  aspectRatio: '4/5',
                  position: 'relative',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: 16
                }}
              >
                <ImageWithFallback
                  src={selectedImage}
                  alt={product.name}
                  fallbackSrc={getFallbackForId(product.id)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Wishlist Button */}
                <button
                  onClick={toggleWishlist}
                  className="card-wishlist-btn"
                  style={{ position: 'absolute', top: 16, right: 16 }}
                  aria-label={isWishlisted ? 'Bỏ lưu' : 'Lưu mẫu'}
                  title="Lưu mẫu hoa"
                >
                  {isWishlisted ? <HeartFilled style={{ color: '#E11D48' }} /> : <HeartOutlined />}
                </button>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                  {product.images.map((img, i) => (
                    <div
                      key={img.id || i}
                      onClick={() => setSelectedImage(img.url)}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: selectedImage === img.url ? '2px solid var(--color-primary-dark)' : '1px solid var(--color-border)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        opacity: selectedImage === img.url ? 1 : 0.7,
                        transition: 'all 0.2s'
                      }}
                    >
                      <ImageWithFallback
                        src={img.url}
                        alt={img.alt_text || product.name}
                        fallbackSrc={getFallbackForId(product.id + i)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INFORMATION & CONVERSION ACTIONS */}
          {/* INFORMATION & CONVERSION ACTIONS */}
          <div className="product-detail-info">
            {/* Category */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span className="badge badge-pastel">{product.category_name}</span>
            </div>

            {/* Product Title */}
            <h1 style={{ fontSize: 'clamp(1.35rem, 3.5vw, 2.2rem)', marginBottom: 12, color: 'var(--color-text)', lineHeight: 1.3, wordBreak: 'break-word' }}>
              {product.name}
            </h1>

            {/* Price Box with "Giá tham khảo" */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #F0F9FF 0%, #F8FAFC 100%)',
                border: '1px solid #BAE6FD',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: 18,
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: 0.6, color: '#0369A1', fontWeight: 700 }}>
                Giá tham khảo:
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary-dark)', lineHeight: 1.1 }}>
                  {formatVND(activePrice)}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>
                * Giá thực tế có thể thay đổi nhẹ tùy theo mùa hoa và yêu cầu tùy biến của quý khách.
              </div>
            </div>

            {/* Description */}
            <div 
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
                marginBottom: 18,
                paddingBottom: 16,
                borderBottom: '1px solid var(--color-border)',
                wordBreak: 'break-word',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {product.description || 'Mẫu hoa tươi tuyển chọn được thiết kế tinh tế bởi đội ngũ Florist chuyên nghiệp của Nghệ Florist. Từng cánh hoa được nâng niu tỉ mỉ để gửi gắm trọn vẹn thông điệp yêu thương của bạn.'}
            </div>

            {/* Florist Assurance Note */}
            <div 
              style={{ 
                marginBottom: 18, 
                fontSize: '0.82rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                color: '#166534', 
                background: '#F0FDF4', 
                padding: '10px 14px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid #BBF7D0', 
                lineHeight: 1.4,
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <CheckCircleOutlined style={{ fontSize: 16, flexShrink: 0 }} />
              <span><strong>Cam kết hoa tươi mới trong ngày</strong> • Chụp ảnh duyệt thực tế trước khi giao</span>
            </div>

            {/* Conversion CTA Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, width: '100%', boxSizing: 'border-box' }}>
              {/* Primary CTA: Chọn mẫu này & Điền thông tin đặt hoa */}
              <button
                type="button"
                className="btn btn-primary"
                style={{ 
                  width: '100%',
                  padding: '13px 18px',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(42, 117, 211, 0.28)',
                  borderRadius: 'var(--radius-full)',
                  boxSizing: 'border-box'
                }}
                onClick={handleSelectSample}
              >
                <MessageOutlined style={{ fontSize: 18 }} />
                <span>Đặt mẫu hoa này (Điền thông tin)</span>
              </button>

              {/* Direct 1-Click Zalo Consultation (NO FORM REQUIRED) */}
              <div 
                style={{
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: 14,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#0369A1', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ThunderboltOutlined style={{ color: '#0284C7' }} />
                  <span>HOẶC CHAT ZALO NGAY (KHÔNG CẦN ĐIỀN FORM):</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                  <a
                    href={zaloUrl1}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{
                      padding: '9px 10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      borderRadius: 'var(--radius-full)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>💬 Zalo 1 ({hotline1})</span>
                  </a>
                  <a
                    href={zaloUrl2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-soft btn-sm"
                    style={{
                      padding: '9px 10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      borderRadius: 'var(--radius-full)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>💬 Zalo 2 ({hotline2})</span>
                  </a>
                </div>
              </div>

              {/* Secondary Actions: Thiết kế riêng & Hotline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, width: '100%', boxSizing: 'border-box' }}>
                <button
                  type="button"
                  className="btn btn-soft"
                  style={{ 
                    padding: '10px 8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    borderRadius: 'var(--radius-full)',
                    minWidth: 0,
                    boxSizing: 'border-box'
                  }}
                  onClick={handleCustomDesign}
                >
                  <GiftOutlined />
                  <span>Thiết kế riêng</span>
                </button>

                <a
                  href={`tel:${hotline1.replace(/\s+/g, '')}`}
                  className="btn btn-outline"
                  style={{ 
                    padding: '10px 8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    borderRadius: 'var(--radius-full)',
                    minWidth: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <PhoneOutlined />
                  <span>Hotline: {hotline1}</span>
                </a>
              </div>
            </div>

            {/* Flower Care & Guarantees (4 cam kết dịch vụ) */}
            <div 
              style={{
                background: 'var(--color-background-soft)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                <GiftOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16, flexShrink: 0 }} />
                <div>Tặng kèm biển và thiệp thiết kế riêng theo yêu cầu.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                <CameraOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16, flexShrink: 0 }} />
                <div>Luôn gửi ảnh sản phẩm trước khi giao đến tay khách hàng.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                <SafetyCertificateOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16, flexShrink: 0 }} />
                <div>Có hoá đơn cho các doanh nghiệp.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                <ShoppingOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16, flexShrink: 0 }} />
                <div>Có túi đựng hoa tinh tế.</div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {product.related && product.related.length > 0 && (
          <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: 48, marginTop: 48 }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 20, textAlign: 'center' }}>
              Mẫu hoa cùng bộ sưu tập {product.category_name}
            </h3>
            <div className="product-grid-4">
              {product.related.map(rel => (
                <ProductCard
                  key={rel.id}
                  id={rel.id}
                  name={rel.name}
                  slug={rel.slug}
                  price={rel.price}
                  imageUrl={rel.image_url}
                  categoryName={product.category_name}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="mobile-sticky-cta-bar mobile-only-element">
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, marginRight: 'auto' }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
            Giá tham khảo
          </span>
          <span style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--color-primary-dark)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
            {formatVND(activePrice)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <a
            href={zaloUrl1}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-soft"
            style={{
              minHeight: 38,
              padding: '7px 10px',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none'
            }}
            title="Chat Zalo ngay không cần điền form"
          >
            <span>💬 Chat Zalo ({hotline1})</span>
          </a>
          <button
            type="button"
            className="btn btn-primary"
            style={{ 
              minHeight: 38, 
              padding: '7px 14px', 
              fontWeight: 700, 
              fontSize: '0.82rem', 
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onClick={handleSelectSample}
          >
            Đặt mẫu này
          </button>
        </div>
      </div>
    </div>
  );
}
