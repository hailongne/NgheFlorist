import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PictureOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  TagOutlined,
  RightOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import ImageWithFallback, { BOTANICAL_FALLBACKS } from '../../components/ImageWithFallback';

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  category_id?: number;
  category_name?: string;
  featured_image?: string;
  is_active: number;
  created_at?: string;
}

interface CategoryOption {
  id: number;
  name: string;
  slug?: string;
  parent_id: number | null;
  direct_product_count?: number;
  total_product_count?: number;
  is_active?: number;
}

const formatVND = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function AdminProductsPage() {
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state for Folder Explorer
  const currentParentId = searchParams.get('parent_id') ? Number(searchParams.get('parent_id')) : null;
  const currentCategoryId = searchParams.get('category_id') ? Number(searchParams.get('category_id')) : null;
  const urlSearch = searchParams.get('search') || '';
  const urlStatus = searchParams.get('status') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const viewMode = (searchParams.get('view') as 'grid' | 'list') || 'grid';

  // State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Local Search Input
  const [searchInput, setSearchInput] = useState(urlSearch);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCategory, setFormCategory] = useState<string>('');
  const [formDescription, setFormDescription] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formImages, setFormImages] = useState<Array<{ url: string; is_featured: number }>>([
    { url: '', is_featured: 1 }
  ]);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Categories (Hierarchical metadata)
  useEffect(() => {
    const fetchAux = async () => {
      try {
        const catRes = await fetch('/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (catRes.ok) {
          const c = await catRes.json();
          setCategories(c.categories || []);
        } else {
          const fallback = await fetch('/api/categories');
          if (fallback.ok) {
            const fb = await fallback.json();
            setCategories(fb.categories || []);
          }
        }
      } catch (err) {
        console.error('Aux data error:', err);
      }
    };
    fetchAux();
  }, [token]);

  // Derived category lists
  const parentCategories = useMemo(() => {
    return categories.filter(c => !c.parent_id);
  }, [categories]);

  const activeParentCategory = useMemo(() => {
    if (!currentParentId) return null;
    return categories.find(c => c.id === currentParentId) || null;
  }, [categories, currentParentId]);

  const subCategoriesOfParent = useMemo(() => {
    if (!currentParentId) return [];
    return categories.filter(c => c.parent_id === currentParentId);
  }, [categories, currentParentId]);

  const activeSubCategory = useMemo(() => {
    if (!currentCategoryId) return null;
    return categories.find(c => c.id === currentCategoryId) || null;
  }, [categories, currentCategoryId]);

  // Fetch Products based on current Folder / Query
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: urlPage.toString(),
        limit: viewMode === 'grid' ? '16' : '20'
      });

      if (urlSearch) params.append('search', urlSearch);
      if (urlStatus !== '') params.append('status', urlStatus);

      // If in a subcategory, filter by category_id directly
      if (currentCategoryId) {
        params.append('category_id', currentCategoryId.toString());
      } else if (currentParentId) {
        // If in a parent folder, filter by parent_id (backend includes child categories)
        params.append('category_id', currentParentId.toString());
      }

      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentParentId, currentCategoryId, urlSearch, urlStatus, urlPage, viewMode]);

  // Navigation helpers for Folder Explorer
  const navigateToRoot = () => {
    const next = new URLSearchParams();
    if (viewMode !== 'grid') next.set('view', viewMode);
    setSearchParams(next);
  };

  const navigateToParentFolder = (parentId: number) => {
    const next = new URLSearchParams();
    next.set('parent_id', parentId.toString());
    if (viewMode !== 'grid') next.set('view', viewMode);
    setSearchParams(next);
  };

  const navigateToSubFolder = (parentId: number, subId: number) => {
    const next = new URLSearchParams();
    next.set('parent_id', parentId.toString());
    next.set('category_id', subId.toString());
    if (viewMode !== 'grid') next.set('view', viewMode);
    setSearchParams(next);
  };

  const updateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('search', searchInput.trim());
    } else {
      next.delete('search');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const updateStatus = (st: string) => {
    const next = new URLSearchParams(searchParams);
    if (st !== '') next.set('status', st);
    else next.delete('status');
    next.set('page', '1');
    setSearchParams(next);
  };

  const toggleViewMode = (mode: 'grid' | 'list') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', mode);
    setSearchParams(next);
  };

  // 1-Click Toggle Active / Hidden
  const handleToggleActive = async (p: ProductItem) => {
    try {
      const newActive = p.is_active === 1 ? 0 : 1;
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newActive })
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi đổi trạng thái sản phẩm');
      }
    } catch {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  // Open Add Product (Context-aware: pre-fills category based on current folder)
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormSku('');
    setFormSlug('');
    setFormPrice(0);
    setFormDescription('');
    setFormActive(true);
    setFormImages([{ url: '', is_featured: 1 }]);

    // Contextual Pre-selection: If admin is inside a folder, pre-fill that category!
    if (currentCategoryId) {
      setFormCategory(currentCategoryId.toString());
    } else if (currentParentId) {
      const firstSub = subCategoriesOfParent[0];
      setFormCategory(firstSub ? firstSub.id.toString() : currentParentId.toString());
    } else {
      setFormCategory(categories[0]?.id.toString() || '');
    }

    setModalOpen(true);
  };

  // Open Edit Product
  const handleOpenEdit = async (id: number) => {
    setEditingId(id);
    setModalOpen(true);
    setModalLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const p = await res.json();
        setFormName(p.name);
        setFormSku(p.sku || '');
        setFormSlug(p.slug);
        setFormPrice(p.price);
        setFormCategory(p.category_id ? p.category_id.toString() : '');
        setFormDescription(p.description || '');
        setFormActive(p.is_active === 1);
        setFormImages(
          p.images && p.images.length > 0
            ? p.images.map((img: any) => ({ url: img.url, is_featured: img.is_featured }))
            : [{ url: '', is_featured: 1 }]
        );
      }
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Save Product (Create / Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) {
      alert('Vui lòng nhập tên sản phẩm và giá bán hợp lệ');
      return;
    }

    const payload = {
      name: formName.trim(),
      sku: formSku.trim() || undefined,
      slug: formSlug.trim() || undefined,
      price: Number(formPrice),
      category_id: formCategory ? Number(formCategory) : null,
      description: formDescription,
      is_active: formActive ? 1 : 0,
      images: formImages.filter(img => img.url.trim() !== '')
    };

    setSaving(true);
    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi lưu sản phẩm');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi hệ thống?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        fetchProducts();
      } else {
        alert(data.error || 'Lỗi xóa sản phẩm');
      }
    } catch {
      alert('Lỗi khi xóa sản phẩm');
    }
  };

  // Image Helpers
  const addImageRow = () => {
    setFormImages([...formImages, { url: '', is_featured: 0 }]);
  };
  const removeImageRow = (index: number) => {
    const next = formImages.filter((_, i) => i !== index);
    if (next.length > 0 && !next.some(img => img.is_featured === 1)) {
      next[0].is_featured = 1;
    }
    setFormImages(next);
  };
  const setAsFeatured = (index: number) => {
    setFormImages(formImages.map((img, i) => ({ ...img, is_featured: i === index ? 1 : 0 })));
  };

  // Upload product images directly to Supabase storage 'products' folder
  const handleUploadImages = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => {
        formData.append('files', f);
      });

      const res = await fetch('/api/admin/products/upload-images', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi tải ảnh lên Supabase');
      }

      if (data.urls && data.urls.length > 0) {
        const newImages = data.urls.map((url: string, idx: number) => ({
          url,
          is_featured: (formImages.filter(img => img.url.trim() !== '').length === 0 && idx === 0) ? 1 : 0
        }));

        setFormImages(prev => {
          const validExisting = prev.filter(img => img.url.trim() !== '');
          const combined = [...validExisting, ...newImages];
          if (combined.length > 0 && !combined.some(img => img.is_featured === 1)) {
            combined[0].is_featured = 1;
          }
          return combined;
        });
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Bộ Sưu Tập Sản Phẩm</h1>
        </div>
        <button onClick={handleOpenAdd} className="admin-btn admin-btn-primary">
          Thêm Sản Phẩm
        </button>
      </div>

      {/* Breadcrumb Bar (Folder Explorer Path) */}
      <div
        className="admin-card"
        style={{
          padding: '12px 20px',
          marginBottom: '16px',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '13px'
        }}
      >
        <button
          onClick={navigateToRoot}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: !currentParentId ? 700 : 500,
            color: !currentParentId ? '#26383D' : '#5D9EAF',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FolderOutlined /> Tất cả thư mục
        </button>

        {activeParentCategory && (
          <>
            <RightOutlined style={{ fontSize: '10px', color: '#A0AEC0' }} />
            <button
              onClick={() => navigateToParentFolder(activeParentCategory.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: currentParentId && !currentCategoryId ? 700 : 500,
                color: currentParentId && !currentCategoryId ? '#26383D' : '#5D9EAF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FolderOpenOutlined /> {activeParentCategory.name}
            </button>
          </>
        )}

        {activeSubCategory && (
          <>
            <RightOutlined style={{ fontSize: '10px', color: '#A0AEC0' }} />
            <span
              style={{
                fontWeight: 700,
                color: '#26383D',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#E6F4F7',
                padding: '2px 10px',
                borderRadius: '6px'
              }}
            >
              <TagOutlined style={{ color: '#5D9EAF' }} /> {activeSubCategory.name}
            </span>
          </>
        )}

        <div style={{ marginLeft: 'auto', color: '#718287', fontSize: '12px' }}>
          Đang xem: <strong>{totalCount} sản phẩm</strong>
        </div>
      </div>

      {/* Visual Folder Browser Tiles (Hierarchical Navigation) */}
      <div style={{ marginBottom: '24px' }}>
        {/* Case 1: At Root - Display all Parent Folders */}
        {!currentParentId && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#718287', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📁 Chọn danh mục lớn để mở xem sản phẩm:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
              {parentCategories.map(cat => {
                const subCount = categories.filter(c => c.parent_id === cat.id).length;
                const prodCount = cat.total_product_count || cat.direct_product_count || 0;

                return (
                  <div
                    key={cat.id}
                    onClick={() => navigateToParentFolder(cat.id)}
                    style={{
                      background: '#fff',
                      border: '1px solid #E4EEF1',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#5D9EAF';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#E4EEF1';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: '#EAF6F9',
                        color: '#5D9EAF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}
                    >
                      <FolderOutlined />
                    </div>
                    <div style={{ minWidth: 0, flexGrow: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#26383D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#718287', marginTop: '2px' }}>
                        {prodCount} sản phẩm {subCount > 0 ? `• ${subCount} khoảng giá` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Case 2: Inside a Parent Folder - Display Price Range Sub-Folders */}
        {currentParentId && activeParentCategory && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#718287', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🏷️ Khoảng ngân sách trong "{activeParentCategory.name}":
              </div>
              <button
                onClick={() => navigate(`/admin/categories`)}
                style={{ fontSize: '12px', color: '#5D9EAF', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                + Thêm khoảng giá mới →
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {/* Tile: All within this parent */}
              <button
                onClick={() => navigateToParentFolder(activeParentCategory.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: !currentCategoryId ? '1.5px solid #5D9EAF' : '1px solid #E2E8F0',
                  background: !currentCategoryId ? '#5D9EAF' : '#fff',
                  color: !currentCategoryId ? '#fff' : '#4A5568',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FolderOpenOutlined /> Tất cả ({activeParentCategory.total_product_count || 0})
              </button>

              {/* Sub-folder chips */}
              {subCategoriesOfParent.map(sub => {
                const isSelected = currentCategoryId === sub.id;
                const count = sub.direct_product_count || 0;

                return (
                  <button
                    key={sub.id}
                    onClick={() => navigateToSubFolder(activeParentCategory.id, sub.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid #5D9EAF' : '1px solid #E2E8F0',
                      background: isSelected ? '#5D9EAF' : '#fff',
                      color: isSelected ? '#fff' : '#4A5568',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <TagOutlined style={{ color: isSelected ? '#fff' : '#5D9EAF' }} />
                    <span>{sub.name}</span>
                    <span style={{ fontSize: '11px', opacity: 0.85 }}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action & Filter Toolbar */}
      <div className="admin-card" style={{ padding: '14px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search */}
          <form onSubmit={updateSearch} style={{ display: 'flex', gap: '8px', flexGrow: 1, maxWidth: '420px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <SearchOutlined style={{ position: 'absolute', left: '12px', top: '10px', color: '#718287' }} />
              <input
                type="text"
                className="admin-input"
                style={{ paddingLeft: '34px' }}
                placeholder="Tìm theo tên hoặc mã SKU sản phẩm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-outline">Tìm</button>
          </form>

          {/* Status & View Mode */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status Selector */}
            <select
              className="admin-select"
              style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
              value={urlStatus}
              onChange={(e) => updateStatus(e.target.value)}
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="1">Đang hiển thị (Bán)</option>
              <option value="0">Đang ẩn (Tạm ngưng)</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{ display: 'inline-flex', borderRadius: '6px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => toggleViewMode('grid')}
                style={{
                  padding: '6px 12px',
                  background: viewMode === 'grid' ? '#5D9EAF' : '#fff',
                  color: viewMode === 'grid' ? '#fff' : '#718287',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                title="Xem dạng Lưới Thẻ (File Cards)"
              >
                <AppstoreOutlined />
              </button>
              <button
                type="button"
                onClick={() => toggleViewMode('list')}
                style={{
                  padding: '6px 12px',
                  background: viewMode === 'list' ? '#5D9EAF' : '#fff',
                  color: viewMode === 'list' ? '#fff' : '#718287',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                title="Xem dạng Danh Sách Bảng (Table)"
              >
                <UnorderedListOutlined />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Products Display */}
      {loading ? (
        <div className="admin-card" style={{ padding: '60px', textAlign: 'center', color: '#5D9EAF' }}>
          Đang tải danh sách sản phẩm hoa...
        </div>
      ) : products.length > 0 ? (
        <>
          {/* GRID VIEW (Product / File Cards - Master Prompt Default) */}
          {viewMode === 'grid' && (
            <div className="admin-product-grid">
              {products.map(p => {
                const isHidden = p.is_active === 0;

                return (
                  <div
                    key={p.id}
                    className="admin-card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      borderRadius: '12px',
                      border: isHidden ? '1px dashed #CBD5E0' : '1px solid #E4EEF1',
                      background: isHidden ? '#F9FBFC' : '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Card Image */}
                    <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', background: '#F1F5F7' }}>
                      <img
                        src={p.featured_image || BOTANICAL_FALLBACKS[0]}
                        alt={p.name}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: isHidden ? 0.65 : 1,
                          transition: 'transform 0.3s ease'
                        }}
                      />
                      {/* Status Pill Badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: isHidden ? 'rgba(229, 62, 62, 0.9)' : 'rgba(56, 161, 105, 0.9)',
                          color: '#fff',
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        {isHidden ? '● Đang ẩn' : '● Đang hiện'}
                      </span>

                      {/* SKU Tag */}
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: '#26383D',
                          fontWeight: 600
                        }}
                      >
                        {p.sku || `NF-${p.id}`}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '14px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Category Badge */}
                      <div style={{ fontSize: '11px', color: '#5D9EAF', fontWeight: 600, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        📂 {p.category_name || 'Chưa phân loại'}
                      </div>

                      {/* Product Name */}
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '14px',
                          color: isHidden ? '#718287' : '#26383D',
                          lineHeight: 1.4,
                          marginBottom: '8px',
                          minHeight: '38px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                        title={p.name}
                      >
                        {p.name}
                      </div>

                      {/* Price */}
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#5D9EAF', marginTop: 'auto', marginBottom: '12px' }}>
                        {formatVND(p.price)}
                      </div>

                      {/* Card Actions Footer */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '6px', borderTop: '1px solid #F1F5F7', paddingTop: '10px' }}>
                        {/* 1-Click Hide/Show Toggle */}
                        <button
                          onClick={() => handleToggleActive(p)}
                          className="admin-btn admin-btn-outline"
                          style={{
                            padding: '6px 10px',
                            fontSize: '11px',
                            color: isHidden ? '#38A169' : '#D69E2E',
                            borderColor: isHidden ? '#C6F6D5' : '#FEFCBF'
                          }}
                          title={isHidden ? 'Kích hoạt bán' : 'Ẩn sản phẩm'}
                        >
                          {isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(p.id)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '6px 10px', fontSize: '12px', justifyContent: 'center' }}
                          title="Chỉnh sửa sản phẩm"
                        >
                          <EditOutlined /> Sửa
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '6px 10px', fontSize: '11px', color: '#E53E3E', borderColor: '#FED7D7' }}
                          title="Xóa sản phẩm"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW (Table format) */}
          {viewMode === 'list' && (
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '28px' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Mã SKU</th>
                    <th>Danh mục</th>
                    <th>Giá bán</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.featured_image || BOTANICAL_FALLBACKS[0]}
                          alt={p.name}
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#26383D' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#718287' }}>/{p.slug}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.sku || `NF-${p.id}`}</span>
                      </td>
                      <td>{p.category_name || 'Chưa phân loại'}</td>
                      <td style={{ fontWeight: 600, color: '#5D9EAF' }}>{formatVND(p.price)}</td>
                      <td>
                        <span className={`admin-badge ${p.is_active === 1 ? 'badge-success' : 'badge-danger'}`}>
                          {p.is_active === 1 ? 'Đang bán' : 'Ngừng bán'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleToggleActive(p)}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '6px 8px', fontSize: '12px' }}
                            title={p.is_active === 1 ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                          >
                            {p.is_active === 1 ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p.id)}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                          >
                            <EditOutlined />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '6px 10px', fontSize: '12px', color: '#E06060' }}
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '24px 0' }}>
              <button
                disabled={urlPage <= 1}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(urlPage - 1));
                  setSearchParams(next);
                }}
                className="admin-btn admin-btn-outline"
                style={{ opacity: urlPage <= 1 ? 0.4 : 1 }}
              >
                ← Trang trước
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '13px', color: '#718287' }}>
                Trang <strong>{urlPage}</strong> / {totalPages} ({totalCount} sản phẩm)
              </span>
              <button
                disabled={urlPage >= totalPages}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(urlPage + 1));
                  setSearchParams(next);
                }}
                className="admin-btn admin-btn-outline"
                style={{ opacity: urlPage >= totalPages ? 0.4 : 1 }}
              >
                Trang sau →
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <FolderOutlined style={{ fontSize: '42px', color: '#CBD5E0', marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#26383D', marginBottom: '6px' }}>
            {currentParentId
              ? `Chưa có sản phẩm trong thư mục "${activeSubCategory?.name || activeParentCategory?.name}"`
              : 'Không tìm thấy sản phẩm hoa nào phù hợp'}
          </h3>
          <p style={{ color: '#718287', fontSize: '13px', marginBottom: '18px' }}>
            Bạn có thể thêm mới sản phẩm trực tiếp vào thư mục này mà không cần chọn lại danh mục.
          </p>
          <button
            onClick={handleOpenAdd}
            className="admin-btn admin-btn-primary"
            style={{ marginTop: '12px' }}
          >
            Thêm sản phẩm vào thư mục này
          </button>
        </div>
      )}

      {/* Product Create / Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '680px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingId ? 'Chỉnh Sửa Sản Phẩm Hoa' : 'Thêm Mẫu Hoa Mới Vào Hệ Thống'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                <CloseOutlined />
              </button>
            </div>

            {modalLoading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#5D9EAF' }}>
                Đang tải dữ liệu sản phẩm...
              </div>
            ) : (
              <form onSubmit={handleSaveProduct} style={{ overflowY: 'auto', flexGrow: 1 }}>
                <div className="admin-modal-body">
                  {/* Name & SKU */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                    <div className="admin-form-group">
                      <label className="admin-label">Tên sản phẩm hoa *</label>
                      <input
                        type="text"
                        className="admin-input"
                        required
                        placeholder="VD: Bó Hoa Hồng Juliet Giấc Mơ"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Mã SKU (Tự tạo nếu trống)</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="VD: NF-BH-01"
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Price & Category (Grouped optgroup) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '14px' }}>
                    <div className="admin-form-group">
                      <label className="admin-label">Giá chuẩn (VNĐ) *</label>
                      <input
                        type="number"
                        className="admin-input"
                        required
                        min="0"
                        step="10000"
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Danh mục (Thư mục chứa) *</label>
                      <select
                        className="admin-select"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        <option value="">-- Chưa phân loại --</option>
                        {categories.filter(c => !c.parent_id).map(parent => {
                          const subcats = categories.filter(c => c.parent_id === parent.id);
                          if (subcats.length === 0) {
                            return <option key={parent.id} value={parent.id}>{parent.name}</option>;
                          }
                          return (
                            <optgroup key={parent.id} label={parent.name}>
                              <option value={parent.id}>{parent.name} (Toàn bộ nhóm)</option>
                              {subcats.map(sub => (
                                <option key={sub.id} value={sub.id}>
                                  {parent.name} → {sub.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Slug & Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                    <div className="admin-form-group">
                      <label className="admin-label">Đường dẫn thân thiện (Slug)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="bo-hoa-hong-juliet"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Trạng thái hiển thị</label>
                      <select
                        className="admin-select"
                        value={formActive ? '1' : '0'}
                        onChange={(e) => setFormActive(e.target.value === '1')}
                      >
                        <option value="1">Đang hiển thị</option>
                        <option value="0">Đang ẩn</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="admin-form-group">
                    <label className="admin-label">Mô tả sản phẩm & loại hoa sử dụng</label>
                    <textarea
                      className="admin-textarea"
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Gồm 15 cành hoa hồng nhập khẩu, hoa baby trắng, lá bạc..."
                    />
                  </div>

                  {/* Images Management */}
                  <div style={{ marginTop: '16px', borderTop: '1px solid #E4EEF1', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <label className="admin-label" style={{ margin: 0 }}>
                          <PictureOutlined /> Hình Ảnh Sản Phẩm
                        </label>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: 2 }}>
                          Thư mục lưu trữ: <code>media/products/</code> trên Supabase
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary"
                          style={{ padding: '6px 14px', fontSize: '12px' }}
                          disabled={uploadingImages}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploadingImages ? 'Đang tải lên...' : 'Tải Ảnh Mới Lên'}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          onClick={addImageRow}
                          title="Nhập link ảnh thủ công nếu cần"
                        >
                          Thêm link ảnh
                        </button>
                      </div>
                    </div>

                    {/* Drag-and-drop / Click-to-upload box */}
                    <div
                      onClick={() => !uploadingImages && fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!uploadingImages && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleUploadImages(e.dataTransfer.files);
                        }
                      }}
                      style={{
                        border: '2px dashed #B8D6DF',
                        borderRadius: '8px',
                        padding: '16px',
                        textAlign: 'center',
                        cursor: uploadingImages ? 'not-allowed' : 'pointer',
                        background: '#FAFDFD',
                        marginBottom: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/png, image/jpeg, image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleUploadImages(e.target.files);
                          }
                        }}
                      />
                      {uploadingImages ? (
                        <div style={{ color: '#5D9EAF', fontWeight: 600, padding: '6px 0' }}>
                          <LoadingOutlined style={{ fontSize: 20, marginRight: 8 }} /> Đang tải ảnh lên thư mục <code>products</code> trên Supabase...
                        </div>
                      ) : (
                        <div>
                          <div style={{ color: '#26383D', fontWeight: 600, fontSize: '13px' }}>
                            <UploadOutlined style={{ marginRight: 6, color: '#5D9EAF' }} />
                            Bấm để chọn ảnh từ máy tính hoặc kéo thả ảnh hoa vào đây
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#718287', marginTop: '4px' }}>
                            Hỗ trợ chọn nhiều ảnh cùng lúc (JPG, PNG, WEBP) • Tự động lưu vào thư mục <code>products</code> trên Supabase Cloud
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Preview Ảnh Chính & Album Ảnh Phụ */}
                    {(() => {
                      const validImages = formImages.map((img, idx) => ({ ...img, originalIndex: idx }));
                      const featuredIdx = validImages.findIndex(img => img.is_featured === 1);
                      const mainIdx = featuredIdx >= 0 ? featuredIdx : (validImages.length > 0 ? 0 : -1);
                      const mainImg = mainIdx >= 0 ? validImages[mainIdx] : null;
                      const subImgs = validImages.filter(img => img.originalIndex !== mainIdx && img.url.trim() !== '');
                      const emptyRows = validImages.filter(img => img.url.trim() === '' && img.originalIndex !== mainIdx);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px', alignItems: 'start' }}>
                            {/* CỘT 1: PREVIEW ẢNH CHÍNH */}
                            <div style={{
                              background: '#fff',
                              border: '2px solid #5D9EAF',
                              borderRadius: '10px',
                              padding: '12px',
                              boxShadow: '0 2px 8px rgba(93,158,175,0.12)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  color: '#1B363C',
                                  background: '#E8F5F8',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  letterSpacing: '0.5px'
                                }}>
                                  ★ ẢNH CHÍNH (COVER)
                                </span>
                                {mainImg && mainImg.url && mainImg.url.includes('/products/') && (
                                  <span style={{ fontSize: '10.5px', color: '#5D9EAF', fontWeight: 600 }}>
                                    ✓ Supabase
                                  </span>
                                )}
                              </div>

                              <div style={{
                                width: '100%',
                                height: '180px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                background: '#F8FAFC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #E2E8F0',
                                position: 'relative'
                              }}>
                                {mainImg && mainImg.url.trim() ? (
                                  <ImageWithFallback
                                    src={mainImg.url}
                                    alt="Ảnh chính sản phẩm"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div style={{ textAlign: 'center', color: '#94A3B8', padding: '16px' }}>
                                    <PictureOutlined style={{ fontSize: 32, color: '#CBD5E1', marginBottom: 6 }} />
                                    <div style={{ fontSize: '12px', fontWeight: 600 }}>Chưa có ảnh chính</div>
                                    <div style={{ fontSize: '11px', marginTop: 2 }}>Tải ảnh để làm ảnh đại diện</div>
                                  </div>
                                )}
                              </div>

                              {mainImg && (
                                <div>
                                  <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="Đường dẫn ảnh chính..."
                                    value={mainImg.url}
                                    onChange={(e) => {
                                      const next = [...formImages];
                                      next[mainImg.originalIndex].url = e.target.value;
                                      setFormImages(next);
                                    }}
                                    style={{ fontSize: '11.5px', padding: '6px 8px' }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* CỘT 2: ALBUM ẢNH PHỤ */}
                            <div style={{
                              background: '#FAFDFD',
                              border: '1px solid #E2E8F0',
                              borderRadius: '10px',
                              padding: '14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              minHeight: '260px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#26383D' }}>
                                  📸 Album ảnh phụ ({subImgs.length} ảnh)
                                </div>
                                <span style={{ fontSize: '11px', color: '#64748B' }}>
                                  Bấm "★ Đặt làm chính" để đổi ảnh đại diện
                                </span>
                              </div>

                              {subImgs.length === 0 ? (
                                <div style={{
                                  border: '1px dashed #CBD5E1',
                                  borderRadius: '8px',
                                  padding: '36px 16px',
                                  textAlign: 'center',
                                  color: '#94A3B8',
                                  fontSize: '12px'
                                }}>
                                  Chưa có ảnh phụ nào trong album.
                                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: 4 }}>
                                    Tải thêm các góc chụp khác của mẫu hoa để khách hàng xem trong trang chi tiết.
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                                  {subImgs.map((sub) => (
                                    <div
                                      key={sub.originalIndex}
                                      style={{
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: '#fff',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                      }}
                                    >
                                      <div style={{ position: 'relative', width: '100%', height: '110px', background: '#F8FAFC' }}>
                                        <ImageWithFallback
                                          src={sub.url}
                                          alt={`Ảnh phụ ${sub.originalIndex}`}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeImageRow(sub.originalIndex)}
                                          style={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            background: 'rgba(238, 56, 56, 0.88)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '10px'
                                          }}
                                          title="Xóa ảnh này khỏi album"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                      <div style={{ padding: '6px' }}>
                                        <button
                                          type="button"
                                          onClick={() => setAsFeatured(sub.originalIndex)}
                                          className="admin-btn admin-btn-outline"
                                          style={{ width: '100%', padding: '4px 6px', fontSize: '10px', textAlign: 'center', justifyContent: 'center' }}
                                          title="Chuyển ảnh này làm ảnh đại diện chính"
                                        >
                                          ★ Đặt làm chính
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Extra empty rows if user added manual link rows */}
                          {emptyRows.map((row) => (
                            <div
                              key={row.originalIndex}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: '10px',
                                alignItems: 'center',
                                background: '#FAFDFD',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px dashed #CBD5E1'
                              }}
                            >
                              <input
                                type="text"
                                className="admin-input"
                                placeholder="Dán link ảnh https://..."
                                value={row.url}
                                onChange={(e) => {
                                  const next = [...formImages];
                                  next[row.originalIndex].url = e.target.value;
                                  setFormImages(next);
                                }}
                                style={{ fontSize: '12px' }}
                              />
                              <button
                                type="button"
                                onClick={() => removeImageRow(row.originalIndex)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '6px 8px', color: '#E06060' }}
                                title="Xóa ô này"
                              >
                                <CloseOutlined />
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-outline">
                    Hủy
                  </button>
                  <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
                    {saving ? 'Đang lưu...' : (editingId ? 'Cập Nhật Mẫu Hoa' : 'Thêm Mẫu Hoa')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
