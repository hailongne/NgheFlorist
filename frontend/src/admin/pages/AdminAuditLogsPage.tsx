import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { HistoryOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

interface AuditLog {
  id: number;
  user_id?: number;
  username?: string;
  full_name?: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const { token } = useAdminAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${page}&limit=30`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Audit logs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, token]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN': return <span className="admin-badge badge-info">Đăng nhập</span>;
      case 'CREATE': return <span className="admin-badge badge-success">Tạo mới</span>;
      case 'UPDATE': return <span className="admin-badge badge-warning">Cập nhật</span>;
      case 'DELETE': return <span className="admin-badge badge-danger">Xóa dữ liệu</span>;
      case 'ADJUST_STOCK': return <span className="admin-badge badge-warning">Điều chỉnh kho</span>;
      case 'UPLOAD_PROOF': return <span className="admin-badge badge-info">Tải ảnh duyệt</span>;
      default: return <span className="admin-badge">{action}</span>;
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Nhật Ký Thao Tác Hệ Thống (Audit Logs)</h1>
          <div className="admin-page-subtitle">
            Ghi nhận vết mọi hoạt động đăng nhập, chỉnh sửa sản phẩm, đổi tồn kho và xử lý đơn hàng
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container" style={{ border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Hành động</th>
                <th>Tài nguyên</th>
                <th>Mã đối tượng</th>
                <th>Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#5D9EAF' }}>
                    Đang tải nhật ký...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map(l => (
                  <tr key={l.id}>
                    <td>{new Date(l.created_at).toLocaleString('vi-VN')}</td>
                    <td>
                      <strong>{l.full_name || l.username || 'Hệ thống'}</strong>
                    </td>
                    <td>{getActionBadge(l.action)}</td>
                    <td><code>{l.resource}</code></td>
                    <td>{l.resource_id ? `#${l.resource_id}` : '—'}</td>
                    <td><small style={{ color: '#718287' }}>{l.ip_address || '127.0.0.1'}</small></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#718287' }}>
                    Chưa có bản ghi nhật ký nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E4EEF1' }}>
          <div style={{ fontSize: '13px', color: '#718287' }}>
            Trang {page} / {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="admin-btn admin-btn-outline"
              style={{ padding: '6px 12px' }}
            >
              Trang trước
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="admin-btn admin-btn-outline"
              style={{ padding: '6px 12px' }}
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
