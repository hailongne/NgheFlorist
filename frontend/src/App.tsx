import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomerRequestModal from './components/CustomerRequestModal';
import QuickContactWidget from './components/QuickContactWidget';
import { RequestProvider } from './context/RequestContext';
import { AdminAuthProvider } from './admin/AdminAuthContext';

// Storefront Pages
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CustomOrderPage from './pages/CustomOrderPage';
import AboutPage from './pages/AboutPage';
import PolicyPage from './pages/PolicyPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

// Admin Pages
import AdminLayout from './admin/AdminLayout';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminCustomerRequestsPage from './admin/pages/AdminCustomerRequestsPage';
import AdminProductsPage from './admin/pages/AdminProductsPage';
import AdminCategoriesPage from './admin/pages/AdminCategoriesPage';
import AdminHomepageCmsPage from './admin/pages/AdminHomepageCmsPage';
import AdminBannersPage from './admin/pages/AdminBannersPage';
import AdminNavigationCmsPage from './admin/pages/AdminNavigationCmsPage';
import AdminPagesCmsPage from './admin/pages/AdminPagesCmsPage';
import AdminMediaPage from './admin/pages/AdminMediaPage';
import AdminSettingsPage from './admin/pages/AdminSettingsPage';
import AdminAuditLogsPage from './admin/pages/AdminAuditLogsPage';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

export default function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <SiteSettingsProvider>
          <RequestProvider>
          <Routes>
            {/* Admin Login (Isolated without Storefront Header/Footer) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Routes - Primary Entry: Yêu Cầu Khách Hàng */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="requests" replace />} />
              <Route path="requests" element={<AdminCustomerRequestsPage />} />
              <Route path="dashboard" element={<Navigate to="/admin/requests" replace />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/category/:id" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="homepage" element={<AdminHomepageCmsPage />} />
              <Route path="banners" element={<AdminBannersPage />} />
              <Route path="navigation" element={<AdminNavigationCmsPage />} />
              <Route path="menu" element={<AdminNavigationCmsPage />} />
              <Route path="footer" element={<AdminNavigationCmsPage />} />
              <Route path="pages" element={<AdminPagesCmsPage />} />
              <Route path="media" element={<AdminMediaPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="*" element={<Navigate to="/admin/requests" replace />} />
            </Route>

            {/* Public Storefront Routes with Header, Footer & Global Lead Modal */}
            <Route
              path="*"
              element={
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Header />
                  <CustomerRequestModal />
                  <QuickContactWidget />
                  <div style={{ flexGrow: 1 }}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductListingPage />} />
                      <Route path="/flowers" element={<ProductListingPage />} />
                      <Route path="/category/:slug" element={<ProductListingPage />} />
                      <Route path="/product/:slug" element={<ProductDetailPage />} />
                      <Route path="/custom-order" element={<CustomOrderPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/policy" element={<PolicyPage />} />
                      <Route path="/shipping-returns" element={<PolicyPage />} />

                      {/* Redirect deprecated e-commerce URLs to storefront showcase */}
                      <Route path="/cart" element={<Navigate to="/flowers" replace />} />
                      <Route path="/checkout" element={<Navigate to="/custom-order" replace />} />
                      <Route path="/order-tracking" element={<Navigate to="/flowers" replace />} />
                      <Route path="/track-order" element={<Navigate to="/flowers" replace />} />
                      <Route path="/login" element={<CustomerLoginPage />} />
                      <Route path="/register" element={<CustomerRegisterPage />} />
                      <Route path="/profile" element={<CustomerProfilePage />} />
                      <Route path="/account" element={<CustomerProfilePage />} />

                      <Route path="*" element={<ProductListingPage />} />
                    </Routes>
                  </div>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </RequestProvider>
        </SiteSettingsProvider>
      </AdminAuthProvider>
    </Router>
  );
}
