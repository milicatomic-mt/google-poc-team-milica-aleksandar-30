import { useState, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';

interface UseWebCreativeCaptureProps {
  campaignResults: any;
  imageMapping?: any;
  uploadedImage?: string;
}

export const useWebCreativeCapture = ({ campaignResults, imageMapping, uploadedImage }: UseWebCreativeCaptureProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const captureWebCreative = useCallback(async () => {
    if (!elementRef.current || !campaignResults) return null;

    setIsCapturing(true);
    setError(null);

    try {
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dataUrl = await toPng(elementRef.current, {
        quality: 0.92,
        pixelRatio: window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio || 1,
        width: 1200,
        height: 800,
        backgroundColor: '#ffffff',
        cacheBust: true,
        // Attempt to load cross-origin images with CORS
        // @ts-ignore - supported by html-to-image
        useCORS: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });

      setCapturedImage(dataUrl);
      return dataUrl;
    } catch (err) {
      console.error('Error capturing web creative:', err);
      setError('Failed to capture preview');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [campaignResults, imageMapping, uploadedImage]);

  return {
    capturedImage,
    isCapturing,
    error,
    elementRef,
    captureWebCreative
  };
};