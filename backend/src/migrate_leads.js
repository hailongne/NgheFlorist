const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runLeadsMigration() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'ngheflorist'
  });

  console.log('Connected to ngheflorist database for leads migration.');

  // 1. Create customer_requests table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS customer_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(30) UNIQUE NOT NULL,
      type ENUM('PRODUCT_SELECTION', 'CUSTOM_DESIGN') NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      zalo VARCHAR(20) NULL,
      selected_product_id INT NULL,
      selected_product_name VARCHAR(255) NULL,
      product_url VARCHAR(500) NULL,
      budget VARCHAR(100) NULL,
      color_tone VARCHAR(100) NULL,
      style VARCHAR(100) NULL,
      recipient VARCHAR(100) NULL,
      requested_date DATE NULL,
      requested_time VARCHAR(50) NULL,
      delivery_area VARCHAR(255) NULL,
      message TEXT NULL,
      notes TEXT NULL,
      status ENUM('new', 'contacted', 'consulting', 'closed', 'cancelled') DEFAULT 'new',
      source VARCHAR(50) DEFAULT 'Website',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_code (code),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. Create customer_request_images table (Private attachments)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS customer_request_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      file_url VARCHAR(500) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      file_size INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_request_id (request_id),
      CONSTRAINT fk_req_images FOREIGN KEY (request_id) REFERENCES customer_requests(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Customer requests tables verified/created successfully.');

  // 3. Seed conversion channel configuration in settings
  const conversionConfig = {
    zalo_url: "https://zalo.me/0987654321",
    fanpage_url: "https://m.me/ngheflorist",
    primary_channel: "zalo",
    primary_cta_text: "Tư vấn qua Zalo",
    secondary_cta_text: "Nhắn Facebook",
    request_message_template: "Nghệ Florist – Yêu cầu tư vấn\n\nMã yêu cầu: {code}\nKhách hàng: {customer_name}\nSĐT: {phone}\nZalo: {zalo}\nLoại yêu cầu: {type_text}\nMẫu hoa: {product_name}\nLink mẫu: {product_url}\nNgân sách: {budget}\nMàu sắc: {color_tone}\nPhong cách: {style}\nNgày cần: {requested_date}\nThời gian: {requested_time}\nKhu vực giao: {delivery_area}\nLời nhắn: {message}\nGhi chú: {notes}"
  };

  await conn.query(`
    INSERT INTO settings (key_name, value_data)
    VALUES ('conversion_config', ?)
    ON DUPLICATE KEY UPDATE value_data = VALUES(value_data)
  `, [JSON.stringify(conversionConfig)]);

  console.log('Conversion config seeded into settings.');

  // Ensure private uploads directory exists
  const leadsDir = path.join(__dirname, '..', 'uploads', 'leads');
  if (!fs.existsSync(leadsDir)) {
    fs.mkdirSync(leadsDir, { recursive: true });
    console.log('Created private uploads/leads directory.');
  }

  await conn.end();
  console.log('Leads migration completed successfully!');
}

runLeadsMigration().catch(err => {
  console.error('Leads migration error:', err);
  process.exit(1);
});
