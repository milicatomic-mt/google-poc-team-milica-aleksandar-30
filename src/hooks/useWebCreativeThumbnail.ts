import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ThumbnailOptions {
  campaignResults: any;
  uploadedImage?: string;
  imageMapping?: any;
}

export const useWebCreativeThumbnail = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnailCache, setThumbnailCache] = useState<Map<string, string>>(new Map());

  const generateThumbnail = useCallback(async (options: ThumbnailOptions): Promise<string | null> => {
    const { campaignResults, uploadedImage, imageMapping } = options;
    
    if (!campaignResults?.landing_page_concept) return null;

    // Create a cache key based on campaign data
    const cacheKey = JSON.stringify({
      headline: campaignResults.landing_page_concept.headline,
      subheading: campaignResults.landing_page_concept.subheading,
      cta_text: campaignResults.landing_page_concept.cta_text,
      hasImage: !!(imageMapping?.image_0 || campaignResults.generated_images?.[0]?.url || uploadedImage)
    });

    // Check cache first
    if (thumbnailCache.has(cacheKey)) {
      return thumbnailCache.get(cacheKey)!;
    }

    setIsGenerating(true);

    try {
      const landingPage = campaignResults.landing_page_concept;
      
      // Get the main image
      const mainImage = imageMapping?.image_0 || campaignResults.generated_images?.[0]?.url || uploadedImage;
      
      // Create a detailed prompt for the landing page thumbnail
      const thumbnailPrompt = `Create a modern, professional landing page thumbnail design featuring:
        
        LAYOUT: Clean, modern website mockup in 16:9 aspect ratio
        
        HEADER: "${landingPage.headline || 'Premium Product'}" as the main headline in bold, large text
        
        SUBHEADER: "${landingPage.subheading || 'Discover the perfect solution for your needs'}" as supporting text
        
        CALL-TO-ACTION: Prominent button with "${landingPage.cta_text || 'Shop Now'}" text
        
        DESIGN STYLE: 
        - Clean, modern web design aesthetic
        - Professional color scheme with gradients
        - Proper typography hierarchy
        - Minimalist layout with good whitespace
        - Website browser frame/mockup appearance
        
        ELEMENTS:
        - Navigation bar at top
        - Hero section with text and CTA button
        - Product features section below
        - Footer area
        
        Make it look like a real, high-quality landing page screenshot. Ultra high resolution, professional web design.`;

      // Generate thumbnail using Supabase edge function
      const { data, error } = await supabase.functions.invoke('generate-images', {
        body: { 
          prompts: [thumbnailPrompt],
          model: 'gpt-image-1',
          size: '1536x1024',
          quality: 'high'
        }
      });

      if (error) throw error;

      if (data?.images?.[0]?.url) {
        const thumbnailUrl = data.images[0].url;
        // Cache the result
        setThumbnailCache(prev => new Map(prev).set(cacheKey, thumbnailUrl));
        return thumbnailUrl;
      }

      return null;
    } catch (error) {
      console.error('Failed to generate web creative thumbnail:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [thumbnailCache]);

  return {
    generateThumbnail,
    isGenerating,
    clearCache: () => setThumbnailCache(new Map())
  };
};