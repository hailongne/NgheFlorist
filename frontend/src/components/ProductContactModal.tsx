import React, { useState, useEffect, useRef } from 'react';
import {
  CloseOutlined,
  CopyOutlined,
  CheckOutlined,
  MessageOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useCustomerRequest } from '../context/RequestContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { RealSocialIcon } from './RealSocialIcons';
import ImageWithFallback, { getFallbackForId } from './ImageWithFallback';
import { useOverlayLock } from '../hooks/useOverlayLock';

export interface ContactWidgetItem {
  id: number;
  platform_type: 'zalo' | 'facebook' | 'instagram' | 'phone';
  title: string;
  subtitle: string | null;
  action_link: string;
  sort_order: number;
  is_active: number | boolean;
}

export default function ProductContactModal() {
  const { isContactModalOpen, contactProduct, closeProductContactModal } = useCustomerRequest();
  const siteSettings = useSiteSettings();
  const modalRef = useRef<HTMLDivElement>(null);

  const [widgets, setWidgets] = useState<ContactWidgetItem[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  useOverlayLock({
    isOpen: isContactModalOpen,
    containerRef: modalRef,
    onClose: closeProductContactModal,
    overlayId: 'product-contact-modal'
  });

  // Fetch active contact widgets from admin
  useEffect(() => {
    if (!isContactModalOpen) return;
    fetch('/api/contact-widgets')
      .then(res => (res.ok ? res.json() : []))
      .then((data: ContactWidgetItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setWidgets(data.filter(w => Boolean(w.is_active)));
        }
      })
      .catch(err => {
        console.warn('Failed to load contact widgets:', err);
      });
  }, [isContactModalOpen]);

  if (!isContactModalOpen || !contactProduct) return null;

  const formatVND = (price?: number | string) => {
    const num = Number(price) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const productUrl = contactProduct.slug
    ? `${window.location.origin}/product/${contactProduct.slug}`
    : window.location.href;

  const consultationText = [
    `🌸 Xin chào Nghệ Florist, mình muốn tư vấn mẫu hoa:`,
    `- Tên mẫu: ${contactProduct.name || 'Mẫu hoa'}`,
    `- Giá tham khảo: ${formatVND(contactProduct.price)}`,
    `- Link xem ảnh: ${productUrl}`
  ].join('\n');

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(consultationText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 3000);
    } catch {}
  };

  const handleChannelClick = async (actionLink: string, platform: string) => {
    // Auto copy message into clipboard for smooth pasting on Zalo / Messenger
    if (platform === 'zalo' || platform === 'facebook') {
      try {
        await navigator.clipboard.writeText(consultationText);
        setCopiedMessage(true);
        setTimeout(() => setCopiedMessage(false), 3000);
      } catch {}
    }

    if (platform === 'phone' || actionLink.startsWith('tel:')) {
      window.location.href = actionLink;
    } else {
      window.open(actionLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Fallback channels if admin hasn't configured any yet
  const fallbackWidgets: ContactWidgetItem[] = [
    {
      id: 1,
      platform_type: 'zalo',
      title: `Chat Zalo 1: ${siteSettings.hotline1 || '0862 926 866'}`,
      subtitle: 'Tư vấn mẫu hoa & Báo giá nhanh trong 3 phút',
      action_link: siteSettings.zaloUrl1 || 'https://zalo.me/0862926866',
      sort_order: 1,
      is_active: 1
    },
    {
      id: 2,
      platform_type: 'zalo',
      title: `Chat Zalo 2: ${siteSettings.hotline2 || '0329 806 866'}`,
      subtitle: 'Hỗ trợ đặt hoa theo yêu cầu & Duyệt ảnh thành phẩm',
      action_link: siteSettings.zaloUrl2 || 'https://zalo.me/0329806866',
      sort_order: 2,
      is_active: 1
    },
    {
      id: 3,
      platform_type: 'facebook',
      title: 'Chat Fanpage Nghệ Florist',
      subtitle: 'Tư vấn mẫu hoa & Báo giá nhanh',
      action_link: 'https://www.facebook.com/Ngheflorist',
      sort_order: 3,
      is_active: 1
    },
    {
      id: 4,
      platform_type: 'phone',
      title: `Hotline ${siteSettings.hotline1 || '0862 926 866'}`,
      subtitle: 'Tư vấn mẫu hoa & Báo giá nhanh',
      action_link: `tel:${(siteSettings.hotline1 || '0862926866').replace(/\s+/g, '')}`,
      sort_order: 4,
      is_active: 1
    }
  ];

  const activeChannels = widgets.length > 0 ? widgets : fallbackWidgets;

  const getPlatformButtonConfig = (type: string) => {
    switch (type) {
      case 'zalo':
        return {
          btnText: 'Nhắn Zalo',
          btnBg: '#0068FF',
          btnColor: '#FFFFFF',
          badgeBg: '#EBF5FF',
          borderColor: '#BFDBFE'
        };
      case 'facebook':
        return {
          btnText: 'Nhắn Fanpage',
          btnBg: '#1877F2',
          btnColor: '#FFFFFF',
          badgeBg: '#EEF2FF',
          borderColor: '#C7D2FE'
        };
      case 'phone':
        return {
          btnText: 'Gọi ngay',
          btnBg: '#059669',
          btnColor: '#FFFFFF',
          badgeBg: '#ECFDF5',
          borderColor: '#A7F3D0'
        };
      case 'instagram':
        return {
          btnText: 'Mở Instagram',
          btnBg: '#E1306C',
          btnColor: '#FFFFFF',
          badgeBg: '#FFF1F2',
          borderColor: '#FBCFE8'
        };
      default:
        return {
          btnText: 'Liên hệ',
          btnBg: '#26383D',
          btnColor: '#FFFFFF',
          badgeBg: '#F1F5F9',
          borderColor: '#E2E8F0'
        };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        padding: '16px',
        animation: 'productContactFadeIn 0.2s ease-out'
      }}
      onClick={closeProductContactModal}
    >
      <style>{`
        @keyframes productContactFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes productContactScaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .product-contact-channel-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid #E8EFF5;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
        }
        .product-contact-channel-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
          border-color: #5D9EAF;
          background: #F8FAFC;
        }
        .product-contact-channel-btn {
          font-size: 0.76rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.15s ease;
        }
      `}</style>

      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.22)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'productContactScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAFDFD'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#E8F5F8',
                color: '#26383D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0
              }}
            >
              <MessageOutlined />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1B363C', letterSpacing: 0.2 }}>
                Liên Hệ Tư Vấn Mẫu Hoa
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: 1 }}>
                Chọn kênh tư vấn bạn thuận tiện nhất bên dưới
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeProductContactModal}
            aria-label="Đóng popup liên hệ"
            style={{
              border: 'none',
              backgroundColor: '#F1F5F9',
              width: 30,
              height: 30,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              fontSize: 13,
              transition: 'background-color 0.15s ease'
            }}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Product Preview Card */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 8,
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF'
              }}
            >
              <ImageWithFallback
                src={contactProduct.imageUrl}
                alt={contactProduct.name || 'Mẫu hoa'}
                fallbackSrc={getFallbackForId(contactProduct.id)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {contactProduct.categoryName && (
                <div style={{ fontSize: '0.68rem', color: '#5D9EAF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                  {contactProduct.categoryName}
                </div>
              )}
              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#1E293B',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={contactProduct.name}
              >
                {contactProduct.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Giá tham khảo:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#26383D' }}>
                  {formatVND(contactProduct.price)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              title="Sao chép đường dẫn xem mẫu hoa này"
              style={{
                backgroundColor: copiedLink ? '#ECFDF5' : '#FFFFFF',
                color: copiedLink ? '#059669' : '#5D9EAF',
                border: `1px solid ${copiedLink ? '#A7F3D0' : '#D8E7E9'}`,
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              {copiedLink ? <CheckOutlined /> : <CopyOutlined />}
              <span>{copiedLink ? 'Đã chép' : 'Chép link'}</span>
            </button>
          </div>

          {/* Copy Message Status Notification */}
          {copiedMessage && (
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: '0.75rem',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600
              }}
            >
              <CheckOutlined style={{ fontSize: 13 }} />
              Đã tự động sao chép thông tin mẫu hoa! Bạn chỉ cần Dán (Paste) vào khung chat.
            </div>
          )}

          {/* Conversion Channels List (From Admin Contact Widgets) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 2 }}>
              Các kênh liên hệ sẵn sàng:
            </div>

            {activeChannels.map((widget) => {
              const cfg = getPlatformButtonConfig(widget.platform_type);
              return (
                <div
                  key={widget.id}
                  className="product-contact-channel-row"
                  onClick={() => handleChannelClick(widget.action_link, widget.platform_type)}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <RealSocialIcon platform={widget.platform_type} size={36} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.25 }}>
                      {widget.title}
                    </div>
                    {widget.subtitle && (
                      <div style={{ fontSize: '0.71rem', color: '#64748B', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {widget.subtitle}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="product-contact-channel-btn"
                    style={{
                      backgroundColor: cfg.btnBg,
                      color: cfg.btnColor
                    }}
                  >
                    <span>{cfg.btnText}</span>
                    <RightOutlined style={{ fontSize: 10 }} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Assistant Action: Copy full message */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              backgroundColor: '#FAFDFD',
              border: '1px dashed #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}
          >
            <div style={{ fontSize: '0.73rem', color: '#64748B' }}>
              💡 Muốn gửi ảnh & thông tin mẫu hoa cho shop nhanh nhất?
            </div>
            <button
              type="button"
              onClick={handleCopyMessage}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284C7',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <CopyOutlined />
              <span>{copiedMessage ? 'Đã sao chép tin nhắn' : 'Sao chép tin nhắn'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            color: '#64748B',
            textAlign: 'center',
            gap: 6
          }}
        >
          <span>✦ Chụp ảnh duyệt hoa thực tế trước khi giao</span>
          <span>•</span>
          <span>Giao nhanh nội thành 2h</span>
        </div>
      </div>
    </div>
  );
}
