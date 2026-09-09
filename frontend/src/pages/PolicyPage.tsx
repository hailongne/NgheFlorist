import React, { useEffect, useState } from 'react';
import { SafetyCertificateOutlined } from '@ant-design/icons';

interface PageData {
  title: string;
  content: string;
  meta_description?: string;
}

export default function PolicyPage() {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages/policy')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setPage(data);
      })
      .catch(err => console.error('Policy fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ backgroundColor: '#F7FBFC', minHeight: '80vh', padding: '40px 20px' }}>
      <div style={{
        maxWidth: '840px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '40px',
        border: '1px solid #E4EEF1',
        boxShadow: '0 4px 20px rgba(93, 158, 175, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <SafetyCertificateOutlined style={{ fontSize: '28px', color: '#5D9EAF' }} />
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#26383D', margin: 0 }}>
            {page?.title || 'Chính Sách & Cam Kết Nghệ Florist'}
          </h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#5D9EAF' }}>
            Đang tải nội dung chính sách...
          </div>
        ) : page?.content ? (
          <div
            style={{ fontSize: '15px', lineHeight: '1.8', color: '#26383D' }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#26383D' }}>
            <h2>1. Cam kết chất lượng hoa</h2>
            <p>Nghệ Florist cam kết sử dụng 100% hoa tươi loại 1. Trước khi giao hàng, chúng tôi luôn chụp ảnh thành phẩm thực tế gửi quý khách duyệt qua Zalo hoặc website.</p>
            <h2>2. Chính sách đổi trả & hoàn tiền</h2>
            <p>Nếu hoa giao đến không đúng mẫu đã duyệt, hoa bị héo úa hoặc hư hỏng do vận chuyển, Nghệ Florist cam kết đổi sản phẩm mới trong vòng 2 giờ hoặc hoàn tiền 100%.</p>
            <h2>3. Thời gian giao hàng</h2>
            <p>Giao hàng hỏa tốc trong 2 giờ nội thành TP.HCM và Hà Nội. Quý khách có thể lựa chọn khung giờ nhận hoa chính xác trong ngày.</p>
          </div>
        )}
      </div>
    </div>
  );
}
