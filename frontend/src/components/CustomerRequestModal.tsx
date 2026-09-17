import React, { useState, useEffect, useRef } from 'react';
import { 
  CloseOutlined, 
  CheckCircleFilled, 
  CopyOutlined, 
  CheckOutlined, 
  UploadOutlined, 
  DeleteOutlined, 
  MessageOutlined, 
  PhoneOutlined,
  LoadingOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { useCustomerRequest } from '../context/RequestContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import ImageWithFallback, { getFallbackForId } from './ImageWithFallback';

interface AttachmentItem {
  file_url: string;
  original_name: string;
  file_size: number;
  mime_type: string;
}

const FLOWER_TYPES = ['Bó hoa', 'Giỏ hoa', 'Kệ hoa', 'Hoa Cưới', 'Kệ Tang', 'Khác'];

const BOUQUET_BUDGETS = [
  '300.000đ – 500.000đ',
  '500.000đ – 1.000.000đ',
  '1.000.000đ – 2.000.000đ',
  'Trên 2.000.000đ',
  'Tùy ý'
];

const BASKET_BUDGETS = [
  '600.000đ – 1.000.000đ',
  '1.000.000đ – 1.800.000đ',
  '1.800.000đ – 3.000.000đ',
  'Trên 3.000.000đ',
  'Tùy ý'
];

const STAND_BUDGETS = [
  '1.200.000đ – 1.800.000đ',
  '1.800.000đ – 2.500.000đ',
  '2.500.000đ – 4.000.000đ',
  'Trên 4.000.000đ',
  'Tùy ý'
];

const WEDDING_BUDGETS = [
  '500.000đ – 1.000.000đ',
  '1.000.000đ – 1.800.000đ',
  '1.800.000đ – 3.000.000đ',
  'Trên 3.000.000đ',
  'Tùy ý'
];

const FUNERAL_BUDGETS = [
  '800.000đ – 1.200.000đ',
  '1.200.000đ – 1.800.000đ',
  '1.800.000đ – 2.800.000đ',
  'Trên 2.800.000đ',
  'Tùy ý'
];

const COLOR_PRESETS = [
  'Pastel dịu nhẹ',
  'Đỏ quyến rũ',
  'Hồng ngọt ngào',
  'Vàng & Cam tươi sáng',
  'Trắng tinh khôi',
  'Xanh dương thanh lịch',
  'Tone tím mộng mơ'
];

const OCCASION_PRESETS = [
  'Sinh nhật',
  'Khai trương',
  'Kỷ niệm / Hẹn hò',
  'Chúc mừng thăng chức',
  'Cảm ơn / Tri ân',
  'Hoa cưới / Cầm tay',
  'Chia buồn'
];

export default function CustomerRequestModal() {
  const { isOpen, selectedProduct, requestType, closeRequestModal, openRequestModal } = useCustomerRequest();
  const { zaloUrl1, zaloUrl2, hotline1, hotline2 } = useSiteSettings();

  // Form states
  const [activeType, setActiveType] = useState<'PRODUCT_SELECTION' | 'CUSTOM_DESIGN'>('PRODUCT_SELECTION');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [zalo, setZalo] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  const [budget, setBudget] = useState('');
  const [customBudget, setCustomBudget] = useState('');
  const [colorTone, setColorTone] = useState('');
  const [style, setStyle] = useState('Hiện đại, tự nhiên');
  const [recipient, setRecipient] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedTime, setRequestedTime] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [notes, setNotes] = useState('');

  // Upload attachments
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission & Result states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState<{
    code: string;
    messageText: string;
    conversionConfig: {
      zalo_url: string;
      fanpage_url: string;
      primary_channel: string;
      primary_cta_text: string;
      secondary_cta_text: string;
    };
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Sync type when modal opens & Auto-fill from saved delivery info
  useEffect(() => {
    if (isOpen) {
      setActiveType(selectedProduct ? 'PRODUCT_SELECTION' : requestType);
      setSuccessResult(null);
      setErrorMessage('');
      setCopiedCode(false);
      setCopiedMessage(false);

      // Auto-fill from saved delivery info or user account
      try {
        const savedDeliveryStr = localStorage.getItem('nghe_customer_delivery_info');
        const savedUserStr = localStorage.getItem('nghe_customer_user');
        const savedDelivery = savedDeliveryStr ? JSON.parse(savedDeliveryStr) : null;
        const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

        if (savedDelivery) {
          if (!customerName && savedDelivery.ordering_name) setCustomerName(savedDelivery.ordering_name);
          if (!phone && savedDelivery.ordering_phone) {
            setPhone(savedDelivery.ordering_phone);
            setZalo(savedDelivery.ordering_phone);
          }
          if (!recipient && savedDelivery.recipient_name) {
            setRecipient(savedDelivery.recipient_phone ? `${savedDelivery.recipient_name} - ${savedDelivery.recipient_phone}` : savedDelivery.recipient_name);
          }
          if (!deliveryArea && savedDelivery.delivery_address) setDeliveryArea(savedDelivery.delivery_address);
          if (!requestedTime && savedDelivery.preferred_delivery_time) setRequestedTime(savedDelivery.preferred_delivery_time);
          if (!cardMessage && savedDelivery.card_message) setCardMessage(savedDelivery.card_message);
          if (!notes && savedDelivery.notes) setNotes(savedDelivery.notes);
        } else if (savedUser) {
          if (!customerName && savedUser.full_name) setCustomerName(savedUser.full_name);
          if (!phone && savedUser.phone) {
            setPhone(savedUser.phone);
            setZalo(savedUser.phone);
          }
        }
      } catch (e) {
        console.error('Autofill in modal error:', e);
      }
    }
  }, [isOpen, selectedProduct, requestType]);

  // Sync zalo with phone if checkbox checked
  useEffect(() => {
    if (sameAsPhone) {
      setZalo(phone);
    }
  }, [phone, sameAsPhone]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length >= 3) {
      alert('Bạn chỉ có thể tải lên tối đa 3 ảnh tham khảo.');
      return;
    }

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng ảnh tối đa là 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await fetch('/api/customer-requests/upload-attachment', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAttachments(prev => [
          ...prev,
          {
            file_url: data.fileUrl,
            original_name: data.originalName,
            file_size: data.fileSize,
            mime_type: file.type
          }
        ]);
      } else {
        alert(data.error || 'Lỗi tải ảnh tham khảo');
      }
    } catch (err: any) {
      alert('Không thể tải ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại để florist liên hệ.');
      return;
    }

    const productUrl = selectedProduct?.slug ? `${window.location.origin}/product/${selectedProduct.slug}` : undefined;

    const finalBudget = budget === 'Tùy ý' 
      ? (customBudget.trim() || 'Tùy ý theo tư vấn')
      : budget;

    const payload = {
      type: activeType,
      customer_name: customerName.trim(),
      phone: phone.trim(),
      zalo: (zalo || phone).trim(),
      selected_product_id: selectedProduct?.id || null,
      selected_product_name: selectedProduct?.name || null,
      product_url: productUrl,
      budget: finalBudget.trim() || undefined,
      color_tone: colorTone.trim() || undefined,
      style: style.trim() || undefined,
      recipient: recipient.trim() || undefined,
      requested_date: requestedDate || undefined,
      requested_time: requestedTime || undefined,
      delivery_area: deliveryArea.trim() || undefined,
      message: cardMessage.trim() || undefined,
      notes: notes.trim() || undefined,
      attachments
    };

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/customer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gửi yêu cầu.');
      }

      setSuccessResult({
        code: data.code,
        messageText: data.messageText,
        conversionConfig: data.conversionConfig
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'message') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      } else {
        setCopiedMessage(true);
        setTimeout(() => setCopiedMessage(false), 2500);
      }
    });
  };

  return (
    <div 
      className="request-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRequestModal();
      }}
    >
      <div className="request-modal-container">
        {/* Modal Header */}
        <div className="request-modal-header">
          <div style={{ minWidth: 0, paddingRight: 8 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-dark)', lineHeight: 1.3 }}>
              {successResult ? 'Yêu Cầu Tư Vấn Của Bạn' : 'Yêu Cầu Tư Vấn & Chọn Mẫu Hoa'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              {successResult 
                ? 'Florist đã sẵn sàng tư vấn mẫu hoa và hình ảnh thực tế cho bạn' 
                : 'Florist sẽ phản hồi ngay qua Zalo hoặc điện thoại để hỗ trợ bạn chu đáo nhất.'}
            </p>
          </div>
          <button
            onClick={closeRequestModal}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              fontSize: 16,
              flexShrink: 0
            }}
            aria-label="Đóng"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Modal Body */}
        <div className="request-modal-body">
          {successResult ? (
            /* ===== SUCCESS VIEW ===== */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div 
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircleFilled />
              </div>

              <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#166534', margin: '0 0 6px' }}>
                Gửi Yêu Cầu Thành Công!
              </h4>
              <p style={{ fontSize: '0.95rem', color: '#4B5563', margin: '0 0 20px', lineHeight: 1.5 }}>
                Hệ thống Nghệ Florist đã ghi nhận thông tin của bạn. Vui lòng kết nối qua Zalo để Florist gửi hình hoa thực tế và báo giá chi tiết.
              </p>

              {/* Request Code Box */}
              <div 
                style={{
                  background: '#F0F9FF',
                  border: '1.5px dashed #38BDF8',
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5, color: '#0369A1', fontWeight: 700 }}>
                    Mã yêu cầu của bạn:
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0C4A6E', letterSpacing: 1, marginTop: 2 }}>
                    {successResult.code}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(successResult.code, 'code')}
                  style={{
                    background: copiedCode ? '#16A34A' : '#FFFFFF',
                    color: copiedCode ? '#FFFFFF' : '#0284C7',
                    border: copiedCode ? '1px solid #16A34A' : '1px solid #BAE6FD',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s'
                  }}
                >
                  {copiedCode ? <CheckOutlined /> : <CopyOutlined />}
                  {copiedCode ? 'Đã sao chép' : 'Sao chép mã'}
                </button>
              </div>

              {/* Structured Message Box & Copy */}
              <div 
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '14px',
                  textAlign: 'left',
                  marginBottom: 24
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Nội dung yêu cầu được định dạng:
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(successResult.messageText, 'message')}
                    style={{
                      background: copiedMessage ? '#16A34A' : '#E0F2FE',
                      color: copiedMessage ? '#FFFFFF' : '#0369A1',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {copiedMessage ? <CheckOutlined /> : <CopyOutlined />}
                    {copiedMessage ? 'Đã sao chép nội dung' : 'Sao chép toàn bộ'}
                  </button>
                </div>
                <pre 
                  style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    color: '#334155',
                    fontFamily: 'inherit',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    maxHeight: 140,
                    overflowY: 'auto',
                    backgroundColor: '#FFFFFF',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #F1F5F9'
                  }}
                >
                  {successResult.messageText}
                </pre>
              </div>

              {/* Mandatory Requirement & Disclaimer Alert */}
              <div 
                style={{
                  background: '#FFFBEB',
                  border: '1.5px solid #F59E0B',
                  borderRadius: 12,
                  padding: '14px 16px',
                  textAlign: 'left',
                  marginBottom: 20,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start'
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>
                    LƯU Ý BẮT BUỘC ĐỂ ĐẶT ĐƯỢC HÀNG:
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#92400E', lineHeight: 1.55 }}>
                    Quý khách vui lòng <strong>sao chép toàn bộ thông tin</strong> ở trên và bấm <strong>liên hệ với sales (qua Zalo)</strong> để gửi đơn và chốt mẫu hoa.
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#DC2626', fontWeight: 700, marginTop: 6, lineHeight: 1.5, background: '#FEF2F2', padding: '8px 12px', borderRadius: 6, border: '1px solid #FECACA' }}>
                    * Nếu chưa liên hệ trực tiếp với sales, Nghệ Florist sẽ hoàn toàn không có trách nhiệm gì vì chúng tôi chưa nhận được đơn hàng chính thức của quý khách.
                  </div>
                </div>
              </div>

              {/* Conversion CTAs: Dual Zalo Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {/* Primary CTA: Zalo 1 */}
                <a
                  href="https://zalo.me/0987654321"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (successResult?.messageText) {
                      copyToClipboard(successResult.messageText, 'message');
                    }
                  }}
                  style={{
                    backgroundColor: '#0068FF',
                    color: '#FFFFFF',
                    borderRadius: 12,
                    padding: '14px 20px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 4px 12px rgba(0, 104, 255, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0053cc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0068FF'}
                >
                  <MessageOutlined style={{ fontSize: 20 }} />
                  Gửi đơn qua Zalo 1: {hotline1}
                </a>

                {/* Secondary CTA: Zalo 2 */}
                <a
                  href={zaloUrl2}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (successResult?.messageText) {
                      copyToClipboard(successResult.messageText, 'message');
                    }
                  }}
                  style={{
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    borderRadius: 12,
                    padding: '14px 20px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0369A1'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0284C7'}
                >
                  <MessageOutlined style={{ fontSize: 20 }} />
                  Gửi đơn qua Zalo 2: {hotline2}
                </a>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                <PhoneOutlined /> Hoặc gọi hỗ trợ: <a href={`tel:${hotline1.replace(/\s+/g, '')}`} style={{ color: '#0369A1', fontWeight: 700, textDecoration: 'none' }}>{hotline1}</a> • <a href={`tel:${hotline2.replace(/\s+/g, '')}`} style={{ color: '#0369A1', fontWeight: 700, textDecoration: 'none' }}>{hotline2}</a>
              </div>
            </div>
          ) : (
            /* ===== FORM VIEW ===== */
            <form onSubmit={handleSubmit}>
              {/* Type Switcher */}
              <div 
                style={{
                  display: 'flex',
                  backgroundColor: '#F1F5F9',
                  borderRadius: 10,
                  padding: 3,
                  marginBottom: 12,
                  gap: 4
                }}
              >
                <button
                  type="button"
                  className="request-type-btn"
                  onClick={() => setActiveType('PRODUCT_SELECTION')}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '7px 6px',
                    borderRadius: 7,
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    backgroundColor: activeType === 'PRODUCT_SELECTION' ? '#FFFFFF' : 'transparent',
                    color: activeType === 'PRODUCT_SELECTION' ? 'var(--color-primary-dark)' : '#64748B',
                    boxShadow: activeType === 'PRODUCT_SELECTION' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}
                >
                  🌸 Chọn mẫu hoa có sẵn
                </button>
                <button
                  type="button"
                  className="request-type-btn"
                  onClick={() => setActiveType('CUSTOM_DESIGN')}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '7px 6px',
                    borderRadius: 7,
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    backgroundColor: activeType === 'CUSTOM_DESIGN' ? '#FFFFFF' : 'transparent',
                    color: activeType === 'CUSTOM_DESIGN' ? 'var(--color-primary-dark)' : '#64748B',
                    boxShadow: activeType === 'CUSTOM_DESIGN' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}
                >
                  🎨 Thiết kế hoa theo yêu cầu
                </button>
              </div>

              {/* Selected Product Banner (if applicable) */}
              {activeType === 'PRODUCT_SELECTION' && selectedProduct && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    backgroundColor: 'var(--color-primary-light)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    marginBottom: 12
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                    <ImageWithFallback
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name || 'Mẫu hoa đã chọn'}
                      fallbackSrc={getFallbackForId(selectedProduct.id || 1)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                      Mẫu hoa bạn quan tâm:
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedProduct.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      Giá tham khảo: <strong style={{ color: 'var(--color-primary-dark)' }}>
                        {typeof selectedProduct.price === 'number' ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price) : selectedProduct.price}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div 
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #F87171',
                    color: '#991B1B',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    marginBottom: 12
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {/* Contact Information (Mandatory) */}
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>1. Thông tin liên hệ</span>
                  <span style={{ fontSize: '0.72rem', color: '#E11D48', fontWeight: 500 }}>(Bắt buộc)</span>
                </h4>

                <div className="request-form-row">
                  <div>
                    <label className="request-modal-label">
                      Họ và tên của bạn *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Chị Lan, Anh Nam..."
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="request-modal-input"
                    />
                  </div>

                  <div>
                    <label className="request-modal-label">
                      Số điện thoại nhận tư vấn *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="09xx xxx xxx"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="request-modal-input"
                    />
                  </div>
                </div>

                {/* Zalo Option */}
                <div style={{ marginTop: 6 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={e => setSameAsPhone(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Số điện thoại trên cũng là tài khoản Zalo của tôi
                  </label>

                  {!sameAsPhone && (
                    <div style={{ marginTop: 6 }}>
                      <input
                        type="text"
                        placeholder="Nhập số Zalo khác nếu có..."
                        value={zalo}
                        onChange={e => setZalo(e.target.value)}
                        className="request-modal-input"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Floral & Customization Specifications */}
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                  2. Mong muốn về hoa & Giao nhận
                </h4>

                {/* Kiểu dáng hoa (Bó hoa, Giỏ hoa, Kệ hoa, Khác) */}
                <div style={{ marginBottom: 10 }}>
                  <label className="request-modal-label">
                    Kiểu dáng hoa:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {FLOWER_TYPES.map(ft => {
                      const isSelected = style === ft || (!style && ft === 'Bó hoa');
                      return (
                        <button
                          key={ft}
                          type="button"
                          className="request-chip-btn"
                          onClick={() => {
                            setStyle(ft);
                            setCustomBudget('');
                            if (ft === 'Bó hoa') setBudget('500.000đ – 1.000.000đ');
                            else if (ft === 'Giỏ hoa') setBudget('1.000.000đ – 1.800.000đ');
                            else if (ft === 'Kệ hoa') setBudget('1.800.000đ – 2.500.000đ');
                            else if (ft === 'Hoa Cưới') setBudget('1.000.000đ – 1.800.000đ');
                            else if (ft === 'Kệ Tang') setBudget('1.200.000đ – 1.800.000đ');
                            else setBudget('Tùy ý');
                          }}
                          style={{
                            border: isSelected ? '1.5px solid var(--color-primary-dark)' : '1px solid #CBD5E1',
                            backgroundColor: isSelected ? 'var(--color-primary-light)' : '#F8FAFC',
                            color: isSelected ? 'var(--color-primary-dark)' : '#334155',
                            fontWeight: isSelected ? 700 : 500
                          }}
                        >
                          {ft}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget selector */}
                <div style={{ marginBottom: 10 }}>
                  <label className="request-modal-label">
                    Ngân sách tham khảo:
                    {style === 'Bó hoa' && <span style={{ fontSize: '0.74rem', color: '#0284C7', marginLeft: 6 }}>(từ 300k trở lên)</span>}
                    {style === 'Giỏ hoa' && <span style={{ fontSize: '0.74rem', color: '#0284C7', marginLeft: 6 }}>(từ 600k trở lên)</span>}
                    {style === 'Kệ hoa' && <span style={{ fontSize: '0.74rem', color: '#0284C7', marginLeft: 6 }}>(từ 1.2tr trở lên)</span>}
                    {style === 'Hoa Cưới' && <span style={{ fontSize: '0.74rem', color: '#0284C7', marginLeft: 6 }}>(từ 500k trở lên)</span>}
                    {style === 'Kệ Tang' && <span style={{ fontSize: '0.74rem', color: '#0284C7', marginLeft: 6 }}>(từ 800k trở lên)</span>}
                  </label>
                  {style !== 'Khác' ? (
                    <>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {(style === 'Giỏ hoa' 
                          ? BASKET_BUDGETS 
                          : style === 'Kệ hoa' 
                          ? STAND_BUDGETS 
                          : style === 'Hoa Cưới'
                          ? WEDDING_BUDGETS
                          : style === 'Kệ Tang'
                          ? FUNERAL_BUDGETS
                          : BOUQUET_BUDGETS
                        ).map(b => {
                          const isSelected = budget === b;
                          return (
                            <button
                              key={b}
                              type="button"
                              className="request-chip-btn"
                              onClick={() => { 
                                setBudget(b); 
                                if (b !== 'Tùy ý') setCustomBudget(''); 
                              }}
                              style={{
                                border: isSelected ? '1.5px solid var(--color-primary-dark)' : '1px solid #CBD5E1',
                                backgroundColor: isSelected ? 'var(--color-primary-light)' : '#F8FAFC',
                                color: isSelected ? 'var(--color-primary-dark)' : '#334155',
                                fontWeight: isSelected ? 700 : 500
                              }}
                            >
                              {b}
                            </button>
                          );
                        })}
                      </div>
                      {budget === 'Tùy ý' && (
                        <div style={{ marginTop: 8 }}>
                          <input
                            type="text"
                            autoFocus
                            placeholder="Nhập mức ngân sách theo ý bạn..."
                            value={customBudget}
                            onChange={e => setCustomBudget(e.target.value)}
                            className="request-modal-input"
                            style={{ borderColor: 'var(--color-primary-dark)', fontWeight: 600 }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Viết mức ngân sách mong muốn của bạn..."
                        value={customBudget}
                        onChange={e => setCustomBudget(e.target.value)}
                        className="request-modal-input"
                        style={{ borderColor: 'var(--color-primary-dark)', fontWeight: 600 }}
                      />
                    </div>
                  )}
                </div>

                {/* Color tone & Style */}
                <div className="request-form-row">
                  <div>
                    <label className="request-modal-label">
                      Tông màu ưu thích:
                    </label>
                    <input
                      type="text"
                      list="color-presets"
                      placeholder="Ví dụ: Hồng pastel, Đỏ tươi..."
                      value={colorTone}
                      onChange={e => setColorTone(e.target.value)}
                      className="request-modal-input"
                    />
                    <datalist id="color-presets">
                      {COLOR_PRESETS.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="request-modal-label">
                      Dịp tặng / Người nhận:
                    </label>
                    <input
                      type="text"
                      list="occasion-presets"
                      placeholder="Ví dụ: Tặng sinh nhật bạn gái..."
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      className="request-modal-input"
                    />
                    <datalist id="occasion-presets">
                      {OCCASION_PRESETS.map(o => <option key={o} value={o} />)}
                    </datalist>
                  </div>
                </div>

                {/* Delivery Date & Time & Area */}
                <div className="request-form-row">
                  <div>
                    <label className="request-modal-label">
                      Ngày & Giờ cần nhận hoa:
                    </label>
                    <div style={{ display: 'flex', gap: 6, width: '100%', boxSizing: 'border-box' }}>
                      <input
                        type="date"
                        value={requestedDate}
                        onChange={e => setRequestedDate(e.target.value)}
                        className="request-modal-input"
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <input
                        type="time"
                        value={requestedTime}
                        onChange={e => setRequestedTime(e.target.value)}
                        className="request-modal-input"
                        style={{ width: 88, flexShrink: 0 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="request-modal-label">
                      Khu vực giao nhận:
                    </label>
                    <input
                      type="text"
                      placeholder="Quận/Huyện hoặc địa chỉ cụ thể"
                      value={deliveryArea}
                      onChange={e => setDeliveryArea(e.target.value)}
                      className="request-modal-input"
                    />
                  </div>
                </div>

                {/* Greeting Card Message */}
                <div style={{ marginBottom: 10 }}>
                  <label className="request-modal-label">
                    Nội dung lời nhắn trên thiệp / banner (nếu có):
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Chúc mừng sinh nhật em yêu! Yêu em nhiều..."
                    value={cardMessage}
                    onChange={e => setCardMessage(e.target.value)}
                    className="request-modal-input"
                  />
                </div>

                {/* Reference Photo Attachments */}
                <div style={{ marginBottom: 10 }}>
                  <label className="request-modal-label">
                    Ảnh mẫu hoa bạn thích (tối đa 3 ảnh):
                  </label>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {attachments.map((att, idx) => (
                      <div 
                        key={idx}
                        style={{
                          position: 'relative',
                          width: 54,
                          height: 54,
                          borderRadius: 7,
                          overflow: 'hidden',
                          border: '1px solid #CBD5E1'
                        }}
                      >
                        <img 
                          src={att.file_url} 
                          alt="Tham khảo" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            background: 'rgba(0,0,0,0.6)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            fontSize: 9,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    ))}

                    {attachments.length < 3 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 7,
                          border: '1.5px dashed #94A3B8',
                          background: '#F8FAFC',
                          color: '#64748B',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '0.68rem',
                          gap: 2
                        }}
                      >
                        {isUploading ? <LoadingOutlined /> : <UploadOutlined style={{ fontSize: 14 }} />}
                        <span>{isUploading ? 'Đang tải' : 'Thêm ảnh'}</span>
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="request-modal-label">
                    Ghi chú thêm cho Florist:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Yêu cầu riêng về hoa nhập khẩu, cách gói hoa, thông tin người nhận..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="request-modal-input"
                    style={{ resize: 'vertical', minHeight: 48 }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-primary-dark)',
                    color: '#FFFFFF',
                    padding: '11px 16px',
                    minHeight: 42,
                    borderRadius: 10,
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 3px 10px rgba(42, 117, 211, 0.2)',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                >
                  {isSubmitting ? <LoadingOutlined /> : <MessageOutlined />}
                  {isSubmitting ? 'Đang gửi thông tin...' : 'Gửi Yêu Cầu & Nhận Báo Giá Nhanh'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.72rem', color: '#94A3B8', lineHeight: 1.4 }}>
                  ✦ Miễn phí tư vấn & thiết kế thiệp • Cam kết gửi ảnh hoa thực tế trước khi giao
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
