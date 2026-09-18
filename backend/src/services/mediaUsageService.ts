import { RowDataPacket } from 'mysql2';
import { pool } from '../db';
import path from 'path';

export interface MediaUsageRef {
  type: 'product' | 'banner' | 'collection' | 'cms_page' | 'settings' | 'lead';
  id?: number | string;
  name: string;
  detail?: string;
}

/**
 * Extract clean filename or key from a URL or storage path
 */
export function extractMediaKey(urlOrPath: string): string {
  if (!urlOrPath) return '';
  try {
    const withoutQuery = urlOrPath.split('?')[0].split('#')[0];
    const parts = withoutQuery.split('/');
    return decodeURIComponent(parts[parts.length - 1]).toLowerCase().trim();
  } catch {
    return urlOrPath.toLowerCase().trim();
  }
}

/**
 * Checks whether a reference URL/path matches a given media file
 */
export function matchesMedia(
  refUrl: string,
  mediaUrl: string,
  mediaFilename: string
): boolean {
  if (!refUrl || (!mediaUrl && !mediaFilename)) return false;

  const refClean = refUrl.trim();
  const mediaUrlClean = (mediaUrl || '').trim();
  const mediaFilenameClean = (mediaFilename || '').trim();

  // 1. Exact string match
  if (refClean === mediaUrlClean || refClean === mediaFilenameClean) {
    return true;
  }

  // 2. Relative or URL path contains
  if (mediaUrlClean && refClean.includes(mediaUrlClean)) return true;
  if (mediaFilenameClean && refClean.includes(mediaFilenameClean)) return true;
  if (mediaUrlClean && mediaUrlClean.includes(refClean)) return true;

  // 3. Basename match if filename is unique
  const refKey = extractMediaKey(refClean);
  const mediaFileKey = extractMediaKey(mediaFilenameClean || mediaUrlClean);

  if (refKey && mediaFileKey && refKey === mediaFileKey) {
    return true;
  }

  return false;
}

/**
 * Collect all active media references across the entire system.
 * Queries Products, Banners, Homepage collections, Settings, CMS pages, and Customer requests.
 */
export async function getAllSystemMediaReferences(): Promise<Array<{ refUrl: string; usage: MediaUsageRef }>> {
  const references: Array<{ refUrl: string; usage: MediaUsageRef }> = [];

  try {
    // 1. Product Images
    const [prodImages] = await pool.query<RowDataPacket[]>(`
      SELECT pi.url, pi.is_featured, p.id as product_id, p.name as product_name
      FROM product_images pi
      JOIN products p ON p.id = pi.product_id
      WHERE pi.url IS NOT NULL AND pi.url != ''
    `);

    for (const row of prodImages) {
      references.push({
        refUrl: row.url,
        usage: {
          type: 'product',
          id: row.product_id,
          name: row.product_name,
          detail: row.is_featured === 1 ? 'Ảnh đại diện sản phẩm' : 'Ảnh thư viện sản phẩm'
        }
      });
    }
  } catch (err) {
    console.error('Error fetching product media references:', err);
  }

  try {
    // 2. Banners
    const [banners] = await pool.query<RowDataPacket[]>(`
      SELECT id, title, image_url
      FROM banners
      WHERE image_url IS NOT NULL AND image_url != ''
    `);

    for (const row of banners) {
      references.push({
        refUrl: row.image_url,
        usage: {
          type: 'banner',
          id: row.id,
          name: row.title || `Banner #${row.id}`,
          detail: 'Banner trang chủ'
        }
      });
    }
  } catch (err) {
    console.error('Error fetching banner media references:', err);
  }

  try {
    // 3. Settings (Showroom collections, homepage hero, custom design banner, site logo)
    const [settingsRows] = await pool.query<RowDataPacket[]>(`
      SELECT key_name, value_data
      FROM settings
      WHERE key_name IN ('homepage_hero', 'showroom_collections', 'custom_design_banner', 'site_settings')
    `);

    for (const row of settingsRows) {
      let data: any = row.value_data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          data = null;
        }
      }

      if (!data) continue;

      if (row.key_name === 'showroom_collections' && Array.isArray(data)) {
        for (const col of data) {
          if (col && col.image) {
            references.push({
              refUrl: col.image,
              usage: {
                type: 'collection',
                name: col.title || 'Bộ sưu tập hoa',
                detail: 'Bộ sưu tập trang chủ'
              }
            });
          }
        }
      } else if (row.key_name === 'custom_design_banner' && typeof data === 'object') {
        const bannerImg = data.image_url || data.image || data.banner_image;
        if (bannerImg) {
          references.push({
            refUrl: bannerImg,
            usage: {
              type: 'banner',
              name: data.title || 'Banner đặt hoa theo yêu cầu',
              detail: 'Banner trang chủ'
            }
          });
        }
      } else if (row.key_name === 'homepage_hero' && typeof data === 'object') {
        if (Array.isArray(data.slides)) {
          for (const s of data.slides) {
            if (s && s.image) {
              references.push({
                refUrl: s.image,
                usage: {
                  type: 'banner',
                  name: s.title || 'Hero Slide',
                  detail: 'Slide banner trang chủ'
                }
              });
            }
          }
        }
        if (data.desktop_image) {
          references.push({
            refUrl: data.desktop_image,
            usage: {
              type: 'banner',
              name: 'Ảnh Hero Desktop',
              detail: 'Banner trang chủ'
            }
          });
        }
        if (data.mobile_image) {
          references.push({
            refUrl: data.mobile_image,
            usage: {
              type: 'banner',
              name: 'Ảnh Hero Mobile',
              detail: 'Banner trang chủ'
            }
          });
        }
      } else if (row.key_name === 'site_settings' && typeof data === 'object') {
        if (data.logo_url) {
          references.push({
            refUrl: data.logo_url,
            usage: {
              type: 'settings',
              name: 'Logo Website',
              detail: 'Cấu hình giao diện'
            }
          });
        }
        if (data.favicon_url) {
          references.push({
            refUrl: data.favicon_url,
            usage: {
              type: 'settings',
              name: 'Favicon Website',
              detail: 'Cấu hình giao diện'
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching settings media references:', err);
  }

  try {
    // 4. CMS Pages
    const [pages] = await pool.query<RowDataPacket[]>(`
      SELECT id, title, slug, content
      FROM pages
      WHERE content IS NOT NULL AND content != ''
    `);

    for (const page of pages) {
      // Find all img src in content
      const regex = /<img[^>]+src=["']([^"']+)["']/gi;
      let match;
      while ((match = regex.exec(page.content)) !== null) {
        if (match[1]) {
          references.push({
            refUrl: match[1],
            usage: {
              type: 'cms_page',
              id: page.id,
              name: page.title || `Trang /${page.slug}`,
              detail: 'Bài viết CMS'
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching page media references:', err);
  }

  try {
    // 5. Customer Request Images (Leads)
    const [reqImages] = await pool.query<RowDataPacket[]>(`
      SELECT id, request_id, file_url
      FROM customer_request_images
      WHERE file_url IS NOT NULL AND file_url != ''
    `);

    for (const reqImg of reqImages) {
      references.push({
        refUrl: reqImg.file_url,
        usage: {
          type: 'lead',
          id: reqImg.request_id,
          name: `Yêu cầu khách hàng #${reqImg.request_id}`,
          detail: 'Ảnh tư vấn khách gửi'
        }
      });
    }
  } catch {
    // Table may not have rows or is optional
  }

  return references;
}

/**
 * Match a specific media file against all system references
 */
export function findUsagesForMedia(
  media: { id: number; url: string; filename: string },
  allRefs: Array<{ refUrl: string; usage: MediaUsageRef }>
): MediaUsageRef[] {
  const matchedUsages: MediaUsageRef[] = [];
  const seenKeys = new Set<string>();

  for (const ref of allRefs) {
    if (matchesMedia(ref.refUrl, media.url, media.filename)) {
      const dedupeKey = `${ref.usage.type}-${ref.usage.id || ref.usage.name}`;
      if (!seenKeys.has(dedupeKey)) {
        seenKeys.add(dedupeKey);
        matchedUsages.push(ref.usage);
      }
    }
  }

  return matchedUsages;
}

/**
 * Check if a single media file is currently in use before deletion
 */
export async function checkMediaUsage(media: { id: number; url: string; filename: string }): Promise<{
  isUsed: boolean;
  usageCount: number;
  usages: MediaUsageRef[];
}> {
  const allRefs = await getAllSystemMediaReferences();
  const usages = findUsagesForMedia(media, allRefs);
  return {
    isUsed: usages.length > 0,
    usageCount: usages.length,
    usages
  };
}
