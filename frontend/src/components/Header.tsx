import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  SearchOutlined, 
  ShoppingOutlined, 
  MenuOutlined, 
  CloseOutlined, 
  CompassOutlined,
  AppstoreOutlined,
  GiftOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  UpOutlined,
  ArrowLeftOutlined,
  CrownOutlined,
  DashboardOutlined,
  PhoneOutlined,
  FacebookOutlined,
  InstagramOutlined,
  RightOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import { useCustomerRequest } from '../context/RequestContext';
import { useAdminAuth } from '../admin/AdminAuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useWishlist } from '../context/WishlistContext';
import ImageWithFallback, { getFallbackForId } from './ImageWithFallback';
import { RealSocialIcon } from './RealSocialIcons';

interface HeaderContactWidget {
  id: number;
  platform_type: 'zalo' | 'facebook' | 'instagram' | 'phone' | string;
  title: string;
  subtitle?: string | null;
  action_link: string;
  sort_order: number;
  is_active: number | boolean;
}

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  category_name: string;
}

interface MenuItem {
  id: number;
  label: string;
  url: string;
  icon?: string | null;
  sort_order: number;
}

export default function Header() {
  const { openRequestModal } = useCustomerRequest();
  const { wishlistCount, isLoggedIn: isWishlistLoggedIn, setShowIosAlert } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customerUser, setCustomerUser] = useState<{ id: number; username: string; email: string; full_name?: string } | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showZaloDropdown, setShowZaloDropdown] = useState(false);
  const [contactWidgets, setContactWidgets] = useState<HeaderContactWidget[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryDropdown = (catKey: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedCategories(prev => ({
      ...prev,
      [catKey]: !prev[catKey]
    }));
  };

  // Admin Auth context & local fallback
  const { user: adminUser, isAuthenticated: isAdminAuthenticated, logout: adminLogout } = useAdminAuth();
  const localAdminSaved = localStorage.getItem('nghe_admin_user');
  const localAdminToken = localStorage.getItem('nghe_admin_token');
  let isLocalAdmin = false;
  let activeAdminUser = adminUser;
  if (localAdminToken && localAdminSaved) {
    try {
      const p = JSON.parse(localAdminSaved);
      if (p.role_name === 'admin' && p.email === 'admin@ngheflorist.vn' && p.id === 1) {
        isLocalAdmin = true;
        if (!activeAdminUser) activeAdminUser = p;
      }
    } catch {}
  }
  const isEffectiveAdmin = Boolean(isAdminAuthenticated && adminUser?.role_name === 'admin') || isLocalAdmin;

  const { zaloUrl1, zaloUrl2, hotline1, hotline2, ctaText1, ctaText2 } = useSiteSettings();

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const zaloDropdownRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMobileSearchOpen) {
      const timer = setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isMobileSearchOpen]);

  useEffect(() => {
    const syncCustomer = () => {
      const saved = localStorage.getItem('nghe_customer_user');
      if (saved) {
        try {
          setCustomerUser(JSON.parse(saved));
        } catch {
          setCustomerUser(null);
        }
      } else {
        setCustomerUser(null);
      }
    };
    syncCustomer();
    window.addEventListener('storage', syncCustomer);
    return () => window.removeEventListener('storage', syncCustomer);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (zaloDropdownRef.current && !zaloDropdownRef.current.contains(e.target as Node)) {
        setShowZaloDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomerLogout = () => {
    localStorage.removeItem('nghe_customer_token');
    localStorage.removeItem('nghe_customer_user');
    setCustomerUser(null);
    setShowUserDropdown(false);
    navigate('/');
  };

  const handleAdminLogout = () => {
    adminLogout();
    localStorage.removeItem('nghe_admin_token');
    localStorage.removeItem('nghe_admin_user');
    localStorage.removeItem('nghe_customer_token');
    localStorage.removeItem('nghe_customer_user');
    setCustomerUser(null);
    setShowUserDropdown(false);
    navigate('/');
  };

  // Fetch dynamic menu
  useEffect(() => {
    fetch('/api/content/menu')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems(data);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch dynamic contact widgets from admin
  useEffect(() => {
    fetch('/api/contact-widgets')
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setContactWidgets(data);
        }
      })
      .catch(err => console.warn('Header contact widgets fetch fallback:', err));
  }, []);

  // Fetch dynamic categories tree for sidebar
  useEffect(() => {
    fetch('/api/categories')
      .then(r => (r.ok ? r.json() : {}))
      .then(data => {
        if (data.tree && Array.isArray(data.tree) && data.tree.length > 0) {
          setCategoryTree(data.tree);
        }
      })
      .catch(err => console.warn('Header categories fetch fallback:', err));
  }, []);

  // Auto expand active category dropdown in mobile drawer
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawCat = params.get('category') || (location.pathname.startsWith('/category/') ? location.pathname.replace('/category/', '') : '');
    const decodedCat = decodeURIComponent(rawCat).trim().toLowerCase();
    
    if (decodedCat && categoryTree.length > 0) {
      categoryTree.forEach((cat: any) => {
        const catKey = String(cat.slug || cat.id);
        const sSlug = String(cat.slug || '').toLowerCase();
        const sId = String(cat.id || '').toLowerCase();
        const sName = String(cat.name || '').toLowerCase();

        const isParent = sSlug === decodedCat || sId === decodedCat || sName === decodedCat;
        const isChild = cat.children?.some((sub: any) => {
          const subSlug = String(sub.slug || '').toLowerCase();
          const subId = String(sub.id || '').toLowerCase();
          const subName = String(sub.name || '').toLowerCase();
          return subSlug === decodedCat || subId === decodedCat || subName === decodedCat;
        });

        if (isParent || isChild) {
          setExpandedCategories(prev => ({ ...prev, [catKey]: true }));
        }
      });
    }
  }, [location.pathname, location.search, categoryTree]);

  const activeContactWidgets = React.useMemo(() => {
    return contactWidgets
      .filter(w => Boolean(w.is_active))
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  }, [contactWidgets]);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(searchTerm.trim())}&limit=5`)
        .then(r => r.json())
        .then(data => {
          setSearchResults(data.products || []);
          setIsSearching(false);
        })
        .catch(() => {
          setSearchResults([]);
          setIsSearching(false);
        });
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSearchDropdown(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setShowSearchDropdown(false);
    navigate(`/flowers?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const selectSearchResult = (slug: string) => {
    setShowSearchDropdown(false);
    setSearchTerm('');
    navigate(`/product/${slug}`);
  };

  const defaultMenuItems = [
    { id: 1, label: 'Trang chủ', url: '/', sort_order: 1 },
    { id: 2, label: 'Bộ sưu tập hoa', url: '/flowers', sort_order: 2 },
    { id: 3, label: 'Thiết kế riêng', url: '/custom-order', sort_order: 3 },
    { id: 4, label: 'Về Nghệ Florist', url: '/about', sort_order: 4 },
    { id: 5, label: 'Chính sách', url: '/policy', sort_order: 5 }
  ];

  const displayMenu = menuItems.length > 0 ? menuItems : defaultMenuItems;
  const displayCategoryTree = categoryTree;

  // Danh mục hoa hiển thị trong Accordion trên Mobile Drawer, hỗ trợ icon tùy chỉnh từ CMS (chuẩn tối giản 2 màu)
  const flowerCollectionLinks = React.useMemo(() => {
    const fromMenu = menuItems.filter(m => 
      m.url.includes('/category/') || m.url === '/flowers' || m.url.includes('/flowers')
    );

    if (fromMenu.length > 0) {
      return fromMenu.map(m => {
        let icon = m.icon;
        if (!icon) {
          const lower = (m.label + ' ' + m.url).toLowerCase();
          if (lower.includes('bo-hoa') || lower.includes('bó hoa')) icon = '⚘';
          else if (lower.includes('gio-hoa') || lower.includes('giỏ hoa')) icon = '❀';
          else if (lower.includes('ke-hoa') || lower.includes('kệ hoa')) icon = '◈';
          else if (lower.includes('lan-ho-diep') || lower.includes('lan hồ điệp')) icon = '🪷';
          else if (lower.includes('hoa-cuoi') || lower.includes('hoa cưới')) icon = '♡';
          else if (lower.includes('flowers') || lower.includes('tất cả')) icon = '✦';
          else icon = '❀';
        }
        // Chuẩn hóa icon tối giản, loại bỏ hoàn toàn emoji màu hoạt hình
        if (icon === '💐' || icon === '🌹' || icon === '🌷') icon = '⚘';
        else if (icon === '🧺') icon = '❀';
        else if (icon === '🏵️' || icon === '🏵') icon = '◈';
        else if (icon === '🪴') icon = '🪷';
        else if (icon === '🎀' || icon === '👰' || icon === '💍') icon = '♡';
        else if (icon === '🌸') icon = '❀';
        else if (icon === '🔍') icon = '◎';
        return { ...m, icon };
      });
    }

    // Danh sách mặc định chuẩn biểu tượng tối giản
    return [
      { id: 'def-1', label: 'Tất cả mẫu hoa', url: '/flowers', icon: '✦' },
      { id: 'def-2', label: 'Bó hoa tươi', url: '/category/bo-hoa', icon: '⚘' },
      { id: 'def-3', label: 'Giỏ hoa', url: '/category/gio-hoa', icon: '❀' },
      { id: 'def-4', label: 'Kệ hoa sự kiện', url: '/category/ke-hoa', icon: '◈' },
      { id: 'def-5', label: 'Lan hồ điệp', url: '/category/lan-ho-diep', icon: '🪷' },
      { id: 'def-6', label: 'Hoa cưới thiết kế', url: '/category/hoa-cuoi', icon: '♡' }
    ];
  }, [menuItems]);

  return (
    <>
      {/* Mobile & Tablet Dedicated Search Overlay */}
      {isMobileSearchOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--color-white)',
            zIndex: 2200,
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Top Search Input Bar */}
          <div style={{
            height: 64,
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 10,
            background: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setShowSearchDropdown(false);
              }}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-background-soft)',
                border: 'none',
                borderRadius: '50%',
                fontSize: 18,
                color: 'var(--color-text)',
                cursor: 'pointer',
                flexShrink: 0
              }}
              aria-label="Đóng tìm kiếm"
            >
              <ArrowLeftOutlined />
            </button>

            <form 
              onSubmit={(e) => {
                handleSearchSubmit(e);
                setIsMobileSearchOpen(false);
              }}
              style={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}
            >
              <SearchOutlined style={{
                position: 'absolute',
                left: 14,
                color: 'var(--color-primary-dark)',
                fontSize: 16,
                pointerEvents: 'none'
              }} />
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="Tìm hoa tươi, lan hồ điệp, bó hoa..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setShowSearchDropdown(true);
                }}
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 38px 0 40px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--color-primary-dark)',
                  background: 'var(--color-background-soft)',
                  fontSize: '0.94rem',
                  outline: 'none',
                  color: 'var(--color-text)'
                }}
                aria-label="Tìm kiếm mẫu hoa"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    mobileSearchInputRef.current?.focus();
                  }}
                  style={{
                    position: 'absolute',
                    right: 10,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#CBD5E1',
                    border: 'none',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 11
                  }}
                  aria-label="Xóa từ khóa"
                >
                  <CloseOutlined />
                </button>
              )}
            </form>
          </div>

          {/* Search Content & Results Body */}
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px 16px' }}>
            {isSearching ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
                <div style={{ marginBottom: 10, fontSize: 24 }}>🌸</div>
                Đang tìm các tác phẩm hoa phù hợp...
              </div>
            ) : searchResults.length > 0 && searchTerm.trim() ? (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  Tác phẩm gợi ý ({searchResults.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        selectSearchResult(p.slug);
                        setIsMobileSearchOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        background: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-background-soft)' }}>
                        <ImageWithFallback
                          src={p.image_url}
                          alt={p.name}
                          fallbackSrc={getFallbackForId(p.id)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                          {p.category_name}
                        </div>
                        <div style={{ fontSize: '0.86rem', color: 'var(--color-primary-dark)', fontWeight: 700, marginTop: 2 }}>
                          {formatVND(p.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <button
                    onClick={(e) => {
                      handleSearchSubmit(e);
                      setIsMobileSearchOpen(false);
                    }}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}
                  >
                    Xem tất cả kết quả cho "{searchTerm}" →
                  </button>
                </div>
              </div>
            ) : searchTerm.trim() ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
                  Không tìm thấy tác phẩm hoa nào
                </div>
                <div style={{ fontSize: '0.88rem', maxWidth: 320, margin: '0 auto 20px' }}>
                  Không có mẫu hoa nào khớp với từ khóa "{searchTerm}". Vui lòng thử tìm với từ khóa khác hoặc xem các gợi ý bên dưới.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {['Hoa hồng', 'Hoa khai trương', 'Lan hồ điệp', 'Hoa sinh nhật'].map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTerm(tag);
                        navigate(`/flowers?search=${encodeURIComponent(tag)}`);
                        setIsMobileSearchOpen(false);
                      }}
                      className="budget-chip"
                      style={{ fontSize: '0.84rem', padding: '6px 14px' }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Popular Keywords */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                    Tìm kiếm phổ biến
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      '⚘ Bó hoa tươi',
                      '❀ Giỏ hoa khai trương',
                      '🪷 Lan hồ điệp cao cấp',
                      '✦ Hoa thiết kế riêng',
                      '◈ Kệ hoa sự kiện',
                      '♡ Hoa cưới cầm tay'
                    ].map((tag, idx) => {
                      const cleanKeyword = tag.replace(/^[^\w\s\u00C0-\u1EF9]+/, '').trim();
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchTerm(cleanKeyword);
                            navigate(`/flowers?search=${encodeURIComponent(cleanKeyword)}`);
                            setIsMobileSearchOpen(false);
                          }}
                          className="budget-chip"
                          style={{
                            fontSize: '0.84rem',
                            padding: '7px 14px',
                            background: 'var(--color-background-soft)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Category Jump */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                    Bộ sưu tập hoa nổi bật
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {[
                      { name: 'Lan Hồ Điệp', slug: 'lan-ho-diep', emoji: '🪷' },
                      { name: 'Bó Hoa Tươi', slug: 'bo-hoa', emoji: '⚘' },
                      { name: 'Giỏ Hoa Sang Trọng', slug: 'gio-hoa', emoji: '❀' },
                      { name: 'Hoa Cưới & Sự Kiện', slug: 'hoa-cuoi', emoji: '♡' },
                    ].map(cat => (
                      <div
                        key={cat.slug}
                        onClick={() => {
                          navigate(`/flowers?category=${cat.slug}`);
                          setIsMobileSearchOpen(false);
                        }}
                        style={{
                          padding: '12px 14px',
                          background: 'var(--color-background-soft)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          color: 'var(--color-text)'
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="site-header">
        <div className="container header-inner" style={{ position: 'relative' }}>
          {/* Left: Mobile Toggle (on mobile) or Brand Logo (on desktop) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Mở menu điều hướng"
              style={{ width: 44, height: 44 }}
            >
              <MenuOutlined style={{ fontSize: 20 }} />
            </button>

            {/* Desktop Brand Logo */}
            <Link to="/" className="site-logo desktop-only-action" title="Nghệ Florist - Tiệm hoa & quả nhập khẩu">
              <img 
                src="/images/logoNgheFlorist-brand-blue.png?v=2" 
                alt="Nghệ Florist" 
                className="site-logo-img"
              />
            </Link>
          </div>

          {/* Center on Mobile: Brand Logo Centered */}
          <Link 
            to="/" 
            className="site-logo mobile-only-element" 
            title="Nghệ Florist"
            style={{ 
              position: 'absolute', 
              left: '50%', 
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img 
              src="/images/logoNgheFlorist-brand-blue.png?v=2" 
              alt="Nghệ Florist" 
              style={{ height: 38, width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Center on Desktop/Tablet: Prominent Search Bar */}
          <div className="header-search-extended desktop-only-action" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Tìm hoa tươi, lan hồ điệp, bó hoa, giỏ hoa khai trương..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                aria-label="Tìm kiếm sản phẩm hoa"
              />
              <button type="submit" className="search-icon-btn" aria-label="Nút tìm kiếm">
                <SearchOutlined />
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {showSearchDropdown && searchTerm.trim() && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 12,
                  zIndex: 150,
                  maxHeight: 380,
                  overflowY: 'auto'
                }}
              >
                {isSearching ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
                    Đang tìm kiếm...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-light)', padding: '4px 8px 8px' }}>
                      Gợi ý sản phẩm ({searchResults.length})
                    </div>
                    {searchResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => selectSearchResult(p.slug)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                          <ImageWithFallback
                            src={p.image_url}
                            alt={p.name}
                            fallbackSrc={getFallbackForId(p.id)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                            {p.category_name} • <span style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>{formatVND(p.price)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 8, paddingTop: 8, textAlign: 'center' }}>
                      <button
                        onClick={handleSearchSubmit}
                        style={{ fontSize: '0.85rem', color: 'var(--color-primary-dark)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Xem tất cả kết quả cho "{searchTerm}" →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Không tìm thấy hoa phù hợp với "{searchTerm}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Mobile Search Button (on Mobile) */}
          <button
            className="mobile-search-btn"
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Mở tìm kiếm"
            title="Tìm kiếm mẫu hoa"
          >
            <SearchOutlined />
          </button>

          {/* Right: Mobile Wishlist Button (on Mobile) */}
          <Link
            to={isWishlistLoggedIn ? "/favorites" : "#"}
            onClick={(e) => {
              if (!isWishlistLoggedIn) {
                e.preventDefault();
                setShowIosAlert(true);
              }
            }}
            className="mobile-search-btn"
            style={{
              position: 'relative',
              color: wishlistCount > 0 ? '#E11D48' : 'inherit',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Bộ sưu tập yêu thích"
            title="Bộ sưu tập hoa yêu thích"
          >
            {wishlistCount > 0 ? <HeartFilled style={{ color: '#E11D48' }} /> : <HeartOutlined />}
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#E11D48',
                border: '1.5px solid #FFFFFF'
              }} />
            )}
          </Link>

          {/* Right: Conversion Actions & Auth (on Desktop/Tablet) */}
          <div className="header-actions desktop-only-action" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Floral Custom Order CTA */}
            <button
              onClick={() => openRequestModal(null, 'CUSTOM_DESIGN')}
              className="btn btn-soft btn-sm"
              style={{ 
                borderRadius: 'var(--radius-full)', 
                padding: '8px 18px',
                fontSize: '0.86rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap'
              }}
              title="Thiết kế hoa theo yêu cầu"
            >
              <GiftOutlined /> Thiết kế riêng
            </button>

            {/* Direct 1-Click Consultation Dropdown (Lấy theo Admin Contact Widgets) */}
            <div ref={zaloDropdownRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowZaloDropdown(!showZaloDropdown)}
                className="btn btn-primary btn-sm"
                style={{ 
                  borderRadius: 'var(--radius-full)', 
                  padding: '8px 18px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  boxShadow: '0 3px 12px rgba(42, 117, 211, 0.28)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
                title="Tư vấn nhanh trực tiếp (Không cần điền form)"
              >
                <MessageOutlined /> Tư vấn Zalo
              </button>

              {showZaloDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 320,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    boxShadow: '0 12px 36px rgba(15, 23, 42, 0.18), 0 2px 10px rgba(0, 104, 255, 0.12)',
                    border: '1px solid #E2E8F0',
                    padding: 16,
                    zIndex: 1000,
                    animation: 'fadeIn 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      TƯ VẤN NHANH TRỰC TIẾP
                    </div>
                    {activeContactWidgets.length > 0 && (
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                        {activeContactWidgets.length} kênh hỗ trợ
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 600, marginBottom: 12 }}>
                    ● 1 chạm kết nối ngay (Không cần điền form)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                    {activeContactWidgets.length > 0 ? (
                      activeContactWidgets.map((w, idx) => {
                        const isZalo = w.platform_type === 'zalo';
                        const isPhone = w.platform_type === 'phone';
                        const isFb = w.platform_type === 'facebook';
                        const isInsta = w.platform_type === 'instagram';
                        
                        const bg = isZalo 
                          ? (idx % 2 === 0 ? '#0068FF' : '#0284C7')
                          : isPhone ? '#10B981'
                          : isFb ? '#0084FF'
                          : isInsta ? 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
                          : '#0F172A';

                        return (
                          <a
                            key={w.id}
                            href={w.action_link}
                            target={isPhone ? '_self' : '_blank'}
                            rel="noopener noreferrer"
                            onClick={() => setShowZaloDropdown(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              background: bg,
                              color: '#FFFFFF',
                              borderRadius: 12,
                              padding: '10px 14px',
                              textDecoration: 'none',
                              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                              transition: 'transform 0.15s ease'
                            }}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <RealSocialIcon platform={w.platform_type} size={32} />
                            </div>
                            <div style={{ flexGrow: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {w.title}
                              </div>
                              {w.subtitle && (
                                <div style={{ fontSize: '0.72rem', opacity: 0.92, fontWeight: 400, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {w.subtitle}
                                </div>
                              )}
                            </div>
                          </a>
                        );
                      })
                    ) : (
                      <>
                        <a
                          href={zaloUrl1}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowZaloDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            backgroundColor: '#0068FF',
                            color: '#FFFFFF',
                            borderRadius: 10,
                            padding: '10px 12px',
                            textDecoration: 'none',
                            fontSize: '0.86rem',
                            fontWeight: 700
                          }}
                        >
                          <MessageOutlined style={{ fontSize: 16 }} />
                          <div>
                            <div>Zalo 1: {hotline1}</div>
                            <div style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 400 }}>{ctaText1 || 'Báo giá & chọn mẫu nhanh'}</div>
                          </div>
                        </a>

                        <a
                          href={zaloUrl2}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowZaloDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            backgroundColor: '#0284C7',
                            color: '#FFFFFF',
                            borderRadius: 10,
                            padding: '10px 12px',
                            textDecoration: 'none',
                            fontSize: '0.86rem',
                            fontWeight: 700
                          }}
                        >
                          <MessageOutlined style={{ fontSize: 16 }} />
                          <div>
                            <div>Zalo 2: {hotline2}</div>
                            <div style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 400 }}>{ctaText2 || 'Sự kiện & thiết kế riêng'}</div>
                          </div>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Wishlist / Album Yêu thích Icon Button */}
            <Link
              to={isWishlistLoggedIn ? "/favorites" : "#"}
              onClick={(e) => {
                if (!isWishlistLoggedIn) {
                  e.preventDefault();
                  setShowIosAlert(true);
                }
              }}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: wishlistCount > 0 ? '#FFF1F2' : '#F1F5F9',
                border: wishlistCount > 0 ? '1px solid #FECDD3' : '1px solid #E2E8F0',
                color: wishlistCount > 0 ? '#E11D48' : '#475569',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: wishlistCount > 0 ? '0 2px 8px rgba(225, 29, 72, 0.15)' : 'none'
              }}
              title={wishlistCount > 0 ? `Xem ${wishlistCount} mẫu hoa yêu thích` : 'Bộ sưu tập hoa yêu thích'}
            >
              {wishlistCount > 0 ? (
                <HeartFilled style={{ fontSize: 18, color: '#E11D48' }} />
              ) : (
                <HeartOutlined style={{ fontSize: 18 }} />
              )}
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#E11D48',
                    color: '#FFFFFF',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Admin or Customer Auth Button (Far Right) */}
            {isEffectiveAdmin && activeAdminUser ? (
              <div ref={userDropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '5px 14px 5px 7px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #1B3F48 0%, #152E35 100%)',
                    color: '#FFFFFF',
                    border: '1.5px solid #E29B42',
                    boxShadow: '0 2px 10px rgba(226, 155, 66, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                  title="Tài khoản Quản trị viên Nghệ Florist"
                >
                  <span style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(226, 155, 66, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FDBA74',
                    fontSize: '0.85rem'
                  }}>
                    <CrownOutlined />
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeAdminUser.full_name || 'Admin'}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      backgroundColor: '#E29B42',
                      color: '#FFF',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      letterSpacing: '0.5px'
                    }}>
                      ADMIN
                    </span>
                  </span>
                  <DownOutlined style={{ fontSize: '0.62rem', color: '#FDBA74', opacity: 0.85, transition: 'transform 0.2s', transform: showUserDropdown ? 'rotate(180deg)' : 'none' }} />
                </button>

                {showUserDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                      minWidth: 230,
                      width: 'max-content',
                      maxWidth: 290,
                      padding: '6px 0',
                      zIndex: 200,
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748B', borderBottom: '1px solid #F1F5F9', background: '#FFFDF9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          ★ QUẢN TRỊ VIÊN HỆ THỐNG
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeAdminUser.full_name || activeAdminUser.username}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 1 }}>
                        {activeAdminUser.email}
                      </div>
                    </div>

                    <Link
                      to="/admin/requests"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#B45309',
                        textDecoration: 'none',
                        backgroundColor: '#FFFBEB',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s'
                      }}
                    >
                      <MessageOutlined style={{ color: '#D97706', fontSize: '1rem' }} />
                      <span>Yêu cầu khách hàng</span>
                    </Link>

                    <Link
                      to="/admin/products"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: '#1E293B',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s'
                      }}
                    >
                      <ShoppingOutlined style={{ color: '#5D9EAF', fontSize: '0.95rem' }} />
                      <span>Quản lý sản phẩm</span>
                    </Link>

                    <Link
                      to="/favorites"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#E11D48',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        backgroundColor: '#FFF5F5',
                        transition: 'background 0.15s'
                      }}
                    >
                      <HeartFilled style={{ color: '#E11D48', fontSize: '0.95rem' }} />
                      <span>Sản phẩm yêu thích {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
                    </Link>

                    <div style={{ height: 1, backgroundColor: '#F1F5F9', margin: '4px 0' }} />

                    <button
                      onClick={handleAdminLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s'
                      }}
                    >
                      <LogoutOutlined style={{ fontSize: '0.95rem' }} />
                      <span>Đăng xuất Admin</span>
                    </button>
                  </div>
                )}
              </div>
            ) : customerUser ? (
              <div ref={userDropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '5px 14px 5px 7px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #1B3F48 0%, #29535E 100%)',
                    color: '#FFFFFF',
                    border: '1px solid #366572',
                    boxShadow: '0 2px 8px rgba(27, 63, 72, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                  title="Tài khoản cá nhân"
                >
                  <span style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#B9DCE8',
                    fontSize: '0.82rem'
                  }}>
                    <UserOutlined />
                  </span>
                  <span style={{ maxWidth: 115, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {customerUser.full_name || customerUser.username}
                  </span>
                  <DownOutlined style={{ fontSize: '0.62rem', color: '#B9DCE8', opacity: 0.85, transition: 'transform 0.2s', transform: showUserDropdown ? 'rotate(180deg)' : 'none' }} />
                </button>

                {showUserDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                      minWidth: 220,
                      width: 'max-content',
                      maxWidth: 280,
                      padding: '6px 0',
                      zIndex: 200,
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ padding: '10px 16px', fontSize: '0.8rem', color: '#64748B', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                      <div style={{ fontSize: '0.74rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đang đăng nhập</div>
                      <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.86rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {customerUser.full_name || customerUser.username}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: '#1E293B',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s'
                      }}
                    >
                      <UserOutlined style={{ color: '#5D9EAF', fontSize: '0.95rem' }} />
                      <span>Hồ sơ thông tin</span>
                    </Link>

                    <Link
                      to="/profile?tab=favorites"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#E11D48',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        backgroundColor: '#FFF5F5',
                        transition: 'background 0.15s'
                      }}
                    >
                      <HeartFilled style={{ color: '#E11D48', fontSize: '0.95rem' }} />
                      <span>Sản phẩm yêu thích {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
                    </Link>
                    <div style={{ height: 1, backgroundColor: '#F1F5F9', margin: '4px 0' }} />
                    <button
                      onClick={handleCustomerLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s'
                      }}
                    >
                      <LogoutOutlined style={{ fontSize: '0.95rem' }} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '5px 16px 5px 8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #1B3F48 0%, #29535E 100%)',
                  color: '#FFFFFF',
                  border: '1px solid #366572',
                  boxShadow: '0 2px 8px rgba(27, 63, 72, 0.2)',
                  transition: 'all 0.2s ease'
                }}
                title="Đăng nhập hoặc đăng ký tài khoản"
              >
                <span style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#B9DCE8',
                  fontSize: '0.82rem'
                }}>
                  <UserOutlined />
                </span>
                <span>Đăng nhập / Đăng ký</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer - Clean Showroom Hierarchy */}
      {isMobileMenuOpen && (
          <>
            <div 
              className="mobile-backdrop"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="mobile-drawer">
              {/* Drawer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <img 
                  src="/images/logoNgheFlorist-brand-blue.png?v=2" 
                  alt="Nghệ Florist" 
                  style={{ height: 38, width: 'auto', objectFit: 'contain' }}
                />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', fontSize: 20, color: 'var(--color-text)', cursor: 'pointer' }}
                  aria-label="Đóng menu"
                >
                  <CloseOutlined />
                </button>
              </div>

              {/* Drawer Navigation: Danh mục hoa (Ảnh 2) */}
              <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 14px', flexGrow: 1, overflowY: 'auto' }}>
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700, 
                  color: '#1E293B', 
                  marginBottom: 14,
                  letterSpacing: -0.2
                }}>
                  Danh mục hoa
                </div>

                {(() => {
                  const isFlowersRoute = location.pathname === '/flowers';
                  const drawerSearchParams = new URLSearchParams(location.search);
                  const currentCatQuery = drawerSearchParams.get('category') || 
                    (location.pathname.startsWith('/category/') ? location.pathname.replace('/category/', '') : '');
                  const decodedCatQuery = decodeURIComponent(currentCatQuery).trim().toLowerCase();
                  const currentSearchQuery = drawerSearchParams.get('search');
                  const isAllFlowersActive = isFlowersRoute && !currentCatQuery && !currentSearchQuery;

                  return (
                    <>
                      {/* Tất cả mẫu hoa */}
                      <Link
                        to="/flowers"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: isAllFlowersActive ? '#E0F2FE' : 'transparent',
                          color: isAllFlowersActive ? '#0369A1' : '#1E293B',
                          fontWeight: isAllFlowersActive ? 700 : 600,
                          fontSize: '0.95rem',
                          textDecoration: 'none',
                          marginBottom: 14,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>📁</span>
                        <span>Tất cả mẫu hoa</span>
                      </Link>

                      {/* Category Tree 2 tầng với hiệu ứng dropdown menu */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {displayCategoryTree.map((cat: any) => {
                          const catKey = String(cat.slug || cat.id);
                          const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
                          const isCatExpanded = Boolean(expandedCategories[catKey]);

                          const sCatSlug = String(cat.slug || '').toLowerCase();
                          const sCatId = String(cat.id || '').toLowerCase();
                          const sCatName = String(cat.name || '').toLowerCase();

                          const isParentActive = (isFlowersRoute || location.pathname.startsWith('/category/')) && (
                            Boolean(currentCatQuery) && (
                              currentCatQuery === String(cat.slug) ||
                              currentCatQuery === String(cat.id) ||
                              decodedCatQuery === sCatSlug ||
                              decodedCatQuery === sCatId ||
                              decodedCatQuery === sCatName
                            )
                          );

                          return (
                            <div key={cat.id || cat.slug} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {/* Parent Category Header Row */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderRadius: 8,
                                background: isParentActive ? '#E0F2FE' : 'transparent',
                                transition: 'background 0.15s ease'
                              }}>
                                <Link
                                  to={`/flowers?category=${cat.slug || cat.id}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    textDecoration: 'none',
                                    color: isParentActive ? '#0284C7' : '#1E293B',
                                    fontWeight: isParentActive ? 700 : 600,
                                    fontSize: '0.98rem',
                                    transition: 'color 0.15s ease'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>📁</span>
                                    <span>{cat.name}</span>
                                  </div>
                                  {cat.product_count > 0 && (
                                    <span style={{
                                      background: isParentActive ? '#BAE6FD' : '#F1F5F9',
                                      color: isParentActive ? '#0369A1' : '#64748B',
                                      borderRadius: 12,
                                      padding: '2px 8px',
                                      fontSize: '0.78rem',
                                      fontWeight: 600,
                                      marginRight: hasChildren ? 4 : 0
                                    }}>
                                      {cat.product_count}
                                    </span>
                                  )}
                                </Link>

                                {hasChildren && (
                                  <button
                                    type="button"
                                    onClick={(e) => toggleCategoryDropdown(catKey, e)}
                                    aria-label={isCatExpanded ? `Thu gọn ${cat.name}` : `Mở rộng ${cat.name}`}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 28,
                                      height: 28,
                                      padding: 0,
                                      border: 'none',
                                      background: 'none',
                                      color: isCatExpanded ? '#0284C7' : '#94A3B8',
                                      cursor: 'pointer',
                                      transition: 'color 0.15s ease',
                                      marginRight: 4
                                    }}
                                  >
                                    <DownOutlined style={{
                                      fontSize: '0.68rem',
                                      transform: isCatExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }} />
                                  </button>
                                )}
                              </div>

                              {/* Subcategories (Price Ranges or sub-items) với hiệu ứng dropdown accordion */}
                              {hasChildren && (
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateRows: isCatExpanded ? '1fr' : '0fr',
                                    transition: 'grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
                                    opacity: isCatExpanded ? 1 : 0
                                  }}
                                >
                                  <div style={{ minHeight: 0, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 14, paddingTop: 4, paddingBottom: 6 }}>
                                      {cat.children.map((sub: any) => {
                                        const sSubSlug = String(sub.slug || '').toLowerCase();
                                        const sSubId = String(sub.id || '').toLowerCase();
                                        const sSubName = String(sub.name || '').toLowerCase();

                                        const isSubActive = (isFlowersRoute || location.pathname.startsWith('/category/')) && (
                                          Boolean(currentCatQuery) && (
                                            currentCatQuery === String(sub.slug) ||
                                            currentCatQuery === String(sub.id) ||
                                            decodedCatQuery === sSubSlug ||
                                            decodedCatQuery === sSubId ||
                                            decodedCatQuery === sSubName
                                          )
                                        );

                                        return (
                                          <Link
                                            key={sub.id || sub.slug}
                                            to={`/flowers?category=${sub.slug || sub.id}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              padding: '6px 10px',
                                              borderRadius: 6,
                                              textDecoration: 'none',
                                              background: isSubActive ? '#E0F2FE' : 'transparent',
                                              color: isSubActive ? '#0284C7' : '#475569',
                                              fontSize: '0.9rem',
                                              fontWeight: isSubActive ? 700 : 500,
                                              transition: 'all 0.15s ease'
                                            }}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                              <span style={{ 
                                                color: isSubActive ? '#0284C7' : '#94A3B8', 
                                                fontWeight: isSubActive ? 700 : 600,
                                                fontSize: '0.95rem'
                                              }}>↳</span>
                                              <span>{sub.name}</span>
                                            </div>
                                            {sub.product_count > 0 && (
                                              <span style={{
                                                background: isSubActive ? '#BAE6FD' : '#F1F5F9',
                                                color: isSubActive ? '#0369A1' : '#64748B',
                                                borderRadius: 10,
                                                padding: '1px 8px',
                                                fontSize: '0.78rem',
                                                fontWeight: 600
                                              }}>
                                                {sub.product_count}
                                              </span>
                                            )}
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}

                {/* Primary CTA Buttons in Drawer: Thiết kế riêng & 2 Zalo 1-click */}
                <div style={{ marginTop: 20, padding: '0 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openRequestModal(null, 'CUSTOM_DESIGN');
                    }}
                    className="btn btn-soft"
                    style={{ 
                      width: '100%', 
                      padding: '12px 14px', 
                      borderRadius: 'var(--radius-full)', 
                      fontWeight: 700, 
                      fontSize: '0.88rem',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 8
                    }}
                  >
                    <GiftOutlined /> Đặt cắm hoa thiết kế riêng
                  </button>

                  <Link
                    to={isWishlistLoggedIn ? "/favorites" : "#"}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      if (!isWishlistLoggedIn) {
                        e.preventDefault();
                        setShowIosAlert(true);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      backgroundColor: wishlistCount > 0 ? '#FFF1F2' : '#F8FAFC',
                      color: wishlistCount > 0 ? '#E11D48' : '#334155',
                      border: wishlistCount > 0 ? '1px solid #FECDD3' : '1px solid #E2E8F0',
                      textDecoration: 'none'
                    }}
                  >
                    <HeartFilled style={{ color: '#E11D48' }} />
                    <span>Bộ sưu tập hoa yêu thích {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
                  </Link>

                  <div style={{ 
                    fontSize: '0.65rem', 
                    color: '#059669', 
                    fontWeight: 600, 
                    textAlign: 'center', 
                    marginTop: 3,
                    letterSpacing: -0.1,
                    lineHeight: 1.3
                  }}>
                    ● 1 chạm kết nối tư vấn ngay (Không cần điền form)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {activeContactWidgets.length > 0 ? (
                      activeContactWidgets.map((w, idx) => {
                        const isZalo = w.platform_type === 'zalo';
                        const isPhone = w.platform_type === 'phone';
                        const isFb = w.platform_type === 'facebook';
                        const isInsta = w.platform_type === 'instagram';
                        
                        const badgeBg = isZalo ? '#EBF5FF' : isPhone ? '#ECFDF5' : isFb ? '#EEF2FF' : isInsta ? '#FFF1F2' : '#F1F5F9';
                        const badgeColor = isZalo ? '#0068FF' : isPhone ? '#059669' : isFb ? '#1877F2' : isInsta ? '#E1306C' : '#334155';

                        return (
                          <a
                            key={w.id}
                            href={w.action_link}
                            target={isPhone ? '_self' : '_blank'}
                            rel="noopener noreferrer"
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 9,
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              color: '#1E293B',
                              borderRadius: 10,
                              padding: '8px 10px',
                              textDecoration: 'none',
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: 7,
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {isZalo ? `Z${idx + 1}` : isPhone ? <PhoneOutlined /> : isFb ? <FacebookOutlined /> : isInsta ? <InstagramOutlined /> : <MessageOutlined />}
                            </div>
                            <div style={{ flexGrow: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {w.title}
                              </div>
                              {w.subtitle && (
                                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 400, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {w.subtitle}
                                </div>
                              )}
                            </div>
                            <RightOutlined style={{ fontSize: 10, color: '#94A3B8', flexShrink: 0 }} />
                          </a>
                        );
                      })
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <a
                          href={zaloUrl1}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="btn btn-primary"
                          style={{ 
                            padding: '10px 8px', 
                            borderRadius: 'var(--radius-full)', 
                            fontWeight: 700, 
                            fontSize: '0.82rem',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: 6,
                            textDecoration: 'none',
                            boxShadow: '0 3px 12px rgba(42, 117, 211, 0.25)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <MessageOutlined /> Zalo 1: {hotline1}
                        </a>

                        <a
                          href={zaloUrl2}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="btn btn-soft"
                          style={{ 
                            padding: '10px 8px', 
                            borderRadius: 'var(--radius-full)', 
                            fontWeight: 700, 
                            fontSize: '0.82rem',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: 6,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <MessageOutlined /> Zalo 2: {hotline2}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Auth Button */}
                {isEffectiveAdmin && activeAdminUser ? (
                  <div style={{
                    padding: '14px',
                    marginTop: 20,
                    backgroundColor: '#FEFBF6',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #FDE68A',
                    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.06)'
                  }}>
                    {/* User profile row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#FEF3C7',
                          color: '#D97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: 14
                        }}>
                          <CrownOutlined />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#92400E',
                            lineHeight: 1.3,
                            wordBreak: 'break-word'
                          }}>
                            {activeAdminUser.full_name || 'Quản Trị Viên'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#B45309' }}>Tài khoản quản trị</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.62rem',
                        backgroundColor: '#E29B42',
                        color: '#FFF',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontWeight: 800,
                        letterSpacing: 0.5,
                        flexShrink: 0
                      }}>
                        ADMIN
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Link
                        to="/admin/requests"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          background: '#B45309',
                          color: '#FFF',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          boxShadow: '0 2px 6px rgba(180, 83, 9, 0.2)'
                        }}
                      >
                        <DashboardOutlined /> Quản trị Showroom (CMS)
                      </Link>
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); handleAdminLogout(); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          width: '100%',
                          background: '#FFF',
                          border: '1px solid #FECACA',
                          color: '#EF4444',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '7px 12px',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <LogoutOutlined /> Đăng xuất Admin
                      </button>
                    </div>
                  </div>
                ) : customerUser ? (
                  <div style={{
                    padding: '14px',
                    marginTop: 20,
                    backgroundColor: 'var(--color-background-soft)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: 14
                      }}>
                        <UserOutlined />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-text)', wordBreak: 'break-word' }}>
                          {customerUser.full_name || customerUser.username}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Thành viên</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, fontSize: '0.8rem', padding: '6px 0', textAlign: 'center', textDecoration: 'none' }}
                      >
                        ✦ Hồ sơ
                      </Link>
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); handleCustomerLogout(); }}
                        className="btn btn-soft btn-sm"
                        style={{ flex: 1, fontSize: '0.8rem', padding: '6px 0', color: '#EF4444', borderColor: '#FECACA' }}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mobile-nav-link"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text)', fontWeight: 600, borderTop: '1px solid var(--color-border)', marginTop: 16, paddingTop: 14 }}
                  >
                    <UserOutlined style={{ color: 'var(--color-primary-dark)' }} /> Đăng nhập / Đăng ký
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
    </>
  );
}
