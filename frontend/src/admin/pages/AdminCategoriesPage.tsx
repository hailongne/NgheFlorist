import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import {
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  FolderOutlined,
  FileOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  AppstoreOutlined,
  TagOutlined,
  CheckCircleOutlined,
  ShopOutlined
} from '@ant-design/icons';

interface CategoryItem {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: number;
  direct_product_count: number;
  total_product_count: number;
  can_delete: boolean;
  children?: CategoryItem[];
}

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryType, setCategoryType] = useState<'parent' | 'sub'>('parent');
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formDescription, setFormDescription] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  // Block Delete Modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockedCategory, setBlockedCategory] = useState<CategoryItem | null>(null);

  const categoryModalRef = useRef<HTMLDivElement>(null);
  const blockModalRef = useRef<HTMLDivElement>(null);

  useOverlayLock({
    id: 'admin-category-edit-modal',
    isOpen: modalOpen,
    onClose: () => setModalOpen(false),
    containerRef: categoryModalRef,
    role: 'dialog',
    priority: 10
  });

  useOverlayLock({
    id: 'admin-category-block-delete-modal',
    isOpen: blockModalOpen,
    onClose: () => {
      setBlockModalOpen(false);
      setBlockedCategory(null);
    },
    containerRef: blockModalRef,
    role: 'alertdialog',
    priority: 20
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        // Fallback if admin endpoint fails
        const pubRes = await fetch('/api/categories');
        if (pubRes.ok) {
          const data = await pubRes.json();
          setCategories(data.categories || []);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Parent categories list
  const parentCategories = useMemo(() => {
    return categories.filter(c => !c.parent_id);
  }, [categories]);

  // Open modal to add parent category
  const handleOpenAddParent = () => {
    setEditingId(null);
    setCategoryType('parent');
    setFormName('');
    setFormSlug('');
    setFormParentId('');
    setFormDescription('');
    setFormSortOrder(0);
    setFormIsActive(1);
    setModalOpen(true);
  };

  // Open modal to add subcategory (price range) under a specific parent
  const handleOpenAddSub = (parent?: CategoryItem) => {
    setEditingId(null);
    setCategoryType('sub');
    setFormName('');
    setFormSlug('');
    setFormParentId(parent ? parent.id.toString() : (parentCategories[0]?.id.toString() || ''));
    setFormDescription('');
    setFormSortOrder(0);
    setFormIsActive(1);
    setModalOpen(true);
  };

  // Open modal to edit category
  const handleOpenEdit = (c: CategoryItem) => {
    setEditingId(c.id);
    setCategoryType(c.parent_id ? 'sub' : 'parent');
    setFormName(c.name);
    setFormSlug(c.slug);
    setFormParentId(c.parent_id ? c.parent_id.toString() : '');
    setFormDescription(c.description || '');
    setFormSortOrder(c.sort_order || 0);
    setFormIsActive(c.is_active !== undefined ? c.is_active : 1);
    setModalOpen(true);
  };

  // Toggle active/hidden
  const handleToggleActive = async (c: CategoryItem) => {
    try {
      const res = await fetch(`/api/admin/categories/${c.id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi đổi trạng thái danh mục');
      }
    } catch (err) {
      alert('Lỗi khi đổi trạng thái danh mục');
    }
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }

    if (categoryType === 'sub' && !formParentId) {
      alert('Vui lòng chọn danh mục lớn (cha) cho khoảng giá này');
      return;
    }

    if (editingId && formParentId && Number(formParentId) === editingId) {
      alert('Danh mục không thể là cha của chính nó!');
      return;
    }

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      parent_id: categoryType === 'sub' && formParentId ? Number(formParentId) : null,
      description: formDescription,
      sort_order: Number(formSortOrder),
      is_active: Number(formIsActive)
    };

    setSaving(true);
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
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
        throw new Error(data.error || 'Lỗi lưu danh mục');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  // Delete Category (Enforces Rule: Block Delete if products are attached, only allow Hide)
  const handleDeleteCategory = async (c: CategoryItem) => {
    const productCount = c.total_product_count || c.direct_product_count || 0;

    // Check if category has products attached
    if (productCount > 0) {
      setBlockedCategory(c);
      setBlockModalOpen(true);
      return;
    }

    // Check if parent category has child categories
    const children = categories.filter(sub => sub.parent_id === c.id);
    if (children.length > 0) {
      alert(`Danh mục lớn "${c.name}" đang chứa ${children.length} danh mục nhỏ. Bạn phải xử lý hoặc xóa các danh mục nhỏ trước khi xóa danh mục lớn.`);
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${c.name}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi xóa danh mục');
      }
    } catch (err) {
      alert('Lỗi xóa danh mục');
    }
  };

  // Filtered parent categories
  const filteredParents = useMemo(() => {
    return parentCategories.filter(parent => {
      const subcats = categories.filter(c => c.parent_id === parent.id);
      
      // Match Search
      const matchesSearch = !searchTerm ||
        parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcats.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Match Status
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && parent.is_active === 1) ||
        (statusFilter === 'hidden' && parent.is_active === 0);

      return matchesSearch && matchesStatus;
    });
  }, [parentCategories, categories, searchTerm, statusFilter]);

  // Total stats
  const totalSubCategories = useMemo(() => categories.filter(c => c.parent_id !== null).length, [categories]);
  const totalProductsClassified = useMemo(() => {
    return parentCategories.reduce((acc, curr) => acc + (curr.total_product_count || curr.direct_product_count || 0), 0);
  }, [parentCategories]);

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Danh Mục Hoa</h1>
          <div className="admin-page-subtitle">
            Cấu trúc 2 tầng: <strong>Danh mục lớn</strong> (Bó hoa, Giỏ hoa, Kệ hoa...) và <strong>Danh mục nhỏ</strong> (Khoảng ngân sách giá)
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleOpenAddSub()} className="admin-btn admin-btn-outline" style={{ background: '#fff' }}>
            Thêm Khoảng Giá
          </button>
          <button onClick={handleOpenAddParent} className="admin-btn admin-btn-primary">
            Thêm Danh Mục Lớn
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#E6F4F7', color: '#5D9EAF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FolderOutlined />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#718287', fontWeight: 500 }}>Danh mục lớn</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#26383D' }}>{parentCategories.length} nhóm hoa</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FFF7E6', color: '#D48806', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <TagOutlined />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#718287', fontWeight: 500 }}>Danh mục nhỏ (Khoảng giá)</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#26383D' }}>{totalSubCategories} khoảng giá</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EBF8F2', color: '#38A169', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <CheckCircleOutlined />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#718287', fontWeight: 500 }}>Tổng sản phẩm liên kết</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#26383D' }}>{totalProductsClassified} mẫu hoa</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flex: '1', minWidth: '280px', maxWidth: '480px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <SearchOutlined style={{ position: 'absolute', left: '12px', top: '10px', color: '#8898AA' }} />
              <input
                type="text"
                className="admin-input"
                placeholder="Tìm danh mục hoặc khoảng giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#718287' }}>Trạng thái:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`admin-btn ${statusFilter === 'all' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Tất cả ({parentCategories.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`admin-btn ${statusFilter === 'active' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Đang hiện ({parentCategories.filter(c => c.is_active === 1).length})
            </button>
            <button
              onClick={() => setStatusFilter('hidden')}
              className={`admin-btn ${statusFilter === 'hidden' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Đang ẩn ({parentCategories.filter(c => c.is_active === 0).length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Categories Hierarchical Group Cards */}
      {loading ? (
        <div className="admin-card" style={{ padding: '60px', textAlign: 'center', color: '#5D9EAF' }}>
          Đang tải danh sách danh mục...
        </div>
      ) : filteredParents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredParents.map(parent => {
            const subcats = categories.filter(c => c.parent_id === parent.id);
            const totalProds = parent.total_product_count || parent.direct_product_count || 0;
            const isHidden = parent.is_active === 0;

            return (
              <div
                key={parent.id}
                className="admin-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: isHidden ? '1px dashed #CBD5E0' : '1px solid #E4EEF1',
                  background: isHidden ? '#F9FBFC' : '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                {/* Parent Category Card Header */}
                <div
                  style={{
                    padding: '16px 20px',
                    background: isHidden ? '#F1F5F7' : '#F4F9FA',
                    borderBottom: '1px solid #E4EEF1',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  {/* Left: Parent Info (Clickable Folder) */}
                  <div 
                    onClick={() => navigate(`/admin/products?parent_id=${parent.id}&category_name=${encodeURIComponent(parent.name)}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    title={`Mở thư mục xem tất cả ${totalProds} sản phẩm trong nhóm "${parent.name}"`}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: isHidden ? '#E2E8F0' : '#5D9EAF',
                        color: isHidden ? '#718287' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        boxShadow: '0 2px 6px rgba(93, 158, 175, 0.25)',
                        transition: 'transform 0.15s'
                      }}
                    >
                      <FolderOutlined />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: isHidden ? '#718287' : '#26383D' }}>
                          {parent.name}
                        </h3>
                        <span style={{ fontSize: '12px', color: '#718287', fontFamily: 'monospace' }}>
                          /{parent.slug}
                        </span>
                        <span className={`admin-badge ${isHidden ? 'badge-danger' : 'badge-success'}`}>
                          {isHidden ? 'Đang ẩn' : 'Đang hiển thị'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#718287', marginTop: '3px' }}>
                        Thứ tự: {parent.sort_order || 0} • {subcats.length} khoảng giá • <span style={{ fontWeight: 700, color: '#5D9EAF' }}>📂 {totalProds} sản phẩm</span>
                        <span style={{ marginLeft: '8px', color: '#2B6CB0', fontSize: '11px', textDecoration: 'underline' }}>
                          (Nhấn để mở thư mục sản phẩm →)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Open Product Folder directly */}
                    <button
                      onClick={() => navigate(`/admin/products?parent_id=${parent.id}&category_name=${encodeURIComponent(parent.name)}`)}
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '6px 12px', fontSize: '12px', background: '#fff', color: '#5D9EAF', borderColor: '#BEE3F8', fontWeight: 600 }}
                      title="Mở thư mục xem sản phẩm"
                    >
                      <ShopOutlined /> Xem {totalProds} sản phẩm
                    </button>

                    {/* Add Subcategory under this Parent */}
                    <button
                      onClick={() => handleOpenAddSub(parent)}
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '6px 12px', fontSize: '12px', background: '#fff', color: '#2B6CB0', borderColor: '#BEE3F8' }}
                      title="Thêm khoảng giá con vào danh mục này"
                    >
                      Thêm khoảng giá
                    </button>

                    {/* Toggle Active/Hide */}
                    <button
                      onClick={() => handleToggleActive(parent)}
                      className="admin-btn admin-btn-outline"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: '#fff',
                        color: isHidden ? '#38A169' : '#D69E2E',
                        borderColor: isHidden ? '#C6F6D5' : '#FEFCBF'
                      }}
                      title={isHidden ? 'Kích hoạt hiển thị danh mục này' : 'Ẩn danh mục khỏi website'}
                    >
                      {isHidden ? <><EyeOutlined /> Hiện</> : <><EyeInvisibleOutlined /> Ẩn</>}
                    </button>

                    {/* Edit Parent */}
                    <button
                      onClick={() => handleOpenEdit(parent)}
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '6px 10px', fontSize: '12px', background: '#fff' }}
                      title="Chỉnh sửa danh mục lớn"
                    >
                      <EditOutlined /> Sửa
                    </button>

                    {/* Delete Parent (Shows block info if has products) */}
                    <button
                      onClick={() => handleDeleteCategory(parent)}
                      className="admin-btn admin-btn-outline"
                      style={{
                        padding: '6px 10px',
                        fontSize: '12px',
                        color: totalProds > 0 ? '#A0AEC0' : '#E53E3E',
                        background: '#fff',
                        borderColor: totalProds > 0 ? '#E2E8F0' : '#FED7D7',
                        cursor: 'pointer'
                      }}
                      title={totalProds > 0 ? `Đang chứa ${totalProds} sản phẩm (Không cho xóa, chỉ cho ẩn)` : 'Xóa danh mục lớn'}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>

                {/* Subcategories (Price Ranges) Table */}
                <div style={{ padding: 0 }}>
                  {subcats.length > 0 ? (
                    <table className="admin-table" style={{ margin: 0, borderTop: 'none' }}>
                      <thead>
                        <tr style={{ background: '#FAFDFD' }}>
                          <th style={{ paddingLeft: '48px', width: '280px' }}>Khoảng ngân sách (Danh mục nhỏ)</th>
                          <th>Đường dẫn (Slug)</th>
                          <th>Thứ tự</th>
                          <th>Số sản phẩm</th>
                          <th>Trạng thái</th>
                          <th style={{ textAlign: 'right', paddingRight: '20px' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subcats.map(sub => {
                          const subProds = sub.direct_product_count || 0;
                          const subHidden = sub.is_active === 0 || isHidden;

                          return (
                            <tr
                              key={sub.id}
                              style={{
                                background: sub.is_active === 0 ? '#FAFBFB' : '#fff'
                              }}
                            >
                              <td 
                                style={{ paddingLeft: '48px', cursor: 'pointer' }}
                                onClick={() => navigate(`/admin/products?parent_id=${parent.id}&category_id=${sub.id}&category_name=${encodeURIComponent(parent.name)}&sub_name=${encodeURIComponent(sub.name)}`)}
                                title={`Mở thư mục xem ${subProds} sản phẩm trong khoảng giá "${sub.name}"`}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <TagOutlined style={{ color: sub.is_active === 0 ? '#A0AEC0' : '#5D9EAF', fontSize: '13px' }} />
                                  <span style={{ fontWeight: 600, color: sub.is_active === 0 ? '#718287' : '#2B6CB0' }}>
                                    {sub.name}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#718287' }}>→</span>
                                </div>
                              </td>
                              <td style={{ fontSize: '12px', color: '#718287', fontFamily: 'monospace' }}>
                                /{sub.slug}
                              </td>
                              <td>{sub.sort_order || 0}</td>
                              <td>
                                <span 
                                  className={`admin-badge ${subProds > 0 ? 'badge-info' : ''}`}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => navigate(`/admin/products?parent_id=${parent.id}&category_id=${sub.id}&category_name=${encodeURIComponent(parent.name)}&sub_name=${encodeURIComponent(sub.name)}`)}
                                  title="Xem sản phẩm"
                                >
                                  {subProds} sản phẩm
                                </span>
                              </td>
                              <td>
                                <span className={`admin-badge ${sub.is_active === 0 ? 'badge-danger' : 'badge-success'}`}>
                                  {sub.is_active === 0 ? 'Đang ẩn' : (isHidden ? 'Ẩn theo cha' : 'Đang hiện')}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  {/* Open Products in this Subcategory */}
                                  <button
                                    onClick={() => navigate(`/admin/products?parent_id=${parent.id}&category_id=${sub.id}&category_name=${encodeURIComponent(parent.name)}&sub_name=${encodeURIComponent(sub.name)}`)}
                                    className="admin-btn admin-btn-outline"
                                    style={{ padding: '4px 8px', fontSize: '11px', color: '#2B6CB0' }}
                                    title="Mở xem sản phẩm"
                                  >
                                    <ShopOutlined /> Xem ({subProds})
                                  </button>

                                  {/* Toggle Subcategory */}
                                  <button
                                    onClick={() => handleToggleActive(sub)}
                                    className="admin-btn admin-btn-outline"
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '11px',
                                      color: sub.is_active === 0 ? '#38A169' : '#D69E2E'
                                    }}
                                    title={sub.is_active === 0 ? 'Hiện khoảng giá' : 'Ẩn khoảng giá'}
                                  >
                                    {sub.is_active === 0 ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                  </button>

                                  {/* Edit Subcategory */}
                                  <button
                                    onClick={() => handleOpenEdit(sub)}
                                    className="admin-btn admin-btn-outline"
                                    style={{ padding: '4px 8px', fontSize: '11px' }}
                                    title="Chỉnh sửa khoảng giá"
                                  >
                                    <EditOutlined />
                                  </button>

                                  {/* Delete Subcategory */}
                                  <button
                                    onClick={() => handleDeleteCategory(sub)}
                                    className="admin-btn admin-btn-outline"
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '11px',
                                      color: subProds > 0 ? '#A0AEC0' : '#E53E3E',
                                      cursor: 'pointer'
                                    }}
                                    title={subProds > 0 ? `Đang chứa ${subProds} sản phẩm (Không cho xóa, chỉ cho ẩn)` : 'Xóa khoảng giá'}
                                  >
                                    <DeleteOutlined />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '24px 48px', color: '#718287', fontSize: '13px', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Chưa có danh mục nhỏ (khoảng ngân sách) nào được tạo cho nhóm này.</span>
                      <button
                        onClick={() => handleOpenAddSub(parent)}
                        className="admin-btn admin-btn-outline"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        + Tạo khoảng giá đầu tiên
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="admin-card" style={{ padding: '60px', textAlign: 'center', color: '#718287' }}>
          <FolderOutlined style={{ fontSize: '36px', color: '#CBD5E0', marginBottom: '12px' }} />
          <div>Không tìm thấy danh mục hoa nào phù hợp</div>
        </div>
      )}

      {/* Modal Thêm / Chỉnh Sửa Danh Mục */}
      {modalOpen && (
        <div 
          className="admin-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div ref={categoryModalRef} role="dialog" aria-modal="true" className="admin-modal" style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingId
                  ? (categoryType === 'parent' ? 'Chỉnh Sửa Danh Mục Lớn' : 'Chỉnh Sửa Khoảng Ngân Sách')
                  : (categoryType === 'parent' ? 'Thêm Danh Mục Lớn Mới' : 'Thêm Khoảng Ngân Sách Mới')}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                <CloseOutlined />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="admin-modal-body">
                {/* Choose category type if creating new */}
                {!editingId && (
                  <div className="admin-form-group">
                    <label className="admin-label">Cấp độ danh mục *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div
                        onClick={() => { setCategoryType('parent'); setFormParentId(''); }}
                        style={{
                          padding: '12px',
                          border: categoryType === 'parent' ? '2px solid #5D9EAF' : '1px solid #E4EEF1',
                          background: categoryType === 'parent' ? '#F0F9FB' : '#fff',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <FolderOutlined style={{ fontSize: '18px', color: '#5D9EAF', marginBottom: '4px' }} />
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#26383D' }}>Danh Mục Lớn</div>
                        <div style={{ fontSize: '11px', color: '#718287' }}>VD: Giỏ hoa, Bó hoa, Kệ hoa</div>
                      </div>

                      <div
                        onClick={() => {
                          setCategoryType('sub');
                          if (!formParentId && parentCategories[0]) {
                            setFormParentId(parentCategories[0].id.toString());
                          }
                        }}
                        style={{
                          padding: '12px',
                          border: categoryType === 'sub' ? '2px solid #5D9EAF' : '1px solid #E4EEF1',
                          background: categoryType === 'sub' ? '#F0F9FB' : '#fff',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <TagOutlined style={{ fontSize: '18px', color: '#D48806', marginBottom: '4px' }} />
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#26383D' }}>Khoảng Ngân Sách</div>
                        <div style={{ fontSize: '11px', color: '#718287' }}>VD: 300k - 500k, 500k - 1tr</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* If Subcategory, choose Parent Category */}
                {categoryType === 'sub' && (
                  <div className="admin-form-group">
                    <label className="admin-label">Thuộc Danh mục lớn (Cha) *</label>
                    <select
                      className="admin-select"
                      required
                      value={formParentId}
                      onChange={(e) => setFormParentId(e.target.value)}
                    >
                      <option value="">-- Chọn danh mục lớn --</option>
                      {parentCategories
                        .filter(c => editingId ? c.id !== editingId : true)
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Category Name */}
                <div className="admin-form-group">
                  <label className="admin-label">
                    {categoryType === 'parent' ? 'Tên Danh mục lớn *' : 'Tên khoảng ngân sách *'}
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    required
                    placeholder={categoryType === 'parent' ? 'VD: Bó Hoa, Giỏ Hoa, Kệ Hoa Chúc Mừng...' : 'VD: 500k - 1000k, Dưới 500k, Trên 2000k...'}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                {/* Slug */}
                <div className="admin-form-group">
                  <label className="admin-label">Đường dẫn Slug (Tự động tạo nếu để trống)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="VD: bo-hoa, 500k-1000k"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                  />
                </div>

                {/* Sort Order & Active */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-label">Thứ tự hiển thị</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Trạng thái hiển thị</label>
                    <select
                      className="admin-select"
                      value={formIsActive}
                      onChange={(e) => setFormIsActive(Number(e.target.value))}
                    >
                      <option value={1}>Hiển thị công khai</option>
                      <option value={0}>Ẩn khỏi website</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="admin-form-group">
                  <label className="admin-label">Mô tả ngắn</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    placeholder="Mô tả danh mục hiển thị cho SEO hoặc khách hàng..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-outline">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
                  {saving ? 'Đang lưu...' : (editingId ? 'Cập Nhật' : 'Tạo Danh Mục')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chặn Xóa Khi Đang Có Sản Phẩm */}
      {blockModalOpen && blockedCategory && (
        <div 
          className="admin-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setBlockModalOpen(false);
              setBlockedCategory(null);
            }
          }}
        >
          <div ref={blockModalRef} role="alertdialog" aria-modal="true" className="admin-modal" style={{ maxWidth: '480px', borderTop: '4px solid #E53E3E' }}>
            <div className="admin-modal-header" style={{ alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FED7D7', color: '#C53030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  <ExclamationCircleOutlined />
                </div>
                <div>
                  <h3 className="admin-modal-title" style={{ color: '#C53030' }}>
                    Không Thể Xóa Danh Mục
                  </h3>
                  <div style={{ fontSize: '13px', color: '#718287' }}>Quy tắc bảo vệ dữ liệu sản phẩm</div>
                </div>
              </div>
              <button
                onClick={() => { setBlockModalOpen(false); setBlockedCategory(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="admin-modal-body" style={{ fontSize: '14px', lineHeight: 1.6, color: '#4A5568' }}>
              <p style={{ margin: '0 0 12px' }}>
                Danh mục <strong>"{blockedCategory.name}"</strong> hiện đang liên kết với{' '}
                <span style={{ fontWeight: 700, color: '#E53E3E' }}>
                  {blockedCategory.total_product_count || blockedCategory.direct_product_count} sản phẩm
                </span>.
              </p>
              <div style={{ background: '#FFF5F5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FED7D7', fontSize: '13px' }}>
                ⚠️ <strong>Hệ thống không cho phép xóa</strong> để tránh làm mất danh mục của các sản phẩm đang bán. Thay vào đó, bạn có thể <strong>Ẩn danh mục</strong> này để khách hàng không nhìn thấy trên website.
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => { setBlockModalOpen(false); setBlockedCategory(null); }}
                className="admin-btn admin-btn-outline"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={async () => {
                  const catToToggle = blockedCategory;
                  setBlockModalOpen(false);
                  setBlockedCategory(null);
                  if (catToToggle.is_active === 1) {
                    await handleToggleActive(catToToggle);
                  }
                }}
                className="admin-btn admin-btn-primary"
                style={{ background: '#DD6B20', borderColor: '#DD6B20' }}
              >
                <EyeInvisibleOutlined /> Chuyển Sang Ẩn Danh Mục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
