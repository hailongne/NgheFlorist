import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CameraOutlined, 
  SafetyCertificateOutlined, 
  SmileOutlined, 
  CarOutlined,
  HeartOutlined,
  CrownOutlined,
  FormatPainterOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  MessageOutlined
} from '@ant-design/icons';
import ImageWithFallback from '../components/ImageWithFallback';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function AboutPage() {
  const { hotline1, zaloUrl1, settings } = useSiteSettings();
  return (
    <div className="about-page">
      {/* 1. BREADCRUMB */}
      <div style={{ background: 'var(--color-background-soft)', borderBottom: '1px solid var(--color-border)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', color: 'var(--color-text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Về Nghệ Florist</span>
        </div>
      </div>

      {/* 2. HERO INTRO SECTION */}
      <section className="about-hero-section">
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span className="badge badge-gold" style={{ fontSize: '0.74rem', letterSpacing: 0.5 }}>
              ✦ NGHỆ THUẬT HOA TƯƠI ĐƯƠNG ĐẠI
            </span>
          </div>

          <h1 className="about-hero-title">
            Về Nghệ Florist — Nơi Cảm Xúc Kết Hoa
          </h1>

          <p className="about-hero-lead">
            Tại <strong>Nghệ Florist</strong>, chúng tôi tin rằng hoa tươi không chỉ là món quà trang trí mà là một thông điệp chân thành, một cầu nối cảm xúc tinh tế và sâu sắc giữa người gửi và người nhận.
          </p>

          {/* Quick Stats Grid */}
          <div className="about-stats-grid">
            <div className="about-stat-card">
              <div className="about-stat-number">100%</div>
              <div className="about-stat-label">Hoa tươi mới nhập mỗi sáng</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-number">5+ Năm</div>
              <div className="about-stat-label">Đồng hành gửi trao yêu thương</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-number">15.000+</div>
              <div className="about-stat-label">Tác phẩm hoa nghệ thuật đến tay khách</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-number">100%</div>
              <div className="about-stat-label">Gửi ảnh thật duyệt trước khi giao</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR STORY & ARTISTRY PHILOSOPHY */}
      <section className="container">
        <div className="about-story-grid">
          <div>
            <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--color-primary-dark)', fontWeight: 700, marginBottom: 8 }}>
              Triết lý sáng tạo
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', marginBottom: 16, lineHeight: 1.3 }}>
              Tâm huyết người Florist trong từng nhành hoa
            </h2>

            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.94rem', marginBottom: 14 }}>
              Được thành lập từ tình yêu thuần khiết với vẻ đẹp thiên nhiên và nghệ thuật cắm hoa đương đại, <strong>Nghệ Florist</strong> tự hào tuyển chọn từng cành hoa nhập khẩu từ các thủ phủ hoa nổi tiếng thế giới như Hà Lan, New Zealand, Ecuador cùng nguồn hoa thượng hạng từ Đà Lạt Hasfarm.
            </p>

            <div className="about-quote-box">
              “Chúng tôi không cắm hoa theo dây chuyền rập khuôn. Mỗi đóa hoa, mỗi nhành lá cắm vào đều mang theo một nhịp điệu riêng, giúp người gửi biểu đạt trọn vẹn sự tinh tế.”
            </div>

            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.94rem', marginBottom: 24 }}>
              Mỗi tác phẩm đều được bảo quản ở nhiệt độ chuẩn mát, kiểm tra từng cánh hoa trước khi hoàn thiện. Chúng tôi đặc biệt chú trọng chi tiết: từ chiếc thiệp viết tay, biển hoa thiết kế đồng bộ, đến túi đựng trong suốt thanh lịch.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link to="/flowers" className="btn btn-primary">
                <span>Khám phá bộ sưu tập hoa</span>
                <ArrowRightOutlined style={{ fontSize: 12 }} />
              </Link>
              <Link to="/custom-order" className="btn btn-outline">
                <FormatPainterOutlined />
                <span>Đặt hoa thiết kế riêng</span>
              </Link>
            </div>
          </div>

          <div className="about-story-img-wrap">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1000&q=80"
              alt="Không gian sáng tạo Nghệ Florist"
              fallbackSrc="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80"
            />
            <div className="about-story-badge">
              🌸 Nghệ Florist Studio & Workshop
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE VALUES (4 GIÁ TRỊ CỐT LÕI) */}
      <section style={{ padding: '48px 0', background: 'var(--color-background-soft)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 12px' }}>
            <span className="badge badge-pastel" style={{ marginBottom: 10 }}>NGUYÊN TẮC HOẠT ĐỘNG</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.95rem)', marginBottom: 8 }}>
              4 Giá Trị Cốt Lõi Tại Nghệ Florist
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
              Những chuẩn mực giúp Nghệ Florist gìn giữ trọn vẹn niềm tin của quý khách qua từng đơn hàng.
            </p>
          </div>

          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="about-value-icon">
                <CrownOutlined />
              </div>
              <h3 style={{ fontSize: '1.08rem', marginBottom: 8, color: 'var(--color-text)' }}>
                Hoa Tươi Thượng Hạng
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>
                Nhập mới từ sáng sớm mỗi ngày, nguồn gốc xuất xứ rõ ràng từ Đà Lạt và hoa nhập khẩu cao cấp thế giới.
              </p>
            </div>

            <div className="about-value-card">
              <div className="about-value-icon">
                <FormatPainterOutlined />
              </div>
              <h3 style={{ fontSize: '1.08rem', marginBottom: 8, color: 'var(--color-text)' }}>
                Gu Thẩm Mỹ Đương Đại
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>
                Phong cách cắm hoa phóng khoáng, phối màu pastel tinh tế, tôn vinh nét đẹp nguyên bản tự nhiên.
              </p>
            </div>

            <div className="about-value-card">
              <div className="about-value-icon">
                <CameraOutlined />
              </div>
              <h3 style={{ fontSize: '1.08rem', marginBottom: 8, color: 'var(--color-text)' }}>
                Minh Bạch Ảnh Thực Tế
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>
                Luôn chụp ảnh thành phẩm thật gửi quý khách duyệt và điều chỉnh đến khi hoàn toàn hài lòng trước khi giao.
              </p>
            </div>

            <div className="about-value-card">
              <div className="about-value-icon">
                <SafetyCertificateOutlined />
              </div>
              <h3 style={{ fontSize: '1.08rem', marginBottom: 8, color: 'var(--color-text)' }}>
                Trọn Vẹn Từng Chi Tiết
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>
                Tặng kèm thiệp thiết kế riêng, túi xách cao cấp, hỗ trợ xuất hóa đơn VAT đầy đủ cho doanh nghiệp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CREATIVE PROCESS (QUY TRÌNH 4 BƯỚC) */}
      <section style={{ padding: '56px 0 40px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 12px' }}>
            <span className="badge badge-gold" style={{ marginBottom: 10 }}>QUY TRÌNH TẬN TÂM</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.95rem)', marginBottom: 8 }}>
              Hành Trình Tạo Nên Tác Phẩm Hoa
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
              4 bước tỉ mỉ để biến mỗi đơn hàng thành một tác phẩm nghệ thuật tròn đầy cảm xúc.
            </p>
          </div>

          <div className="about-process-grid">
            <div className="about-process-card">
              <div className="about-process-step">01</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>Lắng nghe & Tư vấn</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Florist tư vấn tone màu, phong cách cắm hoa phù hợp nhất với dịp tặng, tính cách người nhận và ngân sách của bạn.
              </p>
            </div>

            <div className="about-process-card">
              <div className="about-process-step">02</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>Tuyển chọn hoa tươi</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Lựa chọn những cành hoa có độ nở đẹp nhất trong ngày, sơ chế và xử lý gốc hoa cẩn thận để giữ độ bền lâu.
              </p>
            </div>

            <div className="about-process-card">
              <div className="about-process-step">03</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>Sáng tạo tác phẩm</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Nghệ nhân Florist kết hợp hài hòa giữa hoa chính, hoa phụ và lá đệm, gắn kèm thiệp chúc mừng thiết kế đồng điệu.
              </p>
            </div>

            <div className="about-process-card">
              <div className="about-process-step">04</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>Duyệt ảnh & Trao gửi</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Gửi ảnh thật tại tiệm qua Zalo để bạn nghiệm thu, sau đó đội ngũ giao hoa chuyên nghiệp vận chuyển an toàn đến tay người nhận.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STUDIO INFORMATION & VISIT US */}
      <section className="container" style={{ marginTop: 24 }}>
        <div 
          style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: ' clamp(24px, 4vw, 40px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, alignItems: 'center' }}>
            <div>
              <span className="badge badge-pastel" style={{ marginBottom: 8 }}>LIÊN HỆ & SHOWROOM</span>
              <h3 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Ghé Thăm Không Gian Nghệ Florist</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 20 }}>
                Bạn có thể trực tiếp ghé thăm studio để ngắm nhìn những đóa hoa tươi mới mỗi ngày và cùng Florist lên ý tưởng cho món quà của mình.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <EnvironmentOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16, marginTop: 3 }} />
                  <div>
                    <strong>Địa chỉ:</strong> {settings.address || '22 ngõ 115 Phố Núi Trúc, Ba Đình, Hà Nội'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ClockCircleOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16 }} />
                  <div>
                    <strong>Giờ mở cửa:</strong> {settings.business_hours || '07:30 – 21:30 (Mở cửa tất cả các ngày trong tuần)'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PhoneOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16 }} />
                  <div>
                    <strong>Hotline tư vấn:</strong> <a href={`tel:${hotline1.replace(/\s+/g, '')}`} style={{ color: 'var(--color-primary-dark)', fontWeight: 700, textDecoration: 'none' }}>{hotline1}</a>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--color-background-soft)', padding: '24px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                Tư vấn nhanh 1-1 với Florist
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                Bạn cần hoa gấp trong ngày hoặc muốn phối màu riêng theo phong thủy? Hãy kết nối ngay với chúng tôi:
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <a 
                  href={zaloUrl1} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
                >
                  <MessageOutlined />
                  <span>Chat Zalo</span>
                </a>
                <a 
                  href={`tel:${hotline1.replace(/\s+/g, '')}`} 
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
                >
                  <PhoneOutlined />
                  <span>Gọi ngay ({hotline1})</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION BANNER */}
      <div className="container">
        <div className="about-cta-banner">
          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.1rem)', color: '#FFFFFF', marginBottom: 12, fontWeight: 700 }}>
            Cùng Nghệ Florist Gửi Trao Yêu Thương
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 'clamp(0.88rem, 2vw, 1.02rem)', maxWidth: 620, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Mỗi bó hoa là một thông điệp chân tình. Hãy để chúng tôi đồng hành cùng bạn tạo nên những khoảnh khắc đáng nhớ nhất.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link 
              to="/flowers" 
              className="btn btn-primary"
              style={{ 
                padding: '13px 28px', 
                fontSize: '0.94rem',
                boxShadow: '0 4px 16px rgba(42, 117, 211, 0.4)'
              }}
            >
              <span>Xem bộ sưu tập hoa mẫu</span>
              <ArrowRightOutlined style={{ fontSize: 12 }} />
            </Link>
            <Link 
              to="/custom-order" 
              className="btn btn-soft"
              style={{ 
                padding: '13px 24px', 
                fontSize: '0.94rem',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.25)'
              }}
            >
              <FormatPainterOutlined />
              <span>Gửi yêu cầu thiết kế riêng</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
