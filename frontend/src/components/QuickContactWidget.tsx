import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOutlined,
  MessageOutlined,
  CloseOutlined,
  FacebookOutlined,
  InstagramOutlined,
  RightOutlined
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
      });
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

  const getPlatformConfig = (type: PlatformType, idx: number) => {
    switch (type) {
      case 'zalo':
        return {
          badgeBg: '#EBF5FF',
          badgeColor: '#0068FF',
          borderHover: '#93C5FD',
          bgHover: '#F8FAFF',
          iconText: `Z${idx + 1}`,
          arrowColor: '#0068FF'
        };
      case 'facebook':
        return {
          badgeBg: '#EEF2FF',
          badgeColor: '#1877F2',
          borderHover: '#C7D2FE',
          bgHover: '#FAF5FF',
          iconText: 'FB',
          arrowColor: '#1877F2'
        };
      case 'instagram':
        return {
          badgeBg: '#FFF1F2',
          badgeColor: '#E1306C',
          borderHover: '#FBCFE8',
          bgHover: '#FFF5F5',
          iconText: 'IG',
          arrowColor: '#E1306C'
        };
      case 'phone':
        return {
          badgeBg: '#ECFDF5',
          badgeColor: '#059669',
          borderHover: '#A7F3D0',
          bgHover: '#F6FDF9',
          iconText: 'TEL',
          arrowColor: '#059669'
        };
    }
  };

  return (
    <>
      {/* Scoped CSS for delicate luxury styling & responsive tablet/mobile scaling */}
      <style>{`
        .quick-contact-widget-root {
          position: fixed;
          z-index: 999;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-family: inherit;
        }

        .quick-contact-panel {
          margin-bottom: 12px;
          background-color: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 12px 36px rgba(15, 23, 42, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid #E2E8F0;
          width: 320px;
          padding: 16px 14px;
          animation: quickContactFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes quickContactFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .quick-contact-item-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: #FFFFFF;
          border: 1px solid #E8EFF5;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .quick-contact-item-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
        }

        .quick-contact-item-link:hover .quick-contact-arrow {
          transform: translateX(2px);
        }

        .quick-contact-arrow {
          transition: transform 0.18s ease;
        }

        .quick-contact-fab {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justifyContent: center;
          background: #26383D;
          color: #FFFFFF;
          font-size: 20px;
          box-shadow: 0 6px 20px rgba(38, 56, 61, 0.35);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .quick-contact-fab:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(38, 56, 61, 0.45);
        }

        /* TABLET & MOBILE RESPONSIVE TUNING */
        @media (max-width: 768px) {
          .quick-contact-widget-root {
            bottom: 16px;
            right: 14px;
          }

          .quick-contact-panel {
            width: min(285px, calc(100vw - 28px));
            padding: 12px 10px;
            border-radius: 14px;
            margin-bottom: 8px;
          }

          .quick-contact-item-link {
            padding: 6px 9px;
            gap: 8px;
            border-radius: 8px;
          }

          .quick-contact-badge {
            width: 28px !important;
            height: 28px !important;
            font-size: 12px !important;
            border-radius: 6px !important;
          }

          .quick-contact-title {
            font-size: 0.8rem !important;
          }

          .quick-contact-subtitle {
            font-size: 0.68rem !important;
          }

          .quick-contact-fab {
            width: 44px;
            height: 44px;
            font-size: 17px;
          }
        }
      `}</style>

      <div ref={widgetRef} className="quick-contact-widget-root">
        {/* Popover Menu */}
        {isOpen && (
          <div className="quick-contact-panel">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', letterSpacing: 0.2 }}>
                    TƯ VẤN & DUYỆT ẢNH HOA
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    Phản hồi nhanh trong 3 phút
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Đóng bảng tư vấn"
                style={{
                  border: 'none',
                  background: '#F1F5F9',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  fontSize: 11
                }}
              >
                <CloseOutlined />
              </button>
            </div>

            {/* Contact Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {widgets.length > 0 ? (
                widgets.map((w, idx) => {
                  const cfg = getPlatformConfig(w.platform_type, idx);
                  return (
                    <a
                      key={w.id}
                      href={w.action_link}
                      target={w.platform_type === 'phone' ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="quick-contact-item-link"
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = cfg.borderHover;
                        e.currentTarget.style.backgroundColor = cfg.bgHover;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#E8EFF5';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }}
                    >
                      <div
                        className="quick-contact-badge"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: cfg.badgeBg,
                          color: cfg.badgeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {w.platform_type === 'zalo' ? (
                          cfg.iconText
                        ) : w.platform_type === 'facebook' ? (
                          <FacebookOutlined />
                        ) : w.platform_type === 'instagram' ? (
                          <InstagramOutlined />
                        ) : (
                          <PhoneOutlined />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="quick-contact-title" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1E293B', lineHeight: 1.25 }}>
                          {w.title}
                        </div>
                        {w.subtitle && (
                          <div className="quick-contact-subtitle" style={{ fontSize: '0.7rem', color: '#64748B', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {w.subtitle}
                          </div>
                        )}
                      </div>
                      <RightOutlined className="quick-contact-arrow" style={{ fontSize: 10, color: '#94A3B8', flexShrink: 0 }} />
                    </a>
                  );
                })
              ) : (
                /* Fallback refined delicate buttons */
                <>
                  <a
                    href={zalo1Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="quick-contact-item-link"
                  >
                    <div className="quick-contact-badge" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EBF5FF', color: '#0068FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      Z1
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="quick-contact-title" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1E293B', lineHeight: 1.25 }}>Chat Zalo 1: {hotline1}</div>
                      <div className="quick-contact-subtitle" style={{ fontSize: '0.7rem', color: '#64748B', marginTop: 1 }}>Tư vấn mẫu hoa & Báo giá nhanh</div>
                    </div>
                    <RightOutlined className="quick-contact-arrow" style={{ fontSize: 10, color: '#94A3B8', flexShrink: 0 }} />
                  </a>

                  <a
                    href={zalo2Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="quick-contact-item-link"
                  >
                    <div className="quick-contact-badge" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EBF5FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      Z2
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="quick-contact-title" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1E293B', lineHeight: 1.25 }}>Chat Zalo 2: {hotline2}</div>
                      <div className="quick-contact-subtitle" style={{ fontSize: '0.7rem', color: '#64748B', marginTop: 1 }}>Gửi ảnh hoa thực tế & Đặt theo mẫu</div>
                    </div>
                    <RightOutlined className="quick-contact-arrow" style={{ fontSize: 10, color: '#94A3B8', flexShrink: 0 }} />
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Tư vấn nhanh"
          className="quick-contact-fab"
        >
          {isOpen ? <CloseOutlined /> : <MessageOutlined />}
          {!isOpen && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 11,
                height: 11,
                backgroundColor: '#10B981',
                borderRadius: '50%',
                border: '2px solid #FFFFFF'
              }}
            />
          )}
        </button>
      </div>
    </>
  );
}
