import { Router, Request, Response, NextFunction } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../db';
import { authenticateToken, requireSoleAdmin, requirePermission, logAudit } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { uploadToStorage, deleteFromStorage } from '../services/supabaseStorage';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';

const router = Router();

// All admin routes require valid authentication token and sole admin role
router.use(authenticateToken);
router.use(requireSoleAdmin);

// ==========================================
// 1. CUSTOMER REQUESTS (LEADS) — PRIMARY ADMIN LANDING
// ==========================================


// Helper: formula injection prevention for Excel export
function sanitizeExcelVal(val: any): string | number {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  if (/^[=+\-@\t\r|]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

// GET /api/admin/customer-requests (Paginated list with summary counts)
router.get('/customer-requests', requirePermission('manage_orders'), async (req: Request, res: Response) => {
  try {
    const status = req.query.status ? String(req.query.status).trim() : null;
    const type = req.query.type ? String(req.query.type).trim() : null;
    const search = req.query.search ? String(req.query.search).trim() : '';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where: string[] = ['1=1'];
    const params: any[] = [];

    if (status && status !== 'all') {
      where.push('cr.status = ?');
      params.push(status);
    }

    if (type && type !== 'all') {
      where.push('cr.type = ?');
      params.push(type);
    }

    if (search) {
      where.push('(cr.code LIKE ? OR cr.customer_name LIKE ? OR cr.phone LIKE ? OR cr.zalo LIKE ? OR cr.selected_product_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Summary counts query
    const [summaryRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as count_new,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as count_contacted,
        SUM(CASE WHEN status = 'consulting' THEN 1 ELSE 0 END) as count_consulting,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as count_closed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as count_cancelled
      FROM customer_requests
    `);

    // Total filtered count
    const [countRows] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) as total FROM customer_requests cr WHERE ${where.join(' AND ')}
    `, params);
    const filteredTotal = countRows[0].total;

    // Requests list
    const [requests] = await pool.query<RowDataPacket[]>(`
      SELECT 
        cr.*,
        (SELECT COUNT(*) FROM customer_request_images cri WHERE cri.request_id = cr.id) as attachment_count
      FROM customer_requests cr
      WHERE ${where.join(' AND ')}
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    res.json({
      requests,
      summary: summaryRows[0] || {
        total: 0, count_new: 0, count_contacted: 0, count_consulting: 0, count_closed: 0, count_cancelled: 0
      },
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit)
      }
    });
  } catch (err: any) {
    console.error('Customer requests fetch error:', err);
    res.status(500).json({ error: 'Lỗi tải danh sách yêu cầu khách hàng' });
  }
});

// GET /api/admin/customer-requests/export (Excel export with exceljs)
router.get('/customer-requests/export', requirePermission('manage_orders'), async (req: Request, res: Response) => {
  try {
    const status = req.query.status ? String(req.query.status).trim() : null;
    const type = req.query.type ? String(req.query.type).trim() : null;
    const search = req.query.search ? String(req.query.search).trim() : '';

    const where: string[] = ['1=1'];
    const params: any[] = [];

    if (status && status !== 'all') {
      where.push('cr.status = ?');
      params.push(status);
    }
    if (type && type !== 'all') {
      where.push('cr.type = ?');
      params.push(type);
    }
    if (search) {
      where.push('(cr.code LIKE ? OR cr.customer_name LIKE ? OR cr.phone LIKE ? OR cr.zalo LIKE ? OR cr.selected_product_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT cr.*
      FROM customer_requests cr
      WHERE ${where.join(' AND ')}
      ORDER BY cr.created_at DESC
    `, params);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Nghe Florist System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Danh Sách Yêu Cầu');

    // Title banner
    worksheet.mergeCells('A1:O1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'DANH SÁCH YÊU CẦU TƯ VẤN KHÁCH HÀNG — NGHỆ FLORIST';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF1A365D' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 32;

    // Subtitle date
    worksheet.mergeCells('A2:O2');
    const subCell = worksheet.getCell('A2');
    subCell.value = `Xuất ngày: ${new Date().toLocaleString('vi-VN')} | Tổng số: ${rows.length} yêu cầu`;
    subCell.font = { italic: true, size: 10, color: { argb: 'FF555555' } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    // Headers
    worksheet.getRow(3).values = [
      'STT',
      'Mã yêu cầu',
      'Thời gian gửi',
      'Khách hàng',
      'Số điện thoại',
      'Zalo',
      'Loại yêu cầu',
      'Sản phẩm chọn',
      'Ngân sách',
      'Tông màu',
      'Phong cách',
      'Người nhận',
      'Ngày & Giờ cần',
      'Khu vực giao',
      'Trạng thái'
    ];

    const headerRow = worksheet.getRow(3);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FF0A2540' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F0FA' } // Pastel blue
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFB0C4DE' } },
        left: { style: 'thin', color: { argb: 'FFB0C4DE' } },
        bottom: { style: 'medium', color: { argb: 'FF2A75D3' } },
        right: { style: 'thin', color: { argb: 'FFB0C4DE' } }
      };
    });

    const statusMap: Record<string, string> = {
      new: 'Mới',
      contacted: 'Đã liên hệ',
      consulting: 'Đang tư vấn',
      closed: 'Chốt thành công',
      cancelled: 'Đã hủy'
    };

    rows.forEach((r, idx) => {
      const dateStr = r.created_at ? new Date(r.created_at).toLocaleString('vi-VN') : '';
      const deliveryDateTime = [r.requested_date, r.requested_time].filter(Boolean).join(' ') || 'Chưa định ngày';

      const rowValues = [
        idx + 1,
        sanitizeExcelVal(r.code),
        sanitizeExcelVal(dateStr),
        sanitizeExcelVal(r.customer_name),
        sanitizeExcelVal(r.phone),
        sanitizeExcelVal(r.zalo || r.phone),
        sanitizeExcelVal(r.type === 'CUSTOM_DESIGN' ? 'Thiết kế riêng' : 'Mẫu có sẵn'),
        sanitizeExcelVal(r.selected_product_name || 'Yêu cầu theo mẫu tùy chỉnh'),
        sanitizeExcelVal(r.budget || 'Thỏa thuận'),
        sanitizeExcelVal(r.color_tone || ''),
        sanitizeExcelVal(r.style || ''),
        sanitizeExcelVal(r.recipient || ''),
        sanitizeExcelVal(deliveryDateTime),
        sanitizeExcelVal(r.delivery_area || ''),
        sanitizeExcelVal(statusMap[r.status] || r.status)
      ];

      const row = worksheet.addRow(rowValues);
      row.height = 24;
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: [1, 2, 3, 5, 6, 7, 15].includes(colNumber) ? 'center' : 'left' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });
    });

    // Auto-fit column widths
    worksheet.columns.forEach((col) => {
      let maxLen = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 3, 40);
    });

    const filename = `nghe-florist-leads-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    console.error('Customer requests export error:', err);
    res.status(500).json({ error: 'Lỗi xuất file Excel yêu cầu khách hàng' });
  }
});

// GET /api/admin/customer-requests/:id (Details + Attachments)
router.get('/customer-requests/:id', requirePermission('manage_orders'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT * FROM customer_requests WHERE id = ? LIMIT 1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu khách hàng' });
    }

    const request = rows[0];

    // Fetch images/attachments
    const [images] = await pool.query<RowDataPacket[]>(`
      SELECT * FROM customer_request_images WHERE request_id = ? ORDER BY id ASC
    `, [id]);

    res.json({
      request,
      images
    });
  } catch (err: any) {
    console.error('Customer request detail error:', err);
    res.status(500).json({ error: 'Lỗi tải chi tiết yêu cầu' });
  }
});

// PATCH /api/admin/customer-requests/:id/status
router.patch('/customer-requests/:id/status', requirePermission('manage_orders'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, notes } = req.body;

    const allowedStatuses = ['new', 'contacted', 'consulting', 'closed', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Không có thông tin thay đổi' });
    }

    params.push(id);
    await pool.query(`UPDATE customer_requests SET ${updates.join(', ')} WHERE id = ?`, params);

    await logAudit(req, 'UPDATE_STATUS', 'customer_request', id, { status, notes });

    res.json({ success: true, message: 'Cập nhật trạng thái yêu cầu thành công' });
  } catch (err: any) {
    console.error('Customer request status update error:', err);
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái yêu cầu' });
  }
});

// ==========================================
// 2. PRODUCT MANAGEMENT
// ==========================================

// GET /api/admin/products (List with search, category, status, pagination)
router.get('/products', requirePermission('manage_products'), async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search ? String(req.query.search).trim() : '';
    const categoryId = req.query.category_id ? Number(req.query.category_id) : null;
    const status = req.query.status !== undefined ? req.query.status : null;

    const where: string[] = ['1=1'];
    const params: any[] = [];

    if (search) {
      where.push('(p.name LIKE ? OR p.slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      where.push('(p.category_id = ? OR p.category_id IN (SELECT id FROM categories WHERE parent_id = ?))');
      params.push(categoryId, categoryId);
    }

    if (status !== null && status !== '') {
      where.push('p.is_active = ?');
      params.push(Number(status));
    }

    // Count
    const [countRows] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) as total FROM products p WHERE ${where.join(' AND ')}
    `, params);
    const total = countRows[0].total;

    // Fetch
    const [products] = await pool.query<RowDataPacket[]>(`
      SELECT p.id, p.category_id, p.name, p.slug, p.price, p.currency, p.is_active, p.created_at,
             c.name as category_name,
             (
               SELECT url FROM product_images pi 
               WHERE pi.product_id = p.id 
               ORDER BY pi.is_featured DESC, pi.sort_order ASC LIMIT 1
             ) as featured_image
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${where.join(' AND ')}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    res.json({
      products: products.map(p => ({
        ...p,
        price: Number(p.price),
        image_url: p.featured_image || null,
        featured_image: p.featured_image || null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error('Admin products fetch error:', err);
    res.status(500).json({ error: 'Lỗi tải danh sách sản phẩm' });
  }
});

// GET /api/admin/products/:id (Full product details)
router.get('/products/:id', requirePermission('manage_products'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    const product = rows[0];

    // Images
    const [images] = await pool.query<RowDataPacket[]>(`
      SELECT id, url, is_featured, sort_order FROM product_images
      WHERE product_id = ? ORDER BY is_featured DESC, sort_order ASC
    `, [id]);

    res.json({
      ...product,
      price: Number(product.price),
      images
    });
  } catch (err: any) {
    console.error('Admin product detail error:', err);
    res.status(500).json({ error: 'Lỗi lấy thông tin sản phẩm' });
  }
});

// POST /api/admin/products/upload-images (Upload multiple or single product images to dedicated Supabase 'products' folder)
router.post(
  '/products/upload-images',
  requirePermission('manage_products'),
  (req: Request, res: Response, next: NextFunction) => {
    uploadImage.array('files', 20)(req, res, (err: any) => {
      if (err) {
        console.error('Multer product upload error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Kích thước file ảnh vượt quá giới hạn 25MB' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: 'Số lượng ảnh vượt quá giới hạn (tối đa 20 ảnh/lần)' });
        }
        return res.status(400).json({ error: err.message || 'Lỗi xử lý file tải lên' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Vui lòng chọn ít nhất một tệp ảnh để tải lên' });
      }

      const uploadedUrls: string[] = [];
      const results = [];

      for (const file of files) {
        // Upload directly into the dedicated 'products' folder in Supabase storage
        const uploadResult = await uploadToStorage(file, 'products');
        uploadedUrls.push(uploadResult.url);
        results.push({
          url: uploadResult.url,
          filename: uploadResult.filename,
          original_name: uploadResult.original_name,
          size: uploadResult.file_size
        });

        // Track in media_files
        try {
          await pool.query<ResultSetHeader>(`
            INSERT INTO media_files (filename, original_name, mime_type, file_size, url)
            VALUES (?, ?, ?, ?, ?)
          `, [uploadResult.filename, uploadResult.original_name, uploadResult.mime_type, uploadResult.file_size, uploadResult.url]);
        } catch (errDb) {
          console.error('Error recording product media file:', errDb);
        }
      }

      await logAudit(req, 'UPLOAD', 'product_images', undefined, {
        count: files.length,
        urls: uploadedUrls,
        folder: 'products'
      });

      res.status(201).json({
        success: true,
        urls: uploadedUrls,
        files: results,
        message: `Đã tải lên ${files.length} ảnh sản phẩm vào thư mục products thành công`
      });
    } catch (err: any) {
      console.error('Upload product images error:', err);
      res.status(500).json({ error: err.message || 'Lỗi tải ảnh sản phẩm lên Supabase' });
    }
  }
);

// POST /api/admin/products (Create product)
router.post('/products', requirePermission('manage_products'), async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      slug,
      description,
      price,
      category_id,
      is_active = 1,
      images = []
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Tên sản phẩm và giá là bắt buộc' });
    }

    // Slug generation fallback
    const productSlug = (slug || name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const [prodResult] = await connection.query<ResultSetHeader>(`
      INSERT INTO products (category_id, name, slug, description, price, currency, is_active)
      VALUES (?, ?, ?, ?, ?, 'VND', ?)
    `, [
      category_id || null,
      String(name).trim(),
      productSlug,
      description || '',
      Number(price),
      is_active ? 1 : 0
    ]);

    const productId = prodResult.insertId;

    // Insert images
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await connection.query(`
          INSERT INTO product_images (product_id, url, is_featured, sort_order)
          VALUES (?, ?, ?, ?)
        `, [productId, img.url, img.is_featured ? 1 : (i === 0 ? 1 : 0), i]);
      }
    }

    await connection.commit();

    await logAudit(req, 'CREATE', 'product', productId, { name, price, slug: productSlug });

    res.status(201).json({
      success: true,
      productId,
      message: 'Tạo sản phẩm thành công'
    });
  } catch (err: any) {
    await connection.rollback();
    console.error('Create product error:', err);
    res.status(500).json({ error: err.message || 'Lỗi tạo sản phẩm' });
  } finally {
    connection.release();
  }
});

// PATCH /api/admin/products/:id (Update product)
router.patch('/products/:id', requirePermission('manage_products'), async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const productId = Number(req.params.id);
    const {
      name,
      slug,
      description,
      price,
      category_id,
      is_active,
      images
    } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(String(name).trim());
    }
    if (slug !== undefined) {
      updates.push('slug = ?');
      params.push(String(slug).trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(Number(price));
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id ? Number(category_id) : null);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(productId);
      await connection.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Sync images if provided
    if (Array.isArray(images)) {
      await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await connection.query(`
          INSERT INTO product_images (product_id, url, is_featured, sort_order)
          VALUES (?, ?, ?, ?)
        `, [productId, img.url, img.is_featured ? 1 : (i === 0 ? 1 : 0), i]);
      }
    }

    await connection.commit();

    await logAudit(req, 'UPDATE', 'product', productId, req.body);

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
  } catch (err: any) {
    await connection.rollback();
    console.error('Update product error:', err);
    res.status(500).json({ error: err.message || 'Lỗi cập nhật sản phẩm' });
  } finally {
    connection.release();
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', requirePermission('manage_products'), async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    await pool.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
    await pool.query('DELETE FROM products WHERE id = ?', [productId]);

    await logAudit(req, 'DELETE', 'product', productId);

    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (err: any) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Lỗi xóa sản phẩm' });
  }
});

// ==========================================
// 3. CATEGORY MANAGEMENT
// ==========================================

// GET /api/admin/categories (Hierarchical list with product counts and is_active status)
router.get('/categories', requirePermission('manage_categories'), async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT c.id, c.parent_id, c.name, c.slug, c.description, c.sort_order, c.is_active,
             COUNT(p.id) as direct_product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `);

    const categoryMap = new Map<number, any>();
    rows.forEach(r => {
      categoryMap.set(r.id, {
        ...r,
        direct_product_count: Number(r.direct_product_count),
        total_product_count: Number(r.direct_product_count),
        is_active: Number(r.is_active),
        children: []
      });
    });

    const tree: any[] = [];
    rows.forEach(r => {
      const item = categoryMap.get(r.id);
      if (r.parent_id && categoryMap.has(r.parent_id)) {
        const parent = categoryMap.get(r.parent_id);
        parent.children.push(item);
        parent.total_product_count += item.direct_product_count;
      } else if (!r.parent_id) {
        tree.push(item);
      }
    });

    const flatList = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      can_delete: cat.total_product_count === 0 && cat.children.length === 0
    }));

    res.json({
      categories: flatList,
      tree
    });
  } catch (err: any) {
    console.error('Admin categories fetch error:', err);
    res.status(500).json({ error: 'Lỗi tải danh mục quản trị' });
  }
});

// POST /api/admin/categories (Create category or sub-category)
router.post('/categories', requirePermission('manage_categories'), async (req: Request, res: Response) => {
  try {
    const { name, slug, parent_id, description, sort_order = 0, is_active = 1 } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
    }

    const catSlug = (slug || name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure slug uniqueness
    let finalSlug = catSlug;
    let suffix = 1;
    while (true) {
      const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM categories WHERE slug = ?', [finalSlug]);
      if (existing.length === 0) break;
      finalSlug = `${catSlug}-${suffix++}`;
    }

    const [resInsert] = await pool.query<ResultSetHeader>(`
      INSERT INTO categories (name, slug, parent_id, description, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [String(name).trim(), finalSlug, parent_id ? Number(parent_id) : null, description || '', Number(sort_order), is_active ? 1 : 0]);

    await logAudit(req, 'CREATE', 'category', resInsert.insertId, { name, slug: finalSlug, parent_id });

    res.status(201).json({ success: true, categoryId: resInsert.insertId, message: 'Tạo danh mục thành công' });
  } catch (err: any) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Lỗi tạo danh mục' });
  }
});

// PATCH /api/admin/categories/:id (Update category)
router.patch('/categories/:id', requirePermission('manage_categories'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, slug, parent_id, description, sort_order, is_active } = req.body;

    // Prevent circular hierarchy: category cannot be its own parent
    if (parent_id !== undefined && Number(parent_id) === id) {
      return res.status(400).json({ error: 'Danh mục không thể là danh mục cha của chính nó' });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(String(name).trim());
    }
    if (slug !== undefined) {
      updates.push('slug = ?');
      params.push(String(slug).trim());
    }
    if (parent_id !== undefined) {
      updates.push('parent_id = ?');
      params.push(parent_id ? Number(parent_id) : null);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?');
      params.push(Number(sort_order));
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    await logAudit(req, 'UPDATE', 'category', id, req.body);

    res.json({ success: true, message: 'Cập nhật danh mục thành công' });
  } catch (err: any) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Lỗi cập nhật danh mục' });
  }
});

// PATCH /api/admin/categories/:id/toggle-active (Toggle active/hidden state)
router.patch('/categories/:id/toggle-active', requirePermission('manage_categories'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, is_active FROM categories WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }
    const newActive = rows[0].is_active ? 0 : 1;

    await pool.query('UPDATE categories SET is_active = ? WHERE id = ?', [newActive, id]);
    await logAudit(req, 'UPDATE', 'category', id, { is_active: newActive });

    res.json({
      success: true,
      is_active: newActive,
      message: newActive ? `Đã hiển thị danh mục "${rows[0].name}"` : `Đã ẩn danh mục "${rows[0].name}"`
    });
  } catch (err: any) {
    console.error('Toggle category active error:', err);
    res.status(500).json({ error: 'Lỗi đổi trạng thái danh mục' });
  }
});

// DELETE /api/admin/categories/:id (Block deletion if products are linked, only allow hide)
router.delete('/categories/:id', requirePermission('manage_categories'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const [catRows] = await pool.query<RowDataPacket[]>('SELECT id, name, parent_id FROM categories WHERE id = ?', [id]);
    if (catRows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }
    const cat = catRows[0];

    // Check if products are directly linked or linked to subcategories
    const [prodCountRows] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) as total FROM products 
      WHERE category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?)
    `, [id, id]);

    const linkedProducts = prodCountRows[0].total;
    if (linkedProducts > 0) {
      return res.status(400).json({
        error: `Danh mục "${cat.name}" đang liên kết với ${linkedProducts} sản phẩm. Không được phép xóa để đảm bảo an toàn dữ liệu. Vui lòng chuyển sang trạng thái "Ẩn danh mục".`
      });
    }

    // Check if it contains subcategories
    const [childrenRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM categories WHERE parent_id = ?', [id]);
    if (childrenRows[0].total > 0) {
      return res.status(400).json({
        error: `Danh mục "${cat.name}" đang chứa ${childrenRows[0].total} danh mục nhỏ. Vui lòng xóa hoặc di chuyển các danh mục nhỏ trước khi xóa danh mục lớn này.`
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    await logAudit(req, 'DELETE', 'category', id);

    res.json({ success: true, message: `Đã xóa danh mục "${cat.name}" thành công` });
  } catch (err: any) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Lỗi xóa danh mục' });
  }
});

// ==========================================
// 8. REVIEW MODERATION
// ==========================================
router.get('/reviews', requirePermission('manage_reviews'), async (_req: Request, res: Response) => {
  try {
    const [reviews] = await pool.query<RowDataPacket[]>(`
      SELECT r.id, r.product_id, r.user_name, r.rating, r.comment, r.created_at,
             p.name as product_name
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      ORDER BY r.created_at DESC
    `);
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải đánh giá' });
  }
});

router.delete('/reviews/:id', requirePermission('manage_reviews'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    await logAudit(req, 'DELETE', 'review', id);
    res.json({ success: true, message: 'Xóa đánh giá thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa đánh giá' });
  }
});

// ==========================================
// 9. CMS & CONTENT MANAGEMENT
// ==========================================
// Homepage CMS
router.get('/content/homepage', async (_req: Request, res: Response) => {
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
      SELECT * FROM banners ORDER BY sort_order ASC
    `);

    res.json({
      hero: heroRows.length > 0 ? (typeof heroRows[0].value_data === 'string' ? JSON.parse(heroRows[0].value_data) : heroRows[0].value_data) : null,
      collections: collectionRows.length > 0 ? (typeof collectionRows[0].value_data === 'string' ? JSON.parse(collectionRows[0].value_data) : collectionRows[0].value_data) : null,
      commitments: commitRows.length > 0 ? (typeof commitRows[0].value_data === 'string' ? JSON.parse(commitRows[0].value_data) : commitRows[0].value_data) : [],
      customDesign: customDesignRows.length > 0 ? (typeof customDesignRows[0].value_data === 'string' ? JSON.parse(customDesignRows[0].value_data) : customDesignRows[0].value_data) : null,
      banners
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải cấu hình trang chủ' });
  }
});

router.patch('/content/homepage', requirePermission('manage_cms'), async (req: Request, res: Response) => {
  try {
    const { hero, collections, commitments, custom_design } = req.body;

    if (hero) {
      await pool.query(`
        INSERT INTO settings (key_name, value_data) VALUES ('homepage_hero', ?)
        ON DUPLICATE KEY UPDATE value_data = VALUES(value_data)
      `, [JSON.stringify(hero)]);
    }

    if (collections) {
      await pool.query(`
        INSERT INTO settings (key_name, value_data) VALUES ('showroom_collections', ?)
        ON DUPLICATE KEY UPDATE value_data = VALUES(value_data)
      `, [JSON.stringify(collections)]);
    }

    if (commitments) {
      await pool.query(`
        INSERT INTO settings (key_name, value_data) VALUES ('service_commitments', ?)
        ON DUPLICATE KEY UPDATE value_data = VALUES(value_data)
      `, [JSON.stringify(commitments)]);
    }

    if (custom_design) {
      await pool.query(`
        INSERT INTO settings (key_name, value_data) VALUES ('custom_design_banner', ?)
        ON DUPLICATE KEY UPDATE value_data = VALUES(value_data)
      `, [JSON.stringify(custom_design)]);
    }

    await logAudit(req, 'UPDATE', 'homepage_cms', 'homepage_hero');
    res.json({ success: true, message: 'Lưu nội dung trang chủ thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật trang chủ' });
  }
});

// Banners
router.get('/banners', requirePermission('manage_cms'), async (_req: Request, res: Response) => {
  try {
    const [banners] = await pool.query<RowDataPacket[]>('SELECT * FROM banners ORDER BY sort_order ASC');
    res.json(banners);
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải banners' });
  }
});

router.post('/banners', requirePermission('manage_cms'), async (req: Request, res: Response) => {
  try {
    const { title, subtitle, image_url, cta_text, cta_url, sort_order = 0, is_active = 1 } = req.body;
    if (!title || !image_url) return res.status(400).json({ error: 'Tiêu đề và ảnh banner là bắt buộc' });

    const [resInsert] = await pool.query<ResultSetHeader>(`
      INSERT INTO banners (title, subtitle, image_url, cta_text, cta_url, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title.trim(), subtitle || null, image_url, cta_text || null, cta_url || null, sort_order, is_active ? 1 : 0]);

    await logAudit(req, 'CREATE', 'banner', resInsert.insertId, { title });
    res.status(201).json({ success: true, bannerId: resInsert.insertId, message: 'Thêm banner thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi thêm banner' });
  }
});

router.put('/banners/:id', requirePermission('manage_cms'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, subtitle, image_url, cta_text, cta_url, sort_order = 0, is_active = 1 } = req.body;
    if (!title || !image_url) return res.status(400).json({ error: 'Tiêu đề và ảnh banner là bắt buộc' });

    await pool.query(`
      UPDATE banners 
      SET title = ?, subtitle = ?, image_url = ?, cta_text = ?, cta_url = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `, [title.trim(), subtitle || null, image_url, cta_text || null, cta_url || null, sort_order, is_active ? 1 : 0, id]);

    await logAudit(req, 'UPDATE', 'banner', id, { title });
    res.json({ success: true, message: 'Cập nhật banner thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật banner' });
  }
});

router.delete('/banners/:id', requirePermission('manage_cms'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await pool.query('DELETE FROM banners WHERE id = ?', [id]);
    await logAudit(req, 'DELETE', 'banner', id);
    res.json({ success: true, message: 'Xóa banner thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa banner' });
  }
});

// Pages CMS
router.get('/pages', requirePermission('manage_cms'), async (_req: Request, res: Response) => {
  try {
    const [pages] = await pool.query<RowDataPacket[]>('SELECT id, title, slug, meta_description, is_published FROM pages');
    res.json(pages);
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải danh sách bài viết trang' });
  }
});

router.post('/pages', requirePermission('manage_cms'), async (req: Request, res: Response) => {
  try {
    const { title, slug, content = '', meta_description = '', is_published = 1 } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'Tiêu đề và đường dẫn slug là bắt buộc' });

    const cleanSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM pages WHERE slug = ?', [cleanSlug]);
    if (existing.length > 0) return res.status(400).json({ error: 'Đường dẫn slug này đã tồn tại' });

    const [result] = await pool.query<ResultSetHeader>(`
      INSERT INTO pages (title, slug, content, meta_description, is_published)
      VALUES (?, ?, ?, ?, ?)
    `, [title.trim(), cleanSlug, content, meta_description.trim(), is_published ? 1 : 0]);

    await logAudit(req, 'CREATE', 'page', result.insertId, { title, slug: cleanSlug });
    res.status(201).json({ success: true, message: 'Tạo trang mới thành công', id: result.insertId });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tạo trang mới' });
  }
});

router.patch('/pages/:id', requirePermission('manage_cms'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, content, meta_description, is_published } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (meta_description !== undefined) { updates.push('meta_description = ?'); params.push(meta_description); }
    if (is_published !== undefined) { updates.push('is_published = ?'); params.push(is_published ? 1 : 0); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE pages SET ${updates.join(', ')} WHERE id = ?`, params);
      await logAudit(req, 'UPDATE', 'page', id, { title });
    }

    res.json({ success: true, message: 'Cập nhật trang thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật trang' });
  }
});

router.delete('/pages/:id', requirePermission('manage_cms'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT slug FROM pages WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy trang' });
    if (['about', 'policy'].includes(rows[0].slug)) {
      return res.status(400).json({ error: 'Không thể xóa trang hệ thống cốt lõi (Về chúng tôi, Chính sách)' });
    }
    await pool.query('DELETE FROM pages WHERE id = ?', [id]);
    await logAudit(req, 'DELETE', 'page', id);
    res.json({ success: true, message: 'Xóa trang thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa trang' });
  }
});

// Menu CMS
router.get('/menu', requirePermission('manage_cms'), async (_req: Request, res: Response) => {
  try {
    const [items] = await pool.query<RowDataPacket[]>('SELECT * FROM menu_items ORDER BY sort_order ASC');
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải menu' });
  }
});

router.post('/menu', requirePermission('manage_cms'), async (req: Request, res: Response) => {
  try {
    const { label, url, sort_order = 0, is_active = 1 } = req.body;
    if (!label || !url) return res.status(400).json({ error: 'Tiêu đề và đường dẫn menu là bắt buộc' });

    const [resInsert] = await pool.query<ResultSetHeader>(`
      INSERT INTO menu_items (label, url, sort_order, is_active) VALUES (?, ?, ?, ?)
    `, [label.trim(), url.trim(), sort_order, is_active ? 1 : 0]);

    await logAudit(req, 'CREATE', 'menu_item', resInsert.insertId, { label, url });
    res.status(201).json({ success: true, message: 'Thêm mục menu thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tạo menu' });
  }
});

router.patch('/menu/:id', requirePermission('manage_cms'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { label, url, sort_order, is_active } = req.body;
    const updates: string[] = [];
    const params: any[] = [];
    if (label !== undefined) { updates.push('label = ?'); params.push(label.trim()); }
    if (url !== undefined) { updates.push('url = ?'); params.push(url.trim()); }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(Number(sort_order)); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`, params);
      await logAudit(req, 'UPDATE', 'menu_item', id, { label, url });
    }
    res.json({ success: true, message: 'Cập nhật mục menu thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật menu' });
  }
});

router.delete('/menu/:id', requirePermission('manage_cms'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
    await logAudit(req, 'DELETE', 'menu_item', id);
    res.json({ success: true, message: 'Xóa mục menu thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa menu' });
  }
});

// Website Settings
router.get('/settings', requirePermission('manage_settings'), async (_req: Request, res: Response) => {
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

router.patch('/settings', requirePermission('manage_settings'), async (req: Request, res: Response) => {
  try {
    const { siteSettings, footerConfig, conversionConfig } = req.body;

    if (siteSettings) {
      await pool.query(`
        INSERT INTO settings (key_name, value_data) VALUES ('site_settings', ?)
        ON DUPLICATE KEY UPDATE value_data = VALUES(value_data)
      `, [JSON.stringify(siteSettings)]);
    }

    if (footerConfig) {
      await pool.query(`
        INSERT INTO settings (key_name, value_data) VALUES ('footer_config', ?)
        ON DUPLICATE KEY UPDATE value_data = VALUES(value_data)
      `, [JSON.stringify(footerConfig)]);
    }

    if (conversionConfig) {
      await pool.query(`
        INSERT INTO settings (key_name, value_data) VALUES ('conversion_config', ?)
        ON DUPLICATE KEY UPDATE value_data = VALUES(value_data)
      `, [JSON.stringify(conversionConfig)]);
    }

    await logAudit(req, 'UPDATE', 'settings', 'site_footer_conversion');
    res.json({ success: true, message: 'Lưu cấu hình website thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi lưu cấu hình website' });
  }
});

// ==========================================
// 10. MEDIA LIBRARY
// ==========================================
router.get('/media', requirePermission('manage_media'), async (_req: Request, res: Response) => {
  try {
    const [files] = await pool.query<RowDataPacket[]>('SELECT * FROM media_files ORDER BY created_at DESC LIMIT 100');
    res.json(files);
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải thư viện ảnh' });
  }
});

router.post('/media/upload', requirePermission('manage_media'), uploadImage.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn tệp ảnh để tải lên' });
    }

    const uploadResult = await uploadToStorage(req.file, 'library');

    const [resInsert] = await pool.query<ResultSetHeader>(`
      INSERT INTO media_files (filename, original_name, mime_type, file_size, url)
      VALUES (?, ?, ?, ?, ?)
    `, [uploadResult.filename, uploadResult.original_name, uploadResult.mime_type, uploadResult.file_size, uploadResult.url]);

    await logAudit(req, 'UPLOAD', 'media_file', resInsert.insertId, {
      filename: uploadResult.filename,
      size: uploadResult.file_size,
      url: uploadResult.url,
      isCloud: uploadResult.isCloud
    });

    res.status(201).json({
      success: true,
      file: {
        id: resInsert.insertId,
        filename: uploadResult.filename,
        original_name: uploadResult.original_name,
        url: uploadResult.url,
        size: uploadResult.file_size
      },
      message: 'Tải ảnh lên thành công'
    });
  } catch (err: any) {
    console.error('Upload media error:', err);
    res.status(500).json({ error: err.message || 'Lỗi tải ảnh lên' });
  }
});

router.delete('/media/:id', requirePermission('manage_media'), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT filename, url FROM media_files WHERE id = ?', [id]);
    if (rows.length > 0) {
      const fileTarget = rows[0].filename || rows[0].url;
      await deleteFromStorage(fileTarget);
      await pool.query('DELETE FROM media_files WHERE id = ?', [id]);
      await logAudit(req, 'DELETE', 'media_file', id);
    }
    res.json({ success: true, message: 'Xóa ảnh thành công' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi xóa ảnh' });
  }
});

// ==========================================
// 11. AUDIT LOGS
// ==========================================
router.get('/audit-logs', requirePermission('view_audit_logs'), async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM audit_logs');
    const total = countRows[0].total;

    const [logs] = await pool.query<RowDataPacket[]>(`
      SELECT al.*, u.username, u.full_name
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi tải nhật ký thao tác' });
  }
});

export default router;
