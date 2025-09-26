import React, { useEffect } from 'react';
import { useWebCreativeCapture } from '@/hooks/useWebCreativeCapture';
import { WebCreativePreviewShared } from '@/components/shared/WebCreativePreviewShared';
import { Skeleton } from '@/components/ui/skeleton';

interface WebCreativeCapturePreviewProps {
  campaignResults: any;
  imageMapping?: any;
  uploadedImage?: string;
  className?: string;
}

export const WebCreativeCapturePreview: React.FC<WebCreativeCapturePreviewProps> = ({
  campaignResults,
  imageMapping,
  uploadedImage,
  className = ""
}) => {
  const { capturedImage, isCapturing, error, elementRef, captureWebCreative } = useWebCreativeCapture({
    campaignResults,
    imageMapping,
    uploadedImage
  });

  useEffect(() => {
    if (campaignResults && !capturedImage && !isCapturing) {
      // Small delay to ensure all data is ready
      const timer = setTimeout(() => {
        captureWebCreative();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [campaignResults, capturedImage, isCapturing, captureWebCreative]);

  if (error) {
    // Fallback to the existing mockup on error
    return (
      <div className="h-80 bg-gray-100 overflow-hidden border border-gray-300 shadow-sm" style={{borderRadius: '1px'}}>
        <div className="h-full bg-white">
          {/* Browser Header */}
          <div className="bg-gray-200 px-2 py-1 flex items-center gap-1 border-b">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white mx-2 rounded px-2 py-0.5">
              <div className="text-[6px] text-gray-500">https://yoursite.com</div>
            </div>
          </div>
          <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-sm">
            Preview unavailable
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Off-screen element for capturing */}
      <div 
        ref={elementRef}
        className="absolute top-[-9999px] left-[-9999px] w-[1200px] bg-white"
        style={{ height: 'auto' }}
      >
        {campaignResults && (
          <WebCreativePreviewShared 
            campaignResults={campaignResults}
            imageMapping={imageMapping}
            uploadedImage={uploadedImage}
            variant="full"
          />
        )}
      </div>

      {/* Preview container */}
      <div className={`h-80 bg-gray-100 overflow-hidden border border-gray-300 shadow-sm ${className}`} style={{borderRadius: '1px'}}>
        <div className="h-full bg-white">
          {/* Browser Header */}
          <div className="bg-gray-200 px-2 py-1 flex items-center gap-1 border-b">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white mx-2 rounded px-2 py-0.5">
              <div className="text-[6px] text-gray-500">https://yoursite.com</div>
            </div>
          </div>

          {/* Captured image or loading state */}
          <div className="h-[calc(100%-24px)] relative overflow-hidden">
            {isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            )}
            
            {capturedImage && !isCapturing && (
              <img 
                src={capturedImage} 
                alt="Web Creative Preview"
                className="w-full h-full object-cover object-top"
              />
            )}
            
            {!capturedImage && !isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};