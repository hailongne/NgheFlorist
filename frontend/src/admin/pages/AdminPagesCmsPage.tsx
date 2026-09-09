import React, { useEffect, useState, useMemo } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { 
  EditOutlined, 
  FileTextOutlined, 
  CloseOutlined, 
  EyeOutlined, 
  SearchOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  DeleteOutlined,
  SaveOutlined,
  CopyOutlined
} from '@ant-design/icons';

interface PageItem {
  id: number;
  title: string;
  slug: string;
  meta_description?: string;
  is_published: number;
}

export default function AdminPagesCmsPage() {
  const { token } = useAdminAuth();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'editor' | 'preview' | 'seo'>('editor');
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPages(await res.json());
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [token]);

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setTitle('');
    setSlug('');
    setContent('<h2>1. Tiêu đề mục chính</h2>\n<p>Nội dung giới thiệu hoặc quy định chi tiết tại Nghệ Florist...</p>');
    setMetaDesc('');
    setIsPublished(true);
    setActiveModalTab('editor');
    setModalOpen(true);
  };

  const handleOpenEdit = async (id: number) => {
    setIsCreating(false);
    setEditingId(id);
    setActiveModalTab('editor');
    setModalOpen(true);
    try {
      const targetPage = pages.find(p => p.id === id);
      if (targetPage) {
        setTitle(targetPage.title);
        setSlug(targetPage.slug);
        setMetaDesc(targetPage.meta_description || '');
        setIsPublished(targetPage.is_published !== 0);

        const res = await fetch(`/api/pages/${targetPage.slug}`);
        if (res.ok) {
          const full = await res.json();
          setContent(full.content || '');
          setTitle(full.title);
          setMetaDesc(full.meta_description || '');
          setIsPublished(full.is_published !== 0);
        }
      }
    } catch (err) {
      console.error('Error loading page detail:', err);
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!isCreating && !editingId)) return;

    setSaving(true);
    try {
      if (isCreating) {
        const cleanSlug = slug.trim() || title.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const res = await fetch('/api/admin/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: title.trim(),
            slug: cleanSlug,
            content,
            meta_description: metaDesc.trim(),
            is_published: isPublished ? 1 : 0
          })
        });

        if (res.ok) {
          setModalOpen(false);
          fetchPages();
        } else {
          const d = await res.json();
          alert(d.error || 'Lỗi tạo trang mới');
        }
      } else {
        const res = await fetch(`/api/admin/pages/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: title.trim(),
            content,
            meta_description: metaDesc.trim(),
            is_published: isPublished ? 1 : 0
          })
        });

        if (res.ok) {
          setModalOpen(false);
          fetchPages();
        } else {
          const d = await res.json();
          alert(d.error || 'Lỗi lưu trang');
        }
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (p: PageItem) => {
    const nextStatus = p.is_published ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/pages/${p.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_published: nextStatus })
      });
      if (res.ok) fetchPages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePage = async (p: PageItem) => {
    if (['about', 'policy'].includes(p.slug)) {
      alert('Không thể xóa trang hệ thống cốt lõi này!');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa trang "${p.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/pages/${p.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPages();
      } else {
        const d = await res.json();
        alert(d.error || 'Lỗi xóa trang');
      }
    } catch (err) {
      alert('Lỗi xóa trang');
    }
  };

  const insertSnippet = (snippet: string) => {
    setContent(prev => prev + '\n' + snippet);
  };

  // Filtered pages
  const filteredPages = useMemo(() => {
    return pages.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.meta_description && p.meta_description.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchSearch) return false;
      if (statusFilter === 'published') return p.is_published === 1;
      if (statusFilter === 'draft') return p.is_published === 0;
      return true;
    });
  }, [pages, searchTerm, statusFilter]);

  const publishedCount = pages.filter(p => p.is_published === 1).length;
  const draftCount = pages.filter(p => p.is_published === 0).length;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div className="admin-page-header" style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 className="admin-page-title" style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileTextOutlined style={{ color: 'var(--admin-primary)' }} />
            Quản Lý Trang Nội Dung & Chính Sách
          </h1>
          <div className="admin-page-subtitle">
            Chỉnh sửa nội dung Giới thiệu tiệm, Chính sách đổi trả & bảo hành, Quy trình duyệt ảnh thực tế và Bí quyết chăm sóc hoa
          </div>
        </div>

        <button 
          onClick={handleOpenCreate} 
          className="admin-btn admin-btn-primary"
          style={{ padding: '10px 20px', fontWeight: 700, gap: 8 }}
        >
          Thêm Trang Nội Dung
        </button>
      </div>

      {/* Stats Cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 16, 
          marginBottom: 24 
        }}
      >
        <div className="admin-card" style={{ padding: '16px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EAF6F9', color: '#5D9EAF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            <FileTextOutlined />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Tổng Số Trang</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>{pages.length}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            <CheckCircleOutlined />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Đang Xuất Bản</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16A34A' }}>{publishedCount}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            <EditOutlined />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Bản Nháp</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706' }}>{draftCount}</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', margin: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FAF5FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            <GlobalOutlined />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Chuẩn SEO</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#7E22CE' }}>Google Snippet</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card" style={{ padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <SearchOutlined style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc đường dẫn..."
              className="admin-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid var(--admin-border)',
                background: statusFilter === 'all' ? 'var(--admin-primary)' : '#fff',
                color: statusFilter === 'all' ? '#fff' : 'var(--admin-text)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Tất cả ({pages.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid var(--admin-border)',
                background: statusFilter === 'published' ? '#16A34A' : '#fff',
                color: statusFilter === 'published' ? '#fff' : 'var(--admin-text)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Đã xuất bản ({publishedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid var(--admin-border)',
                background: statusFilter === 'draft' ? '#D97706' : '#fff',
                color: statusFilter === 'draft' ? '#fff' : 'var(--admin-text)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Bản nháp ({draftCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Tiêu đề trang</th>
                <th style={{ minWidth: 160 }}>Đường dẫn (URL)</th>
                <th style={{ minWidth: 260 }}>Mô tả SEO (Meta Description)</th>
                <th style={{ width: 120, textAlign: 'center' }}>Trạng thái</th>
                <th style={{ width: 160, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    Đang tải danh sách bài viết...
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    Không tìm thấy bài viết trang nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPages.map(p => {
                  const isCorePage = ['about', 'policy'].includes(p.slug);
                  return (
                    <tr key={p.id}>
                      {/* Title */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EAF6F9', color: '#5D9EAF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                            <FileTextOutlined />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: '0.92rem' }}>
                              {p.title}
                            </div>
                            {isCorePage && (
                              <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                Trang hệ thống cốt lõi
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* URL Slug */}
                      <td>
                        <a 
                          href={`/${p.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 4, 
                            color: 'var(--admin-primary-dark)', 
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                          title="Bấm để xem trang này trên website"
                        >
                          /{p.slug} <EyeOutlined style={{ fontSize: 11 }} />
                        </a>
                      </td>

                      {/* Meta Description */}
                      <td style={{ color: '#64748B', fontSize: '0.84rem', lineHeight: 1.5 }}>
                        {p.meta_description || <em style={{ color: '#94A3B8' }}>Chưa thiết lập mô tả tìm kiếm</em>}
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(p)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: '4px 10px',
                            borderRadius: 14,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                          className={p.is_published ? 'admin-badge badge-success' : 'admin-badge badge-warning'}
                          title="Bấm để đổi trạng thái xuất bản"
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.is_published ? '#16A34A' : '#D97706' }} />
                          {p.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p.id)}
                            className="admin-btn admin-btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.82rem', gap: 4 }}
                          >
                            <EditOutlined /> Soạn bài
                          </button>

                          {!isCorePage && (
                            <button
                              type="button"
                              onClick={() => handleDeletePage(p)}
                              className="admin-btn admin-btn-outline"
                              style={{ padding: '6px 10px', fontSize: '0.82rem', color: '#DC2626', borderColor: '#FECACA' }}
                              title="Xóa trang này"
                            >
                              <DeleteOutlined />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rich Editor & Preview Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 860, width: '92%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div className="admin-modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--admin-border)' }}>
              <div>
                <h3 className="admin-modal-title" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <EditOutlined style={{ color: 'var(--admin-primary)' }} />
                  {isCreating ? 'Tạo Trang Nội Dung Mới' : `Chỉnh Sửa Trang: ${title}`}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>
                  Đường dẫn hiển thị: <code style={{ color: '#0369A1' }}>/{slug || 'duong-dan-trang'}</code>
                </div>
              </div>

              {/* Tab Switcher inside Modal */}
              <div style={{ display: 'flex', background: '#F1F5F9', padding: 4, borderRadius: 8, gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('editor')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: activeModalTab === 'editor' ? '#fff' : 'transparent',
                    color: activeModalTab === 'editor' ? 'var(--admin-primary-dark)' : '#64748B',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <EditOutlined /> Soạn Thảo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('preview')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: activeModalTab === 'preview' ? '#fff' : 'transparent',
                    color: activeModalTab === 'preview' ? 'var(--admin-primary-dark)' : '#64748B',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <EyeOutlined /> Xem Trước
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('seo')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: activeModalTab === 'seo' ? '#fff' : 'transparent',
                    color: activeModalTab === 'seo' ? 'var(--admin-primary-dark)' : '#64748B',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <GlobalOutlined /> SEO Google
                </button>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748B', padding: 4 }}
              >
                <CloseOutlined />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePage} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div className="admin-modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: 24 }}>
                {/* Basic Meta Row */}
                <div style={{ display: 'grid', gridTemplateColumns: isCreating ? '1.5fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Tiêu đề bài viết *</label>
                    <input
                      type="text"
                      className="admin-input"
                      required
                      placeholder="VD: Chính Sách Đổi Trả & Bảo Hành"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {isCreating && (
                    <div>
                      <label className="admin-label">Đường dẫn tĩnh (Slug) *</label>
                      <input
                        type="text"
                        className="admin-input"
                        required
                        placeholder="VD: chinh-sach-doi-tra"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* TAB 1: EDITOR */}
                {activeModalTab === 'editor' && (
                  <div>
                    {/* Quick HTML Snippet Helpers */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Chèn nhanh:</span>
                      <button 
                        type="button" 
                        onClick={() => insertSnippet('<h2>Tiêu đề mục chính</h2>\n<p>Nội dung chi tiết...</p>')}
                        style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 4, cursor: 'pointer' }}
                      >
                        + Tiêu đề H2
                      </button>
                      <button 
                        type="button" 
                        onClick={() => insertSnippet('<ul>\n  <li>Ý chính thứ nhất</li>\n  <li>Ý chính thứ hai</li>\n</ul>')}
                        style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 4, cursor: 'pointer' }}
                      >
                        + Danh sách gạch đầu dòng
                      </button>
                      <button 
                        type="button" 
                        onClick={() => insertSnippet('<div style="background:#F0FDF4; border:1px solid #BBF7D0; padding:14px; border-radius:8px; color:#15803D;"><strong>Cam kết:</strong> Chúng tôi hoàn tiền 100% nếu hoa không đúng mẫu đã duyệt.</div>')}
                        style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
                      >
                        + Hộp cam kết nổi bật
                      </button>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Nội dung chi tiết (Định dạng HTML / Văn bản)</label>
                      <textarea
                        className="admin-textarea"
                        rows={14}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Nhập nội dung bài viết..."
                        style={{ lineHeight: 1.6, fontSize: '0.92rem' }}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: LIVE PREVIEW */}
                {activeModalTab === 'preview' && (
                  <div style={{ background: '#fff', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 32, minHeight: 320 }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: 20, color: '#26383D', borderBottom: '2px solid #5D9EAF', paddingBottom: 10 }}>
                      {title || 'Tiêu đề bài viết'}
                    </h1>
                    <div 
                      className="cms-content-preview"
                      dangerouslySetInnerHTML={{ __html: content || '<p><em>Chưa có nội dung soạn thảo.</em></p>' }}
                      style={{ lineHeight: 1.8, fontSize: '1rem', color: '#334155' }}
                    />
                  </div>
                )}

                {/* TAB 3: SEO CONFIG */}
                {activeModalTab === 'seo' && (
                  <div>
                    <div className="admin-form-group">
                      <label className="admin-label">Mô tả Meta SEO (Meta Description)</label>
                      <textarea
                        className="admin-textarea"
                        rows={3}
                        placeholder="Mô tả tóm tắt ngắn gọn hiển thị khi khách hàng tìm kiếm trên Google..."
                        value={metaDesc}
                        onChange={(e) => setMetaDesc(e.target.value)}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4 }}>
                        Độ dài khuyến nghị: 120 - 160 ký tự ({metaDesc.length} ký tự hiện tại).
                      </div>
                    </div>

                    {/* Google Snippet Mockup */}
                    <div style={{ marginTop: 20, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 18 }}>
                      <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>
                        Mô phỏng hiển thị trên Google Search:
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#202124', marginBottom: 2 }}>
                        https://ngheflorist.vn › {slug || 'trang'}
                      </div>
                      <div style={{ fontSize: '1.2rem', color: '#1a0dab', fontWeight: 600, cursor: 'pointer', marginBottom: 4 }}>
                        {title || 'Tiêu đề trang'} – Nghệ Florist
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#4d5156', lineHeight: 1.5 }}>
                        {metaDesc || 'Nghệ Florist mang đến những tác phẩm hoa tươi nghệ thuật, tinh tế và dịch vụ tư vấn tận tâm...'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Publish Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid #E2E8F0' }}>
                  <input
                    type="checkbox"
                    id="pagePub"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="pagePub" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--admin-text)', cursor: 'pointer' }}>
                    Xuất bản công khai trang này lên website (cho phép khách hàng đọc)
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="admin-modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="admin-btn admin-btn-outline"
                  style={{ padding: '10px 20px' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                  style={{ padding: '10px 24px', fontWeight: 700 }}
                >
                  <SaveOutlined /> {saving ? 'Đang lưu...' : (isCreating ? 'Tạo Trang Mới' : 'Lưu Thay Đổi')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
