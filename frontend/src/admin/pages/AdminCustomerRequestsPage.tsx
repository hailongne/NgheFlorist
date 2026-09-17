import React, { useEffect, useState, useRef } from 'react';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  CheckCircleFilled, 
  ClockCircleFilled, 
  CloseCircleFilled,
  MessageOutlined,
  PhoneOutlined,
  FileImageOutlined,
  CopyOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useAdminAuth } from '../AdminAuthContext';

interface CustomerRequestItem {
  id: number;
  code: string;
  type: 'PRODUCT_SELECTION' | 'CUSTOM_DESIGN';
  customer_name: string;
  phone: string;
  zalo: string;
  selected_product_id: number | null;
  selected_product_name: string | null;
  product_url: string | null;
  budget: string | null;
  color_tone: string | null;
  style: string | null;
  recipient: string | null;
  requested_date: string | null;
  requested_time: string | null;
  delivery_area: string | null;
  message: string | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'consulting' | 'closed' | 'cancelled';
  source: string;
  created_at: string;
  attachment_count: number;
}

interface AttachmentFile {
  id: number;
  request_id: number;
  file_url: string;
  original_name: string;
  mime_type: string;
  file_size: number;
}

export default function AdminCustomerRequestsPage() {
  const { token } = useAdminAuth();

  const [requests, setRequests] = useState<CustomerRequestItem[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    count_new: 0,
    count_contacted: 0,
    count_consulting: 0,
    count_closed: 0,
    count_cancelled: 0
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);

  // Detail Modal
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequestItem | null>(null);
  const [requestImages, setRequestImages] = useState<AttachmentFile[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailNotes, setDetailNotes] = useState('');
  const [detailStatus, setDetailStatus] = useState<string>('new');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const detailModalRef = useRef<HTMLDivElement>(null);

  useOverlayLock({
    id: 'admin-customer-request-detail-modal',
    isOpen: Boolean(selectedRequest),
    onClose: () => setSelectedRequest(null),
    containerRef: detailModalRef,
    role: 'dialog',
    priority: 10
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('page', String(currentPage));
      params.append('limit', '20');

      const res = await fetch(`/api/admin/customer-requests?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Không thể tải danh sách yêu cầu');
      const data = await res.json();

      setRequests(data.requests || []);
      setSummary({
        total: Number(data.summary?.total || 0),
        count_new: Number(data.summary?.count_new || 0),
        count_contacted: Number(data.summary?.count_contacted || 0),
        count_consulting: Number(data.summary?.count_consulting || 0),
        count_closed: Number(data.summary?.count_closed || 0),
        count_cancelled: Number(data.summary?.count_cancelled || 0)
      });
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalFiltered(data.pagination?.total || 0);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRequests();
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await fetch(`/api/admin/customer-requests/export?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Không thể xuất file Excel');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `nghe-florist-leads-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || 'Lỗi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const openDetail = async (reqItem: CustomerRequestItem) => {
    setSelectedRequest(reqItem);
    setDetailNotes(reqItem.notes || '');
    setDetailStatus(reqItem.status);
    setRequestImages([]);
    setLoadingDetail(true);

    try {
      const res = await fetch(`/api/admin/customer-requests/${reqItem.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequestImages(data.images || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const updateRequestStatus = async (id: number, newStatus: string, notesVal?: string) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/admin/customer-requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notesVal !== undefined ? notesVal : detailNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật trạng thái');

      // Update in current list
      setRequests(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, status: newStatus as any, notes: notesVal !== undefined ? notesVal : detailNotes };
        }
        return item;
      }));

      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status: newStatus as any, notes: notesVal !== undefined ? notesVal : detailNotes } : null);
        setDetailStatus(newStatus);
      }

      alert('Đã cập nhật trạng thái thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusBadge = (st: string) => {
    switch (st) {
      case 'new':
        return <span className="status-badge status-primary" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>Mới tiếp nhận</span>;
      case 'contacted':
        return <span className="status-badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>Đã liên hệ</span>;
      case 'consulting':
        return <span className="status-badge" style={{ backgroundColor: '#EDE9FE', color: '#5B21B6', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>Đang tư vấn</span>;
      case 'closed':
        return <span className="status-badge" style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>Chốt thành công</span>;
      case 'cancelled':
        return <span className="status-badge" style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>Đã hủy</span>;
      default:
        return <span>{st}</span>;
    }
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '0 0 4px' }}>
            Quản Lý Yêu Cầu Khách Hàng
          </h1>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
            Hệ thống quản lý Lead & Chốt đơn tư vấn qua Zalo / Hotline cho tiệm hoa
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={fetchRequests}
            className="btn btn-soft"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title="Tải lại dữ liệu"
          >
            <ReloadOutlined spin={loading} /> Làm mới
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#0284C7' }}
          >
            <DownloadOutlined /> {exporting ? 'Đang xuất Excel...' : 'Xuất File Excel (.xlsx)'}
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div 
          onClick={() => setStatusFilter('all')}
          style={{
            background: statusFilter === 'all' ? '#F0F9FF' : '#FFFFFF',
            border: statusFilter === 'all' ? '2px solid #0284C7' : '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>TẤT CẢ YÊU CẦU</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>{summary.total}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('new')}
          style={{
            background: statusFilter === 'new' ? '#EFF6FF' : '#FFFFFF',
            border: statusFilter === 'new' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#1D4ED8', fontWeight: 700 }}>MỚI TIẾP NHẬN</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1D4ED8', marginTop: 4 }}>{summary.count_new}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('contacted')}
          style={{
            background: statusFilter === 'contacted' ? '#FFFBEB' : '#FFFFFF',
            border: statusFilter === 'contacted' ? '2px solid #D97706' : '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 700 }}>ĐÃ LIÊN HỆ</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#B45309', marginTop: 4 }}>{summary.count_contacted}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('consulting')}
          style={{
            background: statusFilter === 'consulting' ? '#F5F3FF' : '#FFFFFF',
            border: statusFilter === 'consulting' ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#6D28D9', fontWeight: 700 }}>ĐANG TƯ VẤN</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6D28D9', marginTop: 4 }}>{summary.count_consulting}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('closed')}
          style={{
            background: statusFilter === 'closed' ? '#F0FDF4' : '#FFFFFF',
            border: statusFilter === 'closed' ? '2px solid #16A34A' : '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 700 }}>CHỐT THÀNH CÔNG</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803D', marginTop: 4 }}>{summary.count_closed}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('cancelled')}
          style={{
            background: statusFilter === 'cancelled' ? '#F8FAFC' : '#FFFFFF',
            border: statusFilter === 'cancelled' ? '2px solid #64748B' : '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '16px 20px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>ĐÃ HỦY</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#64748B', marginTop: 4 }}>{summary.count_cancelled}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexGrow: 1, maxWidth: 450 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Tìm mã NF..., tên khách, SĐT, mẫu hoa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <SearchOutlined style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 18px' }}>
            Tìm
          </button>
        </form>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Loại:</span>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
            >
              <option value="all">Tất cả loại</option>
              <option value="PRODUCT_SELECTION">Chọn mẫu hoa</option>
              <option value="CUSTOM_DESIGN">Thiết kế riêng</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
            >
              <option value="all">Tất cả ({summary.total})</option>
              <option value="new">Mới ({summary.count_new})</option>
              <option value="contacted">Đã liên hệ ({summary.count_contacted})</option>
              <option value="consulting">Đang tư vấn ({summary.count_consulting})</option>
              <option value="closed">Chốt thành công ({summary.count_closed})</option>
              <option value="cancelled">Đã hủy ({summary.count_cancelled})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <th style={{ padding: '14px 16px' }}>Mã yêu cầu</th>
                <th style={{ padding: '14px 16px' }}>Thời gian</th>
                <th style={{ padding: '14px 16px' }}>Khách hàng</th>
                <th style={{ padding: '14px 16px' }}>Mẫu hoa / Yêu cầu</th>
                <th style={{ padding: '14px 16px' }}>Giao nhận & Dịp</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Ảnh</th>
                <th style={{ padding: '14px 16px' }}>Trạng thái</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                    <ReloadOutlined spin style={{ fontSize: 24, marginBottom: 8 }} />
                    <div>Đang tải dữ liệu yêu cầu khách hàng...</div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <MessageOutlined style={{ fontSize: 32, color: '#CBD5E1', marginBottom: 8 }} />
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>Không tìm thấy yêu cầu nào</div>
                    <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: 4 }}>Hãy thử thay đổi bộ lọc tìm kiếm</div>
                  </td>
                </tr>
              ) : (
                requests.map(item => (
                  <tr 
                    key={item.id} 
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                  >
                    {/* Code */}
                    <td style={{ padding: '14px 16px' }}>
                      <span 
                        onClick={() => openDetail(item)}
                        style={{
                          fontWeight: 800,
                          color: '#0284C7',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          fontSize: '0.95rem'
                        }}
                        title="Xem chi tiết"
                      >
                        {item.code}
                      </span>
                      <div style={{ fontSize: '0.75rem', marginTop: 2 }}>
                        {item.type === 'CUSTOM_DESIGN' ? (
                          <span style={{ color: '#7C3AED', fontWeight: 600 }}>🎨 Thiết kế riêng</span>
                        ) : (
                          <span style={{ color: '#0369A1', fontWeight: 600 }}>🌸 Mẫu có sẵn</span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(item.created_at).toLocaleDateString('vi-VN')}<br />
                      <small>{new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</small>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>
                        {item.customer_name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', marginTop: 2 }}>
                        <a href={`tel:${item.phone}`} style={{ color: '#0369A1', textDecoration: 'none', fontWeight: 600 }}>
                          {item.phone}
                        </a>
                        <a 
                          href={`https://zalo.me/${item.zalo || item.phone}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            background: '#0068FF',
                            color: '#FFFFFF',
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: 4,
                            textDecoration: 'none',
                            fontWeight: 700
                          }}
                        >
                          Zalo
                        </a>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', minWidth: 200, maxWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                        {item.style && (
                          <span style={{ backgroundColor: '#F3E8FF', color: '#7E22CE', border: '1px solid #E9D5FF', padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontSize: '0.72rem' }}>{item.style}</span>
                        )}
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>{item.budget || 'Thỏa thuận'}</span>
                      </div>
                      {item.selected_product_name && (
                        <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.84rem' }}>🌸 {item.selected_product_name}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#475569' }}>
                      {item.requested_date ? <div>Ngày: <strong>{item.requested_date}</strong></div> : <span style={{ color: '#94A3B8' }}>Chưa hẹn ngày</span>}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {item.attachment_count > 0 ? (
                        <span style={{ background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', borderRadius: 12, padding: '3px 8px', fontSize: '0.78rem', fontWeight: 700 }}>
                          <FileImageOutlined /> {item.attachment_count}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>{statusBadge(item.status)}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button type="button" onClick={() => openDetail(item)} className="btn btn-soft btn-sm" style={{ padding: '6px 12px', fontSize: '0.82rem', fontWeight: 600 }}>
                        <EyeOutlined /> Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-only-element" style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Đang tải yêu cầu...</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Không có yêu cầu nào</div>
          ) : (
            requests.map(item => (
              <div key={item.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: '#0369A1', fontSize: '0.94rem' }}>#{item.code}</span>
                  {statusBadge(item.status)}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.02rem', color: '#0F172A' }}>{item.customer_name}</div>
                  <div style={{ fontSize: '0.86rem', color: '#64748B', marginTop: 2 }}>SĐT: <strong style={{ color: '#0F172A' }}>{item.phone}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={`tel:${item.phone}`} className="btn btn-outline btn-sm" style={{ flex: 1, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', fontWeight: 600 }}>
                    <PhoneOutlined /> Gọi
                  </a>
                  <a href={`https://zalo.me/${item.zalo || item.phone}`} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ flex: 1, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', fontWeight: 600, backgroundColor: '#0284C7' }}>
                    <MessageOutlined /> Zalo
                  </a>
                  <button type="button" onClick={() => openDetail(item)} className="btn btn-soft btn-sm" style={{ minHeight: 44, padding: '0 16px', fontWeight: 600 }}>
                    <EyeOutlined />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Hiển thị {requests.length} trên tổng số {totalFiltered} yêu cầu
            </span>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="btn btn-soft btn-sm"
              >
                Trước
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.85rem', fontWeight: 600 }}>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="btn btn-soft btn-sm"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRequest(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 'var(--z-modal, 1100)' as any,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            touchAction: 'none'
          }}
        >
          <div 
            ref={detailModalRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Chi tiết yêu cầu ${selectedRequest.code}`}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#F8FAFC'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    Yêu Cầu: {selectedRequest.code}
                  </h3>
                  {statusBadge(selectedRequest.status)}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 2 }}>
                  Gửi lúc: {new Date(selectedRequest.created_at).toLocaleString('vi-VN')} • Nguồn: {selectedRequest.source}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer' }}
              >
                <CloseOutlined />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flexGrow: 1, overscrollBehavior: 'contain' }}>
              {/* Customer Contact Card */}
              <div 
                style={{
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: 14,
                  padding: '16px 20px',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#0369A1', fontWeight: 700 }}>
                    Khách hàng:
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0C4A6E', marginTop: 2 }}>
                    {selectedRequest.customer_name}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#0369A1', marginTop: 2 }}>
                    Điện thoại: <strong>{selectedRequest.phone}</strong>
                    {selectedRequest.zalo && ` | Zalo: ${selectedRequest.zalo}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={`tel:${selectedRequest.phone}`}
                    className="btn btn-outline btn-sm"
                    style={{ backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <PhoneOutlined /> Gọi điện
                  </a>
                  <a
                    href={`https://zalo.me/${selectedRequest.zalo || selectedRequest.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: '#0068FF', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <MessageOutlined /> Chat Zalo
                  </a>
                </div>
              </div>

              {/* Detail Specifications */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Loại yêu cầu & Mẫu hoa</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                    {selectedRequest.type === 'CUSTOM_DESIGN' ? 'Thiết kế hoa theo yêu cầu' : 'Chọn mẫu hoa có sẵn'}
                  </div>
                  {selectedRequest.selected_product_name && (
                    <div style={{ fontSize: '0.85rem', color: '#0284C7', marginTop: 4 }}>
                      Mẫu: {selectedRequest.selected_product_name}
                    </div>
                  )}
                  {selectedRequest.product_url && (
                    <div style={{ fontSize: '0.78rem', marginTop: 2 }}>
                      <a href={selectedRequest.product_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0284C7' }}>
                        Xem link sản phẩm trên web ↗
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Kiểu dáng & Ngân sách</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                    {selectedRequest.style ? <span style={{ color: '#0369A1' }}>{selectedRequest.style} • </span> : ''}
                    {selectedRequest.budget || 'Thỏa thuận'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: 4 }}>
                    Tone màu: <strong>{selectedRequest.color_tone || 'Tự do'}</strong>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Thời gian & Khu vực giao</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                    {selectedRequest.requested_date ? `${selectedRequest.requested_date} (${selectedRequest.requested_time || 'Bất kỳ'})` : 'Chưa định ngày'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: 4 }}>
                    Khu vực: {selectedRequest.delivery_area || 'Chưa ghi rõ'}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Dịp tặng / Người nhận</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                    {selectedRequest.recipient || 'Quà tặng'}
                  </div>
                </div>
              </div>

              {/* Card Message & Customer Notes */}
              {selectedRequest.message && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px 16px', borderRadius: 10, marginBottom: 16 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                    Lời nhắn in thiệp / banner:
                  </div>
                  <div style={{ fontSize: '0.92rem', color: '#78350F', marginTop: 4, fontStyle: 'italic' }}>
                    "{selectedRequest.message}"
                  </div>
                </div>
              )}

              {/* Reference Images */}
              {requestImages.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileImageOutlined /> Ảnh mẫu khách gửi đính kèm ({requestImages.length}):
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {requestImages.map(img => (
                      <a 
                        key={img.id} 
                        href={img.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          width: 110,
                          height: 110,
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: '1px solid #CBD5E1',
                          display: 'block'
                        }}
                        title="Click để xem ảnh gốc"
                      >
                        <img 
                          src={img.file_url} 
                          alt="Tham khảo" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Florist Notes & Status Update */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 20 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                  Cập nhật trạng thái xử lý & Ghi chú nội bộ
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Trạng thái:
                    </label>
                    <select
                      value={detailStatus}
                      onChange={e => setDetailStatus(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    >
                      <option value="new">Mới tiếp nhận</option>
                      <option value="contacted">Đã liên hệ khách</option>
                      <option value="consulting">Đang tư vấn / Gửi ảnh hoa</option>
                      <option value="closed">Chốt đơn thành công</option>
                      <option value="cancelled">Đã hủy / Khách không đặt</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                      Ghi chú của Florist (nội bộ):
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Đã gửi ảnh hoa hồng Explorer, khách chốt giao 10h sáng mai..."
                      value={detailNotes}
                      onChange={e => setDetailNotes(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => updateRequestStatus(selectedRequest.id, detailStatus, detailNotes)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontWeight: 700, backgroundColor: '#0284C7' }}
                >
                  {updatingStatus ? 'Đang lưu...' : 'Lưu Thay Đổi Trạng Thái & Ghi Chú'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
