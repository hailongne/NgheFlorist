import React, { useEffect, useState, useRef } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { CopyOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';

interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  created_at: string;
}

export default function AdminMediaPage() {
  const { token } = useAdminAuth();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFiles(await res.json());
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

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này khỏi thư viện?')) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchMedia();
    } catch (err) {
      alert('Lỗi xóa ảnh');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Thư Viện Media & Hình Ảnh</h1>
          <div className="admin-page-subtitle">
            Tải lên và quản lý ảnh hoa tươi, banner, ảnh thành phẩm an toàn (Tối đa 5MB/ảnh)
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
          >
            {uploading ? 'Đang tải ảnh lên...' : 'Tải Ảnh Mới Lên'}
          </button>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#5D9EAF' }}>
            Đang tải thư viện hình ảnh...
          </div>
        ) : files.length > 0 ? (
          <div className="admin-media-grid">
            {files.map(f => (
              <div key={f.id} className="admin-media-card">
                <img src={f.url} alt={f.original_name} />
                <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#26383D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.original_name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#718287', marginTop: '2px' }}>
                    {(f.file_size / 1024).toFixed(0)} KB
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <button
                      onClick={() => handleCopyUrl(f)}
                      className="admin-btn admin-btn-outline"
                      style={{ flexGrow: 1, padding: '4px 6px', fontSize: '11px', justifyContent: 'center' }}
                      title="Sao chép link"
                    >
                      {copiedId === f.id ? <CheckOutlined style={{ color: '#3ea877' }} /> : <CopyOutlined />} Link
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '4px 8px', fontSize: '11px', color: '#E06060' }}
                      title="Xóa ảnh"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#718287' }}>
            Thư viện media đang trống. Hãy bấm "Tải Ảnh Mới Lên" để lưu ảnh dùng cho Sản Phẩm và Banners.
          </div>
        )}
      </div>
    </div>
  );
}
