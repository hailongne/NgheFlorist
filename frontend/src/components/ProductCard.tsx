import React from 'react';
import { Link } from 'react-router-dom';
import { HeartOutlined, HeartFilled, MessageOutlined } from '@ant-design/icons';
import ImageWithFallback, { getFallbackForId } from './ImageWithFallback';
import { useCustomerRequest } from '../context/RequestContext';
import { useWishlist } from '../context/WishlistContext';

export interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  categoryName?: string;
  categorySlug?: string;
  tags?: Array<{ id: number; name: string; slug: string }>;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  imageUrl,
  categoryName,
  tags = []
}: ProductCardProps) {
  const { openRequestModal } = useCustomerRequest();
  const { isWishlisted: checkWishlisted, toggleWishlist } = useWishlist();
  const isWishlisted = checkWishlisted(id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  const handleSelectSample = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openRequestModal({
      id,
      name,
      slug,
      price,
      imageUrl: imageUrl || getFallbackForId(id)
    }, 'PRODUCT_SELECTION');
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const isBestSeller = tags.some(t => t.slug === 'best-seller');

  return (
    <div className="product-card">
      <Link to={`/product/${slug}`} className="product-card-img-wrap">
        <ImageWithFallback
          src={imageUrl}
          alt={name}
          fallbackSrc={getFallbackForId(id)}
        />

        {/* Badges */}
        {isBestSeller && (
          <div className="card-badges">
            <span className="badge badge-gold card-badge-item">Yêu thích</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? 'Bỏ lưu' : 'Lưu mẫu'}
          title="Lưu mẫu hoa"
        >
          {isWishlisted ? <HeartFilled /> : <HeartOutlined />}
        </button>
      </Link>

      <div className="product-card-body">
        {categoryName && (
          <div className="product-card-category">{categoryName}</div>
        )}

        <Link to={`/product/${slug}`} className="product-card-title" title={name}>
          {name}
        </Link>

        <div className="product-card-bottom">
          <div className="product-card-price-wrap">
            <div className="product-card-price-label">
              Giá tham khảo
            </div>
            <div className="product-card-price">
              {formatVND(price)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSelectSample}
            className="product-card-select-btn"
            title="Chọn mẫu hoa này để được tư vấn"
            aria-label="Chọn mẫu hoa này để được tư vấn"
          >
            <MessageOutlined className="product-card-select-icon" />
            <span className="product-card-select-text">Chọn mẫu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
