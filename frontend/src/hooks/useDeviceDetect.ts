import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  width: number;
}

/**
 * Custom hook to detect current device view based on viewport width:
 * - Mobile: < 768px (Vertical aspect ratio 4:5 / 1:1)
 * - Tablet: 768px - 1024px (Balanced aspect ratio 4:3 / 1:1)
 * - Desktop: > 1024px (Widescreen landscape 16:9)
 */
export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        width: 1200
      };
    }

    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width <= 1024;
    const isDesktop = width > 1024;
    const deviceType: DeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    return { isMobile, isTablet, isDesktop, deviceType, width };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: any = null;
    const handleResize = () => {
      // Debounce slightly to minimize layout thrashing
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const isMobile = width < 768;
        const isTablet = width >= 768 && width <= 1024;
        const isDesktop = width > 1024;
        const deviceType: DeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

        setDeviceInfo(prev => {
          if (prev.deviceType === deviceType && prev.width === width) return prev;
          return { isMobile, isTablet, isDesktop, deviceType, width };
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceInfo;
}

export default useDeviceDetect;
