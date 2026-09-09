import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserOutlined, 
  LockOutlined, 
  CarOutlined, 
  HistoryOutlined, 
  CheckCircleFilled, 
  SaveOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PhoneOutlined,
  HomeOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  HeartOutlined,
  GiftOutlined
} from '@ant-design/icons';

interface DeliveryInfo {
  ordering_name?: string;
  ordering_phone?: string;
  recipient_name?: string;
  recipient_phone?: string;
  delivery_address?: string;
  preferred_delivery_time?: string;
  card_message?: string;
  payment_method?: string;
  notes?: string;
}

interface CustomerUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at?: string;
}

interface OrderRequest {
  id: number;
  code: string;
  type: string;
  selected_product_name?: string;
  style?: string;
  budget?: string;
  status: string;
  created_at: string;
  requested_date?: string;
  requested_time?: string;
  delivery_area?: string;
  message?: string;
  sample_img?: string;
}

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nghe_customer_token'));
  const [user, setUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('nghe_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'delivery' | 'security' | 'orders'>('delivery');
  const [loading, setLoading] = useState(true);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Delivery info form state (7 essential questions)
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    ordering_name: '',
    ordering_phone: '',
    recipient_name: '',
    recipient_phone: '',
    delivery_address: '',
    preferred_delivery_time: 'Sáng (08:00 - 11:30)',
    card_message: '',
    payment_method: 'Chuyển khoản QR ngân hàng',
    notes: 'Bên em sẽ chụp và gửi ảnh sản phẩm hoàn thiện kèm thiệp/biển qua zalo của anh/chị để duyệt trước khi hoa được giao đi ạ!'
  });

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Orders list
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check login on mount
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('nghe_customer_token');
          localStorage.removeItem('nghe_customer_user');
          navigate('/login');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setFullName(data.user.full_name || '');
            setPhone(data.user.phone || '');
            localStorage.setItem('nghe_customer_user', JSON.stringify(data.user));
          }
          if (data.delivery_info) {
            setDelivery({
              ordering_name: data.delivery_info.ordering_name || data.user.full_name || '',
              ordering_phone: data.delivery_info.ordering_phone || data.user.phone || '',
              recipient_name: data.delivery_info.recipient_name || '',
              recipient_phone: data.delivery_info.recipient_phone || '',
              delivery_address: data.delivery_info.delivery_address || '',
              preferred_delivery_time: data.delivery_info.preferred_delivery_time || 'Sáng (08:00 - 11:30)',
              card_message: data.delivery_info.card_message || '',
              payment_method: data.delivery_info.payment_method || 'Chuyển khoản QR ngân hàng',
              notes: data.delivery_info.notes || 'Bên em sẽ chụp và gửi ảnh sản phẩm hoàn thiện kèm thiệp/biển qua zalo của anh/chị để duyệt trước khi hoa được giao đi ạ!'
            });
            // Save to localStorage for quick auto-fill across all storefront modals/pages
            localStorage.setItem('nghe_customer_delivery_info', JSON.stringify(data.delivery_info));
          } else if (data.user) {
            // Pre-fill user info if no address yet
            setDelivery(prev => ({
              ...prev,
              ordering_name: data.user.full_name || '',
              ordering_phone: data.user.phone || ''
            }));
          }
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  // Fetch orders when tab switches to orders
  useEffect(() => {
    if (activeTab === 'orders' && token) {
      fetch('/api/auth/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.requests) setOrders(data.requests);
        })
        .catch(console.error);
    }
  }, [activeTab, token]);

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    window.scrollTo({ top: 120, behavior: 'smooth' });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  // Save Delivery Info
  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingDelivery(true);
    setAlertMsg(null);

    try {
      const res = await fetch('/api/auth/delivery-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(delivery)
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('nghe_customer_delivery_info', JSON.stringify(delivery));
        showAlert('success', 'Đã lưu thông tin nhận hoa mặc định! Khi đặt hoa, các thông tin này sẽ tự động điền giúp bạn không phải gõ lại.');
      } else {
        showAlert('error', data.error || 'Lỗi lưu thông tin');
      }
    } catch (err) {
      showAlert('error', 'Lỗi kết nối máy chủ');
    } finally {
      setSavingDelivery(false);
    }
  };

  // Update Profile Name & Phone
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setAlertMsg(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ full_name: fullName, phone })
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('nghe_customer_user', JSON.stringify(data.user));
        showAlert('success', 'Cập nhật thông tin tài khoản thành công!');
      } else {
        showAlert('error', data.error || 'Lỗi cập nhật');
      }
    } catch (err) {
      showAlert('error', 'Lỗi kết nối máy chủ');
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword.length < 6) {
      showAlert('error', 'Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('error', 'Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }

    setSavingPassword(true);
    setAlertMsg(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        showAlert('success', 'Đổi mật khẩu thành công! Mật khẩu mới đã có hiệu lực.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showAlert('error', data.error || 'Lỗi đổi mật khẩu');
      }
    } catch (err) {
      showAlert('error', 'Lỗi kết nối máy chủ');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nghe_customer_token');
    localStorage.removeItem('nghe_customer_user');
    localStorage.removeItem('nghe_customer_delivery_info');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#5D9EAF', fontWeight: 600 }}>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFB', minHeight: '85vh', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        
        {/* Top Profile Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid #E4EEF1',
          boxShadow: '0 4px 20px rgba(93, 158, 175, 0.08)',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#EDF6F8',
              color: '#5D9EAF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
            }}>
              <UserOutlined />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#26383D', margin: 0 }}>
                  {user?.full_name || user?.username || 'Khách hàng thân thiết'}
                </h1>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  backgroundColor: '#E6F4EA',
                  color: '#137333',
                  padding: '3px 10px',
                  borderRadius: '20px'
                }}>
                  ✦ Khách hàng Nghệ Florist
                </span>
              </div>
              <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.88rem' }}>
                Email: {user?.email} • Tên đăng nhập: <strong>{user?.username}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/custom-order"
              style={{
                padding: '9px 18px',
                backgroundColor: '#5D9EAF',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <GiftOutlined /> Đặt cắm hoa mới
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '9px 16px',
                backgroundColor: '#FFF1F2',
                color: '#E11D48',
                border: '1px solid #FECDD3',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 600
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {alertMsg && (
          <div style={{
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: alertMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            color: alertMsg.type === 'success' ? '#166534' : '#991B1B',
            border: `1px solid ${alertMsg.type === 'success' ? '#BBF7D0' : '#FECACA'}`
          }}>
            <CheckCircleFilled style={{ fontSize: '16px', color: alertMsg.type === 'success' ? '#16A34A' : '#DC2626' }} />
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* Main Content Card with Navigation Tabs */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E4EEF1',
          boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          {/* Tabs Navigation Header */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #E4EEF1',
            backgroundColor: '#FAFCFD',
            overflowX: 'auto'
          }}>
            <button
              onClick={() => setActiveTab('delivery')}
              style={{
                padding: '16px 24px',
                fontSize: '0.95rem',
                fontWeight: activeTab === 'delivery' ? 700 : 500,
                color: activeTab === 'delivery' ? '#5D9EAF' : '#64748B',
                border: 'none',
                borderBottom: activeTab === 'delivery' ? '3px solid #5D9EAF' : '3px solid transparent',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <CarOutlined style={{ fontSize: '18px' }} />
              <span>Thông Tin Nhận Hoa (Lên đơn nhanh)</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              style={{
                padding: '16px 24px',
                fontSize: '0.95rem',
                fontWeight: activeTab === 'security' ? 700 : 500,
                color: activeTab === 'security' ? '#5D9EAF' : '#64748B',
                border: 'none',
                borderBottom: activeTab === 'security' ? '3px solid #5D9EAF' : '3px solid transparent',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <LockOutlined style={{ fontSize: '18px' }} />
              <span>Tài Khoản & Đổi Mật Khẩu</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '16px 24px',
                fontSize: '0.95rem',
                fontWeight: activeTab === 'orders' ? 700 : 500,
                color: activeTab === 'orders' ? '#5D9EAF' : '#64748B',
                border: 'none',
                borderBottom: activeTab === 'orders' ? '3px solid #5D9EAF' : '3px solid transparent',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <HistoryOutlined style={{ fontSize: '18px' }} />
              <span>Lịch Sử Yêu Cầu Hoa</span>
            </button>
          </div>

          <div style={{ padding: '32px' }}>
            {/* ========================================== */}
            {/* TAB 1: THÔNG TIN NHẬN HOA (7 TIÊU CHÍ LÊN ĐƠN) */}
            {/* ========================================== */}
            {activeTab === 'delivery' && (
              <div>
                {/* Information Card Banner */}
                <div style={{
                  backgroundColor: '#F0F9FA',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  border: '1px solid #D5EFF2',
                  marginBottom: '26px'
                }}>
                  <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#1B4D58', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HeartOutlined style={{ color: '#E11D48' }} />
                    <span>Lên đơn thuận tiện – Không cần điền lại nhiều lần!</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                    Anh/chị chỉ cần điền trước thông tin giao nhận quen thuộc dưới đây. Mỗi khi anh/chị chọn mẫu hoa hoặc đặt cắm theo yêu cầu, hệ thống sẽ <strong>tự động điền đầy đủ</strong> các thông tin này để lên đơn nhanh nhất có thể.
                    <br />
                    <span style={{ fontSize: '0.82rem', color: '#64748B', fontStyle: 'italic', display: 'inline-block', marginTop: 4 }}>
                      * Các thông tin thay đổi theo từng đơn (như ngày/khung giờ nhận, nội dung thiệp hoặc biển chúc mừng) sẽ được chọn trực tiếp mỗi khi anh/chị lên đơn hoa.
                    </span>
                  </p>
                </div>

                <form onSubmit={handleSaveDelivery}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    {/* 1. SĐT của anh/chị */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                        1. SĐT của anh/chị (Người đặt) <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <PhoneOutlined style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                        <input
                          type="tel"
                          required
                          value={delivery.ordering_phone || ''}
                          onChange={e => setDelivery({ ...delivery, ordering_phone: e.target.value })}
                          placeholder="Ví dụ: 0987 654 321"
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 38px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    {/* Họ tên người đặt */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                        Họ tên của anh/chị
                      </label>
                      <div style={{ position: 'relative' }}>
                        <UserOutlined style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                        <input
                          type="text"
                          value={delivery.ordering_name || ''}
                          onChange={e => setDelivery({ ...delivery, ordering_name: e.target.value })}
                          placeholder="Ví dụ: Anh Nam / Chị Lan"
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 38px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    {/* 2. Tên người nhận hoa */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                        2. Tên người nhận hoa <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <UserOutlined style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                        <input
                          type="text"
                          required
                          value={delivery.recipient_name || ''}
                          onChange={e => setDelivery({ ...delivery, recipient_name: e.target.value })}
                          placeholder="Ví dụ: Chị Mai (hoặc Chính mình)"
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 38px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    {/* 3. SĐT người nhận hoa */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                        3. SĐT người nhận hoa <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <PhoneOutlined style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                        <input
                          type="tel"
                          required
                          value={delivery.recipient_phone || ''}
                          onChange={e => setDelivery({ ...delivery, recipient_phone: e.target.value })}
                          placeholder="Số điện thoại shipper liên hệ khi giao"
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 38px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Địa chỉ nhận hoa */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                      4. Địa chỉ nhận hoa chi tiết <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <HomeOutlined style={{ position: 'absolute', left: '12px', top: '14px', color: '#94A3B8' }} />
                      <input
                        type="text"
                        required
                        value={delivery.delivery_address || ''}
                        onChange={e => setDelivery({ ...delivery, delivery_address: e.target.value })}
                        placeholder="Số nhà, tên tòa nhà/tên đường, Phường, Quận (TP.HCM)..."
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* 5. Phương thức thanh toán */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                      5. Phương thức thanh toán ưu tiên
                    </label>
                    <div style={{ position: 'relative' }}>
                      <DollarCircleOutlined style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
                      <select
                        value={delivery.payment_method || 'Chuyển khoản QR ngân hàng'}
                        onChange={e => setDelivery({ ...delivery, payment_method: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          backgroundColor: '#FFF',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="Chuyển khoản QR ngân hàng">Chuyển khoản QR ngân hàng (Khuyên dùng)</option>
                        <option value="Tiền mặt khi nhận hoa (COD)">Tiền mặt khi nhận hoa (COD)</option>
                        <option value="Thanh toán trực tiếp tại tiệm">Thanh toán trực tiếp tại tiệm</option>
                      </select>
                    </div>
                  </div>

                  {/* 6. Ghi chú giao hàng đặc biệt */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                      6. Ghi chú chung cho Florist & Shipper (Tùy chọn)
                    </label>
                    <textarea
                      rows={2}
                      value={delivery.notes || ''}
                      onChange={e => setDelivery({ ...delivery, notes: e.target.value })}
                      placeholder="Ví dụ: Gọi trước khi giao 15 phút, giao tận tay người nhận..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Cam kết của Nghệ Florist */}
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px dashed #CBD5E1',
                    marginBottom: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <CheckCircleFilled style={{ color: '#5D9EAF', fontSize: '18px' }} />
                    <span style={{ fontSize: '0.86rem', color: '#475569', fontWeight: 500 }}>
                      <strong>Cam kết chất lượng:</strong> Bên em sẽ chụp và gửi ảnh sản phẩm hoàn thiện kèm thiệp/biển qua zalo của anh/chị để duyệt trước khi hoa được giao đi ạ!
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={savingDelivery}
                    style={{
                      padding: '13px 28px',
                      backgroundColor: '#5D9EAF',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(93, 158, 175, 0.25)'
                    }}
                  >
                    <SaveOutlined />
                    {savingDelivery ? 'Đang lưu...' : 'Lưu Thông Tin Nhận Hoa Mặc Định'}
                  </button>
                </form>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 2: TÀI KHOẢN & ĐỔI MẬT KHẨU */}
            {/* ========================================== */}
            {activeTab === 'security' && (
              <div>
                <div style={{ maxWidth: '600px' }}>
                  {/* Profile Info Form */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>
                    1. Cập nhật thông tin tài khoản
                  </h3>
                  <form onSubmit={handleSaveProfile} style={{ marginBottom: '36px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên đầy đủ"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0987654321"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Email đăng nhập (Cố định)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          backgroundColor: '#F1F5F9',
                          color: '#64748B',
                          boxSizing: 'border-box',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      style={{
                        padding: '10px 22px',
                        backgroundColor: '#5D9EAF',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {savingProfile ? 'Đang lưu...' : 'Lưu Thông Tin'}
                    </button>
                  </form>

                  <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '30px 0' }} />

                  {/* Password Change Form */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>
                    2. Đổi mật khẩu đăng nhập
                  </h3>
                  <form onSubmit={handleChangePassword}>
                    {/* Current Password */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Mật khẩu hiện tại <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="Nhập mật khẩu đang dùng"
                          style={{
                            width: '100%',
                            padding: '10px 42px 10px 14px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          tabIndex={-1}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            cursor: 'pointer',
                            fontSize: '15px'
                          }}
                        >
                          {showCurrentPass ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Mật khẩu mới (Tối thiểu 6 ký tự) <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Nhập mật khẩu mới"
                          style={{
                            width: '100%',
                            padding: '10px 42px 10px 14px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          tabIndex={-1}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            cursor: 'pointer',
                            fontSize: '15px'
                          }}
                        >
                          {showNewPass ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Xác nhận mật khẩu mới <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu mới"
                          style={{
                            width: '100%',
                            padding: '10px 42px 10px 14px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          tabIndex={-1}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            cursor: 'pointer',
                            fontSize: '15px'
                          }}
                        >
                          {showConfirmPass ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingPassword}
                      style={{
                        padding: '11px 24px',
                        backgroundColor: '#1E293B',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {savingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 3: LỊCH SỬ YÊU CẦU ĐẶT HOA */}
            {/* ========================================== */}
            {activeTab === 'orders' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>
                  Lịch sử yêu cầu tư vấn & đặt hoa
                </h3>

                {orders.length === 0 ? (
                  <div style={{
                    padding: '48px 20px',
                    textAlign: 'center',
                    backgroundColor: '#FAFCFD',
                    borderRadius: '12px',
                    border: '1px dashed #CBD5E1'
                  }}>
                    <GiftOutlined style={{ fontSize: '36px', color: '#94A3B8', marginBottom: '12px' }} />
                    <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem' }}>
                      Anh/chị chưa có yêu cầu đặt hoa nào.
                    </p>
                    <Link
                      to="/custom-order"
                      style={{
                        marginTop: '16px',
                        display: 'inline-block',
                        padding: '10px 22px',
                        backgroundColor: '#5D9EAF',
                        color: '#FFF',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.88rem',
                        fontWeight: 600
                      }}
                    >
                      Đặt cắm hoa ngay
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {orders.map(item => (
                      <div
                        key={item.id}
                        style={{
                          padding: '18px',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          transition: 'box-shadow 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          {item.sample_img && (
                            <img
                              src={item.sample_img}
                              alt="Ảnh mẫu"
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          )}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 700, color: '#5D9EAF', fontSize: '0.95rem' }}>
                                {item.code}
                              </span>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                backgroundColor: item.status === 'new' ? '#DBEAFE' : item.status === 'closed' ? '#DCFCE7' : '#FEF3C7',
                                color: item.status === 'new' ? '#1E40AF' : item.status === 'closed' ? '#15803D' : '#92400E'
                              }}>
                                {item.status === 'new' ? 'Mới tiếp nhận' : item.status === 'contacted' ? 'Đã liên hệ' : item.status === 'consulting' ? 'Đang tư vấn' : item.status === 'closed' ? 'Hoàn thành' : item.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.88rem', color: '#1E293B', marginTop: '4px', fontWeight: 600 }}>
                              {item.selected_product_name || item.style || (item.type === 'CUSTOM_DESIGN' ? 'Thiết kế hoa theo yêu cầu' : 'Mẫu hoa tư vấn')}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                              Ngày gửi: {new Date(item.created_at).toLocaleDateString('vi-VN')} {item.budget ? `• Ngân sách: ${item.budget}` : ''}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.82rem', color: '#5D9EAF', fontWeight: 600 }}>
                            ✦ Đang được Florist chăm sóc
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
