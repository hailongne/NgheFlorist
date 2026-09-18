import React, { useEffect, useState, useRef } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { DeleteOutlined, EditOutlined, UploadOutlined, LoadingOutlined, CloseOutlined, PictureOutlined } from '@ant-design/icons';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import { handleNumberFocus, handleNumberKeyDown, handleNumberChange } from '../../utils/numberInput';

interface BannerItem {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  cta_text?: string;
  cta_url?: string;
  sort_order: number;
  is_active: number;
}

export default function AdminBannersPage() {
  const { token } = useAdminAuth();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  const bannerModalRef = useRef<HTMLDivElement>(null);

  useOverlayLock({
    overlayId: 'admin-banner-modal',
    isOpen: modalOpen,
    onClose: () => setModalOpen(false),
    containerRef: bannerModalRef,
    priority: 10
  });

  // Form inputs
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('Khám phá ngay');
  const [ctaUrl, setCtaUrl] = useState('/flowers');
  const [sortOrder, setSortOrder] = useState<number | ''>(0);

  // Image upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBanners(await res.json());
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [token]);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setCtaText('Khám phá ngay');
    setCtaUrl('/flowers');
    setSortOrder(banners.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setImageUrl(banner.image_url);
    setCtaText(banner.cta_text || 'Khám phá ngay');
    setCtaUrl(banner.cta_url || '/flowers');
    setSortOrder(banner.sort_order || 0);
    setModalOpen(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Dung lượng ảnh tối đa là 10MB.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.file?.url) {
        setImageUrl(data.file.url);
      } else {
        const fbRes = await fetch('/api/customer-requests/upload-attachment', {
          method: 'POST',
          body: formData
        });
        const fbData = await fbRes.json();
        const fbUrl = fbData.fileUrl || fbData.url;
        if (fbRes.ok && fbUrl) {
          setImageUrl(fbUrl);
        } else {
          throw new Error(data.error || 'Lỗi tải ảnh lên máy chủ');
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Không thể tải ảnh lên máy chủ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmitBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      alert('Vui lòng nhập tiêu đề và tải ảnh banner');
      return;
    }

    try {
      const isEdit = !!editingBanner;
      const url = isEdit ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          image_url: imageUrl.trim(),
          cta_text: ctaText.trim(),
          cta_url: ctaUrl.trim(),
          sort_order: Number(sortOrder) || 0,
          is_active: 1
        })
      });

      if (res.ok) {
        setModalOpen(false);
        fetchBanners();
      } else {
        const d = await res.json();
        alert(d.error || (isEdit ? 'Lỗi cập nhật banner' : 'Lỗi thêm banner'));
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchBanners();
    } catch (err) {
      alert('Lỗi xóa banner');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Banners Quảng Cáo (Homepage Banners)</h1>
          <div className="admin-page-subtitle">
            Các banner giới thiệu chiến dịch sự kiện, bộ sưu tập mùa yêu thương, khai trương tại trang chủ
          </div>
        </div>
        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          Thêm Banner Mới
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#5D9EAF' }}>Đang tải danh sách banners...</div>
      ) : banners.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: 48, color: '#64748B' }}>
          Chưa có banner nào. Hãy bấm <b>"Thêm Banner Mới"</b> để tạo banner đầu tiên.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {banners.map(b => (
            <div key={b.id} className="admin-card" style={{ padding: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '12px' }}>
              <div style={{ position: 'relative', aspectRatio: '16 / 9', width: '100%', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px', backgroundColor: '#F8FAFC' }}>
                {b.image_url ? (
                  <ImageWithFallback src={b.image_url} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 6,
                    backgroundColor: '#F8FAFC',
                    border: '1.5px dashed #CBD5E1',
                    borderRadius: '8px',
                    color: '#64748B'
                  }}>
                    <PictureOutlined style={{ fontSize: 32, color: '#94A3B8' }} />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>Chưa có hình ảnh banner</span>
                    <button
                      type="button"
                      onClick={() => openEditModal(b)}
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '4px 12px', fontSize: '12px', borderRadius: 6, marginTop: 4 }}
                    >
                      + Tải ảnh lên
                    </button>
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  Thứ tự: {b.sort_order}
                </div>
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: '#26383D' }}>{b.title}</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#718287', flex: 1 }}>{b.subtitle || 'Không có phụ đề'}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E4EEF1', paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#5D9EAF', fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.cta_url || '/flowers'}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openEditModal(b)}
                    className="admin-btn admin-btn-outline"
                    style={{ padding: '6px 12px', fontSize: '12px', color: '#5D9EAF', borderColor: '#5D9EAF' }}
                  >
                    <EditOutlined /> Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="admin-btn admin-btn-outline"
                    style={{ padding: '6px 12px', fontSize: '12px', color: '#E06060', borderColor: '#FECACA' }}
                  >
                    <DeleteOutlined /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal (Add / Edit) */}
      {modalOpen && (
        <div 
          className="admin-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div ref={bannerModalRef} role="dialog" aria-modal="true" aria-label="Quản lý banner" className="admin-modal" style={{ maxWidth: '560px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingBanner ? `Sửa Banner #${editingBanner.id}` : 'Thêm Banner Mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                <CloseOutlined />
              </button>
            </div>

            <form onSubmit={handleSubmitBanner}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-label">Tiêu đề banner *</label>
                  <input
                    type="text"
                    className="admin-input"
                    required
                    placeholder="VD: Mùa Yêu Thương — Trao Gửi Ngọt Ngào"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Phụ đề mô tả</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="VD: BST Hoa hồng Ecuador & Baby Hà Lan thiết kế tinh xảo"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
                </div>

                {/* Image upload & preview */}
                <div className="admin-form-group">
                  <label className="admin-label">Ảnh Banner (Tỉ lệ chuẩn ngang 5:4, VD: 1000x800px hoặc 1250x1000px) *</label>
                  
                  {/* Hidden input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    style={{ display: 'none' }}
                    onChange={handleUploadImage}
                  />

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="btn btn-outline"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#5D9EAF',
                        borderColor: '#5D9EAF',
                        backgroundColor: '#fff',
                        cursor: uploading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {uploading ? <LoadingOutlined spin /> : <UploadOutlined />}
                      {uploading ? 'Đang tải lên...' : 'Tải ảnh từ máy tính lên Supabase'}
                    </button>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>hoặc dán đường dẫn trực tiếp</span>
                  </div>

                  <input
                    type="text"
                    className="admin-input"
                    required
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />

                  {imageUrl && (
                    <div style={{ marginTop: 10, aspectRatio: '5 / 4', maxWidth: '280px', margin: '10px auto 0', borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
                      <ImageWithFallback src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="admin-form-group">
                    <label className="admin-label">Chữ trên nút bấm</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Đường dẫn khi bấm</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Thứ tự hiển thị (Số nhỏ đứng trước)</label>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="0"
                    value={sortOrder}
                    onFocus={handleNumberFocus}
                    onKeyDown={handleNumberKeyDown}
                    onChange={(e) => handleNumberChange(e, setSortOrder)}
                    onBlur={() => { if (sortOrder === '') setSortOrder(0); }}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-outline">
                  Hủy
                </button>
                <button type="submit" disabled={uploading} className="admin-btn admin-btn-primary">
                  {editingBanner ? 'Lưu Thay Đổi' : 'Thêm Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
