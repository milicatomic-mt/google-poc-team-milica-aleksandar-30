import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  priority = false,
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Cache management
  useEffect(() => {
    if (isInView && src) {
      // Preload the image
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsLoaded(true);
        onLoad?.();
      };
      img.onerror = () => {
        setIsError(true);
        onError?.();
      };
    }
  }, [isInView, src, onLoad, onError]);

  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={cn("bg-muted animate-pulse", className)}
        aria-label={alt}
      />
    );
  }

  if (isError) {
    return (
      <div className={cn("bg-muted flex items-center justify-center text-muted-foreground text-sm", className)}>
        Failed to load
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div className={cn(
          "absolute inset-0 bg-muted animate-pulse",
          placeholder && "bg-gradient-to-r from-muted to-muted/50"
        )} />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={{
          // Add cache control for better performance
        }}
      />
    </div>
  );
};