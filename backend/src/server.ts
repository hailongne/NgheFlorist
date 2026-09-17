import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from './db';
import { helmetMiddleware, corsMiddleware } from './middleware/security';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import customerRequestRoutes from './routes/customerRequestRoutes';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:3000';

// Apply security headers via Helmet
app.use(helmetMiddleware);

// Apply CORS policy
app.use(corsMiddleware);

// JSON body parser
app.use(bodyParser.json());

// Explicitly disable X-Powered-By
app.disable('x-powered-by');

// Serve uploads statically with proper headers
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Fallback for missing uploaded files: serve official logo instead of 404
app.use('/uploads', (_req: Request, res: Response) => {
  const fallbackLogo = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'logoNgheFlorist.PNG');
  if (fs.existsSync(fallbackLogo)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(fallbackLogo);
  }
  res.status(404).json({ error: 'File not found' });
});

// ==========================================
// SEO: ROBOTS.TXT & SITEMAP.XML
// ==========================================
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /cart
Disallow: /checkout

Sitemap: ${PUBLIC_SITE_URL}/sitemap.xml
`);
});

app.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const [products] = await pool.query<RowDataPacket[]>(`
      SELECT slug, updated_at FROM products WHERE is_active = 1 ORDER BY id DESC
    `);
    const [categories] = await pool.query<RowDataPacket[]>(`
      SELECT slug FROM categories ORDER BY id ASC
    `);
    const [pages] = await pool.query<RowDataPacket[]>(`
      SELECT slug FROM pages WHERE is_published = 1
    `);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static core pages
    const coreRoutes = ['', '/flowers', '/custom-order', '/about', '/policy'];
    for (const route of coreRoutes) {
      xml += `  <url>\n    <loc>${PUBLIC_SITE_URL}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    }

    // Categories
    for (const c of categories) {
      xml += `  <url>\n    <loc>${PUBLIC_SITE_URL}/category/${c.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Products
    for (const p of products) {
      xml += `  <url>\n    <loc>${PUBLIC_SITE_URL}/product/${p.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    }

    // Pages
    for (const pg of pages) {
      xml += `  <url>\n    <loc>${PUBLIC_SITE_URL}/${pg.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'NgheFlorist API',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// PUBLIC STOREFRONT CONTENT API (CMS DRIVEN)
// ==========================================
app.get('/api/content/homepage', async (_req: Request, res: Response) => {
  try {
    const [heroRows] = await pool.query<RowDataPacket[]>(`
      SELECT value_data FROM settings WHERE key_name = 'homepage_hero'
    `);
    const [collectionRows] = await pool.query<RowDataPacket[]>(`
      SELECT value_data FROM settings WHERE key_name = 'showroom_collections'
    `);
    const [commitRows] = await pool.query<RowDataPacket[]>(`
      SELECT value_data FROM settings WHERE key_name = 'service_commitments'
    `);
    const [customDesignRows] = await pool.query<RowDataPacket[]>(`
      SELECT value_data FROM settings WHERE key_name = 'custom_design_banner'
    `);
    const [banners] = await pool.query<RowDataPacket[]>(`
      SELECT id, title, subtitle, image_url, cta_text, cta_url 
      FROM banners 
      WHERE is_active = 1 
      ORDER BY sort_order ASC
    `);

    res.json({
      hero: heroRows.length > 0 ? (typeof heroRows[0].value_data === 'string' ? JSON.parse(heroRows[0].value_data) : heroRows[0].value_data) : null,
      collections: collectionRows.length > 0 ? (typeof collectionRows[0].value_data === 'string' ? JSON.parse(collectionRows[0].value_data) : collectionRows[0].value_data) : null,
      commitments: commitRows.length > 0 ? (typeof commitRows[0].value_data === 'string' ? JSON.parse(commitRows[0].value_data) : commitRows[0].value_data) : [],
      customDesign: customDesignRows.length > 0 ? (typeof customDesignRows[0].value_data === 'string' ? JSON.parse(customDesignRows[0].value_data) : customDesignRows[0].value_data) : null,
      banners
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải nội dung trang chủ' });
  }
});

app.get('/api/content/menu', async (_req: Request, res: Response) => {
  try {
    const [items] = await pool.query<RowDataPacket[]>(`
      SELECT id, label, url, icon, sort_order 
      FROM menu_items 
      WHERE is_active = 1 
      ORDER BY sort_order ASC
    `);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải menu điều hướng' });
  }
});

app.get('/api/content/settings', async (_req: Request, res: Response) => {
  try {
    const [siteRows] = await pool.query<RowDataPacket[]>("SELECT value_data FROM settings WHERE key_name = 'site_settings'");
    const [footerRows] = await pool.query<RowDataPacket[]>("SELECT value_data FROM settings WHERE key_name = 'footer_config'");
    const [convRows] = await pool.query<RowDataPacket[]>("SELECT value_data FROM settings WHERE key_name = 'conversion_config'");

    res.json({
      siteSettings: siteRows.length > 0 ? (typeof siteRows[0].value_data === 'string' ? JSON.parse(siteRows[0].value_data) : siteRows[0].value_data) : {},
      footerConfig: footerRows.length > 0 ? (typeof footerRows[0].value_data === 'string' ? JSON.parse(footerRows[0].value_data) : footerRows[0].value_data) : {},
      conversionConfig: convRows.length > 0 ? (typeof convRows[0].value_data === 'string' ? JSON.parse(convRows[0].value_data) : convRows[0].value_data) : {}
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải cấu hình website' });
  }
});

// Public Contact Widgets API for Storefront popup
app.get('/api/contact-widgets', async (_req: Request, res: Response) => {
  try {
    const [widgets] = await pool.query<RowDataPacket[]>(`
      SELECT id, platform_type, title, subtitle, action_link, sort_order, is_active
      FROM contact_widgets
      WHERE is_active = 1
      ORDER BY sort_order ASC, id ASC
    `);
    res.json(widgets);
  } catch (err: any) {
    console.error('Error fetching contact widgets:', err);
    res.status(500).json({ error: 'Lỗi tải danh sách nút tư vấn' });
  }
});

// ==========================================
// PUBLIC STOREFRONT PRODUCT & CATALOG APIS
// ==========================================

// Categories (Only active categories and active parent hierarchy)
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT c.id, c.parent_id, c.name, c.slug, c.description, c.sort_order, c.is_active,
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN categories parent ON parent.id = c.parent_id
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
      WHERE c.is_active = 1 AND (c.parent_id IS NULL OR parent.is_active = 1)
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `);

    const categoryMap = new Map<number, any>();
    const tree: any[] = [];

    rows.forEach(r => {
      categoryMap.set(r.id, {
        ...r,
        product_count: Number(r.product_count),
        children: []
      });
    });

    rows.forEach(r => {
      const item = categoryMap.get(r.id);
      if (r.parent_id && categoryMap.has(r.parent_id)) {
        const parent = categoryMap.get(r.parent_id);
        parent.children.push(item);
        parent.product_count += item.product_count;
      } else if (!r.parent_id) {
        tree.push(item);
      }
    });

    res.json({
      categories: rows,
      tree
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Lỗi truy vấn danh mục' });
  }
});

// Products Listing with multi-filter, search, sort, pagination
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStockOnly,
      sort,
      page = '1',
      limit = '16'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(60, Math.max(1, parseInt(limit as string, 10) || 16));
    const offset = (pageNum - 1) * limitNum;

    const whereClauses: string[] = ['p.is_active = 1'];
    const queryParams: any[] = [];

    // Search query
    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      whereClauses.push('(p.name LIKE ? OR p.description LIKE ? OR p.slug LIKE ?)');
      queryParams.push(term, term, term);
    }

    // Category filter (includes sub-categories if category is a parent)
    if (category && typeof category === 'string' && category.trim() !== '') {
      whereClauses.push('(c.slug = ? OR c.id = ? OR c.parent_id IN (SELECT id FROM categories WHERE slug = ? OR id = ?))');
      queryParams.push(category.trim(), category.trim(), category.trim(), category.trim());
    }

    // Price range filter
    if (minPrice && !isNaN(Number(minPrice))) {
      whereClauses.push('p.price >= ?');
      queryParams.push(Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      whereClauses.push('p.price <= ?');
      queryParams.push(Number(maxPrice));
    }


    // Sort order
    let orderBy = 'p.id DESC';
    switch (sort) {
      case 'price_asc':
        orderBy = 'p.price ASC';
        break;
      case 'price_desc':
        orderBy = 'p.price DESC';
        break;
      case 'name_asc':
        orderBy = 'p.name ASC';
        break;
      case 'name_desc':
        orderBy = 'p.name DESC';
        break;
      case 'oldest':
        orderBy = 'p.id ASC';
        break;
      default:
        orderBy = 'p.id DESC';
        break;
    }

    const whereSql = whereClauses.join(' AND ');

    // Total count
    const [countRows] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
            WHERE ${whereSql}
    `, queryParams);

    const total = countRows[0].total;

    // Fetch products
    const [products] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.id, p.category_id, p.name, p.slug, p.description,
        p.price, p.currency, p.is_active, p.created_at,
        c.name as category_name, c.slug as category_slug,
                (
          SELECT url FROM product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.is_featured DESC, pi.sort_order ASC LIMIT 1
        ) as featured_image
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
            WHERE ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [...queryParams, limitNum, offset]);

    res.json({
      products: products.map(p => ({
        ...p,
        price: Number(p.price),
        image_url: p.featured_image || null,
        featured_image: p.featured_image || null
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Error in /api/products:', err);
    res.status(500).json({ error: 'Lỗi tải danh sách sản phẩm' });
  }
});

// Product detail by slug or id
app.get('/api/products/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const isNumeric = /^\d+$/.test(slugOrId);

    const condition = isNumeric ? 'p.id = ?' : 'p.slug = ?';
    const param = isNumeric ? Number(slugOrId) : slugOrId;

    const [products] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.id, p.category_id, p.name, p.slug, p.description,
        p.price, p.currency, p.is_active, p.created_at,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
            WHERE ${condition} AND p.is_active = 1
      LIMIT 1
    `, [param]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    const product = products[0];

    // Images
    const [images] = await pool.query<RowDataPacket[]>(`
      SELECT id, url, is_featured, sort_order
      FROM product_images
      WHERE product_id = ?
      ORDER BY is_featured DESC, sort_order ASC
    `, [product.id]);

    // Related products (same category, supplemented up to 12 products like Shopee)
    let [related] = await pool.query<RowDataPacket[]>(`
      SELECT p.id, p.name, p.slug, p.price, p.currency, c.name as category_name,
             (
               SELECT url FROM product_images pi 
               WHERE pi.product_id = p.id 
               ORDER BY pi.is_featured DESC, pi.sort_order ASC LIMIT 1
             ) as featured_image
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
      ORDER BY RAND()
      LIMIT 12
    `, [product.category_id, product.id]);

    if (related.length < 8) {
      const existingIds = [product.id, ...related.map((r: any) => r.id)];
      const [additional] = await pool.query<RowDataPacket[]>(`
        SELECT p.id, p.name, p.slug, p.price, p.currency, c.name as category_name,
               (
                 SELECT url FROM product_images pi 
                 WHERE pi.product_id = p.id 
                 ORDER BY pi.is_featured DESC, pi.sort_order ASC LIMIT 1
               ) as featured_image
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id NOT IN (?) AND p.is_active = 1
        ORDER BY p.id DESC
        LIMIT ?
      `, [existingIds, 12 - related.length]);
      related = [...related, ...additional];
    }

    res.json({
      ...product,
      price: Number(product.price),
      images,
      related: related.map(r => ({
        ...r,
        price: Number(r.price),
        image_url: r.featured_image || '',
        featured_image: r.featured_image || ''
      }))
    });
  } catch (err) {
    console.error('Error fetching product detail:', err);
    res.status(500).json({ error: 'Lỗi tải thông tin sản phẩm' });
  }
});

// Reviews
app.get('/api/products/:id/reviews', async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);
    const [reviews] = await pool.query<RowDataPacket[]>(`
      SELECT id, product_id, user_name, rating, comment, created_at
      FROM reviews
      WHERE product_id = ?
      ORDER BY created_at DESC
    `, [productId]);

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tải đánh giá' });
  }
});

app.post('/api/products/:id/reviews', async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);
    const { user_name, rating, comment } = req.body;

    if (!user_name || !rating || !comment) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên, số sao đánh giá và nội dung' });
    }

    const star = Math.min(5, Math.max(1, Number(rating) || 5));

    await pool.query(`
      INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [productId, String(user_name).trim(), star, String(comment).trim()]);

    res.status(201).json({ success: true, message: 'Gửi đánh giá thành công! Cảm ơn bạn đã phản hồi.' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi gửi đánh giá' });
  }
});

// Static Pages Content
app.get('/api/pages/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT id, title, slug, content, meta_description FROM pages WHERE slug = ? AND is_published = 1 LIMIT 1
    `, [slug]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trang không tồn tại' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy nội dung trang' });
  }
});

// ==========================================
// MOUNT AUTH & ADMIN ROUTES
// ==========================================
app.use('/api/customer-requests', customerRequestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler - Never leak stack trace to client
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau.'
    : (err.message || 'Internal Server Error');
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log(`Site URL for SEO: ${PUBLIC_SITE_URL}`);
});
