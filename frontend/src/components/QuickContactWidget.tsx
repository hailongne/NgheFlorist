import React, { useState, useEffect, useRef } from 'react';
import { PhoneOutlined, MessageOutlined, CloseOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useSiteSettings } from '../context/SiteSettingsContext';

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
  const widgetRef = useRef<HTMLDivElement>(null);

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
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(0, 104, 255, 0.12)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            width: 'min(330px, calc(100vw - 32px))',
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
                  TƯ VẤN NHANH QUA ZALO
                </div>
                <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 600 }}>
                  ● 1 chạm kết nối ngay (Không cần điền form)
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
            Chọn 1 trong 2 hotline Zalo để chat trực tiếp với Florist của Nghệ Florist:
          </div>

          {/* 2 Zalo Primary Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {/* Zalo 1 Button */}
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
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#0053cc';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#0068FF';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: '#FFFFFF',
                  color: '#0068FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 900,
                  flexShrink: 0
                }}
              >
                Z1
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.94rem', fontWeight: 800, lineHeight: 1.2 }}>
                  Chat Zalo 1: {hotline1}
                </div>
                <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: 2 }}>
                  Tư vấn mẫu hoa & Báo giá nhanh
                </div>
              </div>
            </a>

            {/* Zalo 2 Button */}
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
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#0369A1';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#0284C7';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: '#FFFFFF',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 900,
                  flexShrink: 0
                }}
              >
                Z2
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.94rem', fontWeight: 800, lineHeight: 1.2 }}>
                  Chat Zalo 2: {hotline2}
                </div>
                <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: 2 }}>
                  Tư vấn sự kiện & Thiết kế riêng
                </div>
              </div>
            </a>
          </div>

          {/* 2 Hotline Call Buttons */}
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
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#E2E8F0';
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
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <PhoneOutlined style={{ color: '#0284C7' }} />
                <span>{hotline2}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Helper Chip for Desktop/Tablet */}
        {!isOpen && (
          <div
            className="quick-contact-pill desktop-only-action"
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0068FF',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0, 104, 255, 0.18)',
              border: '1px solid rgba(0, 104, 255, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <span>Chat Zalo tư vấn ngay</span>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Tư vấn Zalo"
          className="quick-contact-fab"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#0068FF',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 6px 20px rgba(0, 104, 255, 0.42)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s',
            outline: 'none'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.backgroundColor = '#0053cc';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#0068FF';
          }}
        >
          {/* Pulsing ring animation */}
          {!isOpen && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: '50%',
                border: '2px solid #0068FF',
                opacity: 0.75,
                animation: 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                pointerEvents: 'none'
              }}
            />
          )}

          {isOpen ? (
            <CloseOutlined style={{ fontSize: 22 }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 }}>Zalo</span>
              <MessageOutlined style={{ fontSize: 18, marginTop: 2 }} />
            </div>
          )}
        </button>
      </div>

      <style>{`
        @keyframes pulseRing {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive positioning for Mobile and Tablet */
        @media (max-width: 768px) {
          .quick-contact-widget-root {
            bottom: 84px !important;
            right: 16px !important;
          }
          .quick-contact-fab {
            width: 50px !important;
            height: 50px !important;
          }
        }
      `}</style>
    </div>
  );
}
