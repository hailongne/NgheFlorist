import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircleOutlined, 
  CameraOutlined, 
  SafetyCertificateOutlined,
  HeartOutlined, 
  HeartFilled, 
  ArrowLeftOutlined, 
  MessageOutlined, 
  GiftOutlined, 
  PhoneOutlined, 
  ShoppingOutlined, 
  ThunderboltOutlined,
  CopyOutlined,
  DownloadOutlined,
  CloseOutlined,
  SendOutlined,
  FacebookOutlined,
  InstagramOutlined,
  FormOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import ImageWithFallback, { getFallbackForId } from '../components/ImageWithFallback';
import { useSiteSettings } from '../context/SiteSettingsContext';
import ProductCard from '../components/ProductCard';
import { RealSocialIcon } from '../components/RealSocialIcons';
import { useWishlist } from '../context/WishlistContext';

interface ProductImage {
  id: number;
  url: string;
  alt_text: string;
  is_featured: number;
  sort_order: number;
}

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  price: number;
  currency: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  parent_category_name: string | null;
  images: ProductImage[];
  related: Array<{
    id: number;
    name: string;
    slug: string;
    price: number;
    currency: string;
    image_url: string;
    featured_image?: string;
    category_name?: string;
  }>;
}

interface ContactWidget {
  id: number;
  platform_type: 'zalo' | 'facebook' | 'instagram' | 'phone' | string;
  title: string;
  subtitle?: string | null;
  action_link: string;
  sort_order: number;
  is_active: number | boolean;
}



export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { zaloUrl1 } = useSiteSettings();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isWishlisted: checkWishlisted, toggleWishlist: triggerToggleWishlist } = useWishlist();
  const isWishlisted = product ? checkWishlisted(product.id) : false;

  // Dynamic Contact Widgets from Admin
  const [contactWidgets, setContactWidgets] = useState<ContactWidget[]>([]);

  // 50/50 Consultation & Order Modal State
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [activeWidget, setActiveWidget] = useState<ContactWidget | null>(null);
  const [modalTab, setModalTab] = useState<'quick_chat' | 'order_form'>('quick_chat');

  // Form State in Modal (Left Column)
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [deliveryTimePreset, setDeliveryTimePreset] = useState('Giao chiều nay (17:30)');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [isSameRecipient, setIsSameRecipient] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [hasProfileAutofilled, setHasProfileAutofilled] = useState(false);
  const [submittedText, setSubmittedText] = useState<string | null>(null);
  const [isCopiedSuccess, setIsCopiedSuccess] = useState(false);

  // Load product detail
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');

    fetch(`/api/products/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Không tìm thấy mẫu hoa này');
        return r.json();
      })
      .then((data: ProductDetail) => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          const featured = data.images.find(img => img.is_featured === 1);
          setSelectedImage(featured ? featured.url : data.images[0].url);
        } else {
          setSelectedImage(getFallbackForId(data.id));
        }
      })
      .catch(err => {
        setError(err.message || 'Lỗi tải thông tin mẫu hoa');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Load contact widgets from admin
  useEffect(() => {
    fetch('/api/contact-widgets')
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (Array.isArray(data)) {
          setContactWidgets(data.filter(w => Boolean(w.is_active)));
        }
      })
      .catch(err => console.warn('Fetch contact widgets error:', err));
  }, []);

  // Auto import customer profile data
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('nghe_customer_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const name = u.full_name || u.name || u.username || '';
        const phone = u.phone || '';
        const addr = u.address || '';
        if (name) setSenderName(name);
        if (phone) setSenderPhone(phone);
        if (addr) setDeliveryAddress(addr);
        if (name || phone || addr) setHasProfileAutofilled(true);
      }
    } catch {}
  }, []);

  const toggleWishlist = () => {
    if (!product) return;
    triggerToggleWishlist(product.id);
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const activePrice = product ? Number(product.price) : 0;

  // Clipboard Helpers
  const copyImageToClipboard = async (imageUrl: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 400;
      canvas.height = img.naturalHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob && navigator.clipboard && (window as any).ClipboardItem) {
            const item = new (window as any).ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            setCopyStatus('image_copied');
            setTimeout(() => setCopyStatus(''), 4000);
          }
        }, 'image/png');
      }
    } catch (err) {
      console.warn('Canvas image copy fallback:', err);
    }
  };

  const downloadProductImage = (imageUrl: string, title: string) => {
    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'nghe-florist-hoa'}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
        setCopyStatus('image_downloaded');
        setTimeout(() => setCopyStatus(''), 4000);
      })
      .catch(() => {
        window.open(imageUrl, '_blank');
      });
  };

  const copyProductLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus('link_copied');
      setTimeout(() => setCopyStatus(''), 4000);
    } catch {}
  };

  const formatPriceK = (price: number) => {
    if (price >= 1000) {
      const k = Math.round(price / 1000);
      return `${k}k`;
    }
    return `${price}đ`;
  };

  // Generate formatted order summary text matching Florist standard template
  const generateOrderSummaryText = () => {
    if (!product) return '';

    const priceK = formatPriceK(activePrice * orderQuantity);
    const qtyPrefix = orderQuantity > 1 ? `${orderQuantity}x ` : '';
    
    // Dòng 1: - bó 400k (hoặc tên hoa + giá + ghi chú cọc/ship nếu có)
    const line1 = `- ${qtyPrefix}${product.name} ${priceK}${orderNotes ? ` (${orderNotes})` : ''}`;

    // Dòng 2: - giờ báo sau (hoặc giờ cụ thể)
    let timeStr = deliveryTimePreset.trim();
    if (!timeStr) {
      timeStr = deliveryDate ? `Giao ngày ${deliveryDate}` : 'giờ báo sau';
    }
    const line2 = `- ${timeStr}`;

    // Dòng 3: - Sđt người đặt: 0936245994
    const line3 = `- Sđt người đặt: ${senderPhone || '(Chưa nhập)'}`;

    // Dòng 4: - Sđt người nhận : Hoà 097 5905672
    let recStr = '';
    if (isSameRecipient) {
      recStr = `${senderName ? `${senderName} ` : ''}${senderPhone || ''}`.trim();
    } else {
      recStr = `${recipientName ? `${recipientName} ` : ''}${recipientPhone || senderPhone || ''}`.trim();
    }
    const line4 = `- Sđt người nhận : ${recStr || '(Chưa nhập)'}`;

    // Dòng 5: - Địa chỉ : Trường mầm non xứ sở thần tiên - Trung Văn ( gần số 1 Đại Linh )
    const line5 = `- Địa chỉ : ${deliveryAddress.trim() || 'Nhận tại tiệm hoa / Trao đổi qua chat'}`;

    // Dòng 6:
    // - Nội dung : 
    // Chúc mừng sinh nhật em!!!
    const line6 = `- Nội dung : \n${cardMessage.trim() || '(Chưa có nội dung thiệp)'}`;

    return [line1, line2, line3, line4, line5, line6].join('\n');
  };

  // Open Consultation Modal
  const handleOpenConsultation = (widget: ContactWidget) => {
    setActiveWidget(widget);
    setSubmittedText(null);
    setModalTab('quick_chat');
    setConsultModalOpen(true);
    const currentImg = selectedImage || (product ? getFallbackForId(product.id) : '');
    if (currentImg) {
      copyImageToClipboard(currentImg);
    }
  };

  // Submit Order Form & Show Copyable Text (Left 50%)
  const handleSubmitFormAndSend = async () => {
    if (!product || !activeWidget) return;
    if (!senderPhone.trim()) {
      alert('Vui lòng nhập số điện thoại của anh/chị để Florist tiện liên hệ và gửi ảnh hoa ạ!');
      return;
    }
    setIsSubmittingOrder(true);

    const formattedOrderText = generateOrderSummaryText();

    // 1. Copy order message to clipboard immediately
    try {
      await navigator.clipboard.writeText(formattedOrderText);
      setIsCopiedSuccess(true);
      setTimeout(() => setIsCopiedSuccess(false), 3000);
    } catch (e) {
      console.warn('Clipboard error:', e);
    }

    // 2. Copy image to clipboard
    const currentImg = selectedImage || getFallbackForId(product.id);
    copyImageToClipboard(currentImg);

    // 3. Save Lead into backend database
    const totalCost = activePrice * orderQuantity;
    const formattedTotal = formatVND(totalCost);
    const deliveryText = deliveryTimePreset ? `${deliveryTimePreset} (${deliveryDate})` : `Giao ngày ${deliveryDate}`;

    try {
      await fetch('/api/customer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: 'PRODUCT_SELECTION',
          product_id: product.id,
          product_name: product.name,
          customer_name: senderName || 'Khách đặt hoa',
          phone: senderPhone,
          zalo: senderPhone,
          delivery_area: deliveryAddress,
          delivery_time: deliveryText,
          card_message: cardMessage,
          notes: `[ĐƠN QUA ${activeWidget.title}]\n${formattedOrderText}`,
          budget: String(totalCost)
        })
      });
    } catch (err) {
      console.warn('Record lead error:', err);
    }

    setIsSubmittingOrder(false);
    // Display the copyable text block on screen!
    setSubmittedText(formattedOrderText);
  };

  // Skip Form & Direct Chat (Right 50%)
  const handleSkipFormAndChat = async () => {
    if (!product || !activeWidget) return;
    const quickMsg = [
      `🌸 Chào Nghệ Florist, mình muốn tư vấn mẫu hoa này:`,
      `- Tên mẫu: ${product.name}`,
      `- Giá tham khảo: ${formatVND(activePrice)}`,
      `- Link sản phẩm: ${window.location.origin}/product/${product.slug}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(quickMsg);
    } catch {}

    const currentImg = selectedImage || getFallbackForId(product.id);
    copyImageToClipboard(currentImg);

    if (activeWidget.platform_type === 'phone' || activeWidget.action_link.startsWith('tel:')) {
      window.location.href = activeWidget.action_link;
    } else {
      window.open(activeWidget.action_link, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: 16, color: 'var(--color-text-secondary)' }}>Đang tải thông tin mẫu hoa...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Không tìm thấy mẫu hoa</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          Mẫu hoa này có thể đã được lưu trữ hoặc đường dẫn không chính xác.
        </p>
        <button onClick={() => navigate('/flowers')} className="btn btn-primary">
          Xem tất cả mẫu hoa
        </button>
      </div>
    );
  }

  return (
    <div className="page-product-detail" style={{ paddingBottom: 80, overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* BREADCRUMB (Desktop / Tablet) */}
      <div className="desktop-only-element" style={{ background: 'var(--color-background-soft)', borderBottom: '1px solid var(--color-border)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', color: 'var(--color-text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <Link to="/" style={{ color: 'inherit' }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/flowers" style={{ color: 'inherit' }}>Mẫu hoa</Link>
          <span>/</span>
          {product.category_name && (
            <>
              <Link to={`/category/${product.category_slug}`} style={{ color: 'inherit' }}>
                {product.category_name}
              </Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: 'var(--color-text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
        </div>
      </div>

      {/* Mobile Top Navigation Bar */}
      <div className="mobile-only-element" style={{ padding: '10px 14px', background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', boxSizing: 'border-box' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 6, 
            background: 'var(--color-background-soft)', 
            border: '1px solid var(--color-border)', 
            borderRadius: 'var(--radius-full)', 
            padding: '6px 14px', 
            fontSize: '0.82rem', 
            fontWeight: 600,
            color: 'var(--color-text)',
            cursor: 'pointer' 
          }}
        >
          <ArrowLeftOutlined /> Quay lại
        </button>
        {product.category_name && (
          <Link 
            to={`/category/${product.category_slug}`}
            style={{ 
              fontSize: '0.78rem', 
              fontWeight: 600, 
              color: 'var(--color-primary-dark)', 
              background: 'var(--color-primary-light)', 
              padding: '4px 10px', 
              borderRadius: 'var(--radius-full)',
              textDecoration: 'none',
              maxWidth: 160,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {product.category_name}
          </Link>
        )}
      </div>

      <div className="container" style={{ marginTop: 20, width: '100%', boxSizing: 'border-box' }}>
        {/* Desktop / Tablet Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-soft btn-sm desktop-only-element"
          style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeftOutlined /> Quay lại danh sách
        </button>

        {/* MAIN PRODUCT DETAIL GRID */}
        <div className="product-detail-layout">
          {/* GALLERY */}
          <div className="product-detail-gallery">
            {/* Mobile Lookbook Swipe Gallery */}
            <div className="mobile-only-element" style={{ marginBottom: 18, width: '100%', boxSizing: 'border-box' }}>
              <div className="lookbook-gallery-mobile">
                {(product.images && product.images.length > 0 ? product.images : [{ id: product.id, url: selectedImage, alt_text: product.name, is_featured: 1, sort_order: 0 }]).map((img, i) => (
                  <div key={img.id || i} className="lookbook-slide" style={{ position: 'relative' }}>
                    <ImageWithFallback
                      src={img.url}
                      alt={img.alt_text || product.name}
                      fallbackSrc={getFallbackForId(product.id + i)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop / Tablet Main Gallery View */}
            <div className="desktop-only-element" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div 
                style={{ 
                  position: 'relative', 
                  borderRadius: 'var(--radius-md)', 
                  overflow: 'hidden', 
                  boxShadow: 'var(--shadow-md)',
                  aspectRatio: '3/4',
                  maxHeight: '620px',
                  background: '#F8FAFC'
                }}
              >
                <ImageWithFallback
                  src={selectedImage}
                  alt={product.name}
                  fallbackSrc={getFallbackForId(product.id)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Wishlist Button */}
                <button
                  onClick={toggleWishlist}
                  className="card-wishlist-btn"
                  style={{ position: 'absolute', top: 16, right: 16 }}
                  aria-label={isWishlisted ? 'Bỏ lưu' : 'Lưu mẫu'}
                  title="Lưu mẫu hoa"
                >
                  {isWishlisted ? <HeartFilled style={{ color: '#E11D48' }} /> : <HeartOutlined />}
                </button>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                  {product.images.map((img, i) => (
                    <div
                      key={img.id || i}
                      onClick={() => setSelectedImage(img.url)}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: selectedImage === img.url ? '2px solid var(--color-primary-dark)' : '1px solid var(--color-border)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        opacity: selectedImage === img.url ? 1 : 0.7,
                        transition: 'all 0.2s'
                      }}
                    >
                      <ImageWithFallback
                        src={img.url}
                        alt={img.alt_text || product.name}
                        fallbackSrc={getFallbackForId(product.id + i)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INFORMATION & CONVERSION ACTIONS */}
          <div className="product-detail-info">
            {/* Category */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span className="badge badge-pastel">{product.category_name}</span>
            </div>

            {/* Product Title */}
            <h1 style={{ fontSize: 'clamp(1.35rem, 3.5vw, 2.2rem)', marginBottom: 12, color: 'var(--color-text)', lineHeight: 1.3, wordBreak: 'break-word' }}>
              {product.name}
            </h1>

            {/* Price Box with "Giá tham khảo" */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #F0F9FF 0%, #F8FAFC 100%)',
                border: '1px solid #BAE6FD',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: 18,
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: 0.6, color: '#0369A1', fontWeight: 700 }}>
                Giá tham khảo:
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary-dark)', lineHeight: 1.1 }}>
                  {formatVND(activePrice)}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>
                * Giá thực tế có thể thay đổi nhẹ tùy theo mùa hoa và yêu cầu tùy biến của quý khách.
              </div>
            </div>

            {/* Description */}
            <div 
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
                marginBottom: 18,
                paddingBottom: 16,
                borderBottom: '1px solid var(--color-border)',
                wordBreak: 'break-word',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {product.description || 'Mẫu hoa tươi tuyển chọn được thiết kế tinh tế bởi đội ngũ Florist chuyên nghiệp của Nghệ Florist. Từng cánh hoa được nâng niu tỉ mỉ để gửi gắm trọn vẹn thông điệp yêu thương của bạn.'}
            </div>

            {/* Florist Assurance Note */}
            <div 
              style={{ 
                marginBottom: 18, 
                fontSize: '0.82rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                color: '#166534', 
                background: '#F0FDF4', 
                padding: '10px 14px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid #BBF7D0', 
                lineHeight: 1.4,
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <CheckCircleOutlined style={{ fontSize: 16, flexShrink: 0 }} />
              <span><strong>Cam kết hoa tươi mới trong ngày</strong> • Chụp ảnh duyệt thực tế trước khi giao</span>
            </div>

            {/* NÚT TƯ VẤN NHANH (CONTACT WIDGETS TỪ ADMIN CMS) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '2px 0',
                marginBottom: 2
              }}>
                <span style={{ 
                  fontSize: '0.82rem', 
                  fontWeight: 800, 
                  color: 'var(--color-primary-dark)', 
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <ThunderboltOutlined style={{ color: 'var(--color-primary-dark)' }} /> TƯ VẤN & ĐẶT MẪU HOA NHANH
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                  ● 1 chạm kết nối
                </span>
              </div>

              <div className="consultation-buttons-grid">
                {(() => {
                  const sortedWidgets = [...contactWidgets].sort((a, b) => {
                    const order: Record<string, number> = { zalo: 1, phone: 2, facebook: 3, instagram: 4 };
                    const pA = order[a.platform_type] || 5;
                    const pB = order[b.platform_type] || 5;
                    if (pA !== pB) return pA - pB;
                    return (a.sort_order || 0) - (b.sort_order || 0);
                  });

                  if (sortedWidgets.length === 0) {
                    return (
                      <button
                        type="button"
                        className="consultation-widget-btn span-2-col"
                        onClick={() => handleOpenConsultation({
                          id: 1,
                          platform_type: 'zalo',
                          title: 'Chat Zalo Tư Vấn Nhanh',
                          subtitle: 'Gửi ảnh & Báo giá trong 1 phút',
                          action_link: zaloUrl1 || 'https://zalo.me/0862926866',
                          sort_order: 1,
                          is_active: 1
                        })}
                      >
                        <RealSocialIcon platform="zalo" size={30} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#1E293B' }}>Chat Zalo Tư Vấn Nhanh</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary, #718287)' }}>Gửi ảnh & Báo giá trong 1 phút</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>Tư vấn ngay ➜</div>
                      </button>
                    );
                  }

                  return sortedWidgets.map((widget, idx) => {
                    const isSpan2 = (sortedWidgets.length % 2 === 1 && idx === sortedWidgets.length - 1);

                    return (
                      <button
                        key={widget.id}
                        type="button"
                        className={`consultation-widget-btn ${isSpan2 ? 'span-2-col' : ''}`}
                        onClick={() => handleOpenConsultation(widget)}
                        title={widget.title}
                      >
                        <RealSocialIcon platform={widget.platform_type} size={28} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 700,
                            fontSize: isSpan2 ? '0.86rem' : '0.82rem',
                            color: '#1E293B',
                            lineHeight: 1.25,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {widget.title}
                          </div>
                          <div style={{
                            fontSize: '0.72rem',
                            color: 'var(--color-text-secondary, #718287)',
                            marginTop: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {widget.subtitle || (widget.platform_type === 'phone' ? 'Gọi đặt hoa nhanh' : 'Tư vấn & báo giá')}
                          </div>
                        </div>
                        <div style={{
                          fontSize: isSpan2 ? '0.76rem' : '0.72rem',
                          fontWeight: 700,
                          color: 'var(--color-primary-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          flexShrink: 0
                        }}>
                          {isSpan2 ? 'Tư vấn ngay ➜' : '➜'}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Flower Care & Guarantees (4 cam kết dịch vụ) */}
            <div 
              style={{
                background: 'var(--color-background-soft)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                <GiftOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16, flexShrink: 0 }} />
                <div>Tặng kèm biển và thiệp thiết kế riêng theo yêu cầu.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                <CameraOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16, flexShrink: 0 }} />
                <div>Luôn gửi ảnh sản phẩm trước khi giao đến tay khách hàng.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                <SafetyCertificateOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16, flexShrink: 0 }} />
                <div>Có hoá đơn cho các doanh nghiệp.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                <ShoppingOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 16, flexShrink: 0 }} />
                <div>Có túi đựng hoa tinh tế.</div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS - SHOPEE STYLE */}
        {product.related && product.related.length > 0 && (
          <section className="shopee-related-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 4, height: 26, background: 'var(--color-primary-dark)', borderRadius: 2 }} />
                <div>
                  <h3 style={{ 
                    fontSize: 'clamp(1.15rem, 2.5vw, 1.4rem)', 
                    fontWeight: 800, 
                    color: '#1E293B', 
                    textTransform: 'uppercase', 
                    letterSpacing: 0.5,
                    margin: 0 
                  }}>
                    Có thể bạn cũng thích
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 2 }}>
                    Gợi ý các mẫu hoa tươi cùng phong cách & mức giá được yêu thích nhất
                  </div>
                </div>
              </div>
              <Link 
                to={product.category_slug ? `/category/${product.category_slug}` : '/flowers'} 
                style={{ 
                  color: 'var(--color-primary-dark)', 
                  fontSize: '0.88rem', 
                  fontWeight: 700, 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                Xem tất cả {product.category_name || 'mẫu hoa'} <span>&rarr;</span>
              </Link>
            </div>

            <div className="shopee-related-grid">
              {product.related.map(rel => (
                <ProductCard
                  key={rel.id}
                  id={rel.id}
                  name={rel.name}
                  slug={rel.slug}
                  price={rel.price}
                  imageUrl={rel.image_url || rel.featured_image}
                  categoryName={rel.category_name || product.category_name}
                />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link 
                to="/flowers" 
                className="btn btn-outline"
                style={{ 
                  padding: '11px 28px', 
                  borderRadius: 'var(--radius-full)', 
                  fontWeight: 700, 
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                Xem thêm các mẫu hoa khác
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* CONSULTATION & ORDER MODAL (TABBED & STICKY HEADER) */}
      {consultModalOpen && activeWidget && (
        <div className="consultation-modal-backdrop" onClick={() => setConsultModalOpen(false)}>
          <div className="consultation-modal-box" onClick={e => e.stopPropagation()}>
            {/* 1. STICKY MODAL HEADER - KHÔNG BAO GIỜ BỊ MẤT NÚT X */}
            <div className="consultation-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <RealSocialIcon platform={activeWidget.platform_type} size={32} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: '#1E293B',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    Tư vấn qua {activeWidget.title}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: 1 }}>
                    Mẫu hoa: <strong style={{ color: '#1E293B' }}>{product.name}</strong> • <strong style={{ color: 'var(--color-primary-dark)' }}>{formatVND(activePrice)}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConsultModalOpen(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#EDF2F7',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 16,
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                aria-label="Đóng"
              >
                <CloseOutlined />
              </button>
            </div>

            {/* 2. STICKY TABS BAR - CHỌN NHANH GIỮA 2 TAB */}
            <div className="consultation-modal-tabs-bar">
              <button
                type="button"
                onClick={() => setModalTab('quick_chat')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid',
                  borderColor: modalTab === 'quick_chat' ? 'var(--color-primary-dark)' : '#E2E8F0',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: modalTab === 'quick_chat' ? 'var(--color-background-soft, #F7FBFC)' : '#FFFFFF',
                  color: modalTab === 'quick_chat' ? 'var(--color-primary-dark)' : '#64748B',
                  boxShadow: modalTab === 'quick_chat' ? '0 2px 8px rgba(93, 158, 175, 0.12)' : 'none',
                  transition: 'all 0.18s ease'
                }}
              >
                <span>⚡ Tư vấn nhanh</span>
                <span style={{
                  fontSize: '0.68rem',
                  background: modalTab === 'quick_chat' ? 'var(--color-primary-dark)' : '#F1F5F9',
                  color: modalTab === 'quick_chat' ? '#FFFFFF' : '#64748B',
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontWeight: 700
                }}>
                  Khuyên dùng
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('order_form')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid',
                  borderColor: modalTab === 'order_form' ? 'var(--color-primary-dark)' : '#E2E8F0',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: modalTab === 'order_form' ? 'var(--color-background-soft, #F7FBFC)' : '#FFFFFF',
                  color: modalTab === 'order_form' ? 'var(--color-primary-dark)' : '#64748B',
                  boxShadow: modalTab === 'order_form' ? '0 2px 8px rgba(93, 158, 175, 0.12)' : 'none',
                  transition: 'all 0.18s ease'
                }}
              >
                <span>📝 Điền thông tin đặt hoa</span>
              </button>
            </div>

            {/* Notification Bar for Auto Copy Status */}
            {copyStatus && (
              <div style={{
                background: '#ECFDF5',
                borderBottom: '1px solid #A7F3D0',
                padding: '8px 20px',
                fontSize: '0.82rem',
                color: '#065F46',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0
              }}>
                <CheckCircleOutlined style={{ color: '#059669', fontSize: 16, flexShrink: 0 }} />
                <span>
                  {copyStatus === 'image_copied' && 'Đã tự động sao chép ảnh mẫu hoa vào bộ nhớ tạm! Bạn có thể Dán (Ctrl+V) vào khung chat.'}
                  {copyStatus === 'image_downloaded' && 'Đã tải ảnh mẫu hoa về máy của bạn!'}
                  {copyStatus === 'link_copied' && 'Đã sao chép link sản phẩm vào bộ nhớ tạm!'}
                  {copyStatus === 'order_sent' && 'Đã lưu đơn & sao chép nội dung đặt hoa! Đang mở ứng dụng chat...'}
                </span>
              </div>
            )}

            {/* 3. MODAL BODY: CUỘN MƯỢT MÀ BÊN DƯỚI HEADER & TABS CỐ ĐỊNH */}
            <div className="consultation-modal-body">
              {modalTab === 'quick_chat' ? (
                /* ===== TAB 1: TƯ VẤN NHANH TRỰC TIẾP (1 CHẠM, KHÔNG CẦN FORM) ===== */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Product Card */}
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: 14,
                    padding: 12,
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center'
                  }}>
                    <div style={{ width: 76, height: 76, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F1F5F9' }}>
                      <ImageWithFallback
                        src={selectedImage}
                        alt={product.name}
                        fallbackSrc={getFallbackForId(product.id)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.3 }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: 4 }}>
                        {formatVND(activePrice)}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: 2 }}>
                        {product.category_name}
                      </div>
                    </div>
                  </div>

                  {/* Auto Copy Reminder Card */}
                  <div style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: 12,
                    padding: '12px 14px',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start'
                  }}>
                    <CheckCircleOutlined style={{ color: '#0284C7', fontSize: 18, marginTop: 2, flexShrink: 0 }} />
                    <div style={{ fontSize: '0.82rem', color: '#1E40AF', lineHeight: 1.45 }}>
                      <strong>Đã tự động sao chép ảnh mẫu hoa vào bộ nhớ tạm!</strong><br />
                      Khi khung chat {activeWidget.title} mở ra, bạn chỉ cần bấm <strong>Dán (Ctrl + V)</strong> để gửi ảnh cho Florist tư vấn báo giá ngay.
                    </div>
                  </div>

                  {/* Direct Action Utilities */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => copyImageToClipboard(selectedImage || getFallbackForId(product.id))}
                      style={{
                        padding: '9px 6px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        background: '#FFF',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <CopyOutlined style={{ fontSize: 16, color: '#0284C7' }} />
                      <span>Sao chép ảnh</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadProductImage(selectedImage || getFallbackForId(product.id), product.name)}
                      style={{
                        padding: '9px 6px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        background: '#FFF',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <DownloadOutlined style={{ fontSize: 16, color: '#10B981' }} />
                      <span>Tải ảnh về máy</span>
                    </button>

                    <button
                      type="button"
                      onClick={copyProductLink}
                      style={{
                        padding: '9px 6px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        background: '#FFF',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <ShareAltOutlined style={{ fontSize: 16, color: '#6366F1' }} />
                      <span>Sao chép link</span>
                    </button>
                  </div>

                  {/* Big Primary Action Button */}
                  <div style={{ marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={handleSkipFormAndChat}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: 12,
                        fontWeight: 800,
                        fontSize: '0.98rem',
                        background: activeWidget.platform_type === 'zalo' ? '#0068FF' :
                                    activeWidget.platform_type === 'facebook' ? '#1877F2' :
                                    activeWidget.platform_type === 'instagram' ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' :
                                    activeWidget.platform_type === 'phone' ? 'var(--color-primary-dark)' : '#1E293B',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <RealSocialIcon platform={activeWidget.platform_type} size={24} />
                      <span>
                        {activeWidget.platform_type === 'phone' 
                          ? `Gọi hotline ${activeWidget.title} ngay ➜` 
                          : `Mở ${activeWidget.title} để gửi ảnh & chat ngay ➜`}
                      </span>
                    </button>
                    <div style={{ fontSize: '0.76rem', color: '#64748B', textAlign: 'center', marginTop: 8 }}>
                      ⚡ Kết nối trực tiếp 1 chạm • Không cần điền form
                    </div>
                  </div>

                  {/* Suggestion to switch to Tab 2 */}
                  <div style={{
                    marginTop: 8,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: '#F8FAFC',
                    border: '1px dashed #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10
                  }}>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      Bạn muốn hẹn giờ nhận hoa hoặc ghi nội dung thiệp chúc mừng?
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalTab('order_form')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary-dark)',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      👉 Điền thông tin đặt hoa ➜
                    </button>
                  </div>
                </div>
              ) : (
                /* ===== TAB 2: ĐIỀN THÔNG TIN ĐẶT HOA HOẶC XEM ĐOẠN VĂN SAO CHÉP ===== */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {submittedText ? (
                    /* GIAO DIỆN HIỂN THỊ ĐOẠN VĂN ĐẶT HOA ĐỂ SAO CHÉP */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 14px',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        borderRadius: 10
                      }}>
                        <CheckCircleOutlined style={{ color: '#059669', fontSize: 22, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#065F46' }}>
                            Đoạn văn đặt hoa đã sẵn sàng!
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: 2 }}>
                            Nội dung đã được sao chép tự động vào bộ nhớ tạm (Clipboard).
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          📋 Đoạn văn để sao chép:
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(submittedText);
                              setIsCopiedSuccess(true);
                              setTimeout(() => setIsCopiedSuccess(false), 2500);
                            } catch {}
                          }}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: isCopiedSuccess ? '#059669' : 'var(--color-primary-dark)',
                            background: '#F0F9FF',
                            border: '1px solid #BAE6FD',
                            borderRadius: 6,
                            padding: '4px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <CopyOutlined /> {isCopiedSuccess ? '✓ Đã sao chép!' : 'Sao chép nội dung'}
                        </button>
                      </div>

                      <div style={{
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: 10,
                        padding: '14px 16px',
                        fontSize: '0.86rem',
                        lineHeight: 1.6,
                        color: '#1E293B',
                        whiteSpace: 'pre-wrap',
                        maxHeight: 280,
                        overflowY: 'auto',
                        userSelect: 'all',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
                      }}>
                        {submittedText}
                      </div>

                      <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                        💡 <em>Khi khung chat mở ra, bạn chỉ cần bấm <strong>Dán (Ctrl + V)</strong> để gửi ngay nội dung trên và ảnh mẫu hoa cho Florist tư vấn nhé!</em>
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeWidget.platform_type === 'phone' || activeWidget.action_link.startsWith('tel:')) {
                              window.location.href = activeWidget.action_link;
                            } else {
                              window.open(activeWidget.action_link, '_blank');
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '13px 16px',
                            borderRadius: 10,
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            background: activeWidget.platform_type === 'zalo' ? '#0068FF' :
                                        activeWidget.platform_type === 'facebook' ? '#1877F2' :
                                        activeWidget.platform_type === 'instagram' ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' :
                                        activeWidget.platform_type === 'phone' ? 'var(--color-primary-dark)' : '#1E293B',
                            color: '#FFFFFF',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
                          }}
                        >
                          <SendOutlined />
                          <span>Mở {activeWidget.title} để dán gửi ngay ➜</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSubmittedText(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'center',
                            padding: '6px'
                          }}
                        >
                          ← Chỉnh sửa lại thông tin form
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* FORM ĐIỀN THÔNG TIN ĐẶT HOA */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: 8,
                        borderBottom: '1px solid #E2E8F0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FormOutlined style={{ color: 'var(--color-primary-dark)', fontSize: 18 }} />
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', textTransform: 'uppercase' }}>
                            Điền thông tin đặt hoa
                          </span>
                        </div>
                        {hasProfileAutofilled && (
                          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, background: '#ECFDF5', padding: '2px 8px', borderRadius: 4 }}>
                            ✓ Đã tự điền từ hồ sơ
                          </span>
                        )}
                      </div>

                      {/* 1. Mẫu hoa & Số lượng */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Mẫu hoa & Số lượng:
                        </label>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: 10
                        }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                            {product.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                border: '1px solid #CBD5E1',
                                background: '#FFF',
                                cursor: 'pointer',
                                fontWeight: 800
                              }}
                            >
                              -
                            </button>
                            <span style={{ fontWeight: 800, minWidth: 20, textAlign: 'center' }}>
                              {orderQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setOrderQuantity(orderQuantity + 1)}
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                border: '1px solid #CBD5E1',
                                background: '#FFF',
                                cursor: 'pointer',
                                fontWeight: 800
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: 700, marginTop: 4, textAlign: 'right' }}>
                          Tạm tính: {formatVND(activePrice * orderQuantity)}
                        </div>
                      </div>

                      {/* 2. Ngày & Thời gian nhận hoa */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Ngày & Thời gian nhận hoa:
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 8, marginBottom: 6 }}>
                          <input
                            type="date"
                            value={deliveryDate}
                            onChange={e => setDeliveryDate(e.target.value)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 8,
                              border: '1px solid #CBD5E1',
                              fontSize: '0.85rem'
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Giờ nhận (vd: 17:30)"
                            value={deliveryTimePreset}
                            onChange={e => setDeliveryTimePreset(e.target.value)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 8,
                              border: '1px solid #CBD5E1',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                        {/* Preset Time Buttons */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {['Giao ngay trong 2h', 'Sáng mai (9:00)', 'Chiều mai (15:00)', 'giờ báo sau'].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setDeliveryTimePreset(preset)}
                              style={{
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: '1px solid',
                                borderColor: deliveryTimePreset === preset ? 'var(--color-primary-dark)' : '#E2E8F0',
                                background: deliveryTimePreset === preset ? 'var(--color-background-soft, #F7FBFC)' : '#FFF',
                                color: deliveryTimePreset === preset ? 'var(--color-primary-dark)' : '#64748B',
                                cursor: 'pointer',
                                fontWeight: deliveryTimePreset === preset ? 700 : 500
                              }}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. SĐT người đặt hoa */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          SĐT của anh/chị *:
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
                          <input
                            type="tel"
                            placeholder="Số điện thoại *"
                            value={senderPhone}
                            onChange={e => setSenderPhone(e.target.value)}
                            required
                            style={{
                              padding: '8px 10px',
                              borderRadius: 8,
                              border: '1px solid #CBD5E1',
                              fontSize: '0.85rem'
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Tên của anh/chị"
                            value={senderName}
                            onChange={e => setSenderName(e.target.value)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 8,
                              border: '1px solid #CBD5E1',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </div>

                      {/* 4. Người nhận hoa */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                            Người nhận hoa:
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: '#475569', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isSameRecipient}
                              onChange={e => setIsSameRecipient(e.target.checked)}
                            />
                            <span>Người nhận là tôi</span>
                          </label>
                        </div>
                        {!isSameRecipient && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 8 }}>
                            <input
                              type="text"
                              placeholder="Tên người nhận (vd: Hoà)"
                              value={recipientName}
                              onChange={e => setRecipientName(e.target.value)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: 8,
                                border: '1px solid #CBD5E1',
                                fontSize: '0.85rem'
                              }}
                            />
                            <input
                              type="tel"
                              placeholder="SĐT người nhận *"
                              value={recipientPhone}
                              onChange={e => setRecipientPhone(e.target.value)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: 8,
                                border: '1px solid #CBD5E1',
                                fontSize: '0.85rem'
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* 5. Địa chỉ nhận hoa */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Địa chỉ nhận hoa:
                        </label>
                        <input
                          type="text"
                          placeholder="Số nhà, tên đường, tòa nhà, quận/huyện..."
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: '1px solid #CBD5E1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* 6. Nội dung thiệp / biển chúc mừng */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Nội dung thiệp / biển chúc mừng:
                        </label>
                        <textarea
                          rows={3}
                          placeholder="VD: Chúc mừng sinh nhật em! Chúc em luôn xinh đẹp, bình an và may mắn trong cuộc sống..."
                          value={cardMessage}
                          onChange={e => setCardMessage(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: '1px solid #CBD5E1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      {/* 7. Ghi chú thêm */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Ghi chú thêm (ship / cọc / yêu cầu riêng):
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Bó 400k + 70k ship. 470k cọc 200k, đổi giấy gói màu kem..."
                          value={orderNotes}
                          onChange={e => setOrderNotes(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: '1px solid #CBD5E1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Submit Form Button */}
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmitFormAndSend}
                        disabled={isSubmittingOrder}
                        style={{
                          padding: '13px 16px',
                          borderRadius: 10,
                          fontWeight: 800,
                          fontSize: '0.94rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          marginTop: 6
                        }}
                      >
                        <CopyOutlined />
                        <span>
                          {isSubmittingOrder ? 'Đang tạo nội dung...' : 'Hoàn tất & Lấy đoạn văn đặt hoa ➜'}
                        </span>
                      </button>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', textAlign: 'center', lineHeight: 1.3 }}>
                        * Tự động tổng hợp & sao chép đoạn văn đặt hàng kèm ảnh để bạn dán (Ctrl + V) gửi Florist!
                      </div>

                      {/* Switch back to Tab 1 link */}
                      <div style={{ textAlign: 'center', marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => setModalTab('quick_chat')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            textDecoration: 'underline'
                          }}
                        >
                          ← Hoặc bạn muốn chat nhanh trực tiếp không cần điền form?
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
