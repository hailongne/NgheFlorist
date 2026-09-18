/**
 * Utility for generating SEO-friendly URL slugs from Vietnamese or English text.
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Đổi khoảng trắng thành dấu gạch ngang
    .replace(/-+/g, '-'); // Gộp nhiều dấu gạch ngang liên tiếp
}
