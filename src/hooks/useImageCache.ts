import { useState, useEffect } from 'react';

interface ImageCache {
  [url: string]: {
    blob: Blob;
    objectUrl: string;
    timestamp: number;
  };
}

const imageCache: ImageCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useImageCache = () => {
  const preloadImages = async (urls: string[]) => {
    const promises = urls.map(async (url) => {
      if (imageCache[url]) {
        // Check if cache is still valid
        const cacheEntry = imageCache[url];
        if (Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
          return cacheEntry.objectUrl;
        } else {
          // Clean up expired cache
          URL.revokeObjectURL(cacheEntry.objectUrl);
          delete imageCache[url];
        }
      }

      try {
        const response = await fetch(url, {
          headers: {
            'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          },
        });
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        imageCache[url] = {
          blob,
          objectUrl,
          timestamp: Date.now(),
        };
        
        return objectUrl;
      } catch (error) {
        console.warn(`Failed to cache image: ${url}`, error);
        return url; // Fallback to original URL
      }
    });

    return Promise.all(promises);
  };

  const getCachedImageUrl = (url: string): string => {
    const cacheEntry = imageCache[url];
    if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
      return cacheEntry.objectUrl;
    }
    return url;
  };

  const clearExpiredCache = () => {
    const now = Date.now();
    Object.entries(imageCache).forEach(([url, entry]) => {
      if (now - entry.timestamp > CACHE_DURATION) {
        URL.revokeObjectURL(entry.objectUrl);
        delete imageCache[url];
      }
    });
  };

  // Clean up expired cache periodically
  useEffect(() => {
    const interval = setInterval(clearExpiredCache, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return {
    preloadImages,
    getCachedImageUrl,
    clearExpiredCache,
  };
};

export default useImageCache;