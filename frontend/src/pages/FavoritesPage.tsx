import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartFilled, 
  HeartOutlined, 
  ArrowRightOutlined, 
  ShoppingOutlined,
  LockOutlined,
  UserOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  FilterOutlined,
  TagOutlined,
  CheckOutlined
} from '@ant-design/icons';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export default function FavoritesPage() {
  const { wishlist, isLoggedIn, setShowIosAlert } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Tab State: 'all' | 'album'
  const [activeTab, setActiveTab] = useState<'all' | 'album'>('all');
  
  // Album filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (wishlist.length > 0) {
      setLoading(true);
      fetch(`/api/products?ids=${wishlist.join(',')}&limit=100`)
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

  // Group products hierarchically: Category -> Price Range -> Products
  const albumGroups = useMemo(() => {
    const map = new Map<string, {
      categoryName: string;
      count: number;
      priceGroups: Map<string, any[]>;
    }>();

    products.forEach(p => {
      // Main Category: parent category name if exists, else category name, else fallback
      const mainCat = p.parent_category_name || p.category_name || 'Hoa tươi thiết kế';

      // Price Range: subcategory name if present and looks like a price range, or calculate bucket
      let priceRange = '';
      if (p.parent_category_name && p.category_name) {
        priceRange = p.category_name;
      } else {
        const price = Number(p.price) || 0;
        if (price < 350000) priceRange = 'Dưới 350.000₫';
        else if (price <= 500000) priceRange = '350.000₫ - 500.000₫';
        else if (price <= 1000000) priceRange = '500.000₫ - 1.000.000₫';
        else if (price <= 2000000) priceRange = '1.000.000₫ - 2.000.000₫';
        else priceRange = 'Trên 2.000.000₫';
      }

      if (!map.has(mainCat)) {
        map.set(mainCat, {
          categoryName: mainCat,
          count: 0,
          priceGroups: new Map()
        });
      }

      const catObj = map.get(mainCat)!;
      catObj.count += 1;

      if (!catObj.priceGroups.has(priceRange)) {
        catObj.priceGroups.set(priceRange, []);
      }
      catObj.priceGroups.get(priceRange)!.push(p);
    });

    return Array.from(map.values()).map(c => ({
      categoryName: c.categoryName,
      count: c.count,
      priceGroups: Array.from(c.priceGroups.entries()).map(([rangeName, items]) => ({
        rangeName,
        count: items.length,
        items
      }))
    }));
  }, [products]);

  // Get list of all main categories
  const categoriesList = useMemo(() => {
    return albumGroups.map(g => ({
      name: g.categoryName,
      count: g.count
    }));
  }, [albumGroups]);

  // Get price ranges for the currently selected category
  const availablePriceRanges = useMemo(() => {
    if (selectedCategory === 'all') {
      const rangesMap = new Map<string, number>();
      albumGroups.forEach(g => {
        g.priceGroups.forEach(pg => {
          rangesMap.set(pg.rangeName, (rangesMap.get(pg.rangeName) || 0) + pg.count);
        });
      });
      return Array.from(rangesMap.entries()).map(([rangeName, count]) => ({
        rangeName,
        count
      }));
    } else {
      const targetGroup = albumGroups.find(g => g.categoryName === selectedCategory);
      if (!targetGroup) return [];
      return targetGroup.priceGroups.map(pg => ({
        rangeName: pg.rangeName,
        count: pg.count
      }));
    }
  }, [albumGroups, selectedCategory]);

  // Filtered groups for Album tab
  const filteredAlbumGroups = useMemo(() => {
    return albumGroups
      .filter(g => selectedCategory === 'all' || g.categoryName === selectedCategory)
      .map(g => {
        const filteredPriceGroups = g.priceGroups.filter(
          pg => selectedPriceRange === 'all' || pg.rangeName === selectedPriceRange
        );
        return {
          ...g,
          priceGroups: filteredPriceGroups,
          totalFilteredCount: filteredPriceGroups.reduce((acc, pg) => acc + pg.count, 0)
        };
      })
      .filter(g => g.priceGroups.length > 0);
  }, [albumGroups, selectedCategory, selectedPriceRange]);

  return (
    <div style={{ backgroundColor: '#F8FAFB', minHeight: '85vh' }}>
      <div className="favorites-container">
        {/* Breadcrumb / Navigation path */}
        <div style={{ 
          marginBottom: 16, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          fontSize: '0.84rem', 
          color: '#64748B',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <span style={{ color: '#1E293B', fontWeight: 600 }}>Bộ sưu tập yêu thích</span>
        </div>

        {/* Hero Header Card - Compact & Mobile Adaptive */}
        <div className="favorites-header-card">
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
            {/* Header Title & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #FF453A 0%, #FF2D55 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
                boxShadow: '0 6px 16px rgba(255, 45, 85, 0.28)'
              }}>
                <HeartFilled />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h1 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 800, 
                    color: '#1E293B', 
                    margin: 0, 
                    letterSpacing: -0.3,
                    lineHeight: 1.2
                  }}>
                    Album Hoa Yêu Thích
                  </h1>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    backgroundColor: '#FFF1F2',
                    color: '#E11D48',
                    padding: '2px 10px',
                    borderRadius: 20,
                    border: '1px solid #FFE4E6'
                  }}>
                    {wishlist.length} MẪU
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.84rem', lineHeight: 1.4 }}>
                  Lưu trữ các mẫu hoa bạn đã thả tim để tiện so sánh & đặt tư vấn nhanh.
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Link
                to="/flowers"
                className="btn btn-outline btn-sm"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <ShoppingOutlined /> Thêm hoa
              </Link>

              {isLoggedIn ? (
                <Link
                  to="/profile"
                  className="btn btn-soft btn-sm"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <UserOutlined /> Hồ sơ
                </Link>
              ) : (
                <button
                  onClick={() => setShowIosAlert(true)}
                  className="btn btn-primary btn-sm"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer'
                  }}
                >
                  <LockOutlined /> Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Not Logged In Warning Banner if guest visits */}
        {!isLoggedIn && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#991B1B', fontSize: '0.84rem', fontWeight: 500 }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <span>
                <strong>Đăng nhập tài khoản</strong> để lưu vĩnh viễn và đồng bộ album hoa trên mọi thiết bị.
              </span>
            </div>
            <button
              onClick={() => setShowIosAlert(true)}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 20,
                padding: '5px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* ==========================================================================
            TAB SWITCHER: "Tất cả ({N})" vs "📁 Album phân loại ({N})"
            ========================================================================== */}
        {wishlist.length > 0 && products.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: 10,
            gap: 12,
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'inline-flex',
              background: '#E2E8F0',
              padding: '3px',
              borderRadius: 12,
              gap: 4
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 9,
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'all' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'all' ? '#1E293B' : '#64748B',
                  boxShadow: activeTab === 'all' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <AppstoreOutlined />
                <span>Tất cả ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('album')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 9,
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'album' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'album' ? '#E11D48' : '#64748B',
                  boxShadow: activeTab === 'album' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <FolderOpenOutlined />
                <span>Album phân loại ({albumGroups.length})</span>
              </button>
            </div>

            {/* Quick summary status */}
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
              {activeTab === 'all' ? (
                <span>Đang xem tất cả {products.length} mẫu hoa đã lưu</span>
              ) : (
                <span>Phân loại theo danh mục & khoảng ngân sách</span>
              )}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '70px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌸</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E293B' }}>
              Đang tải album bộ sưu tập hoa yêu thích...
            </div>
          </div>
        ) : wishlist.length === 0 || products.length === 0 ? (
          /* Empty State */
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px dashed #CBD5E1'
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#FFF1F2',
              color: '#FDA4AF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              marginBottom: 16,
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.1)'
            }}>
              <HeartOutlined />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
              Album yêu thích của bạn đang trống
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.86rem', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.5 }}>
              Hãy nhấn biểu tượng <strong>thả tim</strong> trên các mẫu hoa khi duyệt website để lưu vào album và so sánh nhé!
            </p>
            <Link
              to="/flowers"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.9rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>Khám phá bộ sưu tập hoa ngay</span>
              <ArrowRightOutlined />
            </Link>
          </div>
        ) : activeTab === 'all' ? (
          /* TAB 1: ALL FAVORITE PRODUCTS GRID */
          <div className="favorites-product-grid">
            {products.map(prod => (
              <ProductCard
                key={prod.id}
                id={prod.id}
                name={prod.name}
                slug={prod.slug}
                price={Number(prod.price)}
                imageUrl={prod.image_url}
                categoryName={prod.parent_category_name ? `${prod.parent_category_name} • ${prod.category_name}` : prod.category_name}
                tags={prod.tags || []}
              />
            ))}
          </div>
        ) : (
          /* TAB 2: ALBUM CATEGORIZED VIEW (Bó hoa -> Khoảng giá -> Mẫu hoa) */
          <div>
            {/* Filter Bar 1: Main Category Pills */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FolderOpenOutlined style={{ color: '#E11D48' }} /> Danh mục lớn:
              </div>
              <div style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 6,
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedPriceRange('all');
                  }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 20,
                    border: selectedCategory === 'all' ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                    backgroundColor: selectedCategory === 'all' ? '#FFF1F2' : '#FFFFFF',
                    color: selectedCategory === 'all' ? '#E11D48' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: selectedCategory === 'all' ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>Tất cả danh mục</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({products.length})</span>
                </button>

                {categoriesList.map(cat => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setSelectedPriceRange('all');
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 20,
                      border: selectedCategory === cat.name ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                      backgroundColor: selectedCategory === cat.name ? '#FFF1F2' : '#FFFFFF',
                      color: selectedCategory === cat.name ? '#E11D48' : '#334155',
                      fontSize: '0.82rem',
                      fontWeight: selectedCategory === cat.name ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span>{cat.name}</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Bar 2: Price Range Pills */}
            {availablePriceRanges.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TagOutlined style={{ color: '#0284C7' }} /> Khoảng giá:
                </div>
                <div style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 6,
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  <button
                    type="button"
                    onClick={() => setSelectedPriceRange('all')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      border: selectedPriceRange === 'all' ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                      backgroundColor: selectedPriceRange === 'all' ? '#F0F9FF' : '#FFFFFF',
                      color: selectedPriceRange === 'all' ? '#0284C7' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: selectedPriceRange === 'all' ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Tất cả mức giá
                  </button>

                  {availablePriceRanges.map(pr => (
                    <button
                      key={pr.rangeName}
                      type="button"
                      onClick={() => setSelectedPriceRange(pr.rangeName)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        border: selectedPriceRange === pr.rangeName ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                        backgroundColor: selectedPriceRange === pr.rangeName ? '#F0F9FF' : '#FFFFFF',
                        color: selectedPriceRange === pr.rangeName ? '#0284C7' : '#475569',
                        fontSize: '0.8rem',
                        fontWeight: selectedPriceRange === pr.rangeName ? 700 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span>{pr.rangeName}</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({pr.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hierarchical Grouped Product Listings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {filteredAlbumGroups.map(group => (
                <div 
                  key={group.categoryName}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    padding: '20px 16px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  {/* Category Section Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1.5px solid #F1F5F9',
                    paddingBottom: 12,
                    marginBottom: 16,
                    flexWrap: 'wrap',
                    gap: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: '#FFF1F2',
                        color: '#E11D48',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16
                      }}>
                        <FolderOpenOutlined />
                      </div>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {group.categoryName}
                      </h2>
                    </div>

                    <span style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#475569',
                      padding: '3px 10px',
                      borderRadius: 20
                    }}>
                      {group.totalFilteredCount} mẫu hoa đã lưu
                    </span>
                  </div>

                  {/* Price Ranges Sub-Sections */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {group.priceGroups.map(pg => (
                      <div key={pg.rangeName}>
                        {/* Price Range Sub-Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 12,
                          backgroundColor: '#F8FAFC',
                          padding: '6px 12px',
                          borderRadius: 8,
                          borderLeft: '3px solid #0284C7'
                        }}>
                          <TagOutlined style={{ color: '#0284C7', fontSize: 13 }} />
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                            {pg.rangeName}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            ({pg.count} mẫu)
                          </span>
                        </div>

                        {/* Product Grid in this Price Range (2 columns on mobile, 4 columns on desktop) */}
                        <div className="favorites-product-grid">
                          {pg.items.map((prod: any) => (
                            <ProductCard
                              key={prod.id}
                              id={prod.id}
                              name={prod.name}
                              slug={prod.slug}
                              price={Number(prod.price)}
                              imageUrl={prod.image_url}
                              categoryName={prod.parent_category_name ? `${prod.parent_category_name} • ${prod.category_name}` : prod.category_name}
                              tags={prod.tags || []}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredAlbumGroups.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px dashed #CBD5E1',
                  color: '#64748B'
                }}>
                  Không có mẫu hoa nào trong khoảng giá hoặc danh mục đã chọn.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
