import { supabase } from "@/integrations/supabase/client";
import type { CampaignCreationRequest, CatalogEnrichmentRequest, CatalogEnrichmentResponse } from "@/types/api";

// Helper function to upload base64 image to storage
export const uploadBase64Image = async (base64Data: string, folder: string = 'uploads'): Promise<string> => {
  try {
    // Extract the base64 data without the data URL prefix
    const base64Match = base64Data.match(/data:image\/([a-zA-Z]*);base64,(.+)/);
    if (!base64Match) {
      throw new Error('Invalid base64 image format');
    }
    
    const [, imageType, base64String] = base64Match;
    const imageBuffer = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
    
    // Generate unique filename
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${imageType}`;
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('campaign-assets')
      .upload(fileName, imageBuffer, {
        contentType: `image/${imageType}`,
        upsert: false
      });
    
    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('campaign-assets')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    throw error;
  }
};

export const saveCampaignRequest = async (data: CampaignCreationRequest, generatedImages?: any[]) => {
  const { data: result, error } = await supabase
    .from('campaign_results')
    .insert({
      image_url: data.image,
      campaign_prompt: data.campaign_prompt,
      target_audience: data.target_audience,
      result: {}, // Will be updated when AI generates the campaign
      generated_images: generatedImages || []
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const generateCampaign = async (campaignId: string, data: CampaignCreationRequest) => {

  const { data: result, error } = await supabase.functions.invoke('generate-campaign', {
    body: {
      campaignId,
      image: data.image,
      campaignPrompt: data.campaign_prompt,
      targetAudience: data.target_audience
    }
  });

  if (error) {
    throw error;
  }

  // If we got a video prompt, generate the video
  if (result?.videoPrompt) {
    try {
      await supabase.functions.invoke('generate-video', {
        body: {
          campaignId,
          videoPrompt: result.videoPrompt
        }
      });
    } catch (videoError) {
      console.warn('Video generation failed, but continuing with campaign:', videoError);
    }
  }

  return result;
};

export const saveCatalogRequest = async (data: CatalogEnrichmentRequest, generatedImages?: any[]) => {
  const { data: result, error } = await supabase
    .from('catalog_results')
    .insert({
      image_url: data.image,
      tone: data.tone,
      platform: data.platform,
      product_category: data.category,
      result: {}, // Will be updated when AI generates the catalog content
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const generateCatalog = async (catalogId: string, data: CatalogEnrichmentRequest) => {

  const { data: result, error } = await supabase.functions.invoke('generate-catalog', {
    body: {
      catalogId,
      image: data.image,
      category: data.category,
      tone: data.tone,
      platform: data.platform,
      brand: data.brand
    }
  });

  

  if (error) {
    throw error;
  }

  return result as CatalogEnrichmentResponse;
};