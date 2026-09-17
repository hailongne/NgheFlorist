import React, { useState } from 'react';
import { Link, NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import {
  DashboardOutlined,
  ShopOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  CameraOutlined,
  StarOutlined,
  LayoutOutlined,
  PictureOutlined,
  MenuOutlined,
  FileTextOutlined,
  FileImageOutlined,
  SettingOutlined,
  HistoryOutlined,
  LogoutOutlined,
  ExportOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  CloseOutlined
} from '@ant-design/icons';
import './admin.css';

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#5D9EAF', fontWeight: 600 }}>Đang kiểm tra quyền truy cập hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role_name !== 'admin' || user?.email !== 'admin@ngheflorist.vn') {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && <div className="admin-mobile-backdrop" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src="/images/logoNgheFlorist-brand-blue.png?v=2" alt="Nghệ Florist" style={{ height: '38px', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
          </Link>
          <button
            className="admin-sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng menu"
            title="Đóng menu"
          >
            <CloseOutlined />
          </button>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-group-title">Trung Tâm Lead & Tư Vấn</div>
          <NavLink
            to="/admin/requests"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <MessageOutlined className="nav-icon" />
            <span>Yêu Cầu Khách Hàng</span>
          </NavLink>

          <NavLink
            to="/admin/contact-widgets"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <MessageOutlined className="nav-icon" />
            <span>Quản Lý Nút Tư Vấn</span>
          </NavLink>

          <div className="admin-nav-group-title">Bộ Sưu Tập Hoa</div>
          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <ShopOutlined className="nav-icon" />
            <span>Sản Phẩm</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <AppstoreOutlined className="nav-icon" />
            <span>Danh Mục Hoa</span>
          </NavLink>



          <div className="admin-nav-group-title">Quản Trị CMS & Giao Diện</div>
          <NavLink
            to="/admin/homepage"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <LayoutOutlined className="nav-icon" />
            <span>Trang Chủ & Cam Kết</span>
          </NavLink>

          <NavLink
            to="/admin/banners"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <PictureOutlined className="nav-icon" />
            <span>Banners Quảng Cáo</span>
          </NavLink>

          <NavLink
            to="/admin/navigation"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <FileTextOutlined className="nav-icon" />
            <span>Chân Trang (Footer)</span>
          </NavLink>

          <NavLink
            to="/admin/pages"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <FileTextOutlined className="nav-icon" />
            <span>Trang Chính Sách</span>
          </NavLink>

          <div className="admin-nav-group-title">Hệ Thống</div>
          <NavLink
            to="/admin/media"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <FileImageOutlined className="nav-icon" />
            <span>Thư Viện Media</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <SettingOutlined className="nav-icon" />
            <span>Cài Đặt Website</span>
          </NavLink>

          <NavLink
            to="/admin/audit-logs"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <HistoryOutlined className="nav-icon" />
            <span>Nhật Ký Thao Tác</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-btn admin-btn-outline admin-mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              title="Menu"
            >
              {mobileOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </button>
            <span className="admin-topbar-title">Nghệ Florist Admin</span>
            <span className="admin-topbar-subtitle">
              — Hệ thống Quản trị Digital Showroom
            </span>
          </div>

          <div className="admin-topbar-right">
            <Link to="/" target="_blank" className="admin-btn admin-btn-outline admin-header-action-btn" title="Xem Cửa Hàng">
              <ExportOutlined style={{ fontSize: 16 }} />
              <span className="admin-btn-text">Xem Cửa Hàng</span>
            </Link>

            <div className="admin-user-pill">
              <div className="admin-user-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="admin-user-info">
                <div className="admin-user-name">{user?.full_name || user?.username}</div>
                <div className="admin-user-role">{user?.role_name}</div>
              </div>
            </div>

            <button onClick={handleLogout} className="admin-btn admin-btn-outline admin-header-action-btn" title="Đăng xuất">
              <LogoutOutlined style={{ fontSize: 16 }} />
              <span className="admin-btn-text">Thoát</span>
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
