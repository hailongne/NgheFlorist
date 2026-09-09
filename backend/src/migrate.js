const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

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
    -- 1. Product Variants
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

    -- 2. Reviews
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

    -- 3. Pages
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
  `;

  await connection.query(ddl);
  console.log('Tables created successfully or already exist.');

  // Link products with variants and reviews if not yet linked
  const [prods] = await connection.query('SELECT id, price, category_id, name FROM products');
  console.log('Enriching', prods.length, 'products with variants and reviews...');

  for (let i = 0; i < prods.length; i++) {
    const p = prods[i];
    const [existingVars] = await connection.query('SELECT id FROM product_variants WHERE product_id = ?', [p.id]);
    if (existingVars.length === 0) {
      const basePrice = Number(p.price) || 350000;
      await connection.query(`
        INSERT INTO product_variants (product_id, sku, name, price, stock) VALUES
        (?, ?, 'Tiêu chuẩn', ?, 25),
        (?, ?, 'Bó lớn (+20% hoa)', ?, 15),
        (?, ?, 'Hộp quà cao cấp', ?, 10)
      `, [
        p.id, `SKU-${p.id}-STD`, basePrice,
        p.id, `SKU-${p.id}-LRG`, Math.round(basePrice * 1.3),
        p.id, `SKU-${p.id}-VIP`, Math.round(basePrice * 1.6)
      ]);
    }

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
