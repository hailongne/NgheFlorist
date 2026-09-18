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
    // 3. Settings (Showroom collections, homepage hero, custom design banner, site logo, footer, conversion)
    const [settingsRows] = await pool.query<RowDataPacket[]>(`
      SELECT key_name, value_data
      FROM settings
      WHERE key_name IN (
        'homepage_hero',
        'showroom_collections',
        'custom_design_banner',
        'service_commitments',
        'site_settings',
        'footer_config',
        'conversion_config'
      )
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
          const colImg = col?.image || col?.image_url;
          if (colImg) {
            references.push({
              refUrl: colImg,
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
        // Multi-device banner images (PC/Desktop, Tablet, Mobile)
        if (data.desktop && typeof data.desktop === 'object') {
          const desktopImg = data.desktop.hero_image || data.desktop.image || data.desktop.image_url;
          if (desktopImg) {
            references.push({
              refUrl: desktopImg,
              usage: {
                type: 'banner',
                name: 'Banner Hero Desktop',
                detail: 'Banner chính trang chủ (Desktop)'
              }
            });
          }
        }
        if (data.tablet && typeof data.tablet === 'object') {
          const tabletImg = data.tablet.hero_image || data.tablet.image || data.tablet.image_url;
          if (tabletImg) {
            references.push({
              refUrl: tabletImg,
              usage: {
                type: 'banner',
                name: 'Banner Hero Tablet',
                detail: 'Banner chính trang chủ (Tablet)'
              }
            });
          }
        }
        if (data.mobile && typeof data.mobile === 'object') {
          const mobileImg = data.mobile.hero_image || data.mobile.image || data.mobile.image_url;
          if (mobileImg) {
            references.push({
              refUrl: mobileImg,
              usage: {
                type: 'banner',
                name: 'Banner Hero Mobile',
                detail: 'Banner chính trang chủ (Mobile)'
              }
            });
          }
        }

        // Backward compatibility & root fallback
        if (data.hero_image) {
          references.push({
            refUrl: data.hero_image,
            usage: {
              type: 'banner',
              name: 'Banner Hero Trang Chủ',
              detail: 'Banner chính trang chủ'
            }
          });
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
        if (Array.isArray(data.slides)) {
          for (const s of data.slides) {
            const slideImg = s?.image || s?.image_url || s?.url;
            if (slideImg) {
              references.push({
                refUrl: slideImg,
                usage: {
                  type: 'banner',
                  name: s?.title || 'Hero Slide',
                  detail: 'Slide banner trang chủ'
                }
              });
            }
          }
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
      } else if (row.key_name === 'footer_config' && typeof data === 'object') {
        if (data.logo_url) {
          references.push({
            refUrl: data.logo_url,
            usage: {
              type: 'settings',
              name: 'Logo Chân Trang (Footer)',
              detail: 'Cấu hình giao diện'
            }
          });
        }
        if (data.qr_code) {
          references.push({
            refUrl: data.qr_code,
            usage: {
              type: 'settings',
              name: 'Mã QR Chân Trang',
              detail: 'Cấu hình giao diện'
            }
          });
        }
      } else if (row.key_name === 'conversion_config' && typeof data === 'object') {
        if (data.zalo_qr || data.qr_image) {
          references.push({
            refUrl: data.zalo_qr || data.qr_image,
            usage: {
              type: 'settings',
              name: 'QR Zalo Tư Vấn',
              detail: 'Cấu hình chuyển đổi'
            }
          });
        }
      }

      // Safety scanner for any other image URLs within settings
      const scanUrls = (val: any) => {
        if (!val) return;
        if (typeof val === 'string') {
          const str = val.trim();
          if (
            (str.startsWith('/uploads/') || str.startsWith('http://') || str.startsWith('https://')) &&
            /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(str)
          ) {
            if (!references.some(r => r.refUrl === str)) {
              references.push({
                refUrl: str,
                usage: {
                  type: 'settings',
                  name: `Cấu hình ${row.key_name}`,
                  detail: 'Cài đặt hệ thống'
                }
              });
            }
          }
          return;
        }
        if (Array.isArray(val)) {
          for (const item of val) scanUrls(item);
          return;
        }
        if (typeof val === 'object') {
          for (const k of Object.keys(val)) scanUrls(val[k]);
        }
      };
      scanUrls(data);
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
