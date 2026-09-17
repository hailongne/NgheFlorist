import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

const WISHLIST_STORAGE_KEY = 'nghe_wishlist';
const WISHLIST_CHANGE_EVENT = 'nghe_wishlist_updated';

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

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {}
    return [];
  });

  const [showIosAlert, setShowIosAlert] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => checkAuthStatus());

  // Check auth periodically or on window focus
  const syncAuthState = useCallback(() => {
    setIsLoggedIn(checkAuthStatus());
  }, []);

  const refreshWishlist = useCallback(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setWishlist(Array.isArray(parsed) ? parsed : []);
      } else {
        setWishlist([]);
      }
    } catch {
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    syncAuthState();
    window.addEventListener('storage', () => {
      syncAuthState();
      refreshWishlist();
    });
    window.addEventListener(WISHLIST_CHANGE_EVENT, refreshWishlist);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener(WISHLIST_CHANGE_EVENT, refreshWishlist);
    };
  }, [syncAuthState, refreshWishlist]);

  const isWishlisted = useCallback((productId: number) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const toggleWishlist = useCallback((productId: number): boolean => {
    const currentAuth = checkAuthStatus();
    setIsLoggedIn(currentAuth);

    if (!currentAuth) {
      // User or admin is not logged in: display iPhone iOS Alert
      setShowIosAlert(true);
      return false;
    }

    // User is logged in: toggle product in wishlist
    let updatedList: number[] = [];
    setWishlist(prev => {
      if (prev.includes(productId)) {
        updatedList = prev.filter(id => id !== productId);
      } else {
        updatedList = [...prev, productId];
      }
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updatedList));
        window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
      } catch (err) {
        console.warn('Could not save wishlist to localStorage', err);
      }
      return updatedList;
    });

    return true;
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlisted,
        toggleWishlist,
        wishlistCount: wishlist.length,
        showIosAlert,
        setShowIosAlert,
        isLoggedIn,
        refreshWishlist
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
