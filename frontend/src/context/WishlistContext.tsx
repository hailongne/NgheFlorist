import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface WishlistContextType {
  wishlist: number[];
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => boolean;
  wishlistCount: number;
  showIosAlert: boolean;
  setShowIosAlert: (show: boolean) => void;
  isLoggedIn: boolean;
  refreshWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WISHLIST_CHANGE_EVENT = 'nghe_wishlist_updated';
export const AUTH_CHANGE_EVENT = 'nghe_auth_changed';

/**
 * Dispatch event to notify all components and WishlistContext that auth state has changed
 */
export const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
  }
};

// Helper to check if user (customer or admin) is logged in
export const checkAuthStatus = (): boolean => {
  try {
    const customerToken = localStorage.getItem('nghe_customer_token');
    const customerUser = localStorage.getItem('nghe_customer_user');
    if (customerToken || customerUser) return true;

    const adminToken = localStorage.getItem('nghe_admin_token');
    const adminUser = localStorage.getItem('nghe_admin_user');
    if (adminToken || adminUser) return true;
  } catch {}
  return false;
};

// Helper to get unique user storage key for wishlist isolation
export const getWishlistStorageKey = (): string | null => {
  try {
    const customerUserStr = localStorage.getItem('nghe_customer_user');
    if (customerUserStr) {
      const u = JSON.parse(customerUserStr);
      const keyId = u.id || u.phone || u.email || 'customer';
      return `nghe_wishlist_user_${keyId}`;
    }

    const adminUserStr = localStorage.getItem('nghe_admin_user');
    if (adminUserStr) {
      const a = JSON.parse(adminUserStr);
      const keyId = a.id || a.username || a.email || 'admin';
      return `nghe_wishlist_admin_${keyId}`;
    }

    if (checkAuthStatus()) {
      return 'nghe_wishlist_auth_default';
    }
  } catch {}
  return null;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => checkAuthStatus());

  // Load wishlist ONLY if user is currently authenticated
  const loadUserWishlist = useCallback((): number[] => {
    if (!checkAuthStatus()) return [];
    const storageKey = getWishlistStorageKey();
    if (!storageKey) return [];

    try {
      let saved = localStorage.getItem(storageKey);
      // Migrate legacy storage if user key not initialized yet
      if (!saved) {
        const legacy = localStorage.getItem('nghe_wishlist');
        if (legacy) {
          localStorage.setItem(storageKey, legacy);
          saved = legacy;
        }
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {}
    return [];
  }, []);

  const [wishlist, setWishlist] = useState<number[]>(() => loadUserWishlist());
  const [showIosAlert, setShowIosAlert] = useState(false);

  const syncState = useCallback(() => {
    const currentAuth = checkAuthStatus();
    setIsLoggedIn(currentAuth);
    if (!currentAuth) {
      // Logged out: strictly clear active wishlist so all hearts reset to un-hearted default
      setWishlist([]);
    } else {
      setWishlist(loadUserWishlist());
    }
  }, [loadUserWishlist]);

  useEffect(() => {
    syncState();

    window.addEventListener('storage', syncState);
    window.addEventListener(AUTH_CHANGE_EVENT, syncState);
    window.addEventListener(WISHLIST_CHANGE_EVENT, syncState);
    window.addEventListener('focus', syncState);

    return () => {
      window.removeEventListener('storage', syncState);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncState);
      window.removeEventListener(WISHLIST_CHANGE_EVENT, syncState);
      window.removeEventListener('focus', syncState);
    };
  }, [syncState]);

  // When logged out, ALWAYS return false (un-hearted default)
  const isWishlisted = useCallback((productId: number): boolean => {
    if (!checkAuthStatus()) return false;
    return wishlist.includes(productId);
  }, [wishlist]);

  const toggleWishlist = useCallback((productId: number): boolean => {
    const currentAuth = checkAuthStatus();
    setIsLoggedIn(currentAuth);

    if (!currentAuth) {
      // Guest or logged out: open iPhone iOS Login Alert dialog
      setShowIosAlert(true);
      return false;
    }

    const storageKey = getWishlistStorageKey() || 'nghe_wishlist_auth_default';

    let updatedList: number[] = [];
    setWishlist(prev => {
      if (prev.includes(productId)) {
        updatedList = prev.filter(id => id !== productId);
      } else {
        updatedList = [...prev, productId];
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
        // Keep legacy sync for fallback
        localStorage.setItem('nghe_wishlist', JSON.stringify(updatedList));
        window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
      } catch (err) {
        console.warn('Could not save wishlist to localStorage', err);
      }
      return updatedList;
    });

    return true;
  }, []);

  const activeWishlistCount = useMemo(() => {
    return isLoggedIn ? wishlist.length : 0;
  }, [isLoggedIn, wishlist.length]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist: isLoggedIn ? wishlist : [],
        isWishlisted,
        toggleWishlist,
        wishlistCount: activeWishlistCount,
        showIosAlert,
        setShowIosAlert,
        isLoggedIn,
        refreshWishlist: syncState
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
