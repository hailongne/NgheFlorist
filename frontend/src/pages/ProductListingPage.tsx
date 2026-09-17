import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { 
  FilterOutlined, 
  CloseOutlined, 
  ReloadOutlined, 
  SearchOutlined,
  CheckOutlined,
  DownOutlined 
} from '@ant-design/icons';
import ProductCard from '../components/ProductCard';

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  image_url?: string;
  featured_image?: string;
  category_name: string;
  category_slug: string;
  tags: Array<{ id: number; name: string; slug: string }>;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  product_count: number;
  children?: CategoryItem[];
}

export default function ProductListingPage() {
  const { slug: routeCategorySlug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const categoryParam = routeCategorySlug || searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Component state
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Local state for price inputs
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  // Load filter metadata (categories)
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        setCategories(d.categories || []);
        if (d.tree) setCategoryTree(d.tree);
      })
      .catch(console.error);
  }, []);

  // Sync local price inputs when URL changes
  useEffect(() => {
    setLocalMinPrice(minPriceParam);
    setLocalMaxPrice(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // Fetch products whenever URL parameters change
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (categoryParam) query.set('category', categoryParam);
    if (searchParam) query.set('search', searchParam);
    if (minPriceParam) query.set('minPrice', minPriceParam);
    if (maxPriceParam) query.set('maxPrice', maxPriceParam);
    if (sortParam) query.set('sort', sortParam);
    query.set('page', String(pageParam));
    query.set('limit', '12');

    fetch(`/api/products?${query.toString()}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setProducts([]);
        setLoading(false);
      });

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryParam, searchParam, minPriceParam, maxPriceParam, sortParam, pageParam]);

  // Update URL helper
  const updateFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete('page'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const applyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMinPrice) next.set('minPrice', localMinPrice);
    else next.delete('minPrice');
    if (localMaxPrice) next.set('maxPrice', localMaxPrice);
    else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
  };

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalMinPrice('');
    setLocalMaxPrice('');
  };

  // Active category display name
  const currentCategoryName = useMemo(() => {
    if (!categoryParam) return 'Tất cả sản phẩm';
    const match = categories.find(c => c.slug === categoryParam || String(c.id) === categoryParam);
    return match ? match.name : 'Danh mục hoa';
  }, [categoryParam, categories]);

  const activeFilterCount = useMemo(() => {
    return [categoryParam, minPriceParam, maxPriceParam].filter(Boolean).length;
  }, [categoryParam, minPriceParam, maxPriceParam]);

  // Filter content component for both desktop sidebar and mobile drawer
  const renderFilterContent = (isMobileModal = false) => (
    <div className={`filter-sidebar ${isMobileModal ? 'mobile-modal-filter' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Bộ lọc tìm kiếm</h3>
        {(categoryParam || minPriceParam || maxPriceParam || searchParam) && (
          <button 
            onClick={resetAllFilters}
            style={{ fontSize: '0.82rem', color: 'var(--color-primary-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ReloadOutlined /> Xóa lọc
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div className="filter-group">
        <div className="filter-title">Danh mục hoa</div>
        <ul className="filter-list">
          <li>
            <div
              className={`filter-item-link ${!categoryParam ? 'active' : ''}`}
              onClick={() => updateFilter('category', null)}
              style={{ cursor: 'pointer', fontWeight: !categoryParam ? 700 : 500 }}
            >
              <span>📁 Tất cả mẫu hoa</span>
            </div>
          </li>
          {(categoryTree.length > 0 ? categoryTree : categories.filter(c => c.parent_id === null)).map(cat => (
            <li key={cat.id} style={{ marginBottom: 4 }}>
              <div
                className={`filter-item-link ${categoryParam === cat.slug ? 'active' : ''}`}
                onClick={() => updateFilter('category', cat.slug)}
                style={{ cursor: 'pointer', fontWeight: categoryParam === cat.slug ? 700 : 600 }}
              >
                <span>📂 {cat.name}</span>
                {cat.product_count > 0 && (
                  <span className="filter-count">{cat.product_count}</span>
                )}
              </div>

              {/* Subcategory budget ranges */}
              {cat.children && cat.children.length > 0 && (
                <ul style={{ listStyle: 'none', paddingLeft: 18, margin: '4px 0 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {cat.children.map(sub => (
                    <li key={sub.id}>
                      <div
                        className={`filter-item-link ${categoryParam === sub.slug ? 'active' : ''}`}
                        onClick={() => updateFilter('category', sub.slug)}
                        style={{ 
                          cursor: 'pointer', 
                          fontSize: '0.84rem', 
                          padding: '4px 8px',
                          color: categoryParam === sub.slug ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                          fontWeight: categoryParam === sub.slug ? 700 : 400
                        }}
                      >
                        <span>└ {sub.name}</span>
                        {sub.product_count > 0 && (
                          <span className="filter-count" style={{ fontSize: '0.75rem', padding: '1px 6px' }}>{sub.product_count}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Price Filter */}
      <div className="filter-group">
        <div className="filter-title">Khoảng giá (VNĐ)</div>
        <form onSubmit={applyPriceFilter}>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Từ..."
              value={localMinPrice}
              onChange={e => setLocalMinPrice(e.target.value)}
              className="price-input"
            />
            <span style={{ color: 'var(--color-text-secondary)' }}>-</span>
            <input
              type="number"
              placeholder="Đến..."
              value={localMaxPrice}
              onChange={e => setLocalMaxPrice(e.target.value)}
              className="price-input"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-soft btn-sm" 
            style={{ width: '100%', marginTop: 10, borderRadius: 'var(--radius-sm)' }}
          >
            Áp dụng giá
          </button>
        </form>

        {/* Quick Price Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          <button 
            type="button" 
            className={`badge ${maxPriceParam === '500000' && !minPriceParam ? 'badge-primary' : 'badge-pastel'}`}
            onClick={() => { setLocalMinPrice(''); setLocalMaxPrice('500000'); updateFilter('minPrice', null); updateFilter('maxPrice', '500000'); }}
            style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '0.78rem' }}
          >
            &lt; 500k
          </button>
          <button 
            type="button" 
            className={`badge ${minPriceParam === '500000' && maxPriceParam === '1000000' ? 'badge-primary' : 'badge-pastel'}`}
            onClick={() => { setLocalMinPrice('500000'); setLocalMaxPrice('1000000'); updateFilter('minPrice', '500000'); updateFilter('maxPrice', '1000000'); }}
            style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '0.78rem' }}
          >
            500k - 1tr
          </button>
          <button 
            type="button" 
            className={`badge ${minPriceParam === '1000000' && maxPriceParam === '2000000' ? 'badge-primary' : 'badge-pastel'}`}
            onClick={() => { setLocalMinPrice('1000000'); setLocalMaxPrice('2000000'); updateFilter('minPrice', '1000000'); updateFilter('maxPrice', '2000000'); }}
            style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '0.78rem' }}
          >
            1tr - 2tr
          </button>
          <button 
            type="button" 
            className={`badge ${minPriceParam === '2000000' && !maxPriceParam ? 'badge-primary' : 'badge-pastel'}`}
            onClick={() => { setLocalMinPrice('2000000'); setLocalMaxPrice(''); updateFilter('minPrice', '2000000'); updateFilter('maxPrice', null); }}
            style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '0.78rem' }}
          >
            &gt; 2tr
          </button>
        </div>
      </div>

      {/* 3. Custom Floral Design Box */}
      <div className="filter-group" style={{ background: 'var(--color-primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
          Bạn cần mẫu hoa riêng?
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
          Florist thiết kế theo ngân sách & tone màu bạn yêu cầu. Chụp ảnh hoa thực tế trước khi giao.
        </p>
        <Link to="/custom-order" className="btn btn-primary btn-sm" style={{ width: '100%', borderRadius: 'var(--radius-full)', textAlign: 'center', fontSize: '0.82rem' }}>
          Đặt thiết kế riêng
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          <Link to="/" style={{ color: 'var(--color-primary-dark)' }}>Trang chủ</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{currentCategoryName}</span>
        </div>

        {/* Active Search Info if any */}
        {searchParam && (
          <div style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-primary-light)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.88rem' }}>
            <span>Kết quả tìm kiếm cho: <strong>"{searchParam}"</strong></span>
            <button onClick={() => updateFilter('search', null)} style={{ padding: 2 }}><CloseOutlined /></button>
          </div>
        )}


        {/* Action Bar Container: Tách biệt giao diện Mobile và Desktop */}
        <div className="catalog-action-bar-container">
          {/* Mobile Filter & Sort Bar (Hiển thị <= 900px) */}
          <div className="mobile-filter-sort-bar">
            <div className="mobile-filter-buttons-row">
              <button
                type="button"
                className={`mobile-filter-chip-btn ${activeFilterCount > 0 ? 'active' : ''}`}
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <FilterOutlined />
                <span>Bộ lọc</span>
                {activeFilterCount > 0 ? (
                  <span className="mobile-active-filter-badge">{activeFilterCount}</span>
                ) : (
                  <span className="mobile-filter-count-dim">(0)</span>
                )}
              </button>

              <div className="mobile-sort-chip-wrap">
                <span className="mobile-sort-label">Sắp xếp:</span>
                <select
                  className="mobile-sort-select"
                  value={sortParam}
                  onChange={e => updateFilter('sort', e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="best-seller">Bán chạy nhất</option>
                </select>
                <DownOutlined className="mobile-sort-arrow" />
              </div>
            </div>

            <div className="mobile-filter-info-row">
              <span className="mobile-product-count">
                Hiện có <strong>{totalCount}</strong> tác phẩm hoa
              </span>
              {(categoryParam || minPriceParam || maxPriceParam || searchParam) && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mobile-clear-filters-btn"
                >
                  <ReloadOutlined /> Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* Desktop Action Bar (Hiển thị > 900px) */}
          <div className="desktop-catalog-action-bar">
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              Hiện có <strong>{totalCount}</strong> tác phẩm hoa
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>Sắp xếp:</span>
              <select
                value={sortParam}
                onChange={e => updateFilter('sort', e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-white)',
                  fontFamily: 'inherit',
                  fontSize: '0.86rem',
                  color: 'var(--color-text)',
                  outline: 'none',
                  cursor: 'pointer',
                  minHeight: 38
                }}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="best-seller">Bán chạy nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Responsive layout */}
        <div className="product-listing-layout">
          {/* Desktop Sidebar Filter */}
          <aside className="desktop-sidebar-filter" style={{ position: 'sticky', top: 100 }}>
            {renderFilterContent()}
          </aside>

          {/* Product Grid Area */}
          <main style={{ minWidth: 0, width: '100%' }}>
            {loading ? (
              <div className="product-grid-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="product-card" style={{ height: 380 }}>
                    <div className="skeleton" style={{ height: 240 }} />
                    <div style={{ padding: 16 }}>
                      <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 10 }} />
                      <div className="skeleton" style={{ height: 22, width: '80%', marginBottom: 16 }} />
                      <div className="skeleton" style={{ height: 24, width: '50%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="product-grid-4">
                  {products.map(p => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      slug={p.slug}
                      price={p.price}
                      imageUrl={p.featured_image || p.image_url}
                      categoryName={p.category_name}
                      categorySlug={p.category_slug}
                      tags={p.tags}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={pageParam <= 1}
                      onClick={() => updateFilter('page', String(pageParam - 1))}
                      style={{ opacity: pageParam <= 1 ? 0.4 : 1, minHeight: 40 }}
                    >
                      ← Trang trước
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const p = i + 1;
                      if (p === 1 || p === totalPages || (p >= pageParam - 2 && p <= pageParam + 2)) {
                        return (
                          <button
                            key={p}
                            onClick={() => updateFilter('page', String(p))}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 'var(--radius-sm)',
                              border: p === pageParam ? 'none' : '1px solid var(--color-border)',
                              background: p === pageParam ? 'var(--color-primary-dark)' : 'var(--color-white)',
                              color: p === pageParam ? 'var(--color-white)' : 'var(--color-text)',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === pageParam - 3 || p === pageParam + 3) {
                        return <span key={p} style={{ padding: '6px 4px' }}>...</span>;
                      }
                      return null;
                    })}
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={pageParam >= totalPages}
                      onClick={() => updateFilter('page', String(pageParam + 1))}
                      style={{ opacity: pageParam >= totalPages ? 0.4 : 1, minHeight: 40 }}
                    >
                      Trang sau →
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div 
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: 'var(--color-background-soft)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ fontSize: 44, color: 'var(--color-primary)', marginBottom: 16 }}>✿</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Không tìm thấy mẫu hoa phù hợp</h3>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: 460, margin: '0 auto 20px', fontSize: '0.9rem' }}>
                  Bạn có thể thử chọn mức giá khác hoặc gửi yêu cầu cắm hoa riêng theo mẫu bạn yêu thích.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={resetAllFilters} className="btn btn-outline">
                    Xóa tất cả bộ lọc
                  </button>
                  <Link to="/custom-order" className="btn btn-primary">
                    Cắm hoa theo mẫu riêng
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {isMobileFilterOpen && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="bottom-sheet-content" style={{ maxHeight: '85vh' }}>
            <div style={{ padding: '12px 20px 8px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ width: 40, height: 4, background: 'var(--color-border)', borderRadius: 2, margin: '0 auto 10px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Bộ lọc sản phẩm</h3>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)} 
                  style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: '50%', 
                    background: 'var(--color-background-soft)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <CloseOutlined />
                </button>
              </div>
            </div>
            <div style={{ padding: '16px 20px 24px', overflowY: 'auto', flexGrow: 1 }}>
              {renderFilterContent(true)}
            </div>
            <div style={{ padding: '14px 20px calc(14px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--color-border)', background: 'var(--color-white)', display: 'flex', gap: 10 }}>
              {(categoryParam || minPriceParam || maxPriceParam || searchParam) && (
                <button
                  onClick={() => { resetAllFilters(); setIsMobileFilterOpen(false); }}
                  className="btn btn-outline"
                  style={{ flex: 1, minHeight: 46 }}
                >
                  Đặt lại
                </button>
              )}
              <button
                className="btn btn-primary"
                style={{ flex: 2, minHeight: 46, fontWeight: 700 }}
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Xem {totalCount} mẫu hoa
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
