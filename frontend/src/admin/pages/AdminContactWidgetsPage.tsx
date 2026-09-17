import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MessageOutlined,
  FacebookOutlined,
  InstagramOutlined,
  CheckCircleOutlined,
  StopOutlined,
  LinkOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import '../admin.css';
import { RealSocialIcon } from '../../components/RealSocialIcons';

export type PlatformType = 'zalo' | 'facebook' | 'instagram' | 'phone';

export interface ContactWidgetItem {
  id: number;
  platform_type: PlatformType;
  title: string;
  subtitle: string | null;
  action_link: string;
  sort_order: number;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
}

const PLATFORMS: Array<{
  value: PlatformType;
  label: string;
  color: string;
  bgGradient: string;
  defaultSubtitle: string;
  placeholderUrl: string;
}> = [
  {
    value: 'zalo',
    label: 'Zalo Chat',
    color: '#0068FF',
    bgGradient: 'linear-gradient(135deg, #0068FF 0%, #004ecc 100%)',
    defaultSubtitle: 'Tư vấn mẫu hoa & Báo giá nhanh',
    placeholderUrl: 'https://zalo.me/0862926866'
  },
  {
    value: 'facebook',
    label: 'Facebook Messenger',
    color: '#0084FF',
    bgGradient: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
    defaultSubtitle: 'Nhắn tin qua Fanpage',
    placeholderUrl: 'https://m.me/ngheflorist'
  },
  {
    value: 'instagram',
    label: 'Instagram Direct',
    color: '#E1306C',
    bgGradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    defaultSubtitle: 'Xem album ảnh & Đặt hoa',
    placeholderUrl: 'https://instagram.com/ngheflorist'
  },
  {
    value: 'phone',
    label: 'Hotline Gọi Nhanh',
    color: '#10B981',
    bgGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    defaultSubtitle: 'Hỗ trợ giao hoa hỏa tốc 24/7',
    placeholderUrl: 'tel:0862926866'
  }
];

export default function AdminContactWidgetsPage() {
  const { token } = useAdminAuth();
  const [widgets, setWidgets] = useState<ContactWidgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<ContactWidgetItem | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    platform_type: 'zalo' as PlatformType,
    title: '',
    subtitle: '',
    action_link: '',
    sort_order: 0,
    is_active: true
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchWidgets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/contact-widgets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWidgets(data);
      } else {
        showToast('error', 'Lỗi tải danh sách nút tư vấn');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWidgets();
  }, []);

  const openAddModal = () => {
    setEditingWidget(null);
    setFormData({
      platform_type: 'zalo',
      title: 'Chat Zalo: 0862 926 866',
      subtitle: 'Tư vấn mẫu hoa & Báo giá nhanh',
      action_link: 'https://zalo.me/0862926866',
      sort_order: widgets.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (w: ContactWidgetItem) => {
    setEditingWidget(w);
    setFormData({
      platform_type: w.platform_type,
      title: w.title,
      subtitle: w.subtitle || '',
      action_link: w.action_link,
      sort_order: w.sort_order,
      is_active: Boolean(w.is_active)
    });
    setModalOpen(true);
  };

  const handlePlatformChange = (newPlatform: PlatformType) => {
    const config = PLATFORMS.find(p => p.value === newPlatform);
    setFormData(prev => ({
      ...prev,
      platform_type: newPlatform,
      subtitle: prev.subtitle || config?.defaultSubtitle || '',
      action_link: prev.action_link ? prev.action_link : (config?.placeholderUrl || '')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.action_link.trim()) {
      showToast('error', 'Vui lòng nhập đầy đủ tiêu đề và link hành động');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingWidget
        ? `/api/admin/contact-widgets/${editingWidget.id}`
        : '/api/admin/contact-widgets';
      const method = editingWidget ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const resData = await res.json();
      if (res.ok) {
        showToast('success', editingWidget ? 'Cập nhật nút tư vấn thành công!' : 'Thêm nút tư vấn mới thành công!');
        setModalOpen(false);
        fetchWidgets();
      } else {
        showToast('error', resData.error || 'Thao tác không thành công');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/contact-widgets/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('success', 'Đã cập nhật trạng thái hiển thị');
        setWidgets(prev =>
          prev.map(w => (w.id === id ? { ...w, is_active: !w.is_active } : w))
        );
      } else {
        showToast('error', 'Không thể đổi trạng thái');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nút tư vấn "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/contact-widgets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('success', 'Đã xóa nút tư vấn thành công');
        setWidgets(prev => prev.filter(w => w.id !== id));
      } else {
        showToast('error', 'Lỗi khi xóa');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi kết nối máy chủ');
    }
  };

  const renderPlatformBadge = (platform: PlatformType) => {
    switch (platform) {
      case 'zalo':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px', borderRadius: 8, backgroundColor: '#EFF6FF', color: '#0068FF', fontWeight: 700, fontSize: 13 }}>
            <RealSocialIcon platform="zalo" size={20} />
            Zalo
          </span>
        );
      case 'facebook':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px', borderRadius: 8, backgroundColor: '#F0F7FF', color: '#1877F2', fontWeight: 700, fontSize: 13 }}>
            <RealSocialIcon platform="facebook" size={20} />
            Messenger
          </span>
        );
      case 'instagram':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px', borderRadius: 8, backgroundColor: '#FDF2F8', color: '#E1306C', fontWeight: 700, fontSize: 13 }}>
            <RealSocialIcon platform="instagram" size={20} />
            Instagram
          </span>
        );
      case 'phone':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px', borderRadius: 8, backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: 13 }}>
            <RealSocialIcon platform="phone" size={20} />
            Điện Thoại
          </span>
        );
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#26383D', margin: 0 }}>
            Quản Lý Nút Tư Vấn Nhanh (Contact Widgets)
          </h1>
          <p style={{ fontSize: '14px', color: '#718287', marginTop: 4, margin: 0 }}>
            Cấu hình danh sách các kênh kết nối nổi góc phải màn hình Storefront (Zalo, Messenger, Instagram, Hotline)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            onClick={fetchWidgets}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 10,
              border: '1.5px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#94A3B8';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
            title="Tải lại dữ liệu"
          >
            <ReloadOutlined spin={loading} style={{ fontSize: 14 }} />
            <span>Làm Mới</span>
          </button>
          <button
            type="button"
            onClick={openAddModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(2, 132, 199, 0.45)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.35)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <PlusOutlined style={{ fontSize: 14, fontWeight: 900 }} />
            <span>Thêm Nút Tư Vấn</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 14,
          fontWeight: 600,
          backgroundColor: notification.type === 'success' ? '#DEF7EC' : '#FDE8E8',
          color: notification.type === 'success' ? '#03543F' : '#9B1C1C',
          border: `1px solid ${notification.type === 'success' ? '#BCF0DA' : '#FBD5D5'}`
        }}>
          {notification.message}
        </div>
      )}

      {/* Overview Tips */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 20,
        border: '1px solid #E4EEF1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0068FF', fontSize: 20 }}>
            <MessageOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#1E293B', fontSize: 14 }}>
              Cơ chế hiển thị trên Storefront:
            </div>
            <div style={{ color: '#64748B', fontSize: 13, marginTop: 2 }}>
              Các nút có trạng thái <strong style={{ color: '#10B981' }}>BẬT</strong> sẽ tự động gom thành menu popover tốc độ cao ở góc dưới bên phải màn hình người dùng.
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#718287', backgroundColor: '#F8FAFC', padding: '6px 12px', borderRadius: 20, fontWeight: 600 }}>
          Đang kích hoạt: {widgets.filter(w => Boolean(w.is_active)).length} / {widgets.length} nút
        </div>
      </div>

      {/* Widgets Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        boxShadow: '0 4px 20px rgba(93, 158, 175, 0.06)',
        border: '1px solid #E4EEF1',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '14px 18px', width: 70 }}>Thứ tự</th>
                <th style={{ padding: '14px 18px', width: 140 }}>Nền Tảng</th>
                <th style={{ padding: '14px 18px' }}>Tiêu Đề & Mô Tả</th>
                <th style={{ padding: '14px 18px' }}>Link Hành Động / URL</th>
                <th style={{ padding: '14px 18px', width: 120, textAlign: 'center' }}>Trạng Thái</th>
                <th style={{ padding: '14px 18px', width: 130, textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                    Đang tải danh sách nút tư vấn...
                  </td>
                </tr>
              ) : widgets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                    Chưa có nút tư vấn nào được tạo. Hãy bấm "Thêm Nút Tư Vấn" ở góc trên.
                  </td>
                </tr>
              ) : (
                widgets.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FCFDFD',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#64748B' }}>
                      #{item.sort_order}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {renderPlatformBadge(item.platform_type)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#1E293B', fontSize: 14 }}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                          {item.subtitle}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <a
                        href={item.action_link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#0068FF',
                          fontSize: 13,
                          textDecoration: 'none',
                          maxWidth: 280,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={item.action_link}
                      >
                        <LinkOutlined style={{ fontSize: 12, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.action_link}
                        </span>
                      </a>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id)}
                        style={{
                          border: `1px solid ${item.is_active ? '#86EFAC' : '#E2E8F0'}`,
                          cursor: 'pointer',
                          padding: '6px 14px',
                          borderRadius: 9999,
                          fontSize: 12.5,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: item.is_active ? '#DCFCE7' : '#F1F5F9',
                          color: item.is_active ? '#15803D' : '#64748B',
                          boxShadow: item.is_active ? '0 2px 6px rgba(22, 163, 74, 0.12)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        title="Bấm để bật/tắt nhanh"
                      >
                        {item.is_active ? <CheckCircleOutlined style={{ fontSize: 13 }} /> : <StopOutlined style={{ fontSize: 13 }} />}
                        <span>{item.is_active ? 'Đang Bật' : 'Tạm Tắt'}</span>
                      </button>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '7px 12px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            borderRadius: 8,
                            border: '1px solid #BFDBFE',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#DBEAFE';
                            e.currentTarget.style.borderColor = '#93C5FD';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = '#EFF6FF';
                            e.currentTarget.style.borderColor = '#BFDBFE';
                          }}
                          title="Chỉnh sửa thông tin nút"
                        >
                          <EditOutlined style={{ fontSize: 13 }} />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '7px 12px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            borderRadius: 8,
                            border: '1px solid #FECACA',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#FEE2E2';
                            e.currentTarget.style.borderColor = '#FCA5A5';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                            e.currentTarget.style.borderColor = '#FECACA';
                          }}
                          title="Xóa nút này"
                        >
                          <DeleteOutlined style={{ fontSize: 13 }} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            animation: 'fadeInUp 0.2s ease-out'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC'
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1E293B', margin: 0 }}>
                {editingWidget ? 'Chỉnh Sửa Nút Tư Vấn' : 'Thêm Nút Tư Vấn Mới'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 16,
                  color: '#64748B'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              {/* Platform Selector */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-label" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
                  Nền Tảng Kết Nối:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {PLATFORMS.map(p => {
                    const isSelected = formData.platform_type === p.value;
                    return (
                      <div
                        key={p.value}
                        onClick={() => handlePlatformChange(p.value)}
                        style={{
                          border: `2px solid ${isSelected ? p.color : '#E2E8F0'}`,
                          borderRadius: 10,
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <RealSocialIcon platform={p.value} size={24} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: isSelected ? 800 : 600, color: isSelected ? '#0F172A' : '#64748B' }}>
                          {p.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-label" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
                  Tiêu Đề Nút (Title): *
                </label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  placeholder="vd: Chat Zalo 1: 0862 926 866"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Subtitle */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-label" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
                  Mô Tả Phụ (Subtitle):
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="vd: Tư vấn mẫu hoa & Báo giá nhanh"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              {/* Action Link */}
              <div className="admin-form-group" style={{ marginBottom: 16 }}>
                <label className="admin-label" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
                  Link Hành Động (URL hoặc Số Điện Thoại): *
                </label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  placeholder={PLATFORMS.find(p => p.value === formData.platform_type)?.placeholderUrl || 'https://...'}
                  value={formData.action_link}
                  onChange={e => setFormData({ ...formData, action_link: e.target.value })}
                />
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                  {formData.platform_type === 'zalo' && 'Định dạng: https://zalo.me/so_dien_thoai'}
                  {formData.platform_type === 'phone' && 'Định dạng: tel:so_dien_thoai (vd: tel:0862926866)'}
                  {formData.platform_type === 'facebook' && 'Định dạng: https://m.me/ten_fanpage hoặc link Facebook'}
                  {formData.platform_type === 'instagram' && 'Định dạng: https://instagram.com/ten_trang'}
                </div>
              </div>

              {/* Sort Order & Active */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label className="admin-label" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
                    Thứ Tự Hiển Thị:
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="admin-input"
                    value={formData.sort_order}
                    onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label className="admin-label" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
                    Kích Hoạt:
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: '#0068FF' }}
                    />
                    Hiển thị trên website
                  </label>
                </div>
              </div>

              {/* Live Preview Box */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                padding: '12px 16px',
                border: '1px dashed #CBD5E1',
                marginBottom: 20
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>
                  Xem trước nút hiển thị:
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: PLATFORMS.find(p => p.value === formData.platform_type)?.bgGradient || '#0068FF',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  padding: '10px 14px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <RealSocialIcon platform={formData.platform_type} size={32} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>
                      {formData.title || 'Tiêu đề nút tư vấn'}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>
                      {formData.subtitle || 'Mô tả ngắn bên dưới'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 12,
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid #E2E8F0'
              }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 22px',
                    borderRadius: 10,
                    border: '1.5px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 26px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                    opacity: submitting ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    minWidth: 140
                  }}
                  onMouseEnter={e => {
                    if (!submitting) {
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(2, 132, 199, 0.45)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.35)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {submitting ? 'Đang Lưu...' : editingWidget ? 'Lưu Thay Đổi' : 'Tạo Nút Tư Vấn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
