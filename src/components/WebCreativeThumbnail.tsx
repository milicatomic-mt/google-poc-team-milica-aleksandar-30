import React, { useEffect, useState } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useWebCreativeThumbnail } from '@/hooks/useWebCreativeThumbnail';
import { Skeleton } from '@/components/ui/skeleton';

interface WebCreativeThumbnailProps {
  campaignResults: any;
  imageMapping?: any;
  uploadedImage?: string;
  className?: string;
}

export const WebCreativeThumbnail: React.FC<WebCreativeThumbnailProps> = ({
  campaignResults,
  imageMapping,
  uploadedImage,
  className = "w-full h-full"
}) => {
  const { generateThumbnail, isGenerating } = useWebCreativeThumbnail();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const generateImage = async () => {
      try {
        setHasError(false);
        const url = await generateThumbnail({
          campaignResults,
          imageMapping,
          uploadedImage
        });
        setThumbnailUrl(url);
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        setHasError(true);
      }
    };

    if (campaignResults?.landing_page_concept) {
      generateImage();
    }
  }, [campaignResults, imageMapping, uploadedImage, generateThumbnail]);

  if (isGenerating || (!thumbnailUrl && !hasError)) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted rounded-lg`}>
        <div className="text-center space-y-2">
          <Skeleton className="w-full h-8 bg-muted-foreground/20" />
          <Skeleton className="w-3/4 h-4 bg-muted-foreground/20 mx-auto" />
          <Skeleton className="w-1/2 h-6 bg-primary/20 mx-auto rounded-full" />
        </div>
      </div>
    );
  }

  if (hasError || !thumbnailUrl) {
    // Fallback to a simple preview
    const landingPage = campaignResults?.landing_page_concept;
    return (
      <div className={`${className} bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 flex flex-col justify-center items-center text-center`}>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground line-clamp-2">
            {landingPage?.headline || 'Web Creative'}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {landingPage?.subheading || 'Landing page design'}
          </p>
          <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
            {landingPage?.cta_text || 'Shop Now'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={thumbnailUrl}
      alt="Web Creative Landing Page"
      className={`${className} object-cover rounded-lg`}
    />
  );
};