-- Schema and seed for NgheFlorist (MySQL-compatible)
-- Charset: utf8mb4
-- Import: mysql -u user -p your_db < database/schema_and_seed.sql
-- Optional for Postgres: convert AUTO_INCREMENT to SERIAL and adjust syntax
SET FOREIGN_KEY_CHECKS = 0;

-- Users, Roles, Permissions (authentication & authorization)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) DEFAULT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Addresses for users (shipping/billing)
CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(100) DEFAULT NULL,
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) DEFAULT NULL,
  postal_code VARCHAR(50) DEFAULT NULL,
  country VARCHAR(100) NOT NULL,
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories (hierarchical)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (parent_id),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Suppliers (import sources)
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) DEFAULT NULL,
  contact_email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(100) DEFAULT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'USD',
  is_active TINYINT(1) DEFAULT 1,
  category_id INT DEFAULT NULL,
  supplier_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (category_id),
  INDEX (supplier_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  url VARCHAR(2048) NOT NULL,
  alt_text VARCHAR(255) DEFAULT NULL,
  is_featured TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tags and product_tags
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_tags (
  product_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (product_id, tag_id),
  CONSTRAINT fk_pt_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product variants (size/weight/pack) and stock
CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  sku VARCHAR(100) DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  price DECIMAL(12,2) DEFAULT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inventory audit log
CREATE TABLE IF NOT EXISTS inventory_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_variant_id INT NOT NULL,
  quantity_change INT NOT NULL,
  reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_il_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders and items
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(12,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'USD',
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  shipping_address_id INT DEFAULT NULL,
  billing_address_id INT DEFAULT NULL,
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_ship_addr FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_bill_addr FOREIGN KEY (billing_address_id) REFERENCES addresses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_variant_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR(100) DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255) DEFAULT NULL,
  paid_at TIMESTAMP NULL,
  CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  reviewer_name VARCHAR(255) DEFAULT 'Khách hàng',
  rating TINYINT NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  body TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pages for brand content (About, Policy, etc.)
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

SET FOREIGN_KEY_CHECKS = 1;

-- ===== Seed data (small examples) =====
-- Roles & permissions
INSERT INTO roles (name, description) VALUES
('admin','Administrator with full access'),
('customer','Retail customer')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO permissions (name, description) VALUES
('manage_products','Create/update/delete products'),
('manage_orders','View and update orders'),
('manage_users','Manage user accounts'),
('view_reports','View sales reports')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Map all permissions to admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON r.name = 'admin'
ON DUPLICATE KEY UPDATE role_id = role_id;

-- Suppliers
INSERT INTO suppliers (name, country, contact_email, phone, notes) VALUES
('Holland Roses BV','Netherlands','sales@hollandroses.example','+31-20-000-0000','Premium Dutch roses importer'),
('Golden Kiwi NZ','New Zealand','export@goldenkiwi.example','+64-9-000-0000','Fresh imported fruits from NZ')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Categories (flowers and fruits)
INSERT INTO categories (parent_id, name, slug, description, sort_order) VALUES
(NULL, 'Flowers', 'flowers', 'All flower products', 1),
(1, 'Roses', 'roses', 'Imported and local roses', 1),
(1, 'Bouquets', 'bouquets', 'Curated bouquets and arrangements', 2),
(NULL, 'Imported Fruits', 'imported-fruits', 'Premium imported fruits', 2),
(4, 'Tropical Fruits', 'tropical-fruits', 'Mangoes, pineapples, etc.', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Tags
INSERT INTO tags (name, slug) VALUES
('Imported','imported'),
('Best Seller','best-seller'),
('Gift','gift')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Products
INSERT INTO products (sku, name, slug, description, price, currency, is_active, category_id, supplier_id) VALUES
('R-RED-01','Premium Red Roses (10 stems)','premium-red-roses-10','Imported premium red roses from Netherlands',49.90,'USD',1,2,1),
('B-MIX-01','Mixed Bouquet - Medium','mixed-bouquet-medium','Hand-tied mixed bouquet, seasonal selection',59.00,'USD',1,3,NULL),
('F-FRUIT-01','Assorted Imported Fruit Basket','assorted-imported-fruit-basket','Gift basket with imported kiwi, apples, premium fruits',79.00,'USD',1,4,2),
('F-MANGO-01','Golden Mango Box (5 pcs)','golden-mango-box','Premium imported mangoes, selected size',39.00,'USD',1,5,2)
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price);

-- Product images (example URLs placeholder)
INSERT INTO product_images (product_id, url, alt_text, is_featured, sort_order) VALUES
(1, 'https://cdn.example.com/images/roses_red_10.jpg', 'Premium Red Roses - 10 stems', 1, 1),
(2, 'https://cdn.example.com/images/mixed_bouquet_medium.jpg', 'Mixed Bouquet - Medium', 1, 1),
(3, 'https://cdn.example.com/images/fruit_basket.jpg', 'Assorted Imported Fruit Basket', 1, 1),
(4, 'https://cdn.example.com/images/mango_box.jpg', 'Golden Mango Box', 1, 1)
ON DUPLICATE KEY UPDATE url = VALUES(url);

-- Product tags relations
INSERT INTO product_tags (product_id, tag_id) VALUES
(1, (SELECT id FROM tags WHERE slug='imported')),
(1, (SELECT id FROM tags WHERE slug='best-seller')),
(2, (SELECT id FROM tags WHERE slug='gift')),
(3, (SELECT id FROM tags WHERE slug='imported'))
ON DUPLICATE KEY UPDATE product_id = product_id;

-- Variants and stock
INSERT INTO product_variants (product_id, sku, name, price, stock) VALUES
(1, 'R-RED-01-10', '10 stems', 49.90, 50),
(1, 'R-RED-01-20', '20 stems', 89.00, 20),
(2, 'B-MIX-01-M', 'Medium', 59.00, 30),
(3, 'F-FRUIT-01-B', 'Basket - Standard', 79.00, 15)
ON DUPLICATE KEY UPDATE price = VALUES(price), stock = VALUES(stock);

-- Pages
INSERT INTO pages (title, slug, content, meta_description, is_published) VALUES
('About NgheFlorist','about','<p>NgheFlorist - premium imported flowers and fruits.</p>','About our brand',1),
('Shipping & Returns','shipping-returns','<p>Shipping policy and return information.</p>','Shipping and returns',1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Sample users (admin + customer)
-- NOTE: Replace the password_hash values with secure bcrypt hashes for your environment.
INSERT INTO users (email, password_hash, full_name, phone, is_active) VALUES
('admin@ngheflorist.example','$2y$12$replace_with_real_hash_admin','Nghe Admin','+84-90-000-0000',1),
('jane.customer@example.com','$2y$12$replace_with_real_hash_customer','Jane Customer','+84-90-111-1111',1)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Assign roles to sample users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'admin' WHERE u.email = 'admin@ngheflorist.example'
ON DUPLICATE KEY UPDATE user_id = user_id;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'customer' WHERE u.email = 'jane.customer@example.com'
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Sample address for customer
INSERT INTO addresses (user_id, label, line1, city, country, is_default) 
SELECT u.id, 'Home', '123 Flower St', 'Hanoi', 'Vietnam', 1 FROM users u WHERE u.email = 'jane.customer@example.com'
ON DUPLICATE KEY UPDATE line1 = VALUES(line1);

-- Example order (for development/demo only)
INSERT INTO orders (user_id, status, total_amount, currency, payment_status)
SELECT u.id, 'completed', 129.90, 'USD', 'paid' FROM users u WHERE u.email = 'jane.customer@example.com';

-- If you created an order above, add example items and payment (simple demo flow)
INSERT INTO order_items (order_id, product_variant_id, quantity, unit_price)
SELECT o.id, pv.id, 1, pv.price FROM orders o
JOIN users u ON u.email = 'jane.customer@example.com' AND o.user_id = u.id
JOIN product_variants pv ON pv.product_id = (SELECT id FROM products WHERE slug='assorted-imported-fruit-basket' LIMIT 1)
WHERE o.user_id = u.id LIMIT 1;

INSERT INTO payments (order_id, amount, method, status, transaction_id, paid_at)
SELECT o.id, o.total_amount, 'card', 'completed', 'TXN-DEMO-001', NOW() FROM orders o
JOIN users u ON u.email = 'jane.customer@example.com' AND o.user_id = u.id
WHERE o.user_id = u.id LIMIT 1;

-- Notes:
-- - Replace example image URLs with your real CDN URLs.
-- - Replace the sample password hashes with real bcrypt hashes before using in production.
-- - Adjust currency and prices as needed.
-- - For PostgreSQL: change AUTO_INCREMENT to SERIAL and remove `SET FOREIGN_KEY_CHECKS` lines.
