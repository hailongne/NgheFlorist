import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

export default function IosWishlistModal() {
  const { showIosAlert, setShowIosAlert } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  if (!showIosAlert) return null;

  const handleLoginRedirect = () => {
    setShowIosAlert(false);
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?redirect=${redirectUrl}`);
  };

  const handleClose = () => {
    setShowIosAlert(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'iosBackdropFadeIn 0.2s ease-out'
      }}
      onClick={handleClose}
    >
      <style>{`
        @keyframes iosBackdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes iosAlertScaleIn {
          0% {
            opacity: 0;
            transform: scale(1.12);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .ios-alert-btn:active {
          background-color: rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>

      {/* iOS Dialog Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 290,
          backgroundColor: 'rgba(248, 248, 248, 0.92)',
          backdropFilter: 'blur(30px) saturate(190%)',
          WebkitBackdropFilter: 'blur(30px) saturate(190%)',
          borderRadius: 18,
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.3), 0 0 0 0.5px rgba(255, 255, 255, 0.35) inset',
          overflow: 'hidden',
          animation: 'iosAlertScaleIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.15)',
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif'
        }}
      >
        {/* Content Container */}
        <div style={{ padding: '22px 18px 18px 18px' }}>
          {/* iOS-styled App/Feature Icon */}
          <div
            style={{
              width: 54,
              height: 54,
              margin: '0 auto 14px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #FF453A 0%, #FF2D55 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 26,
              boxShadow: '0 8px 18px rgba(255, 45, 85, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '1.06rem',
              fontWeight: 700,
              color: '#000000',
              letterSpacing: -0.4,
              lineHeight: 1.3,
              marginBottom: 8
            }}
          >
            Bộ sưu tập yêu thích
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '0.84rem',
              fontWeight: 400,
              color: '#3C3C43',
              lineHeight: 1.4,
              letterSpacing: -0.15,
              opacity: 0.95
            }}
          >
            Vui lòng đăng nhập để lưu và quản lý album những mẫu hoa bạn yêu thích nhất trên Nghệ Florist.
          </div>
        </div>

        {/* iOS Hairline Separator */}
        <div
          style={{
            height: 0.5,
            backgroundColor: 'rgba(60, 60, 67, 0.29)',
            width: '100%'
          }}
        />

        {/* Action Buttons Row */}
        <div
          style={{
            display: 'flex',
            height: 46,
            position: 'relative'
          }}
        >
          {/* Cancel Button */}
          <button
            onClick={handleClose}
            className="ios-alert-btn"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '1.02rem',
              fontWeight: 400,
              color: '#8E8E93',
              letterSpacing: -0.3,
              fontFamily: 'inherit',
              transition: 'background-color 0.15s'
            }}
          >
            Để sau
          </button>

          {/* Vertical Divider */}
          <div
            style={{
              width: 0.5,
              backgroundColor: 'rgba(60, 60, 67, 0.29)',
              height: '100%'
            }}
          />

          {/* Sign In Button */}
          <button
            onClick={handleLoginRedirect}
            className="ios-alert-btn"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '1.02rem',
              fontWeight: 600,
              color: '#007AFF',
              letterSpacing: -0.3,
              fontFamily: 'inherit',
              transition: 'background-color 0.15s'
            }}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
