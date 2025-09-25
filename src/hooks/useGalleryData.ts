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
}

export interface GalleryItemDetails extends GalleryItem {
  // Full data loaded on demand
  generated_images: any;
  generated_video_url?: string;
  result: any;
}

const fetchGalleryData = async (): Promise<GalleryItem[]> => {
  // Optimized query: fetch minimal data for gallery display
  const [campaignsResult, catalogsResult] = await Promise.all([
    supabase
      .from('campaign_results')
      .select('id, created_at, image_url, generated_video_url, result')
      .not('generated_video_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10),
    
    supabase
      .from('catalog_results')
      .select('id, created_at, image_url, product_category, platform, tone, result')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  const campaigns: GalleryItem[] = (campaignsResult.data || []).map(item => {
    const result = item.result as any;
    return {
      id: item.id,
      type: 'campaign' as const,
      created_at: item.created_at,
      image_url: item.image_url,
      title: result?.email_copy?.subject || result?.banner_ads?.[0]?.headline || result?.landing_page_concept?.hero_text || `Campaign ${item.id.slice(-8)}`,
      description: result?.email_copy?.body?.substring(0, 100) + '...' || result?.video_scripts?.[0]?.script?.substring(0, 100) + '...' || 'Generated marketing campaign',
      has_video: !!item.generated_video_url,
      has_images: true
    };
  });

  const catalogs: GalleryItem[] = (catalogsResult.data || []).map(item => {
    const result = item.result as any;
    return {
      id: item.id,
      type: 'catalog' as const,
      created_at: item.created_at,
      image_url: item.image_url,
      title: result?.title || 'Product Catalog',
      description: result?.description || 'Catalog content',
      has_video: false,
      has_images: true,
      product_category: item.product_category,
      platform: item.platform,
      tone: item.tone
    };
  });

  // Combine and sort by date, remove duplicates
  return [...campaigns, ...catalogs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter((item, index, array) => array.findIndex(i => i.id === item.id) === index);
};

const fetchGalleryItemDetails = async (id: string, type: 'campaign' | 'catalog'): Promise<GalleryItemDetails | null> => {
  const table = type === 'campaign' ? 'campaign_results' : 'catalog_results';
  const selectFields = type === 'campaign' 
    ? 'id, created_at, generated_images, generated_video_url, result, image_url'
    : 'id, created_at, result, image_url, product_category, platform, tone';

  const { data, error } = await supabase
    .from(table)
    .select(selectFields)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  // Cast data to any to avoid TypeScript issues with dynamic table selection
  const itemData = data as any;

  const baseItem: GalleryItemDetails = {
    id: itemData.id,
    type,
    created_at: itemData.created_at,
    image_url: itemData.image_url,
    generated_images: type === 'campaign' ? (itemData.generated_images || []) : [],
    result: itemData.result || {},
    has_video: type === 'campaign' ? !!itemData.generated_video_url : false,
    has_images: type === 'campaign'
  };

  if (type === 'campaign') {
    const result = itemData.result as any;
    return {
      ...baseItem,
      generated_video_url: itemData.generated_video_url,
      title: result?.email_copy?.subject || result?.banner_ads?.[0]?.headline || result?.landing_page_concept?.hero_text || `Campaign ${itemData.id.slice(-8)}`,
      description: result?.email_copy?.body?.substring(0, 100) + '...' || result?.video_scripts?.[0]?.script?.substring(0, 100) + '...' || 'Generated marketing campaign'
    };
  } else {
    return {
      ...baseItem,
      product_category: itemData.product_category,
      platform: itemData.platform,
      tone: itemData.tone,
      title: itemData.result?.title || 'Product Catalog',
      description: itemData.result?.description || 'Catalog content'
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

export const useGalleryItemDetails = (id: string | null, type: 'campaign' | 'catalog' | null) => {
  return useQuery({
    queryKey: ['gallery-item-details', id, type],
    queryFn: () => id && type ? fetchGalleryItemDetails(id, type) : null,
    enabled: !!(id && type),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};