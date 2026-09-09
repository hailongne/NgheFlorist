const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'ngheflorist',
    multipleStatements: true
  });

  console.log('Connected to MySQL database:', process.env.DB_NAME || 'ngheflorist');

  const ddl = `
    -- 1. Suppliers
    CREATE TABLE IF NOT EXISTS suppliers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      country VARCHAR(100) DEFAULT NULL,
      contact_email VARCHAR(255) DEFAULT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 2. Tags
    CREATE TABLE IF NOT EXISTS tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 3. Product Tags
    CREATE TABLE IF NOT EXISTS product_tags (
      product_id INT NOT NULL,
      tag_id INT NOT NULL,
      PRIMARY KEY (product_id, tag_id),
      INDEX idx_pt_tag (tag_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 4. Product Variants
    CREATE TABLE IF NOT EXISTS product_variants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      sku VARCHAR(100) DEFAULT NULL,
      name VARCHAR(255) DEFAULT NULL,
      price DECIMAL(12,2) DEFAULT NULL,
      stock INT DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_pv_prod (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 5. Inventory Logs
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_variant_id INT NOT NULL,
      quantity_change INT NOT NULL,
      reason VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 6. Orders
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_code VARCHAR(32) UNIQUE,
      user_id INT DEFAULT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      customer_email VARCHAR(255) DEFAULT NULL,
      recipient_name VARCHAR(255) NOT NULL,
      recipient_phone VARCHAR(50) NOT NULL,
      recipient_address TEXT NOT NULL,
      delivery_date DATE NULL,
      delivery_time_slot VARCHAR(50) NULL,
      card_message TEXT NULL,
      is_anonymous TINYINT(1) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      total_amount DECIMAL(12,2) DEFAULT 0.00,
      currency VARCHAR(10) DEFAULT 'VND',
      payment_method VARCHAR(50) DEFAULT 'cod',
      payment_status VARCHAR(50) DEFAULT 'unpaid',
      placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 7. Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_variant_id INT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      INDEX idx_oi_order (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 8. Payments
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      method VARCHAR(100) DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      transaction_id VARCHAR(255) DEFAULT NULL,
      paid_at TIMESTAMP NULL,
      INDEX idx_pay_order (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 9. Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      user_id INT DEFAULT NULL,
      reviewer_name VARCHAR(255) NOT NULL,
      rating TINYINT NOT NULL,
      title VARCHAR(255) DEFAULT NULL,
      body TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_rev_product (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 10. Pages
    CREATE TABLE IF NOT EXISTS pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      content LONGTEXT DEFAULT NULL,
      meta_description VARCHAR(512) DEFAULT NULL,
      is_published TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 11. Custom Orders
    CREATE TABLE IF NOT EXISTS custom_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_code VARCHAR(32) UNIQUE,
      budget VARCHAR(50) NOT NULL,
      tone VARCHAR(100) NOT NULL,
      occasion VARCHAR(100) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      customer_email VARCHAR(255) DEFAULT NULL,
      card_message TEXT NULL,
      notes TEXT NULL,
      sample_image_url VARCHAR(2048) DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 12. Order Proofs
    CREATE TABLE IF NOT EXISTS order_proofs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      image_url VARCHAR(2048) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending_review',
      customer_note TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP NULL,
      INDEX idx_proof_order (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await connection.query(ddl);
  console.log('Tables created successfully or already exist.');

  // Populate Suppliers
  await connection.query(`
    INSERT INTO suppliers (id, name, country, contact_email, phone, notes) VALUES
    (1, 'Đà Lạt Hasfarm', 'Việt Nam', 'contact@dalathasfarm.vn', '+84-263-3824947', 'Nhà cung cấp hoa tươi cao cấp Đà Lạt'),
    (2, 'Holland Roses BV', 'Hà Lan', 'sales@hollandroses.example', '+31-20-000-0000', 'Hoa hồng và hoa củ nhập khẩu Hà Lan cao cấp'),
    (3, 'Golden Kiwi NZ', 'New Zealand', 'export@goldenkiwi.example', '+64-9-000-0000', 'Trái cây và hoa quả ôn đới New Zealand'),
    (4, 'Ecuador Rose Garden', 'Ecuador', 'info@ecuadorrose.example', '+593-2-000-0000', 'Hoa hồng khổng lồ Ecuador sang trọng')
    ON DUPLICATE KEY UPDATE name = VALUES(name), country = VALUES(country);
  `);
  console.log('Suppliers populated.');

  // Populate Tags
  await connection.query(`
    INSERT INTO tags (name, slug) VALUES
    ('Bán Chạy', 'best-seller'),
    ('Nhập Khẩu', 'imported'),
    ('Quà Tặng', 'gift'),
    ('Tone Pastel', 'pastel'),
    ('Lãng Mạn', 'romantic'),
    ('Hoa Cưới', 'wedding'),
    ('Khai Trương', 'opening'),
    ('Cao Cấp', 'luxury'),
    ('Chia Buồn', 'sympathy')
    ON DUPLICATE KEY UPDATE name = VALUES(name);
  `);
  console.log('Tags populated.');

  // Link products with suppliers and tags and variants if not yet linked
  const [prods] = await connection.query('SELECT id, price, category_id, name FROM products');
  console.log('Enriching', prods.length, 'products with suppliers, tags, and variants...');

  // Get tag IDs
  const [tagRows] = await connection.query('SELECT id, slug FROM tags');
  const tagMap = {};
  tagRows.forEach(t => { tagMap[t.slug] = t.id; });

  for (let i = 0; i < prods.length; i++) {
    const p = prods[i];
    const supplierId = (p.id % 4) + 1; // distribute among 4 suppliers
    await connection.query('UPDATE products SET supplier_id = ? WHERE id = ? AND (supplier_id IS NULL OR supplier_id = 0)', [supplierId, p.id]);

    // Add tags
    const pTags = [];
    if (p.id % 3 === 0) pTags.push(tagMap['best-seller']);
    if (supplierId > 1) pTags.push(tagMap['imported']);
    if (p.name.includes('cưới') || p.category_id <= 6) pTags.push(tagMap['wedding']);
    if (p.name.includes('khai trương') || (p.category_id >= 20 && p.category_id <= 24)) pTags.push(tagMap['opening']);
    if (p.name.includes('viếng') || p.category_id === 35) pTags.push(tagMap['sympathy']);
    if (p.name.includes('pastel') || p.id % 4 === 0) pTags.push(tagMap['pastel']);
    pTags.push(tagMap['gift']);

    for (const tid of pTags) {
      if (tid) {
        await connection.query('INSERT IGNORE INTO product_tags (product_id, tag_id) VALUES (?, ?)', [p.id, tid]);
      }
    }

    // Add default variants if none exist
    const [existingVars] = await connection.query('SELECT id FROM product_variants WHERE product_id = ?', [p.id]);
    if (existingVars.length === 0) {
      const basePrice = Number(p.price);
      await connection.query(`
        INSERT INTO product_variants (product_id, sku, name, price, stock) VALUES
        (?, ?, 'Kích thước tiêu chuẩn', ?, 25),
        (?, ?, 'Kích thước lớn (+20% hoa)', ?, 15),
        (?, ?, 'Phiên bản đặc biệt & Hộp quà', ?, 10)
      `, [
        p.id, `SKU-${p.id}-STD`, basePrice,
        p.id, `SKU-${p.id}-LRG`, basePrice * 1.3,
        p.id, `SKU-${p.id}-VIP`, basePrice * 1.6
      ]);
    }

    // Add sample review for some products
    if (p.id <= 15) {
      const [existingRev] = await connection.query('SELECT id FROM reviews WHERE product_id = ?', [p.id]);
      if (existingRev.length === 0) {
        await connection.query(`
          INSERT INTO reviews (product_id, reviewer_name, rating, title, body) VALUES
          (?, 'Trần Minh Hằng', 5, 'Hoa tươi rất lâu và thiết kế đẹp!', 'Shop gửi ảnh trước khi giao đúng như cam kết, hoa nhận y hệt ảnh, bạn mình rất thích.'),
          (?, 'Nguyễn Hải Nam', 5, 'Dịch vụ chu đáo, giao nhanh', 'Hoa cắm rất tinh tế, phối màu pastel sang trọng, shipper giao đúng giờ hẹn.')
        `, [p.id, p.id]);
      }
    }
  }

  // Populate Pages
  await connection.query(`
    INSERT INTO pages (title, slug, content, meta_description, is_published) VALUES
    ('Về Nghệ Florist', 'about', '<p>Nghệ Florist mang sứ mệnh trao gửi cảm xúc chân thành qua từng đóa hoa tươi nhập khẩu và thiết kế thủ công tinh tế.</p>', 'Giới thiệu thương hiệu Nghệ Florist', 1),
    ('Chính sách giao hàng & Đổi trả', 'shipping-returns', '<p>Chúng tôi cam kết gửi ảnh thành phẩm cho quý khách duyệt trước khi giao. Nếu hoa không đạt yêu cầu, chúng tôi sẽ chỉnh sửa hoặc hoàn tiền.</p>', 'Chính sách giao hoa và đổi trả', 1)
    ON DUPLICATE KEY UPDATE title = VALUES(title);
  `);
  console.log('Pages populated.');

  console.log('Migration and enrichment completed successfully!');
  await connection.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
