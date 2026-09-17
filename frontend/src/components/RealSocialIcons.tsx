import React from 'react';

export const RealZaloIcon = ({ size = 28, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      flexShrink: 0,
      borderRadius: size > 24 ? 6 : 4,
      overflow: 'hidden',
      display: 'inline-block',
      verticalAlign: 'middle',
      ...style
    }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.782 0.166H27.199C33.265 0.166 36.81 1.057 39.957 2.744C43.104 4.431 45.587 6.896 47.256 10.043C48.943 13.19 49.834 16.735 49.834 22.801V27.199C49.834 33.265 48.943 36.81 47.256 39.957C45.568 43.104 43.104 45.588 39.957 47.256C36.81 48.943 33.265 49.834 27.199 49.834H22.801C16.735 49.834 13.19 48.943 10.043 47.256C6.896 45.569 4.412 43.104 2.744 39.957C1.057 36.81 0.166 33.265 0.166 27.199V22.801C0.166 16.735 1.057 13.19 2.744 10.043C4.431 6.896 6.896 4.412 10.043 2.744C13.171 1.057 16.735 0.166 22.782 0.166Z"
      fill="#0068FF"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.779 43.589C10.102 43.846 13.006 43.184 15.068 42.183C24.022 47.132 38.02 46.895 46.492 41.473C46.821 40.98 47.128 40.468 47.413 39.936C49.106 36.778 50 33.22 50 27.132V22.718C50 16.629 49.106 13.071 47.413 9.913C45.738 6.754 43.246 4.281 40.088 2.588C36.929 0.894 33.371 0 27.283 0H22.85C17.664 0 14.298 0.653 11.47 1.899C11.315 2.037 11.164 2.178 11.015 2.321C2.717 10.32 2.087 27.659 9.123 37.078C9.131 37.092 9.139 37.106 9.149 37.12C10.233 38.718 9.187 41.515 7.551 43.152C7.284 43.399 7.379 43.551 7.779 43.589Z"
      fill="white"
    />
    <path
      d="M20.563 17H10.838V19.085H17.587L10.933 27.332C10.724 27.635 10.573 27.919 10.573 28.564V29.095H19.748C20.203 29.095 20.582 28.716 20.582 28.261V27.142H13.492L19.748 19.294C19.843 19.18 20.013 18.972 20.089 18.877L20.127 18.82C20.487 18.289 20.563 17.834 20.563 17.284V17Z"
      fill="#0068FF"
    />
    <path d="M32.942 29.095H34.326V17H32.24V28.393C32.24 28.772 32.544 29.095 32.942 29.095Z" fill="#0068FF" />
    <path
      d="M25.814 19.692C23.198 19.692 21.075 21.816 21.075 24.432C21.075 27.048 23.198 29.171 25.814 29.171C28.43 29.171 30.553 27.048 30.553 24.432C30.572 21.816 28.449 19.692 25.814 19.692ZM25.814 27.218C24.278 27.218 23.027 25.967 23.027 24.432C23.027 22.896 24.278 21.645 25.814 21.645C27.35 21.645 28.601 22.896 28.601 24.432C28.601 25.967 27.368 27.218 25.814 27.218Z"
      fill="#0068FF"
    />
    <path
      d="M40.487 19.616C37.852 19.616 35.71 21.758 35.71 24.393C35.71 27.028 37.852 29.171 40.487 29.171C43.122 29.171 45.264 27.028 45.264 24.393C45.264 21.758 43.122 19.616 40.487 19.616ZM40.487 27.218C38.932 27.218 37.681 25.967 37.681 24.412C37.681 22.858 38.932 21.607 40.487 21.607C42.041 21.607 43.292 22.858 43.292 24.412C43.292 25.967 42.041 27.218 40.487 27.218Z"
      fill="#0068FF"
    />
    <path d="M29.456 29.094H30.575V19.957H28.622V28.279C28.622 28.715 29.001 29.094 29.456 29.094Z" fill="#0068FF" />
  </svg>
);

export const RealFacebookIcon = ({ size = 28, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      flexShrink: 0,
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'inline-block',
      verticalAlign: 'middle',
      ...style
    }}
  >
    <circle cx="24" cy="24" r="24" fill="#1877F2" />
    <path
      d="M33.5 24H27.5V38H21.5V24H18.5V19H21.5V15.5C21.5 12.5 23.3 10.5 27 10.5C28.7 10.5 29.8 10.7 29.8 10.7V14.3H27.9C26.4 14.3 26 15.1 26 16.2V19H33.1L33.5 24Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const RealInstagramIcon = ({ size = 28, style }: { size?: number; style?: React.CSSProperties }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        flexShrink: 0,
        borderRadius: size > 24 ? 7 : 5,
        overflow: 'hidden',
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style
      }}
    >
      <defs>
        <radialGradient id="ig-rg1" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="5.5" fill="url(#ig-rg1)" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 7C9.238 7 7 9.238 7 12C7 14.762 9.238 17 12 17C14.762 17 17 14.762 17 12C17 9.238 14.762 7 12 7ZM12 8.625C13.864 8.625 15.375 10.136 15.375 12C15.375 13.864 13.864 15.375 12 15.375C10.136 15.375 8.625 13.864 8.625 12C8.625 10.136 10.136 8.625 12 8.625Z"
        fill="white"
      />
      <circle cx="15.8" cy="8.2" r="0.9" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 12C4 7.582 7.582 4 12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20C7.582 20 4 16.418 4 12ZM12 5.5C8.41 5.5 5.5 8.41 5.5 12C5.5 15.59 8.41 18.5 12 18.5C15.59 18.5 18.5 15.59 18.5 12C18.5 8.41 15.59 5.5 12 5.5Z"
        fill="white"
      />
    </svg>
  );
};

export const RealPhoneIcon = ({
  size = 28,
  bgColor,
  iconColor = '#FFFFFF',
  style
}: {
  size?: number;
  bgColor?: string;
  iconColor?: string;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size > 24 ? 8 : 6,
      background: bgColor || 'var(--color-primary-dark, #5D9EAF)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: iconColor,
      flexShrink: 0,
      ...style
    }}
  >
    <svg width={Math.round(size * 0.54)} height={Math.round(size * 0.54)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
    </svg>
  </div>
);

export const RealSocialIcon = ({
  platform,
  size = 28,
  phoneBgColor,
  style
}: {
  platform: 'zalo' | 'facebook' | 'instagram' | 'phone' | string;
  size?: number;
  phoneBgColor?: string;
  style?: React.CSSProperties;
}) => {
  switch (platform) {
    case 'zalo':
      return <RealZaloIcon size={size} style={style} />;
    case 'facebook':
      return <RealFacebookIcon size={size} style={style} />;
    case 'instagram':
      return <RealInstagramIcon size={size} style={style} />;
    case 'phone':
      return <RealPhoneIcon size={size} bgColor={phoneBgColor} style={style} />;
    default:
      return <RealZaloIcon size={size} style={style} />;
  }
};
