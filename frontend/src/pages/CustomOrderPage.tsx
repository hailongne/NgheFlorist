import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircleOutlined, 
  UploadOutlined, 
  CameraOutlined, 
  SafetyCertificateOutlined,
  CopyOutlined,
  CheckOutlined,
  MessageOutlined,
  PhoneOutlined,
  DeleteOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface AttachmentItem {
  file_url: string;
  original_name: string;
  file_size: number;
  mime_type: string;
}

export default function CustomOrderPage() {
  const { zaloUrl1, zaloUrl2, hotline1, hotline2 } = useSiteSettings();
  const [flowerType, setFlowerType] = useState<'Bó hoa' | 'Giỏ hoa' | 'Kệ hoa' | 'Hoa Cưới' | 'Kệ Tang' | 'Khác'>('Bó hoa');
  const [customFlowerType, setCustomFlowerType] = useState('');
  const [budget, setBudget] = useState('500.000đ – 1.000.000đ');
  const [tone, setTone] = useState('Pastel dịu dàng');
  const [customBudget, setCustomBudget] = useState('');
  const [customTone, setCustomTone] = useState('');
  const [occasion, setOccasion] = useState('Sinh nhật');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [zalo, setZalo] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedTime, setRequestedTime] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [notes, setNotes] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill from saved customer delivery profile or account info
  useEffect(() => {
    try {
      const savedDeliveryStr = localStorage.getItem('nghe_customer_delivery_info');
      const savedUserStr = localStorage.getItem('nghe_customer_user');
      const savedDelivery = savedDeliveryStr ? JSON.parse(savedDeliveryStr) : null;
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

      if (savedDelivery) {
        if (savedDelivery.ordering_name) setCustomerName(savedDelivery.ordering_name);
        if (savedDelivery.ordering_phone) {
          setCustomerPhone(savedDelivery.ordering_phone);
          setZalo(savedDelivery.ordering_phone);
        }
        if (savedDelivery.delivery_address) setDeliveryArea(savedDelivery.delivery_address);
        if (savedDelivery.preferred_delivery_time) setRequestedTime(savedDelivery.preferred_delivery_time);
        if (savedDelivery.card_message) setCardMessage(savedDelivery.card_message);
        if (savedDelivery.notes) setNotes(savedDelivery.notes);
      } else if (savedUser) {
        if (savedUser.full_name) setCustomerName(savedUser.full_name);
        if (savedUser.phone) {
          setCustomerPhone(savedUser.phone);
          setZalo(savedUser.phone);
        }
      }
    } catch (e) {
      console.error('Autofill error:', e);
    }
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Conversion Success Result
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

  // 1. Flower Type / Arrangement Options (Clean & Minimalist)
  const flowerTypeOptions: Array<{
    value: 'Bó hoa' | 'Giỏ hoa' | 'Kệ hoa' | 'Hoa Cưới' | 'Kệ Tang' | 'Khác';
    label: string;
    icon: string;
    minPrice: string;
  }> = [
    {
      value: 'Bó hoa',
      label: 'Bó hoa',
      icon: '⚘',
      minPrice: 'Từ 300k'
    },
    {
      value: 'Giỏ hoa',
      label: 'Giỏ hoa',
      icon: '❀',
      minPrice: 'Từ 600k'
    },
    {
      value: 'Kệ hoa',
      label: 'Kệ hoa',
      icon: '◈',
      minPrice: 'Từ 1.2tr'
    },
    {
      value: 'Hoa Cưới',
      label: 'Hoa Cưới',
      icon: '♡',
      minPrice: 'Từ 500k'
    },
    {
      value: 'Kệ Tang',
      label: 'Kệ Tang',
      icon: '⚜',
      minPrice: 'Từ 800k'
    },
    {
      value: 'Khác',
      label: 'Khác',
      icon: '✦',
      minPrice: 'Tùy ý'
    }
  ];

  // 2. Dynamic Budget Options based on Flower Type (Clean & Direct)
  // Bó hoa: từ 300k trở lên
  const bouquetBudgetOptions = [
    { value: '300.000đ – 500.000đ', label: '300k – 500k' },
    { value: '500.000đ – 1.000.000đ', label: '500k – 1tr' },
    { value: '1.000.000đ – 2.000.000đ', label: '1tr – 2tr' },
    { value: 'Trên 2.000.000đ', label: 'Trên 2tr' },
    { value: 'Tùy ý', label: 'Tùy ý' }
  ];

  // Giỏ hoa: từ 600k trở lên
  const basketBudgetOptions = [
    { value: '600.000đ – 1.000.000đ', label: '600k – 1tr' },
    { value: '1.000.000đ – 1.800.000đ', label: '1tr – 1.8tr' },
    { value: '1.800.000đ – 3.000.000đ', label: '1.8tr – 3tr' },
    { value: 'Trên 3.000.000đ', label: 'Trên 3tr' },
    { value: 'Tùy ý', label: 'Tùy ý' }
  ];

  // Kệ hoa: từ 1.200k trở lên
  const standBudgetOptions = [
    { value: '1.200.000đ – 1.800.000đ', label: '1.2tr – 1.8tr' },
    { value: '1.800.000đ – 2.500.000đ', label: '1.8tr – 2.5tr' },
    { value: '2.500.000đ – 4.000.000đ', label: '2.5tr – 4tr' },
    { value: 'Trên 4.000.000đ', label: 'Trên 4tr' },
    { value: 'Tùy ý', label: 'Tùy ý' }
  ];

  // Hoa Cưới: từ 500k trở lên
  const weddingBudgetOptions = [
    { value: '500.000đ – 1.000.000đ', label: '500k – 1tr' },
    { value: '1.000.000đ – 1.800.000đ', label: '1tr – 1.8tr' },
    { value: '1.800.000đ – 3.000.000đ', label: '1.8tr – 3tr' },
    { value: 'Trên 3.000.000đ', label: 'Trên 3tr' },
    { value: 'Tùy ý', label: 'Tùy ý' }
  ];

  // Kệ Tang: từ 800k trở lên
  const funeralBudgetOptions = [
    { value: '800.000đ – 1.200.000đ', label: '800k – 1.2tr' },
    { value: '1.200.000đ – 1.800.000đ', label: '1.2tr – 1.8tr' },
    { value: '1.800.000đ – 2.800.000đ', label: '1.8tr – 2.8tr' },
    { value: 'Trên 2.800.000đ', label: 'Trên 2.8tr' },
    { value: 'Tùy ý', label: 'Tùy ý' }
  ];

  const currentBudgetOptions = flowerType === 'Bó hoa'
    ? bouquetBudgetOptions
    : flowerType === 'Giỏ hoa'
    ? basketBudgetOptions
    : flowerType === 'Kệ hoa'
    ? standBudgetOptions
    : flowerType === 'Hoa Cưới'
    ? weddingBudgetOptions
    : flowerType === 'Kệ Tang'
    ? funeralBudgetOptions
    : [];

  const handleSelectFlowerType = (type: 'Bó hoa' | 'Giỏ hoa' | 'Kệ hoa' | 'Hoa Cưới' | 'Kệ Tang' | 'Khác') => {
    setFlowerType(type);
    setCustomBudget('');
    if (type === 'Bó hoa') {
      setBudget('500.000đ – 1.000.000đ');
    } else if (type === 'Giỏ hoa') {
      setBudget('1.000.000đ – 1.800.000đ');
    } else if (type === 'Kệ hoa') {
      setBudget('1.800.000đ – 2.500.000đ');
    } else if (type === 'Hoa Cưới') {
      setBudget('1.000.000đ – 1.800.000đ');
    } else if (type === 'Kệ Tang') {
      setBudget('1.200.000đ – 1.800.000đ');
    } else {
      setBudget('Tùy ý');
    }
  };

  const toneOptions = [
    { value: 'Pastel dịu dàng', label: 'Tone Pastel dịu dàng', bg: '#E0F2FE', border: '#7DD3FC', text: '#0369A1' },
    { value: 'Trắng tinh khôi', label: 'Tone Trắng tinh khôi', bg: '#F8FAFC', border: '#CBD5E1', text: '#334155' },
    { value: 'Hồng ngọt ngào', label: 'Tone Hồng ngọt ngào', bg: '#FCE7F3', border: '#F472B6', text: '#9D174D' },
    { value: 'Đỏ quyến rũ', label: 'Tone Đỏ rực rỡ & sang trọng', bg: '#FEE2E2', border: '#F87171', text: '#991B1B' },
    { value: 'Vàng & Cam ấm áp', label: 'Tone Vàng & Cam ấm áp', bg: '#FEF3C7', border: '#FBBF24', text: '#92400E' },
    { value: 'Tone màu khác', label: 'Tone màu khác', bg: '#F1F5F9', border: '#94A3B8', text: '#475569' }
  ];

  const occasionOptions = [
    'Sinh nhật',
    'Kỷ niệm tình yêu / Ngày cưới',
    'Khai trương / Thăng chức',
    'Chúc mừng / Tri ân thầy cô, đối tác',
    'Hoa cầm tay cô dâu',
    'Chia buồn',
    'Dịp đặc biệt khác'
  ];

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
        alert(data.error || 'Lỗi tải ảnh');
      }
    } catch {
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
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
    setError('');

    if (!customerName.trim()) {
      setError('Vui lòng cung cấp họ và tên của bạn');
      return;
    }

    if (!customerPhone.trim()) {
      setError('Vui lòng cung cấp số điện thoại để florist liên hệ tư vấn');
      return;
    }

    setSubmitting(true);
    try {
      const styleValue = flowerType === 'Khác' 
        ? (customFlowerType.trim() ? `Khác (${customFlowerType.trim()})` : 'Kiểu dáng khác')
        : flowerType;

      const finalBudget = (flowerType === 'Khác' || budget === 'Tùy ý')
        ? (customBudget.trim() || 'Tùy ý theo tư vấn')
        : budget;

      const finalTone = tone === 'Tone màu khác'
        ? (customTone.trim() || 'Tone màu theo tư vấn')
        : tone;

      const payload = {
        type: 'CUSTOM_DESIGN',
        customer_name: customerName.trim(),
        phone: customerPhone.trim(),
        zalo: (sameAsPhone ? customerPhone : zalo || customerPhone).trim(),
        style: styleValue,
        budget: finalBudget.trim(),
        color_tone: finalTone.trim(),
        recipient: occasion.trim(),
        requested_date: requestedDate || undefined,
        requested_time: requestedTime || undefined,
        delivery_area: deliveryArea.trim() || undefined,
        message: cardMessage.trim() || undefined,
        notes: notes.trim() || undefined,
        attachments
      };

      const res = await fetch('/api/customer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi gửi yêu cầu thiết kế');

      setSuccessResult({
        code: data.code,
        messageText: data.messageText,
        conversionConfig: data.conversionConfig
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
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
    <div className="custom-order-page">
      <div className="container" style={{ width: '100%', boxSizing: 'border-box' }}>
        {/* Header Intro */}
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>
          <span className="badge badge-pastel" style={{ marginBottom: 12 }}>
            Dịch vụ hoa tươi thiết kế riêng
          </span>
          <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', marginBottom: 14, color: 'var(--color-text)', lineHeight: 1.25 }}>
            Thiết Kế Hoa Theo Yêu Cầu
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.92rem, 2vw, 1.05rem)', lineHeight: 1.7 }}>
            Mỗi người nhận đều là duy nhất. Hãy chia sẻ với Nghệ Florist ý tưởng hoặc hình ảnh mẫu bạn thích, florist sẽ thiết kế riêng và <strong>gửi ảnh thật duyệt trước khi giao</strong>.
          </p>
        </div>

        {successResult ? (
          /* ===== CONVERSION SUCCESS CARD ===== */
          <div 
            style={{
              maxWidth: 680,
              margin: '0 auto',
              background: 'var(--color-white)',
              border: '2px solid #38BDF8',
              borderRadius: 20,
              padding: '40px clamp(20px, 4vw, 48px)',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
            }}
          >
            <div 
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#16A34A',
                fontSize: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <CheckCircleOutlined />
            </div>

            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#166534', marginBottom: 12 }}>
              Gửi Yêu Cầu Thiết Kế Thành Công!
            </h2>
            <p style={{ color: '#4B5563', fontSize: '1rem', lineHeight: 1.6, marginBottom: 24 }}>
              Hệ thống đã tạo mã yêu cầu riêng cho bạn. Florist của tiệm sẽ liên hệ tư vấn chi tiết và gửi mẫu hoa thực tế qua Zalo.
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
                marginBottom: 24
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5, color: '#0369A1', fontWeight: 700 }}>
                  Mã yêu cầu của bạn:
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0C4A6E', letterSpacing: 1, marginTop: 2 }}>
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
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {copiedCode ? <CheckOutlined /> : <CopyOutlined />}
                {copiedCode ? 'Đã sao chép' : 'Sao chép mã'}
              </button>
            </div>

            {/* Formatted Message Box */}
            <div 
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '16px',
                textAlign: 'left',
                marginBottom: 28
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Thông tin yêu cầu đã định dạng:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(successResult.messageText, 'message')}
                  style={{
                    background: copiedMessage ? '#16A34A' : '#E0F2FE',
                    color: copiedMessage ? '#FFFFFF' : '#0369A1',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {copiedMessage ? <CheckOutlined /> : <CopyOutlined />}
                  {copiedMessage ? 'Đã sao chép nội dung' : 'Sao chép nội dung'}
                </button>
              </div>

              <pre 
                style={{
                  margin: 0,
                  fontSize: '0.84rem',
                  color: '#334155',
                  fontFamily: 'inherit',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  maxHeight: 160,
                  overflowY: 'auto',
                  backgroundColor: '#FFFFFF',
                  padding: '12px',
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
                borderRadius: 14,
                padding: '16px 20px',
                textAlign: 'left',
                marginBottom: 24,
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start'
              }}
            >
              <span style={{ fontSize: 24, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>
                  LƯU Ý BẮT BUỘC ĐỂ ĐẶT ĐƯỢC HÀNG:
                </div>
                <div style={{ fontSize: '0.9rem', color: '#92400E', lineHeight: 1.55 }}>
                  Quý khách vui lòng <strong>sao chép toàn bộ thông tin</strong> ở trên và bấm <strong>liên hệ với sales (qua Zalo)</strong> để gửi đơn và chốt mẫu hoa.
                </div>
                <div style={{ fontSize: '0.88rem', color: '#DC2626', fontWeight: 700, marginTop: 6, lineHeight: 1.5, background: '#FEF2F2', padding: '8px 12px', borderRadius: 6, border: '1px solid #FECACA' }}>
                  * Nếu chưa liên hệ trực tiếp với sales, Nghệ Florist sẽ hoàn toàn không có trách nhiệm gì vì chúng tôi chưa nhận được đơn hàng chính thức của quý khách.
                </div>
              </div>
            </div>

            {/* Conversion CTA Action Buttons: Dual Zalo Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
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
                  padding: '16px 24px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 4px 14px rgba(0, 104, 255, 0.3)'
                }}
              >
                <MessageOutlined style={{ fontSize: 22 }} />
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
                  padding: '14px 24px',
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                }}
              >
                <MessageOutlined style={{ fontSize: 22 }} />
                Gửi đơn qua Zalo 2: {hotline2}
              </a>
            </div>

            <div style={{ fontSize: '0.88rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
              <PhoneOutlined /> Hoặc gọi hỗ trợ: <a href={`tel:${hotline1.replace(/\s+/g, '')}`} style={{ color: '#0369A1', fontWeight: 700, textDecoration: 'none' }}>{hotline1}</a> • <a href={`tel:${hotline2.replace(/\s+/g, '')}`} style={{ color: '#0369A1', fontWeight: 700, textDecoration: 'none' }}>{hotline2}</a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
              <Link to="/flowers" className="btn btn-soft">
                Khám phá thêm mẫu hoa
              </Link>
              <Link to="/" className="btn btn-outline">
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : (
          /* ===== CUSTOM ORDER FORM ===== */
          <div className="custom-order-layout">
            {/* Form Column */}
            <div className="custom-order-form-card">
              {error && (
                <div style={{ background: '#FFF2F2', border: '1px solid #F8B4C4', color: '#D9383A', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 20, fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* 1. Kiểu dáng hoa mong muốn */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>
                    1. Kiểu dáng hoa bạn mong muốn *
                  </label>
                  <div className="custom-order-flower-grid">
                    {flowerTypeOptions.map(opt => {
                      const isSelected = flowerType === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => handleSelectFlowerType(opt.value)}
                          style={{
                            border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                            background: isSelected ? '#F0F9FF' : '#FFFFFF',
                            borderRadius: 12,
                            padding: '16px 8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            textAlign: 'center',
                            boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.15)' : 'none',
                            transform: isSelected ? 'translateY(-2px)' : 'none'
                          }}
                        >
                          <div style={{ fontSize: '2rem', marginBottom: 6, lineHeight: 1 }}>{opt.icon}</div>
                          <div style={{ fontWeight: 700, fontSize: '0.96rem', color: isSelected ? '#0369A1' : '#0F172A' }}>
                            {opt.label}
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <span 
                              style={{ 
                                display: 'inline-block',
                                fontSize: '0.75rem', 
                                color: isSelected ? '#0369A1' : '#64748B', 
                                backgroundColor: isSelected ? '#E0F2FE' : '#F1F5F9',
                                border: isSelected ? '1px solid #BAE6FD' : '1px solid #E2E8F0',
                                padding: '2px 8px',
                                borderRadius: 999,
                                fontWeight: 600 
                              }}
                            >
                              {opt.minPrice}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mô tả kiểu dáng nếu chọn Khác */}
                  {flowerType === 'Khác' && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: '0.88rem', color: '#0F172A', marginBottom: 8, fontWeight: 700 }}>
                        Mô tả kiểu dáng hoa bạn mong muốn (bình hoa, hộp hoa, hoa thả bình, thiết kế riêng...):
                      </div>
                      <input
                        type="text"
                        autoFocus
                        placeholder="VD: Bình gốm để bàn phòng khách, Hộp hoa mica, Hoa cưới cầm tay..."
                        value={customFlowerType}
                        onChange={e => setCustomFlowerType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '13px 16px',
                          borderRadius: 8,
                          border: '2px solid #0284C7',
                          background: '#FFFFFF',
                          color: '#0F172A',
                          fontWeight: 600,
                          fontSize: '0.98rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.15)',
                          transition: 'all 0.2s'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Dự kiến ngân sách */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>
                    2. Dự kiến ngân sách của bạn *
                    {flowerType === 'Bó hoa' && <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0284C7', marginLeft: 8 }}>(từ 300k trở lên)</span>}
                    {flowerType === 'Giỏ hoa' && <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0284C7', marginLeft: 8 }}>(từ 600k trở lên)</span>}
                    {flowerType === 'Kệ hoa' && <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0284C7', marginLeft: 8 }}>(từ 1.200k trở lên)</span>}
                    {flowerType === 'Hoa Cưới' && <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0284C7', marginLeft: 8 }}>(từ 500k trở lên)</span>}
                    {flowerType === 'Kệ Tang' && <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0284C7', marginLeft: 8 }}>(từ 800k trở lên)</span>}
                    {flowerType === 'Khác' && <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0284C7', marginLeft: 8 }}>(nhập mức ngân sách mong muốn)</span>}
                  </label>

                  {flowerType !== 'Khác' ? (
                    <>
                      <div className="custom-order-budget-grid">
                        {currentBudgetOptions.map(opt => {
                          const isSelected = budget === opt.value;
                          return (
                            <div
                              key={opt.value}
                              onClick={() => {
                                setBudget(opt.value);
                                if (opt.value !== 'Tùy ý') {
                                  setCustomBudget('');
                                }
                              }}
                              style={{
                                border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                                background: isSelected ? '#F0F9FF' : '#FFFFFF',
                                borderRadius: 12,
                                padding: '14px 10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                textAlign: 'center',
                                boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.12)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: isSelected ? 'translateY(-2px)' : 'none'
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? '#0369A1' : '#0F172A' }}>
                                {opt.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Budget Input - Chỉ hiển thị khi chọn ô 'Tùy ý' */}
                      {budget === 'Tùy ý' && (
                        <div style={{ marginTop: 14 }}>
                          <div style={{ fontSize: '0.88rem', color: '#0F172A', marginBottom: 8, fontWeight: 700 }}>
                            {flowerType === 'Bó hoa' && 'Nhập mức ngân sách dự kiến của bạn (từ 300.000đ trở lên):'}
                            {flowerType === 'Giỏ hoa' && 'Nhập mức ngân sách dự kiến của bạn (từ 600.000đ trở lên):'}
                            {flowerType === 'Kệ hoa' && 'Nhập mức ngân sách dự kiến của bạn (từ 1.200.000đ trở lên):'}
                            {flowerType === 'Hoa Cưới' && 'Nhập mức ngân sách dự kiến của bạn (từ 500.000đ trở lên):'}
                            {flowerType === 'Kệ Tang' && 'Nhập mức ngân sách dự kiến của bạn (từ 800.000đ trở lên):'}
                          </div>
                          <input
                            type="text"
                            autoFocus
                            placeholder={
                              flowerType === 'Bó hoa'
                                ? 'VD: 400.000đ, 750.000đ, 1.5 triệu (từ 300k)...'
                                : flowerType === 'Giỏ hoa'
                                ? 'VD: 800.000đ, 1.5 triệu, 2.5 triệu (từ 600k)...'
                                : flowerType === 'Kệ hoa'
                                ? 'VD: 1.5 triệu, 2.8 triệu, 5 triệu (từ 1.2tr)...'
                                : flowerType === 'Hoa Cưới'
                                ? 'VD: 800.000đ, 1.5 triệu, 3 triệu (từ 500k)...'
                                : flowerType === 'Kệ Tang'
                                ? 'VD: 900.000đ, 1.5 triệu, 2.5 triệu (từ 800k)...'
                                : 'VD: 800.000đ, 2 triệu, 5 triệu hoặc theo thỏa thuận...'
                            }
                            value={customBudget}
                            onChange={e => setCustomBudget(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '13px 16px',
                              borderRadius: 8,
                              border: '2px solid #0284C7',
                              background: '#FFFFFF',
                              color: '#0F172A',
                              fontWeight: 600,
                              fontSize: '0.98rem',
                              outline: 'none',
                              boxSizing: 'border-box',
                              boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.15)',
                              transition: 'all 0.2s'
                            }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    /* Khi là 'Khác' thì trực tiếp viết ngân sách mong muốn của khách */
                    <div>
                      <div style={{ fontSize: '0.88rem', color: '#0F172A', marginBottom: 8, fontWeight: 700 }}>
                        Viết mức ngân sách mong muốn của bạn:
                      </div>
                      <input
                        type="text"
                        autoFocus
                        placeholder="VD: 800.000đ, 2 triệu, 5 triệu hoặc theo thỏa thuận tư vấn..."
                        value={customBudget}
                        onChange={e => setCustomBudget(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '13px 16px',
                          borderRadius: 8,
                          border: '2px solid #0284C7',
                          background: '#FFFFFF',
                          color: '#0F172A',
                          fontWeight: 600,
                          fontSize: '0.98rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.15)',
                          transition: 'all 0.2s'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 3. Color Tone */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>
                    3. Tone màu hoa chủ đạo *
                  </label>
                  <div className="custom-order-tone-grid">
                    {toneOptions.map(opt => {
                      const isSelected = tone === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setTone(opt.value);
                            if (opt.value !== 'Tone màu khác') {
                              setCustomTone('');
                            }
                          }}
                          style={{
                            border: isSelected ? '2.5px solid #0284C7' : `1.5px solid ${opt.border}`,
                            background: opt.bg,
                            borderRadius: 'var(--radius-md)',
                            padding: '13px 14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            fontWeight: isSelected ? 700 : 600,
                            fontSize: '0.88rem',
                            color: opt.text,
                            boxShadow: isSelected ? '0 0 0 2px rgba(2, 132, 199, 0.25), 0 2px 8px rgba(0,0,0,0.06)' : '0 1px 2px rgba(0,0,0,0.03)'
                          }}
                        >
                          {opt.label}
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Tone Input - Chỉ hiển thị khi chọn ô 'Tone màu khác' */}
                  {tone === 'Tone màu khác' && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: '0.88rem', color: '#0F172A', marginBottom: 8, fontWeight: 700 }}>
                        Nhập tone màu hoặc loài hoa mong muốn theo ý bạn:
                      </div>
                      <input
                        type="text"
                        autoFocus
                        placeholder="VD: Trắng phối xanh bơ, Tím khói, Đỏ burgundy, Tone rực rỡ..."
                        value={customTone}
                        onChange={e => setCustomTone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '13px 16px',
                          borderRadius: 8,
                          border: '2px solid #0284C7',
                          background: '#FFFFFF',
                          color: '#0F172A',
                          fontWeight: 600,
                          fontSize: '0.98rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.15)',
                          transition: 'all 0.2s'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 4. Occasion */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
                    4. Dịp tặng hoa hoặc mục đích sử dụng *
                  </label>
                  <select
                    value={occasion}
                    onChange={e => setOccasion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      background: 'var(--color-white)'
                    }}
                  >
                    {occasionOptions.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Reference Photos Upload */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
                    5. Hình ảnh mẫu bạn thích (tối đa 3 ảnh tham khảo)
                  </label>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {attachments.map((att, idx) => (
                      <div 
                        key={idx}
                        style={{
                          position: 'relative',
                          width: 80,
                          height: 80,
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: '1px solid #CBD5E1'
                        }}
                      >
                        <img 
                          src={att.file_url} 
                          alt="Mẫu tham khảo" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'rgba(0,0,0,0.6)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '50%',
                            width: 22,
                            height: 22,
                            fontSize: 11,
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
                          width: 80,
                          height: 80,
                          borderRadius: 10,
                          border: '1.5px dashed #94A3B8',
                          background: '#F8FAFC',
                          color: '#64748B',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '0.76rem',
                          gap: 4
                        }}
                      >
                        {isUploading ? <LoadingOutlined /> : <UploadOutlined style={{ fontSize: 18 }} />}
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
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 8 }}>
                    Chụp hoặc tải ảnh từ điện thoại (Pinterest, Instagram...) để Florist dễ hình dung phong cách bạn thích.
                  </div>
                </div>

                {/* 6. Date, Time & Delivery Area */}
                <div className="custom-order-form-row">
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.92rem', marginBottom: 6 }}>
                      Ngày & Khung giờ nhận hoa:
                    </label>
                    <div style={{ display: 'flex', gap: 6, width: '100%', boxSizing: 'border-box' }}>
                      <input
                        type="date"
                        value={requestedDate}
                        onChange={e => setRequestedDate(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.88rem'
                        }}
                      />
                      <input
                        type="time"
                        value={requestedTime}
                        onChange={e => setRequestedTime(e.target.value)}
                        style={{
                          width: 100,
                          padding: '10px 6px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.92rem', marginBottom: 6 }}>
                      Khu vực giao hoa:
                    </label>
                    <input
                      type="text"
                      placeholder="Quận/Huyện hoặc địa chỉ nhận"
                      value={deliveryArea}
                      onChange={e => setDeliveryArea(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* 6. Card Message & Notes */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.92rem', marginBottom: 6 }}>
                    Nội dung in thiệp hoặc banner chúc mừng:
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Happy Birthday My Love! Chúc em luôn rực rỡ và hạnh phúc..."
                    value={cardMessage}
                    onChange={e => setCardMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.92rem', marginBottom: 6 }}>
                    Ghi chú chi tiết cho Florist:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả loài hoa bạn thích (Mẫu đơn, Tulip, Hồng Ecuador...) hoặc các lưu ý đặc biệt khác..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 7. Contact Info */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24, marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '1rem', marginBottom: 14, color: 'var(--color-primary-dark)' }}>
                    ✦ Thông tin liên hệ nhận tư vấn *
                  </label>

                  <div className="custom-order-form-row">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Họ và tên của bạn"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--color-border)',
                          fontSize: '0.92rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="09xx xxx xxx"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--color-border)',
                          fontSize: '0.92rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={e => setSameAsPhone(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      Số điện thoại trên là tài khoản Zalo của tôi
                    </label>

                    {!sameAsPhone && (
                      <div style={{ marginTop: 8 }}>
                        <input
                          type="text"
                          placeholder="Nhập số Zalo khác nếu có..."
                          value={zalo}
                          onChange={e => setZalo(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 4px 14px rgba(42, 117, 211, 0.28)'
                  }}
                >
                  {submitting ? <LoadingOutlined /> : <MessageOutlined style={{ fontSize: 20 }} />}
                  {submitting ? 'Đang gửi thông tin...' : 'Gửi Yêu Cầu Thiết Kế & Nhận Báo Giá Nhanh'}
                </button>
              </form>
            </div>

            {/* Sidebar Commitment & Process */}
            <div className="custom-order-sidebar">
              <div 
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: 24
                }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: 20, color: 'var(--color-primary-dark)' }}>
                  Quy trình đặt hoa thiết kế riêng
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Gửi mong muốn</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Điền ngân sách, tone màu và tải ảnh mẫu tham khảo bạn thích.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Florist tư vấn & Chốt mẫu</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Tiệm sẽ liên hệ qua Zalo gửi ảnh các loại hoa nhập có sẵn trong ngày để bạn chọn.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      3
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Chụp ảnh duyệt hoa thật</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Sau khi cắm xong, tiệm chụp ảnh hoa thực tế từ nhiều góc gửi bạn duyệt ưng ý 100% trước khi giao.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div 
                style={{
                  background: 'var(--color-background-soft)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.92rem' }}>
                  <CameraOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 22 }} />
                  <div><strong>Ảnh chụp thực tế trước khi giao</strong>: Không bao giờ giao hoa khi khách hàng chưa duyệt hình.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.92rem' }}>
                  <SafetyCertificateOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 22 }} />
                  <div><strong>Bảo đảm hoa tươi 100%</strong>: Tuyển chọn cành hoa tươi mới nhập về trong ngày.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
