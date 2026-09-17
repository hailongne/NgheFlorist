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
    <section className="features-section">
      <div className="container">
        <div className="features-grid">
          {displayList.map((item, idx) => (
            <div
              key={idx}
              className={`feature-card ${item.highlight ? 'feature-card-highlight' : ''}`}
            >
              {item.highlight && (
                <span className="badge badge-pastel feature-badge">
                  Cam kết số 1
                </span>
              )}
              <div className={`feature-icon-box ${item.highlight ? 'feature-icon-highlight' : ''}`}>
                {item.icon}
              </div>
              <h4 className="feature-title">
                {item.title}
              </h4>
              <p className="feature-desc">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
