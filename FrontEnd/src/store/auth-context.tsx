import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthAPI, setAuthToken } from '@/services/API';
import { getValidAvatarUri, DEFAULT_AVATAR_URI } from '@/constants/avatar';

export interface UserProfileData {
  id?: number | string;
  fullName?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  role?: string;
  vipTier?: string;
  vip_tier?: string;
  is_vip?: boolean;
  vipExpiry?: string;
  vip_expires_at?: string;
  totalWatchedHours?: number;
}

interface AuthContextType {
  user: UserProfileData | null;
  avatarUri: string;
  setUser: React.Dispatch<React.SetStateAction<UserProfileData | null>>;
  login: (userData: UserProfileData, token?: string) => void;
  updateAvatar: (newAvatarUri: string) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  avatarUri: DEFAULT_AVATAR_URI,
  setUser: () => {},
  login: () => {},
  updateAvatar: () => {},
  refreshUser: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileData | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await AuthAPI.getMe();
      if (res && res.success && res.data) {
        setUser(res.data);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback((userData: UserProfileData, token?: string) => {
    if (token) {
      setAuthToken(token);
    }
    setUser(userData);
  }, []);

  const updateAvatar = useCallback((newAvatarUri: string) => {
    setUser((prev) => (prev ? { ...prev, avatar: newAvatarUri, avatar_url: newAvatarUri } : prev));
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const rawAvatar = user?.avatar || user?.avatar_url;
  const avatarUri = getValidAvatarUri(rawAvatar);

  return (
    <AuthContext.Provider
      value={{
        user,
        avatarUri,
        setUser,
        login,
        updateAvatar,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
