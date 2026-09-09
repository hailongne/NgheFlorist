import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role_id: number;
  role_name: string;
  permissions: string[];
}

interface AdminAuthContextType {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nghe_admin_token'));
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('nghe_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate session on mount
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Strictly allow only the 1 single admin account (admin@ngheflorist.vn)
          if (data.user?.role_name !== 'admin' || data.user?.email !== 'admin@ngheflorist.vn' || data.user?.id !== 1) {
            logout();
            return;
          }
          setUser(data.user);
          localStorage.setItem('nghe_admin_user', JSON.stringify(data.user));
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Session verify error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const login = (newToken: string, newUser: AdminUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('nghe_admin_token', newToken);
    localStorage.setItem('nghe_admin_user', JSON.stringify(newUser));
    localStorage.setItem('nghe_customer_token', newToken);
    localStorage.setItem('nghe_customer_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nghe_admin_token');
    localStorage.removeItem('nghe_admin_user');
    localStorage.removeItem('nghe_customer_token');
    localStorage.removeItem('nghe_customer_user');
  };

  const hasPermission = (perm: string) => {
    if (!user) return false;
    if (user.role_name === 'admin') return true;
    return user.permissions?.includes(perm) || false;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        hasPermission
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
