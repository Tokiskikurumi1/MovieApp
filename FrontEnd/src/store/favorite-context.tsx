import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserAPI } from '@/services/API';

export interface FavoriteMovie {
  id: string;
  numericId?: number;
  title: string;
  rating: string;
  quality: string;
  year: string;
  type: string;
  genres: string;
  duration: string;
  image: string;
  [key: string]: any;
}

interface FavoriteContextType {
  favorites: FavoriteMovie[];
  isLoading: boolean;
  isFavorite: (idOrSlug: string | number | undefined | null) => boolean;
  toggleFavorite: (movieOrId: any) => Promise<boolean>;
  removeFavorite: (idOrSlug: string | number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

const extractKeys = (item: any): string[] => {
  if (!item) return [];
  if (typeof item === 'string' || typeof item === 'number') {
    return [String(item).toLowerCase().trim()];
  }
  const keys: string[] = [];
  if (item.id !== undefined && item.id !== null) keys.push(String(item.id).toLowerCase().trim());
  if (item.numericId !== undefined && item.numericId !== null) keys.push(String(item.numericId).toLowerCase().trim());
  if (item.slug !== undefined && item.slug !== null) keys.push(String(item.slug).toLowerCase().trim());
  return Array.from(new Set(keys));
};

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Tải danh sách phim yêu thích thực từ MySQL Backend
  const refreshFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await UserAPI.getFavorites();
      if (res.success && Array.isArray(res.data)) {
        setFavorites(res.data);
        const newSet = new Set<string>();
        res.data.forEach((m: any) => {
          extractKeys(m).forEach((k) => newSet.add(k));
        });
        setFavoriteIds(newSet);
      } else {
        setFavorites([]);
        setFavoriteIds(new Set());
      }
    } catch (error) {
      console.warn('Lỗi nạp danh sách yêu thích:', error);
      setFavorites([]);
      setFavoriteIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // 2. Kiểm tra xem một ID / Slug hoặc phim đã được yêu thích chưa
  const isFavorite = useCallback(
    (idOrSlug: string | number | undefined | null): boolean => {
      if (idOrSlug === undefined || idOrSlug === null) return false;
      const key = String(idOrSlug).toLowerCase().trim();
      return favoriteIds.has(key);
    },
    [favoriteIds]
  );

  // 3. Toggle Yêu thích với Optimistic Update tức thời trên mọi màn hình
  const toggleFavorite = useCallback(
    async (movieOrId: any): Promise<boolean> => {
      const keys = extractKeys(movieOrId);
      if (keys.length === 0) return false;

      const wasFavorite = keys.some((k) => favoriteIds.has(k));
      const nowFavorite = !wasFavorite;

      // Optimistic update Set IDs
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (nowFavorite) {
          keys.forEach((k) => next.add(k));
        } else {
          keys.forEach((k) => next.delete(k));
        }
        return next;
      });

      // Optimistic update Favorites List
      setFavorites((prev) => {
        if (!nowFavorite) {
          return prev.filter((m) => {
            const mKeys = extractKeys(m);
            return !mKeys.some((k) => keys.includes(k));
          });
        } else {
          const isObject = typeof movieOrId === 'object' && movieOrId !== null;
          if (isObject) {
            const newFav: FavoriteMovie = {
              id: String(movieOrId.slug || movieOrId.id),
              numericId:
                movieOrId.numericId ||
                (typeof movieOrId.id === 'number' ? movieOrId.id : undefined),
              title: movieOrId.title || movieOrId.name || 'Phim yêu thích',
              rating: String(movieOrId.rating || '8.8'),
              quality: movieOrId.quality || '4K HDR',
              year: String(movieOrId.year || '2024'),
              type: movieOrId.type === 'series' ? 'series' : 'movies',
              genres: Array.isArray(movieOrId.genres)
                ? movieOrId.genres.join(' • ')
                : movieOrId.genres || 'Phim hay',
              duration: movieOrId.duration || movieOrId.time || '120 phút',
              image:
                movieOrId.image ||
                movieOrId.poster ||
                movieOrId.thumb_url ||
                movieOrId.poster_url ||
                '',
            };
            return [newFav, ...prev];
          }
          return prev;
        }
      });

      // Đồng bộ với MySQL Backend
      const targetIdOrSlug = keys[0];
      try {
        await UserAPI.toggleFavorite(targetIdOrSlug);
        // Tải lại để đồng bộ chính xác dữ liệu từ server
        const res = await UserAPI.getFavorites();
        if (res.success && Array.isArray(res.data)) {
          setFavorites(res.data);
          const newSet = new Set<string>();
          res.data.forEach((m: any) => {
            extractKeys(m).forEach((k) => newSet.add(k));
          });
          setFavoriteIds(newSet);
        }
      } catch (error) {
        console.warn('Lỗi gọi API toggleFavorite:', error);
        refreshFavorites();
      }

      return nowFavorite;
    },
    [favoriteIds, refreshFavorites]
  );

  const removeFavorite = useCallback(
    async (idOrSlug: string | number) => {
      await toggleFavorite(idOrSlug);
    },
    [toggleFavorite]
  );

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        isLoading,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = (): FavoriteContextType => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
