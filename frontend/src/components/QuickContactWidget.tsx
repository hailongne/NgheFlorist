import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOutlined,
  MessageOutlined,
  CloseOutlined,
  ThunderboltOutlined,
  FacebookOutlined,
  InstagramOutlined
} from '@ant-design/icons';
import { useSiteSettings } from '../context/SiteSettingsContext';

export type PlatformType = 'zalo' | 'facebook' | 'instagram' | 'phone';

export interface ContactWidgetItem {
  id: number;
  platform_type: PlatformType;
  title: string;
  subtitle: string | null;
  action_link: string;
  sort_order: number;
  is_active: number | boolean;
}

interface QuickContactWidgetProps {
  hotline1?: string;
  hotline2?: string;
  zalo1Url?: string;
  zalo2Url?: string;
}

export default function QuickContactWidget({
  hotline1: propHotline1,
  hotline2: propHotline2,
  zalo1Url: propZalo1Url,
  zalo2Url: propZalo2Url
}: QuickContactWidgetProps) {
  const siteSettings = useSiteSettings();
  const hotline1 = propHotline1 || siteSettings.hotline1 || '0862 926 866';
  const hotline2 = propHotline2 || siteSettings.hotline2 || '0329 806 866';
  const zalo1Url = propZalo1Url || siteSettings.zaloUrl1 || 'https://zalo.me/0862926866';
  const zalo2Url = propZalo2Url || siteSettings.zaloUrl2 || 'https://zalo.me/0329806866';

  const [isOpen, setIsOpen] = useState(false);
  const [widgets, setWidgets] = useState<ContactWidgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic contact widgets from API
  useEffect(() => {
    fetch('/api/contact-widgets')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load contact widgets');
        return res.json();
      })
      .then((data: ContactWidgetItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setWidgets(data);
        }
      })
      .catch(err => {
        console.warn('Using fallback contact widgets:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const cleanPhone1 = hotline1.replace(/\s+/g, '');
  const cleanPhone2 = hotline2.replace(/\s+/g, '');

  const getPlatformStyle = (type: PlatformType, idx: number) => {
    switch (type) {
      case 'zalo':
        return {
          bgColor: idx % 2 === 0 ? '#0068FF' : '#0284C7',
          hoverBg: idx % 2 === 0 ? '#0053cc' : '#0369A1',
          shadow: idx % 2 === 0 ? '0 4px 12px rgba(0, 104, 255, 0.28)' : '0 4px 12px rgba(2, 132, 199, 0.28)',
          iconText: `Z${idx + 1}`,
          textColor: idx % 2 === 0 ? '#0068FF' : '#0284C7'
        };
      case 'facebook':
        return {
          bgColor: '#0084FF',
          hoverBg: '#006ed6',
          shadow: '0 4px 12px rgba(0, 132, 255, 0.28)',
          iconText: 'FB',
          textColor: '#0084FF'
        };
      case 'instagram':
        return {
          bgColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          hoverBg: 'linear-gradient(45deg, #e08423 0%, #d6582c 25%, #cc1733 50%, #bc1356 75%, #ac0878 100%)',
          shadow: '0 4px 12px rgba(225, 48, 108, 0.28)',
          iconText: 'IG',
          textColor: '#E1306C'
        };
      case 'phone':
        return {
          bgColor: '#10B981',
          hoverBg: '#059669',
          shadow: '0 4px 12px rgba(16, 185, 129, 0.28)',
          iconText: 'TEL',
          textColor: '#059669'
        };
    }
  };

  return (
    <div
      ref={widgetRef}
      className="quick-contact-widget-root"
      style={{
        position: 'fixed',
        zIndex: 999,
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}
    >
      {/* Popover / Speed Dial Menu */}
      {isOpen && (
        <div
          className="quick-contact-panel"
          style={{
            marginBottom: 12,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            boxShadow: '0 14px 40px rgba(15, 23, 42, 0.2), 0 4px 14px rgba(0, 104, 255, 0.12)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            width: 'min(340px, calc(100vw - 32px))',
            padding: '18px 16px',
            animation: 'fadeInUp 0.25s ease-out'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0068FF 0%, #004ecc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <ThunderboltOutlined style={{ fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                  KẾT NỐI TƯ VẤN NHANH
                </div>
                <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 600 }}>
                  ● 1 chạm phản hồi ngay qua Florist
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Đóng bảng tư vấn"
              style={{
                border: 'none',
                background: '#F1F5F9',
                width: 28,
                height: 28,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                fontSize: 12
              }}
            >
              <CloseOutlined />
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 14, lineHeight: 1.45 }}>
            Chọn kênh liên hệ thuận tiện nhất để nhận tư vấn & duyệt ảnh hoa:
          </div>

          {/* Dynamic Buttons (or Fallback) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {widgets.length > 0 ? (
              widgets.map((w, idx) => {
                const style = getPlatformStyle(w.platform_type, idx);
                return (
                  <a
                    key={w.id}
                    href={w.action_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: style.bgColor,
                      color: '#FFFFFF',
                      borderRadius: 12,
                      padding: '12px 14px',
                      textDecoration: 'none',
                      transition: 'transform 0.15s ease, opacity 0.15s ease',
                      boxShadow: style.shadow
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.opacity = '0.95';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: '#FFFFFF',
                        color: style.textColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: w.platform_type === 'zalo' ? 17 : 18,
                        fontWeight: 900,
                        flexShrink: 0
                      }}
                    >
                      {w.platform_type === 'zalo' ? (
                        style.iconText
                      ) : w.platform_type === 'facebook' ? (
                        <FacebookOutlined />
                      ) : w.platform_type === 'instagram' ? (
                        <InstagramOutlined />
                      ) : (
                        <PhoneOutlined />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, lineHeight: 1.2 }}>
                        {w.title}
                      </div>
                      {w.subtitle && (
                        <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: 2 }}>
                          {w.subtitle}
                        </div>
                      )}
                    </div>
                  </a>
                );
              })
            ) : (
              /* Fallback static buttons */
              <>
                <a
                  href={zalo1Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: '#0068FF',
                    color: '#FFFFFF',
                    borderRadius: 12,
                    padding: '12px 14px',
                    textDecoration: 'none',
                    transition: 'transform 0.15s ease, background-color 0.15s ease',
                    boxShadow: '0 4px 12px rgba(0, 104, 255, 0.28)'
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#FFFFFF', color: '#0068FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, flexShrink: 0 }}>
                    Z1
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, lineHeight: 1.2 }}>Chat Zalo 1: {hotline1}</div>
                    <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: 2 }}>Tư vấn mẫu hoa & Báo giá nhanh</div>
                  </div>
                </a>

                <a
                  href={zalo2Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    borderRadius: 12,
                    padding: '12px 14px',
                    textDecoration: 'none',
                    transition: 'transform 0.15s ease, background-color 0.15s ease',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.28)'
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#FFFFFF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, flexShrink: 0 }}>
                    Z2
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, lineHeight: 1.2 }}>Chat Zalo 2: {hotline2}</div>
                    <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: 2 }}>Gửi ảnh hoa thực tế & Đặt theo yêu cầu</div>
                  </div>
                </a>
              </>
            )}
          </div>

          {/* Hotline Call Quick Bar */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, textAlign: 'center' }}>
              HOẶC GỌI ĐIỆN TRỰC TIẾP
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <a
                href={`tel:${cleanPhone1}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#1E293B',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.15s'
                }}
              >
                <PhoneOutlined style={{ color: '#0068FF' }} />
                <span>{hotline1}</span>
              </a>

              <a
                href={`tel:${cleanPhone2}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#1E293B',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.15s'
                }}
              >
                <PhoneOutlined style={{ color: '#0284C7' }} />
                <span>{hotline2}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Tư vấn nhanh"
        className="quick-contact-btn pulse-effect"
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isOpen ? '#1E293B' : 'linear-gradient(135deg, #0068FF 0%, #004ecc 100%)',
          color: '#FFFFFF',
          fontSize: 24,
          boxShadow: '0 8px 24px rgba(0, 104, 255, 0.42)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
      >
        {isOpen ? <CloseOutlined /> : <MessageOutlined />}
        {!isOpen && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 14,
              height: 14,
              backgroundColor: '#10B981',
              borderRadius: '50%',
              border: '2px solid #FFFFFF'
            }}
          />
        )}
      </button>
    </div>
  );
}
