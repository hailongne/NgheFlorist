const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

async function runAdminCmsMigration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'ngheflorist'
  });

  console.log('Connected to ngheflorist database.');

  // 1. Permissions table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description VARCHAR(255) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. Role permissions table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INT NOT NULL,
      permission_id INT NOT NULL,
      PRIMARY KEY (role_id, permission_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. Settings table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key_name VARCHAR(100) PRIMARY KEY,
      value_data JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. Banners table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255) NULL,
      image_url VARCHAR(500) NOT NULL,
      cta_text VARCHAR(100) NULL,
      cta_url VARCHAR(255) NULL,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5. Menu items table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      label VARCHAR(100) NOT NULL,
      url VARCHAR(255) NOT NULL,
      sort_order INT DEFAULT 0,
      parent_id INT DEFAULT NULL,
      is_active TINYINT(1) DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. Media files table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS media_files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      file_size INT NOT NULL,
      url VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 7. Audit logs table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(100) NOT NULL,
      resource_id VARCHAR(100) NULL,
      details JSON NULL,
      ip_address VARCHAR(45) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Admin CMS tables verified/created successfully.');

  // Seed permissions
  const permissionsList = [
    { name: 'manage_products', description: 'Quản lý sản phẩm, biến thể, hình ảnh' },
    { name: 'manage_categories', description: 'Quản lý danh mục sản phẩm' },
    { name: 'manage_reviews', description: 'Kiểm duyệt đánh giá từ khách hàng' },
    { name: 'manage_cms', description: 'Quản lý nội dung trang chủ, banner, bài viết' },
    { name: 'manage_media', description: 'Upload và quản lý thư viện hình ảnh' },
    { name: 'manage_settings', description: 'Cấu hình thông tin website và hotline' },
    { name: 'manage_users', description: 'Quản lý tài khoản người dùng' },
    { name: 'view_audit_logs', description: 'Xem nhật ký thao tác bảo mật' },
    { name: 'view_reports', description: 'Xem thống kê và báo cáo doanh thu' }
  ];

  for (const perm of permissionsList) {
    await conn.query(`
      INSERT INTO permissions (name, description)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `, [perm.name, perm.description]);
  }

  // Assign all permissions to role 1 (admin)
  const [allPerms] = await conn.query('SELECT id FROM permissions');
  for (const p of allPerms) {
    await conn.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      VALUES (1, ?)
    `, [p.id]);
  }
  console.log(`Assigned ${allPerms.length} permissions to role 1 (admin).`);

  // Seed Admin user
  const adminEmail = 'admin@ngheflorist.vn';
  const plainPass = 'Admin@NgheFlorist2026!';
  const saltRounds = 10;
  const hash = await bcrypt.hash(plainPass, saltRounds);

  // Check if admin user exists
  const [existingUser] = await conn.query('SELECT id FROM users WHERE email = ? OR username = ?', [adminEmail, 'admin']);
  if (existingUser.length > 0) {
    const adminUserId = existingUser[0].id;
    await conn.query(`
      UPDATE users SET 
        email = ?, 
        password_hash = ?, 
        full_name = 'Quản Trị Viên Nghệ Florist',
        is_active = 1
      WHERE id = ?
    `, [adminEmail, hash, adminUserId]);

    await conn.query(`
      INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, 1)
    `, [adminUserId]);
    console.log(`Admin user updated (ID: ${adminUserId}) with email: ${adminEmail}`);
  } else {
    const [createRes] = await conn.query(`
      INSERT INTO users (username, email, password_hash, full_name, phone, is_active)
      VALUES ('admin', ?, ?, 'Quản Trị Viên Nghệ Florist', '0987654321', 1)
    `, [adminEmail, hash]);
    await conn.query(`
      INSERT INTO user_roles (user_id, role_id) VALUES (?, 1)
    `, [createRes.insertId]);
    console.log(`Created new Admin user (ID: ${createRes.insertId}) with email: ${adminEmail}`);
  }

  // Seed Settings
  const settingsData = [
    {
      key: 'homepage_hero',
      val: {
        badge: 'TIỆM HOA THIẾT KẾ NGHỆ FLORIST',
        title: 'Trao gửi yêu thương bằng những đóa hoa thật đẹp',
        subtitle: 'Hoa tươi thiết kế cao cấp theo yêu cầu – Chụp và gửi ảnh duyệt thành phẩm trước khi giao hàng tận nơi.',
        cta_primary_text: 'Xem bộ sưu tập hoa',
        cta_primary_url: '/flowers',
        cta_secondary_text: 'Cắm hoa theo yêu cầu',
        cta_secondary_url: '/custom-order',
        hero_image: ''
      }
    },
    {
      key: 'service_commitments',
      val: [
        { id: 1, icon: 'ThunderboltOutlined', title: 'Giao Hỏa Tốc 2H', desc: 'Giao hoa nhanh chóng, cẩn thận nội thành TP.HCM & Hà Nội' },
        { id: 2, icon: 'FormatPainterOutlined', title: 'Cắm Hoa Theo Yêu Cầu', desc: 'Tùy biến tone màu, loại hoa và ngân sách theo sở thích' },
        { id: 3, icon: 'CameraOutlined', title: 'Gửi Ảnh Duyệt Trước', desc: 'Chụp ảnh thành phẩm gửi khách duyệt trước khi giao đơn' },
        { id: 4, icon: 'SafetyCertificateOutlined', title: 'Uy Tín & Chất Lượng', desc: 'Cam kết đổi trả 100% nếu hoa héo dập hoặc không đúng mẫu' },
        { id: 5, icon: 'CrownOutlined', title: 'Hoa Nhập Khẩu Tuyển Chọn', desc: 'Nguồn hoa tươi nhập khẩu trực tiếp từ Đà Lạt, Hà Lan, Ecuador' }
      ]
    },
    {
      key: 'site_settings',
      val: {
        site_name: 'Nghệ Florist — Tiệm Hoa Tươi Thiết Kế',
        hotline: '0987.654.321',
        email: 'contact@ngheflorist.vn',
        address: '123 Đường Hoa Lan, Phường 2, Quận Phú Nhuận, TP. Hồ Chí Minh',
        business_hours: '07:30 - 21:30 hàng ngày',
        currency: 'VND',
        announcement: 'Miễn phí thiệp chúc mừng & banner cao cấp cho tất cả đơn hàng'
      }
    },
    {
      key: 'footer_config',
      val: {
        brand_desc: 'Nghệ Florist mang đến những tác phẩm hoa tươi nghệ thuật, tinh tế và tràn đầy cảm xúc. Từng đóa hoa được nâng niu tỉ mỉ từ khâu chọn hoa đến khi trao tận tay người nhận.',
        facebook: 'https://facebook.com/ngheflorist',
        instagram: 'https://instagram.com/ngheflorist',
        zalo: 'https://zalo.me/0987654321',
        copyright: '© 2026 Nghệ Florist. Tất cả các quyền được bảo lưu.'
      }
    },
    {
      key: 'custom_design_banner',
      val: {
        badge: 'Dịch vụ độc quyền',
        title: 'Cắm hoa theo yêu cầu & Ngân sách của riêng bạn',
        subtitle: 'Bạn có mẫu hoa ưng ý trên Pinterest hoặc muốn sáng tạo theo tone màu phong thủy? Hãy gửi hình ảnh và yêu cầu, florist của Nghệ Florist sẽ hiện thực hóa tác phẩm hoa gửi bạn kiểm duyệt trước khi giao.',
        image_url: '',
        cta_text: 'Gửi yêu cầu cắm hoa ngay',
        cta_url: '/custom-order'
      }
    }
  ];

  for (const s of settingsData) {
    await conn.query(`
      INSERT IGNORE INTO settings (key_name, value_data)
      VALUES (?, ?)
    `, [s.key, JSON.stringify(s.val)]);
  }
  console.log('Default settings seeded (existing settings preserved).');

  // Seed Menu items
  const menuItems = [
    { label: 'Trang chủ', url: '/', sort_order: 1 },
    { label: 'Tất cả hoa', url: '/flowers', sort_order: 2 },
    { label: 'Bó hoa tươi', url: '/category/bo-hoa-tuoi', sort_order: 3 },
    { label: 'Giỏ hoa tươi', url: '/category/gio-hoa-tuoi', sort_order: 4 },
    { label: 'Lan hồ điệp', url: '/category/lan-ho-diep', sort_order: 5 },
    { label: 'Cắm hoa theo yêu cầu', url: '/custom-order', sort_order: 6 },
    { label: 'Tra cứu đơn', url: '/order-tracking', sort_order: 7 },
    { label: 'Về chúng tôi', url: '/about', sort_order: 8 }
  ];

  const [existingMenu] = await conn.query('SELECT COUNT(*) as count FROM menu_items');
  if (existingMenu[0].count === 0) {
    for (const m of menuItems) {
      await conn.query(`
        INSERT INTO menu_items (label, url, sort_order, is_active)
        VALUES (?, ?, ?, 1)
      `, [m.label, m.url, m.sort_order]);
    }
    console.log(`Seeded ${menuItems.length} menu items.`);
  }

  // Seed initial banners
  const [existingBanners] = await conn.query('SELECT COUNT(*) as count FROM banners');
  if (existingBanners[0].count === 0) {
    const defaultBanners = [
      {
        title: 'Mùa Yêu Thương — Trao Gửi Ngọt Ngào',
        subtitle: 'BST Hoa hồng Ecuador & Baby Hà Lan thiết kế tinh xảo',
        image_url: '',
        cta_text: 'Khám phá ngay',
        cta_url: '/flowers?tag=romantic',
        sort_order: 1
      },
      {
        title: 'Khai Trương Hồng Phát — Kệ Hoa Sang Trọng',
        subtitle: 'Tone vàng tài lộc, đỏ may mắn và pastel thanh lịch',
        image_url: '',
        cta_text: 'Xem hoa chúc mừng',
        cta_url: '/flowers?tag=opening',
        sort_order: 2
      }
    ];
    for (const b of defaultBanners) {
      await conn.query(`
        INSERT INTO banners (title, subtitle, image_url, cta_text, cta_url, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `, [b.title, b.subtitle, b.image_url, b.cta_text, b.cta_url, b.sort_order]);
    }
    console.log('Seeded default banners.');
  }

  // Also ensure `policy` page exists in `pages`
  await conn.query(`
    INSERT INTO pages (title, slug, content, meta_description, is_published)
    VALUES 
    (
      'Chính Sách Giao Hàng & Đổi Trả', 
      'policy', 
      '<h2>1. Cam kết chất lượng hoa</h2><p>Nghệ Florist cam kết sử dụng 100% hoa tươi loại 1. Trước khi giao hàng, chúng tôi luôn chụp ảnh thành phẩm thực tế gửi quý khách duyệt qua Zalo hoặc website.</p><h2>2. Chính sách đổi trả & hoàn tiền</h2><p>Nếu hoa giao đến không đúng mẫu đã duyệt, hoa bị héo úa hoặc hư hỏng do vận chuyển, Nghệ Florist cam kết đổi sản phẩm mới trong vòng 2 giờ hoặc hoàn tiền 100%.</p><h2>3. Thời gian giao hàng</h2><p>Giao hàng hỏa tốc trong 2 giờ nội thành TP.HCM và Hà Nội. Quý khách có thể lựa chọn khung giờ nhận hoa chính xác trong ngày.</p>', 
      'Chính sách giao nhận, bảo hành và cam kết chất lượng của Nghệ Florist',
      1
    )
    ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content);
  `);
  console.log('Seeded policy page.');

  await conn.end();
  console.log('Admin CMS migration completed successfully!');
}

runAdminCmsMigration().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
