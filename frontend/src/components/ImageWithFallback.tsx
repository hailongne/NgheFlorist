import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const DEFAULT_LOGO_FALLBACK = '/images/logoNgheFlorist-brand-blue.png?v=2';

// Fallback images default to the official Nghệ Florist logo
export const BOTANICAL_FALLBACKS = [
  DEFAULT_LOGO_FALLBACK
];

export const getFallbackForId = (_id?: number | string): string => {
  return DEFAULT_LOGO_FALLBACK;
};

export default function ImageWithFallback({
  src,
  alt = 'Nghệ Florist',
  fallbackSrc = DEFAULT_LOGO_FALLBACK,
  className,
  style,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(!src);
  const fallback = fallbackSrc || DEFAULT_LOGO_FALLBACK;

  React.useEffect(() => {
    setHasError(!src);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  const isUsingFallback = hasError || !src;
  const imageSource = isUsingFallback ? fallback : src;

  return (
    <img
      src={imageSource}
      alt={alt}
      onError={handleError}
      loading="lazy"
      className={className}
      style={{
        ...style,
        ...(isUsingFallback && !style?.objectFit ? { objectFit: 'contain', background: '#F8FAFB', padding: '16px' } : {})
      }}
      {...props}
    />
  );
}
