import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import {
  CopyOutlined,
  DeleteOutlined,
  CheckOutlined,
  SearchOutlined,
  CloseCircleFilled,
  InfoCircleOutlined,
  EyeOutlined,
  TagOutlined,
  PictureOutlined,
  AppstoreOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  ShopOutlined,
  DesktopOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useOverlayLock } from '../../hooks/useOverlayLock';

export interface MediaUsageRef {
  type: 'product' | 'banner' | 'collection' | 'cms_page' | 'settings' | 'lead';
  id?: number | string;
  name: string;
  detail?: string;
}

export interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  created_at: string;
  is_used?: boolean;
  usage_count?: number;
  usages?: MediaUsageRef[];
}

export interface MediaCounts {
  total: number;
  used: number;
  unused: number;
  product: number;
  banner: number;
}

export default function AdminMediaPage() {
  const { token } = useAdminAuth();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [counts, setCounts] = useState<MediaCounts>({
    total: 0,
    used: 0,
    unused: 0,
    product: 0,
    banner: 0
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'all' | 'unused' | 'used' | 'product' | 'banner'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size_desc' | 'size_asc' | 'used_desc'>('newest');

  // Usage Modal for Mobile / Deep View
  const [selectedUsageFile, setSelectedUsageFile] = useState<MediaFile | null>(null);
  const usageModalRef = useRef<HTMLDivElement>(null);

  // Preview zoom image
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const previewModalRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useOverlayLock({
    overlayId: 'admin-media-usage-modal',
    isOpen: Boolean(selectedUsageFile),
    onClose: () => setSelectedUsageFile(null),
    containerRef: usageModalRef,
    priority: 10
  });

  useOverlayLock({
    overlayId: 'admin-media-preview-modal',
    isOpen: Boolean(previewImageUrl),
    onClose: () => setPreviewImageUrl(null),
    containerRef: previewModalRef,
    priority: 11
  });

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFiles(data);
          const used = data.filter((f: any) => f.is_used).length;
          setCounts({
            total: data.length,
            used,
            unused: data.length - used,
            product: data.filter((f: any) => f.usages?.some((u: any) => u.type === 'product')).length,
            banner: data.filter((f: any) => f.usages?.some((u: any) => u.type === 'banner' || u.type === 'collection')).length
          });
        } else {
          setFiles(data.files || []);
          if (data.counts) {
            setCounts(data.counts);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        fetchMedia();
      } else {
        const d = await res.json();
        alert(d.error || 'Lỗi tải ảnh lên');
      }
    } catch (err) {
      alert('Lỗi kết nối khi tải ảnh');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (file: MediaFile) => {
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (file: MediaFile) => {
    if (file.is_used) {
      alert('Ảnh này đang được sử dụng trong hệ thống và không thể xóa.');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa ảnh "${file.original_name}" khỏi thư viện?`)) return;

    try {
      const res = await fetch(`/api/admin/media/${file.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const resData = await res.json();

      if (res.ok) {
        fetchMedia();
      } else {
        alert(resData.error || 'Không thể xóa ảnh này.');
      }
    } catch (err) {
      alert('Lỗi khi kết nối với máy chủ để xóa ảnh.');
    }
  };

  // Filter & Sort Pipeline
  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];

    // 1. Tab Filter
    if (activeTab === 'unused') {
      result = result.filter(f => !f.is_used);
    } else if (activeTab === 'used') {
      result = result.filter(f => f.is_used);
    } else if (activeTab === 'product') {
      result = result.filter(f => f.usages && f.usages.some(u => u.type === 'product'));
    } else if (activeTab === 'banner') {
      result = result.filter(f => f.usages && f.usages.some(u => u.type === 'banner' || u.type === 'collection' || u.type === 'cms_page' || u.type === 'settings'));
    }

    // 2. Search Filter (Keeps input focus, zero remounting)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(f =>
        f.original_name.toLowerCase().includes(q) ||
        f.filename.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'size_desc') {
        return b.file_size - a.file_size;
      }
      if (sortBy === 'size_asc') {
        return a.file_size - b.file_size;
      }
      if (sortBy === 'used_desc') {
        return (b.usage_count || 0) - (a.usage_count || 0);
      }
      return 0;
    });

    return result;
  }, [files, activeTab, searchQuery, sortBy]);

  const renderUsageTypeIcon = (type: MediaUsageRef['type']) => {
    switch (type) {
      case 'product':
        return <ShopOutlined style={{ color: '#0284C7' }} />;
      case 'banner':
      case 'collection':
        return <DesktopOutlined style={{ color: '#8B5CF6' }} />;
      case 'cms_page':
        return <FileTextOutlined style={{ color: '#10B981' }} />;
      default:
        return <TagOutlined style={{ color: '#F59E0B' }} />;
    }
  };

  const renderUsageTypeLabel = (type: MediaUsageRef['type']) => {
    switch (type) {
      case 'product':
        return 'Sản phẩm';
      case 'banner':
        return 'Banner trang chủ';
      case 'collection':
        return 'Bộ sưu tập';
      case 'cms_page':
        return 'Trang bài viết CMS';
      case 'settings':
        return 'Cấu hình website';
      case 'lead':
        return 'Yêu cầu khách hàng';
      default:
        return 'Khác';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Thư Viện Media & Hình Ảnh</h1>
          <div className="admin-page-subtitle">
            Hệ thống quản lý ảnh thông minh: Tự động phân loại, phát hiện vị trí sử dụng và bảo vệ chống xóa
          </div>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, image/webp"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="admin-btn admin-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <PictureOutlined />
            {uploading ? 'Đang tải ảnh lên...' : 'Tải Ảnh Mới Lên'}
          </button>
        </div>
      </div>

      <div className="admin-card">
        {/* Filter Tabs & Search Controls */}
        <div className="admin-media-header-controls">
          {/* TABS */}
          <div className="admin-media-tabs">
            <button
              type="button"
              className={`admin-media-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <span>Tất cả</span>
              <span className="admin-media-tab-badge">{counts.total}</span>
            </button>

            <button
              type="button"
              className={`admin-media-tab ${activeTab === 'unused' ? 'active' : ''}`}
              onClick={() => setActiveTab('unused')}
            >
              <span>Chưa sử dụng</span>
              <span className="admin-media-tab-badge">{counts.unused}</span>
            </button>

            <button
              type="button"
              className={`admin-media-tab ${activeTab === 'used' ? 'active' : ''}`}
              onClick={() => setActiveTab('used')}
            >
              <span>Đang sử dụng</span>
              <span className="admin-media-tab-badge">{counts.used}</span>
            </button>

            <button
              type="button"
              className={`admin-media-tab ${activeTab === 'product' ? 'active' : ''}`}
              onClick={() => setActiveTab('product')}
            >
              <span>Sản phẩm</span>
              <span className="admin-media-tab-badge">{counts.product}</span>
            </button>

            <button
              type="button"
              className={`admin-media-tab ${activeTab === 'banner' ? 'active' : ''}`}
              onClick={() => setActiveTab('banner')}
            >
              <span>Banners & Trang chủ</span>
              <span className="admin-media-tab-badge">{counts.banner}</span>
            </button>
          </div>

          {/* TOOLBAR: SEARCH & SORT */}
          <div className="admin-media-toolbar">
            <div className="admin-media-search-wrap">
              <SearchOutlined className="admin-media-search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên ảnh..."
                className="admin-media-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="admin-media-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Xóa tìm kiếm"
                >
                  <CloseCircleFilled />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Sắp xếp:</span>
              <select
                className="admin-media-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">Mới nhất tải lên</option>
                <option value="oldest">Cũ nhất trước</option>
                <option value="size_desc">Dung lượng lớn nhất</option>
                <option value="size_asc">Dung lượng nhỏ nhất</option>
                <option value="used_desc">Sử dụng nhiều nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media Grid Content */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#5D9EAF' }}>
            Đang tải dữ liệu thư viện ảnh và phân tích liên kết...
          </div>
        ) : filteredAndSortedFiles.length > 0 ? (
          <div className="admin-media-grid">
            {filteredAndSortedFiles.map(f => {
              const isUsed = Boolean(f.is_used);
              const usageCount = f.usage_count || 0;
              const usages = f.usages || [];

              return (
                <div key={f.id} className="admin-media-card">
                  {/* Image Wrap */}
                  <div className="admin-media-img-wrap">
                    {/* Status Badge */}
                    {isUsed ? (
                      <div
                        className="admin-media-badge-used admin-media-tooltip-trigger"
                        onClick={() => setSelectedUsageFile(f)}
                        title="Bấm để xem chi tiết vị trí sử dụng"
                      >
                        <InfoCircleOutlined style={{ fontSize: '10px' }} />
                        <span>Đang dùng{usageCount > 1 ? ` ×${usageCount}` : ''}</span>

                        {/* Desktop Hover Tooltip */}
                        <div className="admin-media-tooltip">
                          <div style={{ fontWeight: 700, marginBottom: 5, color: '#38BDF8', fontSize: '11px' }}>
                            Đang dùng ở {usageCount} mục:
                          </div>
                          <div style={{ maxHeight: 110, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {usages.slice(0, 4).map((u, idx) => (
                              <div key={idx} style={{ fontSize: '11px', color: '#F1F5F9' }}>
                                • {u.name} <span style={{ color: '#94A3B8' }}>({u.detail || renderUsageTypeLabel(u.type)})</span>
                              </div>
                            ))}
                            {usages.length > 4 && (
                              <div style={{ fontSize: '10.5px', color: '#38BDF8', marginTop: 2 }}>
                                + {usages.length - 4} vị trí khác (bấm xem)
                              </div>
                            )}
                          </div>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 6, paddingTop: 5, fontSize: '10px', color: '#FDA4AF' }}>
                            Ảnh đang được dùng, không thể xóa.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="admin-media-badge-unused">
                        <span>Chưa dùng</span>
                      </div>
                    )}

                    <img
                      src={f.url}
                      alt={f.original_name}
                      loading="lazy"
                      onClick={() => setPreviewImageUrl(f.url)}
                      style={{ cursor: 'pointer' }}
                      title="Bấm để phóng to xem trước ảnh"
                    />
                  </div>

                  {/* Card Info & Actions */}
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#1E293B',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={f.original_name}
                    >
                      {f.original_name}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {(f.file_size / 1024).toFixed(0)} KB
                      </span>
                      {isUsed && (
                        <button
                          type="button"
                          onClick={() => setSelectedUsageFile(f)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284C7',
                            fontSize: '11px',
                            cursor: 'pointer',
                            padding: 0,
                            fontWeight: 600,
                            textDecoration: 'underline'
                          }}
                          title="Xem danh sách liên kết"
                        >
                          Xem dùng ({usageCount})
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      {/* Copy Link Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(f)}
                        className="admin-btn admin-btn-outline"
                        style={{ flexGrow: 1, padding: '4px 6px', fontSize: '11.5px', justifyContent: 'center' }}
                        title="Sao chép đường dẫn ảnh"
                      >
                        {copiedId === f.id ? <CheckOutlined style={{ color: '#10B981' }} /> : <CopyOutlined />} Link
                      </button>

                      {/* Delete Button */}
                      {isUsed ? (
                        <div className="admin-media-tooltip-trigger" style={{ display: 'inline-block' }}>
                          <button
                            type="button"
                            disabled
                            className="admin-btn admin-btn-outline admin-media-btn-disabled"
                            style={{ padding: '4px 8px', fontSize: '11.5px' }}
                            title="Ảnh đang được sử dụng, không thể xóa"
                          >
                            <DeleteOutlined />
                          </button>
                          <div className="admin-media-tooltip" style={{ width: 190 }}>
                            <span style={{ color: '#FCA5A5' }}>Không thể xóa:</span> Ảnh này đang được tham chiếu trong hệ thống.
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDelete(f)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '4px 8px', fontSize: '11.5px', color: '#E11D48', borderColor: '#FECDD3' }}
                          title="Xóa ảnh khỏi thư viện"
                        >
                          <DeleteOutlined />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            <PictureOutlined style={{ fontSize: 36, color: '#94A3B8', marginBottom: 12 }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Không tìm thấy hình ảnh phù hợp
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748B', maxWidth: 400, margin: '0 auto' }}>
              {searchQuery
                ? `Không có ảnh nào khớp với từ khóa "${searchQuery}". Hãy thử tìm kiếm tên khác.`
                : activeTab !== 'all'
                ? 'Không có hình ảnh nào trong mục đã chọn.'
                : 'Thư viện media đang trống. Hãy bấm "Tải Ảnh Mới Lên" để thêm ảnh.'}
            </div>
          </div>
        )}
      </div>

      {/* Usage Detail Modal (Mobile, Tablet, and Desktop click) */}
      {selectedUsageFile && (
        <div className="admin-modal-overlay" style={{ zIndex: 1000 }}>
          <div
            ref={usageModalRef}
            className="admin-modal-container"
            style={{ maxWidth: '520px', width: '92%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <InfoCircleOutlined style={{ color: '#0284C7', fontSize: 18 }} />
                <h3 className="admin-modal-title" style={{ margin: 0 }}>Vị Trí Đang Sử Dụng Ảnh</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUsageFile(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="admin-modal-body" style={{ overflowY: 'auto', padding: '18px' }}>
              {/* Media File Brief */}
              <div style={{ display: 'flex', gap: 14, padding: 12, background: '#F8FAFC', borderRadius: 8, marginBottom: 16, border: '1px solid #E2E8F0' }}>
                <img
                  src={selectedUsageFile.url}
                  alt={selectedUsageFile.original_name}
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #CBD5E1' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1E293B', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {selectedUsageFile.original_name}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                    Dung lượng: {(selectedUsageFile.file_size / 1024).toFixed(0)} KB
                  </div>
                  <div style={{ fontSize: 11.5, color: '#0369A1', marginTop: 2, fontWeight: 600 }}>
                    Tổng số liên kết: {selectedUsageFile.usage_count || selectedUsageFile.usages?.length || 0} nơi
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 10 }}>
                Chi tiết các mục đang sử dụng hình ảnh này:
              </div>

              {selectedUsageFile.usages && selectedUsageFile.usages.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedUsageFile.usages.map((u, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                        <span style={{ fontSize: 16 }}>{renderUsageTypeIcon(u.type)}</span>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            {u.detail || renderUsageTypeLabel(u.type)}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: '#F1F5F9',
                          color: '#475569',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {renderUsageTypeLabel(u.type)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#64748B', fontSize: 12 }}>Chưa có thông tin sử dụng chi tiết.</div>
              )}

              {/* Protection Notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginTop: 18,
                  padding: 12,
                  background: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: 8,
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                <ExclamationCircleOutlined style={{ color: '#DC2626', fontSize: 16, marginTop: 2 }} />
                <div style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.45 }}>
                  <strong>Quy tắc bảo vệ dữ liệu:</strong> Ảnh này đang được sử dụng trực tiếp trên website. Hệ thống khóa tính năng xóa để đảm bảo không làm mất ảnh hiển thị của sản phẩm hoặc banner.
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={() => setSelectedUsageFile(null)}
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Preview Modal */}
      {previewImageUrl && (
        <div
          className="admin-modal-overlay"
          style={{ zIndex: 1050, background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            ref={previewModalRef}
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImageUrl}
              alt="Preview"
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                borderRadius: 8,
                boxShadow: '0 10px 35px rgba(0,0,0,0.5)',
                objectFit: 'contain'
              }}
            />
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
                background: '#FFFFFF',
                color: '#0F172A',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                fontSize: 14
              }}
              title="Đóng xem trước"
            >
              <CloseOutlined />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
