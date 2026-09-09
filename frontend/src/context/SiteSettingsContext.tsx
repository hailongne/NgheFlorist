import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface SiteSettings {
  site_name: string;
  hotline: string;
  email: string;
  address: string;
  business_hours: string;
  currency: string;
  announcement: string;
}

export interface ConversionConfig {
  zalo_url: string;
  fanpage_url: string; // Used for Hotline/Zalo 2
  primary_channel: string;
  primary_cta_text: string;
  secondary_cta_text: string;
  request_message_template: string;
}

export interface SiteSettingsContextValue {
  settings: SiteSettings;
  conversion: ConversionConfig;
  hotline1: string;
  hotline2: string;
  zaloUrl1: string;
  zaloUrl2: string;
  ctaText1: string;
  ctaText2: string;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

// Helpers
export function normalizeZaloUrl(url?: string, defaultPhone = '0987654321'): string {
  if (!url) return `https://zalo.me/${defaultPhone}`;
  let clean = url.trim();
  // Fix missing 'h' in 'ttps://'
  if (clean.startsWith('ttps://')) {
    clean = 'h' + clean;
  }
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    if (clean.includes('zalo.me')) {
      clean = 'https://' + clean;
    } else {
      const digits = clean.replace(/\D/g, '');
      clean = `https://zalo.me/${digits || defaultPhone}`;
    }
  }
  return clean;
}

export function extractPhoneFromZalo(url?: string, fallback = ''): string {
  if (!url) return fallback;
  const match = url.match(/(?:zalo\.me\/|\b)(0\d{9,10})\b/);
  if (match) {
    const raw = match[1];
    if (raw.length === 10) {
      return `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
    }
    if (raw.length === 11) {
      return `${raw.slice(0, 5)} ${raw.slice(5, 8)} ${raw.slice(8)}`;
    }
    return raw;
  }
  const digits = url.replace(/\D/g, '');
  if (digits.length >= 10) {
    const d = digits.slice(-10);
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return fallback || url;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'Nghệ Florist',
  hotline: '0862926866',
  email: 'ngheflorist.com@gmail.com',
  address: '22 ngõ 115 Phố Núi Trúc, Ba Đình, Hà Nội',
  business_hours: '07:30 - 21:30 hàng ngày',
  currency: 'VND',
  announcement: ''
};

const DEFAULT_CONVERSION: ConversionConfig = {
  zalo_url: 'https://zalo.me/0862926866',
  fanpage_url: 'https://zalo.me/0329806866',
  primary_channel: 'zalo',
  primary_cta_text: 'Tư vấn qua Zalo',
  secondary_cta_text: 'Tư vấn qua Zalo',
  request_message_template: ''
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  conversion: DEFAULT_CONVERSION,
  hotline1: '0862 926 866',
  hotline2: '0329 806 866',
  zaloUrl1: 'https://zalo.me/0862926866',
  zaloUrl2: 'https://zalo.me/0329806866',
  ctaText1: 'Tư vấn qua Zalo',
  ctaText2: 'Tư vấn qua Zalo',
  loading: false,
  refreshSettings: async () => {}
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [conversion, setConversion] = useState<ConversionConfig>(DEFAULT_CONVERSION);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/content/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.siteSettings && Object.keys(data.siteSettings).length > 0) {
          setSettings(prev => ({ ...prev, ...data.siteSettings }));
        }
        if (data.conversionConfig && Object.keys(data.conversionConfig).length > 0) {
          setConversion(prev => ({ ...prev, ...data.conversionConfig }));
        }
      }
    } catch (err) {
      console.error('Failed to load site settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const handleUpdated = () => {
      fetchSettings();
    };

    window.addEventListener('site_settings_updated', handleUpdated);
    return () => {
      window.removeEventListener('site_settings_updated', handleUpdated);
    };
  }, [fetchSettings]);

  const zaloUrl1 = normalizeZaloUrl(conversion.zalo_url, '0862926866');
  const zaloUrl2 = normalizeZaloUrl(conversion.fanpage_url, '0329806866');
  const hotline1 = extractPhoneFromZalo(conversion.zalo_url, settings.hotline || '0862 926 866');
  const hotline2 = extractPhoneFromZalo(conversion.fanpage_url, '0329 806 866');
  const ctaText1 = conversion.primary_cta_text || 'Tư vấn qua Zalo';
  const ctaText2 = conversion.secondary_cta_text || 'Tư vấn qua Zalo';

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        conversion,
        hotline1,
        hotline2,
        zaloUrl1,
        zaloUrl2,
        ctaText1,
        ctaText2,
        loading,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
