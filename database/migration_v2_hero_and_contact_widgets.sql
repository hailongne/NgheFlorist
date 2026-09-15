-- ==========================================================
-- MIGRATION: CONTACT WIDGETS & MULTI-DEVICE HERO BANNER
-- ==========================================================

-- 1. Create table contact_widgets
CREATE TABLE IF NOT EXISTS contact_widgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform_type ENUM('zalo', 'facebook', 'instagram', 'phone') NOT NULL DEFAULT 'zalo',
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NULL,
  action_link VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cw_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Seed 3 default contact widgets
INSERT INTO contact_widgets (id, platform_type, title, subtitle, action_link, sort_order, is_active)
VALUES 
  (1, 'zalo', 'Chat Zalo 1: 0862 926 866', 'Tư vấn mẫu hoa & Báo giá nhanh', 'https://zalo.me/0862926866', 1, 1),
  (2, 'zalo', 'Chat Zalo 2: 0329 806 866', 'Gửi ảnh duyệt hoa thực tế trước khi giao', 'https://zalo.me/0329806866', 2, 1),
  (3, 'phone', 'Hotline Gọi Nhanh: 0862 926 866', 'Hỗ trợ đặt hoa hỏa tốc 24/7', 'tel:0862926866', 3, 1)
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  subtitle = VALUES(subtitle),
  action_link = VALUES(action_link),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active);

-- 3. Update homepage_hero in settings table to support desktop, tablet, and mobile
INSERT INTO settings (key_name, value_data)
VALUES (
  'homepage_hero',
  JSON_OBJECT(
    'desktop', JSON_OBJECT(
      'badge', '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
      'title', 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
      'subtitle', 'Hoa tươi thiết kế cao cấp theo yêu cầu – Chụp và gửi ảnh duyệt thành phẩm trước khi giao hàng tận nơi.',
      'cta_primary_text', 'Xem bộ sưu tập hoa',
      'cta_primary_url', '/flowers',
      'cta_secondary_text', 'Cắm hoa theo yêu cầu',
      'cta_secondary_url', '/custom-order',
      'hero_image', ''
    ),
    'tablet', JSON_OBJECT(
      'badge', '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
      'title', 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
      'subtitle', 'Hoa tươi thiết kế cao cấp theo yêu cầu – Chụp ảnh duyệt trước khi giao.',
      'cta_primary_text', 'Xem bộ sưu tập hoa',
      'cta_primary_url', '/flowers',
      'cta_secondary_text', 'Cắm hoa theo yêu cầu',
      'cta_secondary_url', '/custom-order',
      'hero_image', ''
    ),
    'mobile', JSON_OBJECT(
      'badge', '✦ NGHỆ FLORIST SHOWROOM',
      'title', 'Hoa Tươi Thiết Kế Theo Yêu Cầu',
      'subtitle', 'Gửi ảnh thành phẩm thực tế duyệt trước khi giao tận nơi.',
      'cta_primary_text', 'Xem mẫu hoa',
      'cta_primary_url', '/flowers',
      'cta_secondary_text', 'Cắm theo yêu cầu',
      'cta_secondary_url', '/custom-order',
      'hero_image', ''
    ),
    'badge', '✦ TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
    'title', 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
    'subtitle', 'Hoa tươi thiết kế cao cấp theo yêu cầu – Chụp và gửi ảnh duyệt thành phẩm trước khi giao hàng tận nơi.',
    'cta_primary_text', 'Xem bộ sưu tập hoa',
    'cta_primary_url', '/flowers',
    'cta_secondary_text', 'Cắm hoa theo yêu cầu',
    'cta_secondary_url', '/custom-order',
    'hero_image', ''
  )
)
ON DUPLICATE KEY UPDATE value_data = VALUES(value_data);
