import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartFilled, 
  HeartOutlined, 
  ArrowRightOutlined, 
  ShoppingOutlined,
  LockOutlined,
  UserOutlined
} from '@ant-design/icons';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export default function FavoritesPage() {
  const { wishlist, isLoggedIn, setShowIosAlert } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (wishlist.length > 0) {
      setLoading(true);
      fetch(`/api/products?ids=${wishlist.join(',')}&limit=60`)
        .then(r => r.json())
        .then(data => {
          if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
          } else {
            setProducts([]);
          }
        })
        .catch(err => {
          console.warn('Error fetching favorite products:', err);
          setProducts([]);
        })
        .finally(() => setLoading(false));
    } else {
      setProducts([]);
    }
  }, [wishlist]);

  return (
    <div style={{ backgroundColor: '#F8FAFB', minHeight: '85vh', padding: '36px 16px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb / Navigation path */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', color: '#64748B' }}>
          <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <span style={{ color: '#1E293B', fontWeight: 600 }}>Bộ sưu tập yêu thích</span>
        </div>

        {/* Hero Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: '28px 32px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          marginBottom: 28,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #FF453A 0%, #FF2D55 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 8px 20px rgba(255, 45, 85, 0.28)'
            }}>
              <HeartFilled />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: 0, letterSpacing: -0.3 }}>
                  Album Mẫu Hoa Yêu Thích
                </h1>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: '#FFF1F2',
                  color: '#E11D48',
                  padding: '3px 12px',
                  borderRadius: 20,
                  border: '1px solid #FFE4E6'
                }}>
                  {wishlist.length} MẪU ĐÃ LƯU
                </span>
              </div>
              <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: '0.9rem' }}>
                Bộ sưu tập các mẫu hoa bạn đã thả tim để dễ dàng so sánh, tham khảo và yêu cầu cắm theo mẫu.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/flowers"
              className="btn btn-outline"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '10px 20px',
                fontSize: '0.88rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <ShoppingOutlined /> Khám phá thêm hoa
            </Link>

            {isLoggedIn ? (
              <Link
                to="/profile"
                className="btn btn-soft"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <UserOutlined /> Hồ sơ cá nhân
              </Link>
            ) : (
              <button
                onClick={() => setShowIosAlert(true)}
                className="btn btn-primary"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 20px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <LockOutlined /> Đăng nhập để đồng bộ
              </button>
            )}
          </div>
        </div>

        {/* Not Logged In Warning Banner if guest visits */}
        {!isLoggedIn && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 14,
            padding: '14px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#991B1B', fontSize: '0.9rem', fontWeight: 500 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <span>
                Bạn đang xem ở chế độ khách. <strong>Đăng nhập tài khoản</strong> để lưu trữ vĩnh viễn và đồng bộ album yêu thích trên mọi thiết bị.
              </span>
            </div>
            <button
              onClick={() => setShowIosAlert(true)}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 20,
                padding: '6px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)'
              }}
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🌸</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B' }}>Đang tải album bộ sưu tập hoa yêu thích...</div>
          </div>
        ) : wishlist.length === 0 || products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            border: '1px dashed #CBD5E1'
          }}>
            <div style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              backgroundColor: '#FFF1F2',
              color: '#FDA4AF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              marginBottom: 18,
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.1)'
            }}>
              <HeartOutlined />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>
              Album yêu thích của bạn đang trống
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.92rem', maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Hãy nhấn biểu tượng <strong>thả tim</strong> trên góc các mẫu hoa khi duyệt website để lưu vào bộ sưu tập này và đặt tư vấn nhanh chóng nhé!
            </p>
            <Link
              to="/flowers"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.95rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(38, 56, 61, 0.25)'
              }}
            >
              <span>Khám phá bộ sưu tập hoa ngay</span>
              <ArrowRightOutlined />
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 24
          }}>
            {products.map(prod => (
              <ProductCard
                key={prod.id}
                id={prod.id}
                name={prod.name}
                slug={prod.slug}
                price={Number(prod.price)}
                imageUrl={prod.image_url}
                categoryName={prod.category_name}
                tags={prod.tags || []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
