import React, { useEffect, useState, useRef } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { 
  SaveOutlined, 
  PictureOutlined, 
  SafetyCertificateOutlined, 
  UploadOutlined, 
  LoadingOutlined,
  AppstoreOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CopyOutlined,
  DesktopOutlined,
  TabletOutlined,
  MobileOutlined
} from '@ant-design/icons';
import ImageWithFallback, { BOTANICAL_FALLBACKS } from '../../components/ImageWithFallback';
import { DEFAULT_SHOWROOM_COLLECTIONS, ShowroomCollectionItem } from '../../pages/HomePage';

export interface HeroDeviceConfig {
  badge: string;
  title: string;
  subtitle: string;
  cta_primary_text: string;
  cta_primary_url: string;
  cta_secondary_text: string;
  cta_secondary_url: string;
  hero_image: string;
}

export interface MultiDeviceHeroData {
  desktop: HeroDeviceConfig;
  tablet: HeroDeviceConfig;
  mobile: HeroDeviceConfig;
}

interface CustomDesignData {
  badge: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_url: string;
}

interface CommitmentItem {
  id: number;
  icon: string;
  title: string;
  desc: string;
}

const MINIMAL_ELEGANT_ICONS = [
  { icon: '⚘', label: 'Cành hoa thanh mảnh' },
  { icon: '❀', label: 'Hoa nở 8 cánh' },
  { icon: '✿', label: 'Đóa hoa tối giản' },
  { icon: '◈', label: 'Kệ hoa hình thoi' },
  { icon: '✦', label: 'Ngôi sao 4 cánh tinh hoa' },
  { icon: '✧', label: 'Tia sáng dịu dàng' },
  { icon: '⚜', label: 'Hoa Ly hoàng gia' },
  { icon: '🪷', label: 'Hoa sen thanh tao' },
  { icon: '🌿', label: 'Nhánh thảo mộc' },
  { icon: '🌱', label: 'Mầm hoa tươi mát' },
  { icon: '🍃', label: 'Lá bay tự nhiên' },
  { icon: '♡', label: 'Trái tim thuần khiết' },
  { icon: '✨', label: 'Tinh hoa lấp lánh' },
  { icon: '⌂', label: 'Trang chủ tối giản' },
  { icon: '◎', label: 'Vòng tròn tinh hoa' }
];

const BOTANICAL_LINE_ICONS = [
  { icon: '⚘', label: 'Bó hoa tươi' },
  { icon: '❀', label: 'Giỏ hoa' },
  { icon: '◈', label: 'Kệ hoa sự kiện' },
  { icon: '🪷', label: 'Lan hồ điệp' },
  { icon: '♡', label: 'Hoa cưới thiết kế' },
  { icon: '✦', label: 'Tất cả mẫu hoa' },
  { icon: '✨', label: 'Cắm hoa yêu cầu' },
  { icon: '🌿', label: 'Về thương hiệu' },
  { icon: '⚜', label: 'Hoa nghệ thuật' }
];

export default function AdminHomepageCmsPage() {
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCustomDesign, setUploadingCustomDesign] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customDesignFileInputRef = useRef<HTMLInputElement>(null);

  // Active tab for 3 devices
  const [activeHeroTab, setActiveHeroTab] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Multi-device Hero state
  const [hero, setHero] = useState<MultiDeviceHeroData>({
    desktop: {
      badge: '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
      title: 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
      subtitle: 'Hoa tươi thiết kế cao cấp theo yêu cầu – Chụp và gửi ảnh duyệt thành phẩm trước khi giao hàng tận nơi.',
      cta_primary_text: 'Xem bộ sưu tập hoa',
      cta_primary_url: '/flowers',
      cta_secondary_text: 'Cắm hoa theo yêu cầu',
      cta_secondary_url: '/custom-order',
      hero_image: ''
    },
    tablet: {
      badge: '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
      title: 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
      subtitle: 'Hoa tươi thiết kế cao cấp theo yêu cầu – Chụp ảnh duyệt trước khi giao.',
      cta_primary_text: 'Xem bộ sưu tập hoa',
      cta_primary_url: '/flowers',
      cta_secondary_text: 'Cắm hoa theo yêu cầu',
      cta_secondary_url: '/custom-order',
      hero_image: ''
    },
    mobile: {
      badge: '✦ NGHỆ FLORIST SHOWROOM',
      title: 'Hoa Tươi Thiết Kế Theo Yêu Cầu',
      subtitle: 'Gửi ảnh thành phẩm thực tế duyệt trước khi giao tận nơi.',
      cta_primary_text: 'Xem mẫu hoa',
      cta_primary_url: '/flowers',
      cta_secondary_text: 'Cắm theo yêu cầu',
      cta_secondary_url: '/custom-order',
      hero_image: ''
    }
  });

  // Custom Design Banner state (Section 6)
  const [customDesign, setCustomDesign] = useState<CustomDesignData>({
    badge: 'Dịch vụ độc quyền',
    title: 'Cắm hoa theo yêu cầu & Ngân sách của riêng bạn',
    subtitle: 'Bạn có mẫu hoa ưng ý trên Pinterest hoặc muốn sáng tạo theo tone màu phong thủy? Hãy gửi hình ảnh và yêu cầu, florist của Nghệ Florist sẽ hiện thực hóa tác phẩm hoa gửi bạn kiểm duyệt trước khi giao.',
    image_url: '',
    cta_text: 'Gửi yêu cầu cắm hoa ngay',
    cta_url: '/custom-order'
  });

  // 5 commitments
  const [commitments, setCommitments] = useState<CommitmentItem[]>([]);

  // Showroom collections state (Section 2)
  const [collections, setCollections] = useState<ShowroomCollectionItem[]>(DEFAULT_SHOWROOM_COLLECTIONS);
  const [uploadingCollectionIndex, setUploadingCollectionIndex] = useState<number | null>(null);
  const collectionFileInputRef = useRef<HTMLInputElement>(null);
  const [activeCollectionUploadIdx, setActiveCollectionUploadIdx] = useState<number | null>(null);

  const fetchHomepageData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/homepage');
      if (res.ok) {
        const data = await res.json();
        if (data.hero) {
          const d = data.hero;
          setHero({
            desktop: d.desktop ? { ...d.desktop, cta_primary_url: '/flowers', cta_secondary_url: '/custom-order' } : {
              badge: d.badge || '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
              title: d.title || 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
              subtitle: d.subtitle || '',
              cta_primary_text: d.cta_primary_text || 'Xem bộ sưu tập hoa',
              cta_primary_url: '/flowers',
              cta_secondary_text: d.cta_secondary_text || 'Cắm hoa theo yêu cầu',
              cta_secondary_url: '/custom-order',
              hero_image: d.hero_image || ''
            },
            tablet: d.tablet ? { ...d.tablet, cta_primary_url: '/flowers', cta_secondary_url: '/custom-order' } : {
              badge: d.badge || '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
              title: d.title || 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
              subtitle: d.subtitle || '',
              cta_primary_text: d.cta_primary_text || 'Xem bộ sưu tập hoa',
              cta_primary_url: '/flowers',
              cta_secondary_text: d.cta_secondary_text || 'Cắm hoa theo yêu cầu',
              cta_secondary_url: '/custom-order',
              hero_image: d.hero_image || ''
            },
            mobile: d.mobile ? { ...d.mobile, cta_primary_url: '/flowers', cta_secondary_url: '/custom-order' } : {
              badge: d.badge || '✦ NGHỆ FLORIST SHOWROOM',
              title: d.title || 'Hoa Tươi Thiết Kế Theo Yêu Cầu',
              subtitle: d.subtitle || '',
              cta_primary_text: d.cta_primary_text || 'Xem mẫu hoa',
              cta_primary_url: '/flowers',
              cta_secondary_text: d.cta_secondary_text || 'Cắm theo yêu cầu',
              cta_secondary_url: '/custom-order',
              hero_image: d.hero_image || ''
            }
          });
        }
        if (data.customDesign) setCustomDesign(data.customDesign);
        if (data.commitments && data.commitments.length > 0) setCommitments(data.commitments);
        if (data.collections && Array.isArray(data.collections) && data.collections.length > 0) {
          setCollections(data.collections);
        }
      }
    } catch (err) {
      console.error('Error fetching homepage CMS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const handleCopyFromDesktop = (target: 'tablet' | 'mobile') => {
    setHero(prev => ({
      ...prev,
      [target]: {
        ...prev.desktop,
        hero_image: prev[target].hero_image || prev.desktop.hero_image
      }
    }));
    alert(`Đã sao chép nội dung văn bản từ Desktop sang ${target === 'tablet' ? 'Tablet' : 'Mobile'}!`);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payloadHero = {
        desktop: { ...hero.desktop, cta_primary_url: '/flowers', cta_secondary_url: '/custom-order' },
        tablet: { ...hero.tablet, cta_primary_url: '/flowers', cta_secondary_url: '/custom-order' },
        mobile: { ...hero.mobile, cta_primary_url: '/flowers', cta_secondary_url: '/custom-order' },
        // Fallback root fields for backward compatibility
        ...hero.desktop
      };

      const res = await fetch('/api/admin/content/homepage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hero: payloadHero,
          collections,
          commitments,
          custom_design: {
            ...customDesign,
            cta_url: '/custom-order'
          }
        })
      });

      if (res.ok) {
        alert('Đã lưu nội dung trang chủ thành công! Các thay đổi đã xuất hiện trên trang chủ.');
      } else {
        const d = await res.json();
        alert(d.error || 'Lỗi lưu dữ liệu');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerCollectionUpload = (index: number) => {
    setActiveCollectionUploadIdx(index);
    if (collectionFileInputRef.current) {
      collectionFileInputRef.current.value = '';
      collectionFileInputRef.current.click();
    }
  };

  const handleUploadCollectionImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeCollectionUploadIdx === null) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Dung lượng ảnh tối đa là 10MB.');
      return;
    }

    try {
      setUploadingCollectionIndex(activeCollectionUploadIdx);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      let uploadedUrl = '';
      if (res.ok && data.file?.url) {
        uploadedUrl = data.file.url;
      } else {
        const fbRes = await fetch('/api/customer-requests/upload-attachment', {
          method: 'POST',
          body: formData
        });
        const fbData = await fbRes.json();
        uploadedUrl = fbData.fileUrl || fbData.url;
      }

      if (uploadedUrl) {
        setCollections(prev => {
          const next = [...prev];
          next[activeCollectionUploadIdx] = {
            ...next[activeCollectionUploadIdx],
            image: uploadedUrl
          };
          return next;
        });
      } else {
        throw new Error('Không thể tải ảnh lên máy chủ');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploadingCollectionIndex(null);
      setActiveCollectionUploadIdx(null);
      if (collectionFileInputRef.current) collectionFileInputRef.current.value = '';
    }
  };

  const handleUpdateCollection = (index: number, field: keyof ShowroomCollectionItem, value: string) => {
    setCollections(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value
      };
      return next;
    });
  };

  const handleAddCollection = () => {
    setCollections(prev => [
      ...prev,
      {
        title: 'Bộ sưu tập mới',
        slug: `danh-muc-${Date.now()}`,
        icon: '🌸',
        image: '/images/bo-hoa-hong.webp',
        desc: 'Mô tả bộ sưu tập hoa'
      }
    ]);
  };

  const handleDeleteCollection = (index: number) => {
    if (collections.length <= 1) {
      alert('Cần giữ ít nhất 1 bộ sưu tập hiển thị trên trang chủ.');
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa bộ sưu tập "${collections[index].title}" khỏi trang chủ?`)) {
      setCollections(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleResetCollectionsToDefault = () => {
    if (window.confirm('Khôi phục danh sách 5 bộ sưu tập về mặc định ban đầu của Nghệ Florist?')) {
      setCollections(DEFAULT_SHOWROOM_COLLECTIONS);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Dung lượng ảnh tối đa là 10MB.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.file?.url) {
        setHero(prev => ({
          ...prev,
          [activeHeroTab]: {
            ...prev[activeHeroTab],
            hero_image: data.file.url
          }
        }));
      } else {
        // Fallback upload endpoint
        const fbRes = await fetch('/api/customer-requests/upload-attachment', {
          method: 'POST',
          body: formData
        });
        const fbData = await fbRes.json();
        const fbUrl = fbData.fileUrl || fbData.url;
        if (fbRes.ok && fbUrl) {
          setHero(prev => ({
            ...prev,
            [activeHeroTab]: {
              ...prev[activeHeroTab],
              hero_image: fbUrl
            }
          }));
        } else {
          throw new Error(data.error || 'Lỗi tải ảnh lên máy chủ');
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Không thể tải ảnh lên máy chủ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadCustomDesignImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Dung lượng ảnh tối đa là 10MB.');
      return;
    }

    try {
      setUploadingCustomDesign(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.file?.url) {
        setCustomDesign(prev => ({ ...prev, image_url: data.file.url }));
      } else {
        const fbRes = await fetch('/api/customer-requests/upload-attachment', {
          method: 'POST',
          body: formData
        });
        const fbData = await fbRes.json();
        const fbUrl = fbData.fileUrl || fbData.url;
        if (fbRes.ok && fbUrl) {
          setCustomDesign(prev => ({ ...prev, image_url: fbUrl }));
        } else {
          throw new Error(data.error || 'Lỗi tải ảnh lên máy chủ');
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Không thể tải ảnh lên máy chủ');
    } finally {
      setUploadingCustomDesign(false);
      if (customDesignFileInputRef.current) customDesignFileInputRef.current.value = '';
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#5D9EAF' }}>Đang tải cấu hình trang chủ...</div>;
  }

  const currentDeviceHero = hero[activeHeroTab];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản Trị Trang Chủ (Homepage CMS)</h1>
          <div className="admin-page-subtitle">
            Chỉnh sửa Banner chính (Hero) phân tách theo PC / Tablet / Mobile, slogan và các cam kết hiển thị ngoài trang chủ
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAll}>
        {/* Section 1: Multi-Device Hero Banner */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#26383D', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PictureOutlined style={{ color: '#5D9EAF' }} /> Banner Chính (Hero Section) — Phân Tách Thiết Bị
            </h3>
            {activeHeroTab !== 'desktop' && (
              <button
                type="button"
                onClick={() => handleCopyFromDesktop(activeHeroTab)}
                className="admin-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px' }}
                title="Sao chép tiêu đề, mô tả và nút bấm từ Desktop sang"
              >
                <CopyOutlined />
                Sao chép dữ liệu từ PC sang {activeHeroTab === 'tablet' ? 'Tablet' : 'Mobile'}
              </button>
            )}
          </div>

          {/* 3 Tabs Header: PC, Tablet, Mobile */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #E2E8F0', marginBottom: 20, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveHeroTab('desktop')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderBottom: activeHeroTab === 'desktop' ? '3px solid #5D9EAF' : '3px solid transparent',
                color: activeHeroTab === 'desktop' ? '#5D9EAF' : '#64748B',
                transition: 'all 0.15s ease'
              }}
            >
              <DesktopOutlined />
              <span>[ 💻 PC / Desktop ]</span>
              <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, backgroundColor: activeHeroTab === 'desktop' ? '#E4EEF1' : '#F1F5F9', color: '#475569' }}>
                Tỉ lệ ngang 16:9
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHeroTab('tablet')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderBottom: activeHeroTab === 'tablet' ? '3px solid #5D9EAF' : '3px solid transparent',
                color: activeHeroTab === 'tablet' ? '#5D9EAF' : '#64748B',
                transition: 'all 0.15s ease'
              }}
            >
              <TabletOutlined />
              <span>[ 📟 Tablet ]</span>
              <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, backgroundColor: activeHeroTab === 'tablet' ? '#E4EEF1' : '#F1F5F9', color: '#475569' }}>
                Tỉ lệ 4:3
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHeroTab('mobile')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderBottom: activeHeroTab === 'mobile' ? '3px solid #5D9EAF' : '3px solid transparent',
                color: activeHeroTab === 'mobile' ? '#5D9EAF' : '#64748B',
                transition: 'all 0.15s ease'
              }}
            >
              <MobileOutlined />
              <span>[ 📱 Mobile ]</span>
              <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, backgroundColor: activeHeroTab === 'mobile' ? '#E4EEF1' : '#F1F5F9', color: '#475569' }}>
                Tỉ lệ dọc 4:5
              </span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'start' }}>
            <div>
              <div className="admin-form-group">
                <label className="admin-label">Huy hiệu nhỏ phía trên (Badge)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={currentDeviceHero.badge}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHero(prev => ({
                      ...prev,
                      [activeHeroTab]: { ...prev[activeHeroTab], badge: val }
                    }));
                  }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tiêu đề chính (Title H1) *</label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  value={currentDeviceHero.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHero(prev => ({
                      ...prev,
                      [activeHeroTab]: { ...prev[activeHeroTab], title: val }
                    }));
                  }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Đoạn giới thiệu ngắn (Subtitle)</label>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  value={currentDeviceHero.subtitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHero(prev => ({
                      ...prev,
                      [activeHeroTab]: { ...prev[activeHeroTab], subtitle: val }
                    }));
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Nút chính: Tên nút</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={currentDeviceHero.cta_primary_text}
                    placeholder="Ví dụ: Xem bộ sưu tập hoa"
                    onChange={(e) => {
                      const val = e.target.value;
                      setHero(prev => ({
                        ...prev,
                        [activeHeroTab]: { ...prev[activeHeroTab], cta_primary_text: val }
                      }));
                    }}
                  />
                </div>
                <div className="admin-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="admin-label">Nút chính: Đường dẫn (URL)</label>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Cố định hệ thống</span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    value={currentDeviceHero.cta_primary_url || '/flowers'}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' }}
                    title="Đường dẫn cố định đến trang Bộ sưu tập hoa"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Nút phụ: Tên nút</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={currentDeviceHero.cta_secondary_text}
                    placeholder="Ví dụ: Cắm hoa theo yêu cầu"
                    onChange={(e) => {
                      const val = e.target.value;
                      setHero(prev => ({
                        ...prev,
                        [activeHeroTab]: { ...prev[activeHeroTab], cta_secondary_text: val }
                      }));
                    }}
                  />
                </div>
                <div className="admin-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="admin-label">Nút phụ: Đường dẫn (URL)</label>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Cố định hệ thống</span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    value={currentDeviceHero.cta_secondary_url || '/custom-order'}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' }}
                    title="Đường dẫn cố định đến trang Đặt hoa theo yêu cầu"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image Upload with Dynamic Device Proportioned Frame */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label className="admin-label" style={{ margin: 0, fontWeight: 700, color: '#26383D' }}>
                  Hình Ảnh Banner ({activeHeroTab.toUpperCase()})
                </label>
                <span style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                  {activeHeroTab === 'desktop' && 'Tỉ lệ chuẩn: 16:9 (hoặc 4:4.5)'}
                  {activeHeroTab === 'tablet' && 'Tỉ lệ chuẩn: 4:3 (hoặc 1:1)'}
                  {activeHeroTab === 'mobile' && 'Tỉ lệ chuẩn: 4:5 (hoặc 4:3)'}
                </span>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: 'none' }}
                onChange={handleUploadImage}
              />

              {/* Device Proportioned Preview Frame */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: activeHeroTab === 'desktop' ? '460px' : activeHeroTab === 'tablet' ? '360px' : '280px',
                  margin: '0 auto',
                  aspectRatio: activeHeroTab === 'desktop' ? '16 / 9' : activeHeroTab === 'tablet' ? '4 / 3' : '4 / 5',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '6px solid #FFFFFF',
                  boxShadow: '0 12px 30px rgba(38, 56, 61, 0.14)',
                  backgroundColor: '#F7FBFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Bấm vào để chọn ảnh mới tải lên cho thiết bị này"
              >
                {currentDeviceHero.hero_image ? (
                  <ImageWithFallback
                    key={currentDeviceHero.hero_image}
                    src={currentDeviceHero.hero_image}
                    alt={`Hero ${activeHeroTab} preview`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748B' }}>
                    <UploadOutlined style={{ fontSize: 40, color: '#5D9EAF', marginBottom: 12 }} />
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                      Tải ảnh cho {activeHeroTab.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: 4 }}>Bấm vào để chọn ảnh từ máy tính</div>
                  </div>
                )}

                {/* Uploading progress overlay */}
                {uploading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#5D9EAF',
                      fontWeight: 600,
                      fontSize: '14px',
                      backdropFilter: 'blur(2px)'
                    }}
                  >
                    <LoadingOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                    <span>Đang tải ảnh lên...</span>
                  </div>
                )}
              </div>

              {/* Action under image preview */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, gap: 10 }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                >
                  <UploadOutlined /> Thay đổi ảnh {activeHeroTab.toUpperCase()}
                </button>
                {currentDeviceHero.hero_image && (
                  <button
                    type="button"
                    style={{
                      border: '1px solid #FECACA',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHero(prev => ({
                        ...prev,
                        [activeHeroTab]: { ...prev[activeHeroTab], hero_image: '' }
                      }));
                    }}
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input for collection item images */}
        <input
          ref={collectionFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleUploadCollectionImage}
        />

        {/* Section 2: BỘ SƯU TẬP NỔI BẬT (SHOWROOM COLLECTIONS) */}
        <div className="admin-card" style={{ border: '2px solid #BAE6FD', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0C4A6E', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AppstoreOutlined style={{ color: '#0284C7' }} /> Quản Lý Bộ Sưu Tập Nổi Bật (Showroom Collections)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5 }}>
                Chỉnh sửa hình ảnh, tên gọi, biểu tượng (icon), mô tả và đường dẫn của các danh mục hoa hiển thị tại mục "Bộ sưu tập nổi bật" trên trang chủ
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={handleResetCollectionsToDefault}
                className="btn btn-soft btn-sm"
                style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                title="Khôi phục danh sách gốc ban đầu"
              >
                <ReloadOutlined /> Khôi phục gốc
              </button>
              <button
                type="button"
                onClick={handleAddCollection}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <PlusOutlined /> Thêm bộ sưu tập
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {collections.map((col, index) => (
              <div
                key={col.id || col.slug || index}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative'
                }}
              >
                {/* Header card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Mục #{index + 1}: {col.title}
                  </span>
                  {collections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCollection(index)}
                      style={{
                        border: 'none',
                        background: '#FEE2E2',
                        color: '#EF4444',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Xóa bộ sưu tập này"
                    >
                      <DeleteOutlined /> Xóa
                    </button>
                  )}
                </div>

                {/* Top: Image Preview & Upload */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 75,
                      height: 100,
                      borderRadius: 10,
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid #CBD5E1',
                      flexShrink: 0,
                      backgroundColor: '#F8FAFC'
                    }}
                  >
                    <ImageWithFallback
                      src={col.image}
                      alt={col.title}
                      fallbackSrc={BOTANICAL_FALLBACKS[1]}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {uploadingCollectionIndex === index && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.85)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0284C7',
                          fontSize: 16
                        }}
                      >
                        <LoadingOutlined spin />
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleTriggerCollectionUpload(index)}
                      disabled={uploadingCollectionIndex !== null}
                      className="btn btn-outline btn-sm"
                      style={{
                        fontSize: '0.8rem',
                        padding: '6px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        borderRadius: 6,
                        borderColor: '#0284C7',
                        color: '#0284C7',
                        backgroundColor: '#F0F9FF',
                        marginBottom: 6,
                        cursor: uploadingCollectionIndex !== null ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <UploadOutlined />
                      {uploadingCollectionIndex === index ? 'Đang tải...' : 'Tải ảnh mới lên'}
                    </button>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      JPG, PNG, WEBP (Tỉ lệ chuẩn khung hình 3:4)
                    </div>
                  </div>
                </div>

                {/* Image URL text input */}
                <div className="admin-form-group" style={{ margin: 0 }}>
                  <label className="admin-label" style={{ fontSize: '0.78rem', marginBottom: 4 }}>
                    Đường dẫn ảnh (URL):
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                    value={col.image}
                    placeholder="/images/... hoặc https://..."
                    onChange={(e) => handleUpdateCollection(index, 'image', e.target.value)}
                  />
                </div>

                {/* Title & Icon Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 10 }}>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label" style={{ fontSize: '0.78rem', marginBottom: 4 }}>
                      Icon:
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ fontSize: '1.1rem', textAlign: 'center', padding: '6px 4px' }}
                      value={col.icon}
                      placeholder="⚘"
                      onChange={(e) => handleUpdateCollection(index, 'icon', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label" style={{ fontSize: '0.78rem', marginBottom: 4 }}>
                      Tên bộ sưu tập: *
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ fontSize: '0.84rem', fontWeight: 700, padding: '6px 10px' }}
                      required
                      value={col.title}
                      placeholder="Ví dụ: Bó hoa tươi"
                      onChange={(e) => handleUpdateCollection(index, 'title', e.target.value)}
                    />
                  </div>
                </div>

                {/* Quick icon suggestions (Minimalist Elegant & Vibrant Emoji) */}
                <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Row 1: Phong cách Tinh tế & Tối giản (Khuyên dùng) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginRight: 2, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <span>✦</span> Tinh tế:
                    </span>
                    {MINIMAL_ELEGANT_ICONS.map(item => (
                      <button
                        key={item.icon}
                        type="button"
                        onClick={() => handleUpdateCollection(index, 'icon', item.icon)}
                        title={`${item.label} (${item.icon})`}
                        style={{
                          border: '1px solid',
                          background: col.icon === item.icon ? '#E6F4F4' : '#FFFFFF',
                          borderColor: col.icon === item.icon ? 'var(--color-primary-dark)' : '#CBD5E1',
                          color: col.icon === item.icon ? 'var(--color-primary-dark)' : '#334155',
                          borderRadius: 6,
                          padding: '3px 7px',
                          cursor: 'pointer',
                          fontSize: '0.92rem',
                          lineHeight: 1,
                          fontWeight: 600,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {item.icon}
                      </button>
                    ))}
                  </div>

                  {/* Row 2: Biểu tượng bộ sưu tập */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748B', marginRight: 2 }}>
                      ⚘ Chủ đề:
                    </span>
                    {BOTANICAL_LINE_ICONS.map(item => (
                      <button
                        key={item.icon}
                        type="button"
                        onClick={() => handleUpdateCollection(index, 'icon', item.icon)}
                        title={`${item.label} (${item.icon})`}
                        style={{
                          border: '1px solid',
                          background: col.icon === item.icon ? '#E6F4F4' : '#FFFFFF',
                          borderColor: col.icon === item.icon ? 'var(--color-primary-dark)' : '#E2E8F0',
                          color: col.icon === item.icon ? 'var(--color-primary-dark)' : '#334155',
                          borderRadius: 6,
                          padding: '3px 7px',
                          cursor: 'pointer',
                          fontSize: '0.92rem',
                          lineHeight: 1,
                          fontWeight: 600,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {item.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description & Slug */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label" style={{ fontSize: '0.78rem', marginBottom: 4 }}>
                      Mô tả ngắn:
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                      value={col.desc}
                      placeholder="Ví dụ: Thiết kế tinh tế, tự nhiên"
                      onChange={(e) => handleUpdateCollection(index, 'desc', e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label" style={{ fontSize: '0.78rem', marginBottom: 4 }}>
                      Đường dẫn (Slug):
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                      value={col.slug}
                      placeholder="Ví dụ: bo-hoa"
                      onChange={(e) => handleUpdateCollection(index, 'slug', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: 5 Cam kết thương hiệu */}
        <div className="admin-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#26383D', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SafetyCertificateOutlined style={{ color: '#5D9EAF' }} /> 5 Cam Kết Dịch Vụ Của Nghệ Florist
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {commitments.map((c, index) => (
              <div key={c.id || index} style={{ padding: '16px', border: '1px solid #E4EEF1', borderRadius: '8px', backgroundColor: '#fff' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#5D9EAF', marginBottom: '6px' }}>
                  CAM KẾT #{index + 1}
                </div>
                <div className="admin-form-group" style={{ marginBottom: '10px' }}>
                  <label className="admin-label">Tiêu đề</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={c.title}
                    onChange={(e) => {
                      const updated = [...commitments];
                      updated[index].title = e.target.value;
                      setCommitments(updated);
                    }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Mô tả cam kết</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    value={c.desc}
                    onChange={(e) => {
                      const updated = [...commitments];
                      updated[index].desc = e.target.value;
                      setCommitments(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Banner Cắm Hoa Theo Yêu Cầu (Custom Design Banner) */}
        <div className="admin-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#26383D', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PictureOutlined style={{ color: '#5D9EAF' }} /> Banner Dịch Vụ Độc Quyền (Cắm Hoa Theo Yêu Cầu)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'start' }}>
            <div>
              <div className="admin-form-group">
                <label className="admin-label">Huy hiệu nhỏ (Badge)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={customDesign.badge}
                  onChange={(e) => setCustomDesign({ ...customDesign, badge: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tiêu đề (Title) *</label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  value={customDesign.title}
                  onChange={(e) => setCustomDesign({ ...customDesign, title: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Mô tả dịch vụ</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  value={customDesign.subtitle}
                  onChange={(e) => setCustomDesign({ ...customDesign, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-label">Chữ trên nút bấm</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={customDesign.cta_text}
                    onChange={(e) => setCustomDesign({ ...customDesign, cta_text: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="admin-label">Đường dẫn liên kết</label>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Cố định hệ thống</span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    value={customDesign.cta_url || '/custom-order'}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Custom Design Image Upload & Preview */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label className="admin-label" style={{ margin: 0, fontWeight: 700, color: '#26383D' }}>
                  Hình Ảnh Banner Cắm Hoa Theo Yêu Cầu
                </label>
                <span style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                  Tỉ lệ: 4:3
                </span>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={customDesignFileInputRef}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: 'none' }}
                onChange={handleUploadCustomDesignImage}
              />

              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '340px',
                  margin: '0 auto',
                  aspectRatio: '4/3',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 8px 24px rgba(38, 56, 61, 0.12)',
                  backgroundColor: '#F7FBFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => customDesignFileInputRef.current?.click()}
                title="Bấm vào để chọn ảnh mới tải lên"
              >
                {customDesign.image_url ? (
                  <ImageWithFallback
                    key={customDesign.image_url}
                    src={customDesign.image_url}
                    alt="Custom design banner preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748B' }}>
                    <UploadOutlined style={{ fontSize: 40, color: '#5D9EAF', marginBottom: 12 }} />
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>Tải ảnh banner lên</div>
                    <div style={{ fontSize: '12px', marginTop: 4 }}>Bấm vào để chọn ảnh từ máy tính</div>
                  </div>
                )}

                {/* Uploading progress overlay */}
                {uploadingCustomDesign && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      color: '#0284C7',
                      fontWeight: 700,
                      fontSize: '14px',
                      zIndex: 10
                    }}
                  >
                    <LoadingOutlined style={{ fontSize: 32 }} spin />
                    Đang tải ảnh lên...
                  </div>
                )}
              </div>

              {/* Upload Action Button */}
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => customDesignFileInputRef.current?.click()}
                  disabled={uploadingCustomDesign}
                  className="btn btn-outline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    borderColor: '#5D9EAF',
                    color: '#5D9EAF',
                    backgroundColor: '#FFFFFF',
                    cursor: uploadingCustomDesign ? 'not-allowed' : 'pointer'
                  }}
                >
                  <UploadOutlined style={{ fontSize: 16 }} />
                  {customDesign.image_url ? 'Tải ảnh khác thay thế' : 'Chọn tệp ảnh tải lên'}
                </button>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: 6 }}>
                  Lưu trữ trực tiếp Supabase Storage • Hiển thị tại khối Dịch vụ độc quyền trang chủ
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        <div style={{ position: 'sticky', bottom: '20px', display: 'flex', justifyContent: 'flex-end', zIndex: 10 }}>
          <button
            type="submit"
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{ padding: '12px 28px', fontSize: '15px', boxShadow: '0 8px 24px rgba(93, 158, 175, 0.35)' }}
          >
            <SaveOutlined /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Trang Chủ'}
          </button>
        </div>
      </form>
    </div>
  );
}
