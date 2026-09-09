import React, { useEffect, useState } from 'react';
import { 
  CarOutlined, 
  CameraOutlined, 
  SafetyCertificateOutlined, 
  GlobalOutlined, 
  SmileOutlined,
  ThunderboltOutlined,
  FormatPainterOutlined,
  CrownOutlined
} from '@ant-design/icons';

interface CommitmentItem {
  id: number;
  title: string;
  desc: string;
  icon?: string;
}

export default function Features() {
  const [commitments, setCommitments] = useState<CommitmentItem[]>([]);

  useEffect(() => {
    fetch('/api/content/homepage')
      .then(r => r.json())
      .then(data => {
        if (data.commitments && data.commitments.length > 0) {
          setCommitments(data.commitments);
        }
      })
      .catch(console.error);
  }, []);

  const defaultItems = [
    {
      title: 'Giao hàng nội thành',
      desc: 'Đội ngũ shipper cẩn trọng, giữ phom hoa hoàn hảo khi đến tay người nhận',
      icon: <CarOutlined />,
      highlight: false
    },
    {
      title: 'Cắm hoa theo yêu cầu',
      desc: 'Thiết kế riêng theo ngân sách, tone màu và dịp kỷ niệm đặc biệt của bạn',
      icon: <FormatPainterOutlined />,
      highlight: false
    },
    {
      title: 'Cam kết gửi ảnh duyệt',
      desc: 'Chụp ảnh thật thành phẩm tại tiệm gửi bạn duyệt hài lòng trước khi giao',
      icon: <CameraOutlined />,
      highlight: true
    },
    {
      title: 'Uy tín & chất lượng',
      desc: 'Hoa tuyển chọn kỹ lưỡng, chỉnh sửa chu đáo đến khi bạn hoàn toàn ưng ý',
      icon: <SafetyCertificateOutlined />,
      highlight: false
    },
    {
      title: 'Hoa tươi nhập khẩu',
      desc: 'Nhập mới mỗi ngày từ Đà Lạt, Hà Lan, Ecuador đảm bảo độ nở và tươi bền',
      icon: <CrownOutlined />,
      highlight: false
    }
  ];

  const getIcon = (idx: number) => {
    switch (idx) {
      case 0: return <ThunderboltOutlined />;
      case 1: return <FormatPainterOutlined />;
      case 2: return <CameraOutlined />;
      case 3: return <SafetyCertificateOutlined />;
      case 4: return <CrownOutlined />;
      default: return <SmileOutlined />;
    }
  };

  const displayList = commitments.length > 0 
    ? commitments.map((c, i) => ({
        title: c.title,
        desc: c.desc,
        icon: getIcon(i),
        highlight: i === 2 // highlight photo proofing
      }))
    : defaultItems;

  return (
    <section style={{ padding: '48px 0', background: 'var(--color-background-soft)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20
          }}
        >
          {displayList.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: item.highlight ? 'var(--color-white)' : 'rgba(255, 255, 255, 0.7)',
                border: item.highlight ? '2px solid var(--color-primary-dark)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                boxShadow: item.highlight ? 'var(--shadow-md)' : 'none',
                transition: 'all 0.25s ease'
              }}
            >
              {item.highlight && (
                <span 
                  className="badge badge-pastel"
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: 20,
                    fontSize: '0.72rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  }}
                >
                  Cam kết số 1
                </span>
              )}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-sm)',
                  background: item.highlight ? 'var(--color-primary-dark)' : 'var(--color-primary-light)',
                  color: item.highlight ? 'var(--color-white)' : 'var(--color-primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: 16
                }}
              >
                {item.icon}
              </div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: 8, color: 'var(--color-text)' }}>
                {item.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
