import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { 
  DeleteOutlined, 
  MenuOutlined, 
  SaveOutlined, 
  EditOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckOutlined,
  CloseOutlined,
  GlobalOutlined,
  MessageOutlined,
  InstagramOutlined,
  PhoneOutlined,
  CopyrightOutlined,
  EyeOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

interface MenuItem {
  id: number;
  label: string;
  url: string;
  sort_order: number;
  is_active: number;
}

interface FooterConfig {
  brand_desc: string;
  facebook: string;
  instagram: string;
  zalo: string;
  hotline?: string;
  address?: string;
  copyright: string;
}

export default function AdminNavigationCmsPage() {
  const { token } = useAdminAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    brand_desc: '',
    facebook: '',
    instagram: '',
    zalo: '',
    hotline: '0862 926 866',
    address: 'Toàn quốc & TP. Hồ Chí Minh',
    copyright: '© 2026 Nghệ Florist. Tất cả các quyền được bảo lưu.'
  });

  const [activeTab, setActiveTab] = useState<'both' | 'menu' | 'footer'>('both');
  const [loading, setLoading] = useState(true);
  const [savingFooter, setSavingFooter] = useState(false);
  const [footerToast, setFooterToast] = useState('');

  // Add form state
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSortOrder, setNewSortOrder] = useState<number>(1);

  // Edit inline state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(1);

  const fetchNavData = async () => {
    try {
      setLoading(true);
      const [mRes, sRes] = await Promise.all([
        fetch('/api/admin/menu', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (mRes.ok) {
        const mData = await mRes.json();
        setMenuItems(mData);
        setNewSortOrder(mData.length + 1);
      }
      if (sRes.ok) {
        const s = await sRes.json();
        if (s.footerConfig) {
          setFooterConfig(prev => ({ ...prev, ...s.footerConfig }));
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavData();
  }, [token]);

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) return;

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          label: newLabel.trim(), 
          url: newUrl.trim(), 
          sort_order: Number(newSortOrder) || (menuItems.length + 1),
          is_active: 1
        })
      });

      if (res.ok) {
        setNewLabel('');
        setNewUrl('');
        fetchNavData();
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi thêm menu');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleStartEdit = (m: MenuItem) => {
    setEditingId(m.id);
    setEditLabel(m.label);
    setEditUrl(m.url);
    setEditSortOrder(m.sort_order);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editLabel.trim() || !editUrl.trim()) return;
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          label: editLabel.trim(),
          url: editUrl.trim(),
          sort_order: Number(editSortOrder)
        })
      });

      if (res.ok) {
        setEditingId(null);
        fetchNavData();
      } else {
        alert('Lỗi cập nhật menu');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const handleToggleActive = async (m: MenuItem) => {
    try {
      const newActive = m.is_active ? 0 : 1;
      const res = await fetch(`/api/admin/menu/${m.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newActive })
      });
      if (res.ok) fetchNavData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorder = async (m: MenuItem, direction: 'up' | 'down') => {
    const currentIndex = menuItems.findIndex(item => item.id === m.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= menuItems.length) return;

    const targetItem = menuItems[targetIndex];
    try {
      await Promise.all([
        fetch(`/api/admin/menu/${m.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sort_order: targetItem.sort_order })
        }),
        fetch(`/api/admin/menu/${targetItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sort_order: m.sort_order })
        })
      ]);
      fetchNavData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa mục menu này khỏi thanh điều hướng?')) return;
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchNavData();
    } catch (err) {
      alert('Lỗi xóa menu');
    }
  };

  const handleApplyPreset = (label: string, url: string) => {
    setNewLabel(label);
    setNewUrl(url);
  };

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
        body: JSON.stringify({ footerConfig })
      });
      if (res.ok) {
        setFooterToast('✓ Đã lưu cấu hình chân trang thành công!');
        setTimeout(() => setFooterToast(''), 4000);
      } else {
        alert('Lỗi lưu chân trang');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSavingFooter(false);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header & View Mode Switcher */}
      <div className="admin-page-header" style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 className="admin-page-title" style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MenuOutlined style={{ color: 'var(--admin-primary)' }} />
            Quản Lý Menu Header & Chân Trang Footer
          </h1>
          <div className="admin-page-subtitle">
            Tùy biến liên kết thanh điều hướng chính và thông tin thương hiệu, hotline, mạng xã hội ở chân trang
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
            onClick={() => setActiveTab('menu')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'menu' ? '#fff' : 'transparent',
              color: activeTab === 'menu' ? 'var(--admin-primary-dark)' : 'var(--admin-text-secondary)',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: activeTab === 'menu' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <MenuOutlined /> Menu Header ({menuItems.length})
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
            <GlobalOutlined /> Chân trang Footer
          </button>
        </div>
      </div>

      {/* Main Grid Container */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: activeTab === 'both' ? 'repeat(auto-fit, minmax(460px, 1fr))' : '1fr', 
          gap: 24,
          alignItems: 'start'
        }}
      >
        {/* ======================================================== */}
        {/* COLUMN 1: HEADER MENU NAVIGATION */}
        {/* ======================================================== */}
        {(activeTab === 'both' || activeTab === 'menu') && (
          <div className="admin-card" style={{ padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--admin-text)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-primary)' }} />
                Menu Điều Hướng Chính (Header)
              </h3>
              <span className="admin-badge badge-info">{menuItems.length} liên kết</span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
              Các mục hiển thị trên thanh menu đầu trang website. Kéo xếp theo thứ tự ưu tiên từ trái sang phải.
            </p>

            {/* Menu Items Table */}
            <div className="admin-table-container" style={{ marginBottom: 20 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 64, textAlign: 'center' }}>Thứ tự</th>
                    <th style={{ minWidth: 140 }}>Tên hiển thị</th>
                    <th style={{ minWidth: 150 }}>Đường dẫn (URL)</th>
                    <th style={{ width: 100, textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ width: 120, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((m, idx) => {
                    const isEditing = editingId === m.id;
                    return (
                      <tr key={m.id} style={{ background: isEditing ? '#F0F9FF' : undefined }}>
                        {/* Sort Order */}
                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          {isEditing ? (
                            <input
                              type="number"
                              className="admin-input"
                              style={{ width: 50, padding: '4px 6px', textAlign: 'center' }}
                              value={editSortOrder}
                              onChange={e => setEditSortOrder(Number(e.target.value))}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', width: 18 }}>{m.sort_order}</span>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleReorder(m, 'up')}
                                  style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 0.7, padding: 1, fontSize: 10 }}
                                  title="Di chuyển lên"
                                >
                                  <ArrowUpOutlined />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === menuItems.length - 1}
                                  onClick={() => handleReorder(m, 'down')}
                                  style={{ border: 'none', background: 'none', cursor: idx === menuItems.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === menuItems.length - 1 ? 0.3 : 0.7, padding: 1, fontSize: 10 }}
                                  title="Di chuyển xuống"
                                >
                                  <ArrowDownOutlined />
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Label */}
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className="admin-input"
                              value={editLabel}
                              onChange={e => setEditLabel(e.target.value)}
                              style={{ padding: '6px 10px', fontSize: '0.88rem' }}
                            />
                          ) : (
                            <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{m.label}</div>
                          )}
                        </td>

                        {/* URL */}
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              className="admin-input"
                              value={editUrl}
                              onChange={e => setEditUrl(e.target.value)}
                              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                            />
                          ) : (
                            <code style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: 4, fontSize: '0.82rem', color: '#0369A1' }}>
                              {m.url}
                            </code>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(m)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: 12,
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            className={m.is_active ? 'admin-badge badge-success' : 'admin-badge badge-danger'}
                            title="Bấm để bật/tắt hiển thị"
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.is_active ? '#16A34A' : '#DC2626' }} />
                            {m.is_active ? 'Hiện' : 'Ẩn'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          {isEditing ? (
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(m.id)}
                                className="admin-btn admin-btn-primary"
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                              >
                                <CheckOutlined /> Lưu
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                              >
                                <CloseOutlined />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(m)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                title="Chỉnh sửa mục này"
                              >
                                <EditOutlined />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMenuItem(m.id)}
                                className="admin-btn admin-btn-outline"
                                style={{ padding: '4px 8px', fontSize: '12px', color: '#DC2626', borderColor: '#FECACA' }}
                                title="Xóa mục này"
                              >
                                <DeleteOutlined />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--admin-text-secondary)', fontWeight: 700, marginBottom: 8 }}>
                Gợi ý thêm nhanh mục phổ biến:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <button 
                  type="button" 
                  onClick={() => handleApplyPreset('Tất cả hoa', '/flowers')}
                  style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', color: '#0369A1', padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Tất cả hoa
                </button>
                <button 
                  type="button" 
                  onClick={() => handleApplyPreset('Cắm hoa theo yêu cầu', '/custom-order')}
                  style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Thiết kế riêng
                </button>
                <button 
                  type="button" 
                  onClick={() => handleApplyPreset('Về Nghệ Florist', '/about')}
                  style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', color: '#7E22CE', padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Về chúng tôi
                </button>
                <button 
                  type="button" 
                  onClick={() => handleApplyPreset('Chính sách giao hàng', '/policy')}
                  style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#B45309', padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Chính sách
                </button>
                <button 
                  type="button" 
                  onClick={() => handleApplyPreset('Quy trình đặt hoa', '/order-guide')}
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  + Quy trình đặt hoa
                </button>
              </div>
            </div>

            {/* Add Menu Item Form */}
            <form 
              onSubmit={handleAddMenuItem} 
              style={{ 
                padding: '18px', 
                backgroundColor: '#F7FBFC', 
                borderRadius: '10px', 
                border: '1.5px dashed #CBD5E1' 
              }}
            >
              <div style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>
                + Thêm mục menu mới
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="admin-label">Tên hiển thị trên Menu *</label>
                  <input
                    type="text"
                    className="admin-input"
                    required
                    placeholder="VD: Hoa Tươi Thiết Kế"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-label">Đường dẫn URL *</label>
                  <input
                    type="text"
                    className="admin-input"
                    required
                    placeholder="VD: /category/bo-hoa hoặc /flowers"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ width: 120 }}>
                  <label className="admin-label">Thứ tự (STT)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={newSortOrder}
                    onChange={(e) => setNewSortOrder(Number(e.target.value))}
                  />
                </div>

                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary"
                  style={{ padding: '10px 24px', fontWeight: 700 }}
                >
                  Thêm Vào Menu
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* COLUMN 2: FOOTER CONFIGURATION */}
        {/* ======================================================== */}
        {(activeTab === 'both' || activeTab === 'footer') && (
          <div className="admin-card" style={{ padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--admin-text)' }}>
                <GlobalOutlined style={{ color: 'var(--admin-primary)' }} />
                Cấu Hình Chân Trang (Footer)
              </h3>
              <span className="admin-badge badge-info">CMS Chân Trang</span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-secondary)', margin: '0 0 18px', lineHeight: 1.5 }}>
              Nội dung chân website bao gồm câu chuyện thương hiệu, đường dẫn kênh tư vấn (Zalo 1, Zalo 2) và thông tin bản quyền.
            </p>

            {footerToast && (
              <div style={{ padding: '10px 14px', background: '#F0FDF4', color: '#15803D', borderRadius: 8, border: '1px solid #BBF7D0', marginBottom: 16, fontSize: '0.88rem', fontWeight: 600 }}>
                {footerToast}
              </div>
            )}

            <form onSubmit={handleSaveFooter}>
              {/* Brand description */}
              <div className="admin-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="admin-label" style={{ margin: 0 }}>Lời giới thiệu thương hiệu ở chân trang</label>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{footerConfig.brand_desc?.length || 0} ký tự</span>
                </div>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  placeholder="Nghệ Florist mang đến những tác phẩm hoa tươi nghệ thuật, tinh tế và tràn đầy cảm xúc..."
                  value={footerConfig.brand_desc}
                  onChange={(e) => setFooterConfig({ ...footerConfig, brand_desc: e.target.value })}
                  style={{ lineHeight: 1.6 }}
                />
              </div>

              {/* Social Channels */}
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 18 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
                  Kênh Chuyển Đổi & Tư Vấn Khách Hàng
                </div>

                <div className="admin-form-group" style={{ marginBottom: 12 }}>
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#0068FF', fontWeight: 700 }}>Zalo</span> Tư vấn báo giá (Primary)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="https://zalo.me/0862926866"
                    value={footerConfig.zalo}
                    onChange={(e) => setFooterConfig({ ...footerConfig, zalo: e.target.value })}
                  />
                </div>

                <div className="admin-form-group" style={{ marginBottom: 12 }}>
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageOutlined style={{ color: '#0284C7' }} /> Kênh Zalo Hotline 2 (0862 926 866)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="https://zalo.me/0862926866"
                    value={footerConfig.facebook}
                    onChange={(e) => setFooterConfig({ ...footerConfig, facebook: e.target.value })}
                  />
                </div>

                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <InstagramOutlined style={{ color: '#E1306C' }} /> Kênh Instagram
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="https://instagram.com/ngheflorist"
                    value={footerConfig.instagram}
                    onChange={(e) => setFooterConfig({ ...footerConfig, instagram: e.target.value })}
                  />
                </div>
              </div>

              {/* Hotline & Copyright */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
                <div>
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <PhoneOutlined style={{ color: '#16A34A' }} /> Hotline tư vấn
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="0862 926 866"
                    value={footerConfig.hotline || ''}
                    onChange={(e) => setFooterConfig({ ...footerConfig, hotline: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CopyrightOutlined /> Dòng bản quyền (Copyright)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="© 2026 Nghệ Florist. Tất cả các quyền được bảo lưu."
                    value={footerConfig.copyright}
                    onChange={(e) => setFooterConfig({ ...footerConfig, copyright: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={savingFooter} 
                className="admin-btn admin-btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.95rem', fontWeight: 700 }}
              >
                <SaveOutlined /> {savingFooter ? 'Đang lưu cấu hình...' : 'Lưu Cấu Hình Chân Trang'}
              </button>
            </form>

            {/* Mini Footer Preview */}
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <EyeOutlined /> Xem trước chân trang (Preview):
              </div>
              <div style={{ background: '#26383D', color: '#E2E8F0', padding: 18, borderRadius: 10, fontSize: '0.82rem', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: 6 }}>NGHỆ FLORIST</div>
                <div style={{ color: '#94A3B8', marginBottom: 12 }}>
                  {footerConfig.brand_desc || 'Mô tả tiệm hoa nghệ thuật...'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: '#BAE6FD', fontWeight: 600 }}>
                  <span>✦ Zalo: {footerConfig.zalo || 'https://zalo.me/...'}</span>
                  <span>✦ Hotline: {footerConfig.hotline || '0862 926 866'}</span>
                </div>
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', color: '#64748B', fontSize: '0.75rem' }}>
                  {footerConfig.copyright || '© 2026 Nghệ Florist.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
