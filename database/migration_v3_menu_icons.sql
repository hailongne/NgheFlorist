-- 1. Cập nhật thêm cột icon (nếu đã có thì thôi)
ALTER TABLE menu_items ADD COLUMN icon VARCHAR(50) NULL DEFAULT NULL AFTER label;

-- 2. Gán icon mặc định cho các mục
UPDATE menu_items SET icon = '✦' WHERE url = '/flowers' OR url LIKE '%/flowers%';
UPDATE menu_items SET icon = '💐' WHERE url LIKE '%bo-hoa%';
UPDATE menu_items SET icon = '🧺' WHERE url LIKE '%gio-hoa%';
UPDATE menu_items SET icon = '🪷' WHERE url LIKE '%lan-ho-diep%';
UPDATE menu_items SET icon = '🏵️' WHERE url LIKE '%ke-hoa%';
UPDATE menu_items SET icon = '🎀' WHERE url LIKE '%hoa-cuoi%';
UPDATE menu_items SET icon = '✨' WHERE url LIKE '%custom-order%';
UPDATE menu_items SET icon = '🔍' WHERE url LIKE '%order-tracking%';
UPDATE menu_items SET icon = '🌿' WHERE url LIKE '%about%';
