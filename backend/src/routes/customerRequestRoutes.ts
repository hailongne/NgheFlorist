import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../db';
import { orderRateLimiter } from '../middleware/security';
import { uploadToStorage } from '../services/supabaseStorage';

const router = Router();

// Ensure private uploads/leads directory exists for fallback
const leadsUploadDir = path.join(__dirname, '..', '..', 'uploads', 'leads');
if (!fs.existsSync(leadsUploadDir)) {
  fs.mkdirSync(leadsUploadDir, { recursive: true });
}

// Multer memory storage for direct cloud upload
const uploadLeadAttachment = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedMimes.includes(file.mimetype) || !allowedExts.includes(ext)) {
      return cb(new Error('Chỉ chấp nhận các tệp ảnh định dạng JPG, JPEG, PNG, WEBP, GIF'));
    }
    cb(null, true);
  }
});

// Helper to generate unique NFYYYYMMDDXXX code
async function generateRequestCode(): Promise<string> {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const datePrefix = `NF${yyyy}${mm}${dd}`;

  // Query latest code for today
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT code FROM customer_requests
    WHERE code LIKE ?
    ORDER BY id DESC LIMIT 1
  `, [`${datePrefix}%`]);

  let sequence = 1;
  if (rows.length > 0) {
    const lastCode = rows[0].code;
    const lastSeqStr = lastCode.substring(datePrefix.length);
    const lastSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  return `${datePrefix}${String(sequence).padStart(3, '0')}`;
}

// POST /api/customer-requests/upload-attachment (Customer reference flower upload)
router.post('/upload-attachment', uploadLeadAttachment.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn tệp ảnh mẫu tham khảo' });
    }

    const uploadResult = await uploadToStorage(req.file, 'leads');
    res.status(201).json({
      success: true,
      url: uploadResult.url,
      fileUrl: uploadResult.url,
      originalName: uploadResult.original_name,
      fileSize: uploadResult.file_size
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi tải ảnh tham khảo' });
  }
});

// POST /api/customer-requests (Create Lead / Customer Request)
router.post('/', orderRateLimiter, async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      type = 'PRODUCT_SELECTION', // 'PRODUCT_SELECTION' | 'CUSTOM_DESIGN'
      customer_name,
      phone,
      zalo,
      selected_product_id,
      selected_product_name,
      product_url,
      budget,
      color_tone,
      style,
      recipient,
      requested_date,
      requested_time,
      delivery_area,
      message,
      notes,
      source = 'Website',
      attachments = [] // Array of { file_url, original_name, mime_type, file_size }
    } = req.body;

    if (!customer_name || !String(customer_name).trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp họ và tên của bạn' });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại liên hệ' });
    }

    const code = await generateRequestCode();

    const [insertResult] = await connection.query<ResultSetHeader>(`
      INSERT INTO customer_requests (
        code, type, customer_name, phone, zalo,
        selected_product_id, selected_product_name, product_url,
        budget, color_tone, style, recipient,
        requested_date, requested_time, delivery_area,
        message, notes, status, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
    `, [
      code,
      type === 'CUSTOM_DESIGN' ? 'CUSTOM_DESIGN' : 'PRODUCT_SELECTION',
      String(customer_name).trim(),
      String(phone).trim(),
      zalo ? String(zalo).trim() : String(phone).trim(),
      selected_product_id ? Number(selected_product_id) : null,
      selected_product_name ? String(selected_product_name).trim() : null,
      product_url ? String(product_url).trim() : null,
      budget ? String(budget).trim() : null,
      color_tone ? String(color_tone).trim() : null,
      style ? String(style).trim() : null,
      recipient ? String(recipient).trim() : null,
      requested_date || null,
      requested_time || null,
      delivery_area ? String(delivery_area).trim() : null,
      message ? String(message).trim() : null,
      notes ? String(notes).trim() : null,
      source || 'Website'
    ]);

    const requestId = insertResult.insertId;

    // Insert attachments if any
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        if (att.file_url) {
          await connection.query(`
            INSERT INTO customer_request_images (request_id, file_url, original_name, mime_type, file_size)
            VALUES (?, ?, ?, ?, ?)
          `, [
            requestId,
            att.file_url,
            att.original_name || 'anh-tham-khao.jpg',
            att.mime_type || 'image/jpeg',
            att.file_size || 0
          ]);
        }
      }
    }

    // Get conversion config from settings
    const [cfgRows] = await connection.query<RowDataPacket[]>(`
      SELECT value_data FROM settings WHERE key_name = 'conversion_config'
    `);

    let config = {
      zalo_url: "https://zalo.me/0987654321",
      zalo2_url: "https://zalo.me/0862926866",
      hotline1: "0987 654 321",
      hotline2: "086 292 6866",
      primary_channel: "zalo",
      primary_cta_text: "Gửi đơn qua Zalo 1 (0987 654 321)",
      secondary_cta_text: "Gửi đơn qua Zalo 2 (086 292 6866)"
    };

    if (cfgRows.length > 0) {
      const parsed = typeof cfgRows[0].value_data === 'string'
        ? JSON.parse(cfgRows[0].value_data)
        : cfgRows[0].value_data;
      config = { ...config, ...parsed };
    }

    await connection.commit();

    // Generate formatted structured message for customer to copy / send
    const typeLabel = type === 'CUSTOM_DESIGN' ? 'Thiết kế hoa theo yêu cầu' : 'Chọn mẫu hoa có sẵn';
    let messageText = `Nghệ Florist – Yêu cầu tư vấn\n`;
    messageText += `\n✦ Mã yêu cầu: ${code}`;
    messageText += `\n✦ Khách hàng: ${customer_name}`;
    messageText += `\n✦ Số điện thoại: ${phone}`;
    if (zalo && zalo !== phone) messageText += `\n✦ Zalo: ${zalo}`;
    messageText += `\n✦ Loại yêu cầu: ${typeLabel}`;

    if (selected_product_name) {
      messageText += `\n✦ Mẫu hoa: ${selected_product_name}`;
      if (product_url) messageText += `\n✦ Link mẫu: ${product_url}`;
    }

    if (budget) messageText += `\n✦ Ngân sách: ${budget}`;
    if (color_tone) messageText += `\n✦ Tông màu: ${color_tone}`;
    if (style) messageText += `\n✦ Phong cách: ${style}`;
    if (recipient) messageText += `\n✦ Người nhận: ${recipient}`;
    if (requested_date) messageText += `\n✦ Ngày cần: ${requested_date}`;
    if (requested_time) messageText += `\n✦ Khung giờ: ${requested_time}`;
    if (delivery_area) messageText += `\n✦ Khu vực giao: ${delivery_area}`;
    if (message) messageText += `\n✦ Lời nhắn thiệp: "${message}"`;
    if (notes) messageText += `\n✦ Ghi chú: ${notes}`;

    if (attachments.length > 0) {
      messageText += `\n✦ Có ${attachments.length} ảnh mẫu tham khảo đính kèm`;
    }

    res.status(201).json({
      success: true,
      code,
      requestId,
      messageText,
      conversionConfig: config
    });
  } catch (err: any) {
    await connection.rollback();
    console.error('Error creating customer request:', err);
    res.status(500).json({ error: err.message || 'Lỗi tạo yêu cầu tư vấn' });
  } finally {
    connection.release();
  }
});

export default router;
