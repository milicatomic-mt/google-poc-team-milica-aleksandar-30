import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GalleryItem {
  id: string;
  type: 'campaign' | 'catalog';
  created_at: string;
  image_url?: string;
  // Essential fields for gallery display
  title?: string;
  description?: string;
  has_video?: boolean;
  has_images?: boolean;
  // Catalog-specific fields
  product_category?: string;
  platform?: string;
  tone?: string;
  // Full data to avoid separate fetching (internal use)
  _fullData?: any;
}

export interface GalleryItemDetails extends GalleryItem {
  // Full data loaded on demand
  generated_images: any;
  generated_video_url?: string;
  result: any;
}

const fetchGalleryData = async (): Promise<GalleryItem[]> => {
  // Fetch complete data in one go to avoid race conditions and data mismatches
  const [campaignsResult, catalogsResult] = await Promise.all([
    supabase
      .from('campaign_results')
      .select('id, created_at, image_url, generated_video_url, generated_images, result, campaign_prompt, target_audience')
      .order('created_at', { ascending: false })
      .limit(20),
    
    supabase
      .from('catalog_results')
      .select('id, created_at, image_url, product_category, platform, tone, result')
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  const campaigns: GalleryItem[] = (campaignsResult.data || []).map((item: any) => {
    const result = item.result as any;
    // Create a unique identifier that includes both ID and some content to avoid confusion
    const contentHash = `${item.id}-${item.campaign_prompt?.slice(0, 50) || 'no-prompt'}`;
    return {
      id: item.id,
      type: 'campaign' as const,
      created_at: item.created_at,
      image_url: item.image_url,
      title: result?.email_copy?.subject || result?.banner_ads?.[0]?.headline || result?.landing_page_concept?.hero_text || item.campaign_prompt || `Campaign ${item.id.slice(-8)}`,
      description: result?.email_copy?.body?.substring(0, 100) + '...' || result?.video_scripts?.[0]?.script?.substring(0, 100) + '...' || item.campaign_prompt?.substring(0, 100) + '...' || 'Generated marketing campaign',
      has_video: !!item.generated_video_url,
      has_images: true,
      // Store full data to avoid separate fetching
      _fullData: {
        generated_images: item.generated_images || [],
        generated_video_url: item.generated_video_url,
        result: item.result,
        campaign_prompt: item.campaign_prompt,
        target_audience: item.target_audience
      }
    };
  });

  const catalogs: GalleryItem[] = (catalogsResult.data || []).map((item: any) => {
    const result = item.result as any;
    return {
      id: item.id,
      type: 'catalog' as const,
      created_at: item.created_at,
      image_url: item.image_url,
      title: result?.product_title || result?.title || 'Product Catalog',
      description: result?.description || 'Catalog content',
      has_video: false,
      has_images: true,
      product_category: item.product_category,
      platform: item.platform,
      tone: item.tone,
      // Store full data to avoid separate fetching
      _fullData: {
        result: item.result,
        product_category: item.product_category,
        platform: item.platform,
        tone: item.tone
      }
    };
  });

  // Combine and sort by date, remove duplicates by ID (strict matching)
  const combined = [...campaigns, ...catalogs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Remove duplicates by ID, keeping the first occurrence (most recent)
  const seen = new Set();
  return combined.filter(item => {
    if (seen.has(item.id)) {
      console.warn(`Duplicate item detected and filtered: ${item.id} - ${item.title}`);
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

// Updated to use embedded data instead of separate fetch to avoid race conditions
const fetchGalleryItemDetails = async (item: GalleryItem): Promise<GalleryItemDetails | null> => {
  // Use embedded full data if available to avoid race conditions
  if (item._fullData) {
    const fullData = item._fullData;
    const baseItem: GalleryItemDetails = {
      id: item.id,
      type: item.type,
      created_at: item.created_at,
      image_url: item.image_url,
      generated_images: fullData.generated_images || [],
      result: fullData.result || {},
      has_video: item.has_video,
      has_images: item.has_images,
      title: item.title,
      description: item.description
    };

    if (item.type === 'campaign') {
      return {
        ...baseItem,
        generated_video_url: fullData.generated_video_url,
      };
    } else {
      return {
        ...baseItem,
        product_category: item.product_category,
        platform: item.platform,
        tone: item.tone
      };
    }
  }

  // Fallback to database fetch if no embedded data (shouldn't happen with new logic)
  console.warn(`No embedded data for item ${item.id}, falling back to database fetch`);
  const table = item.type === 'campaign' ? 'campaign_results' : 'catalog_results';
  const selectFields = item.type === 'campaign' 
    ? 'id, created_at, generated_images, generated_video_url, result, image_url'
    : 'id, created_at, result, image_url, product_category, platform, tone';

  const { data, error } = await supabase
    .from(table)
    .select(selectFields)
    .eq('id', item.id)
    .maybeSingle();

  if (error || !data) return null;

  const itemData = data as any;
  const baseItem: GalleryItemDetails = {
    id: itemData.id,
    type: item.type,
    created_at: itemData.created_at,
    image_url: itemData.image_url,
    generated_images: item.type === 'campaign' ? (itemData.generated_images || []) : [],
    result: itemData.result || {},
    has_video: item.type === 'campaign' ? !!itemData.generated_video_url : false,
    has_images: item.type === 'campaign',
    title: item.title,
    description: item.description
  };

  if (item.type === 'campaign') {
    return {
      ...baseItem,
      generated_video_url: itemData.generated_video_url,
    };
  } else {
    return {
      ...baseItem,
      product_category: itemData.product_category,
      platform: itemData.platform,
      tone: itemData.tone
    };
  }
};

export const useGalleryData = () => {
  return useQuery({
    queryKey: ['gallery-items'],
    queryFn: fetchGalleryData,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2
  });
};

export const useGalleryItemDetails = (item: GalleryItem | null) => {
  return useQuery({
    queryKey: ['gallery-item-details', item?.id, item?.type, item?._fullData ? 'embedded' : 'fetch'],
    queryFn: () => item ? fetchGalleryItemDetails(item) : null,
    enabled: !!item,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};